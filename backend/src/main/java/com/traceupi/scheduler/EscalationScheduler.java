package com.traceupi.scheduler;

import com.traceupi.model.Transaction;
import com.traceupi.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EscalationScheduler {

    private static final Logger log = LoggerFactory.getLogger(EscalationScheduler.class);

    private final TransactionService transactionService;

    public EscalationScheduler(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Runs every 5 minutes. Auto-escalates transactions that have been in
     * FAILED or UNDER_REVIEW status for more than 30 minutes.
     */
    @Scheduled(fixedRate = 300000)
    public void autoEscalateStaleTransactions() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        List<Transaction> staleTransactions = transactionService.findStaleTransactions(cutoff);

        if (staleTransactions.isEmpty()) {
            log.debug("No stale transactions found for auto-escalation");
            return;
        }

        log.info("Found {} stale transactions for auto-escalation", staleTransactions.size());

        for (Transaction txn : staleTransactions) {
            try {
                transactionService.updateStatus(txn.getTransactionId(), "ESCALATED");
                log.info("Auto-escalated transaction: {}", txn.getTransactionId());
            } catch (Exception e) {
                log.error("Failed to auto-escalate transaction {}: {}",
                        txn.getTransactionId(), e.getMessage());
            }
        }
    }
}
