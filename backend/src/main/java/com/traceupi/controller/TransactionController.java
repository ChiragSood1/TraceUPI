package com.traceupi.controller;

import com.traceupi.dto.StatusUpdateRequest;
import com.traceupi.dto.TransactionRequest;
import com.traceupi.dto.TransactionResponse;
import com.traceupi.model.EscalationLog;
import com.traceupi.model.Notification;
import com.traceupi.service.EscalationService;
import com.traceupi.service.NotificationService;
import com.traceupi.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final EscalationService escalationService;
    private final NotificationService notificationService;

    public TransactionController(TransactionService transactionService,
                                 EscalationService escalationService,
                                 NotificationService notificationService) {
        this.transactionService = transactionService;
        this.escalationService = escalationService;
        this.notificationService = notificationService;
    }

    /**
     * Create a new failed transaction.
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all transactions, optionally filtered by status.
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(
            @RequestParam(required = false) String status) {
        List<TransactionResponse> transactions = transactionService.getAllTransactions(status);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get a single transaction by transactionId.
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @PathVariable String transactionId) {
        TransactionResponse response = transactionService.getTransaction(transactionId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update a transaction's status (forward-only transitions).
     */
    @PutMapping("/{transactionId}/status")
    public ResponseEntity<TransactionResponse> updateStatus(
            @PathVariable String transactionId,
            @Valid @RequestBody StatusUpdateRequest request) {
        TransactionResponse response = transactionService.updateStatus(transactionId, request.getStatus());
        return ResponseEntity.ok(response);
    }

    /**
     * Get escalation history for a transaction.
     */
    @GetMapping("/{transactionId}/logs")
    public ResponseEntity<List<EscalationLog>> getEscalationLogs(
            @PathVariable String transactionId) {
        List<EscalationLog> logs = escalationService.getEscalationLogs(transactionId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get notifications for a specific transaction.
     */
    @GetMapping("/{transactionId}/notifications")
    public ResponseEntity<List<Notification>> getTransactionNotifications(
            @PathVariable String transactionId) {
        List<Notification> notifications = notificationService.getNotificationsByTransactionId(transactionId);
        return ResponseEntity.ok(notifications);
    }
}
