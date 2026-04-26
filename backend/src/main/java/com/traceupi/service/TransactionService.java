package com.traceupi.service;

import com.traceupi.dto.TransactionRequest;
import com.traceupi.dto.TransactionResponse;
import com.traceupi.enums.TransactionStatus;
import com.traceupi.exception.DuplicateTransactionException;
import com.traceupi.exception.InvalidStatusTransitionException;
import com.traceupi.model.Transaction;
import com.traceupi.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final EscalationService escalationService;
    private final NotificationService notificationService;

    public TransactionService(TransactionRepository transactionRepository,
                              EscalationService escalationService,
                              NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.escalationService = escalationService;
        this.notificationService = notificationService;
    }

    /**
     * Create a new failed transaction. Returns 409 if transactionId already exists.
     */
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        if (transactionRepository.existsByTransactionId(request.getTransactionId())) {
            throw new DuplicateTransactionException(
                    "Transaction with ID '" + request.getTransactionId() + "' already exists");
        }

        Transaction transaction = Transaction.builder()
                .transactionId(request.getTransactionId())
                .amount(request.getAmount())
                .senderUpi(request.getSenderUpi())
                .receiverUpi(request.getReceiverUpi())
                .status(TransactionStatus.FAILED)
                .failureReason(request.getFailureReason())
                .build();

        transaction = transactionRepository.save(transaction);
        log.info("Created failed transaction: {}", transaction.getTransactionId());

        return TransactionResponse.from(transaction);
    }

    /**
     * Get all transactions, optionally filtered by status.
     */
    public List<TransactionResponse> getAllTransactions(String status) {
        List<Transaction> transactions;

        if (status != null && !status.isBlank()) {
            try {
                TransactionStatus txnStatus = TransactionStatus.valueOf(status.toUpperCase());
                transactions = transactionRepository.findByStatus(txnStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + status);
            }
        } else {
            transactions = transactionRepository.findAll();
        }

        return transactions.stream()
                .map(TransactionResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get a single transaction by its transactionId.
     */
    public TransactionResponse getTransaction(String transactionId) {
        Transaction transaction = findTransactionOrThrow(transactionId);
        return TransactionResponse.from(transaction);
    }

    /**
     * Update a transaction's status. Enforces forward-only state machine transitions.
     * Sends notifications on escalation and resolution.
     */
    @Transactional
    public TransactionResponse updateStatus(String transactionId, String newStatusStr) {
        Transaction transaction = findTransactionOrThrow(transactionId);

        TransactionStatus newStatus;
        try {
            newStatus = TransactionStatus.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatusStr);
        }

        TransactionStatus currentStatus = transaction.getStatus();

        // Enforce forward-only transitions
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(
                    String.format("Cannot transition from %s to %s. Only forward transitions are allowed.",
                            currentStatus.name(), newStatus.name()));
        }

        String previousStatus = currentStatus.name();
        transaction.setStatus(newStatus);

        // Set timestamps for specific transitions
        if (newStatus == TransactionStatus.ESCALATED) {
            transaction.setEscalatedAt(LocalDateTime.now());
        } else if (newStatus == TransactionStatus.RESOLVED) {
            transaction.setResolvedAt(LocalDateTime.now());
        }

        transaction = transactionRepository.save(transaction);

        // Log escalation
        String reason = switch (newStatus) {
            case UNDER_REVIEW -> "Moved to review by admin";
            case ESCALATED -> "Escalated due to unresolved status";
            case RESOLVED -> "Marked as resolved by admin";
            case CLOSED -> "Transaction closed";
            default -> "Status updated";
        };

        escalationService.logEscalation(transactionId, previousStatus, newStatus.name(), reason);

        // Send notifications on escalation and resolution
        if (newStatus == TransactionStatus.ESCALATED || newStatus == TransactionStatus.RESOLVED) {
            notificationService.sendNotifications(transaction,
                    newStatus == TransactionStatus.ESCALATED ? "Escalated" : "Resolved");
        }

        log.info("Transaction {} status updated: {} -> {}", transactionId, previousStatus, newStatus.name());
        return TransactionResponse.from(transaction);
    }

    /**
     * Find transaction entity by transactionId or throw 404.
     */
    private Transaction findTransactionOrThrow(String transactionId) {
        return transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Transaction not found: " + transactionId));
    }

    /**
     * Used by EscalationScheduler — find stale transactions for auto-escalation.
     */
    public List<Transaction> findStaleTransactions(LocalDateTime cutoff) {
        return transactionRepository.findByStatusInAndUpdatedAtBefore(
                List.of(TransactionStatus.FAILED, TransactionStatus.UNDER_REVIEW),
                cutoff
        );
    }
}
