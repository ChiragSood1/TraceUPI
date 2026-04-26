package com.traceupi.service;

import com.traceupi.model.EscalationLog;
import com.traceupi.repository.EscalationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscalationService {

    private static final Logger log = LoggerFactory.getLogger(EscalationService.class);

    private final EscalationLogRepository escalationLogRepository;

    public EscalationService(EscalationLogRepository escalationLogRepository) {
        this.escalationLogRepository = escalationLogRepository;
    }

    /**
     * Log a status transition in the escalation log.
     */
    @Transactional
    public void logEscalation(String transactionId, String previousStatus, String newStatus, String reason) {
        EscalationLog logEntry = EscalationLog.builder()
                .transactionId(transactionId)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .reason(reason)
                .escalatedAt(LocalDateTime.now())
                .build();

        escalationLogRepository.save(logEntry);
        log.info("Escalation logged: {} -> {} for transaction {}", previousStatus, newStatus, transactionId);
    }

    /**
     * Get escalation history for a transaction, newest first.
     */
    public List<EscalationLog> getEscalationLogs(String transactionId) {
        return escalationLogRepository.findByTransactionIdOrderByEscalatedAtDesc(transactionId);
    }
}
