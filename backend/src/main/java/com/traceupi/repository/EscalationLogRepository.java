package com.traceupi.repository;

import com.traceupi.model.EscalationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationLogRepository extends JpaRepository<EscalationLog, Long> {

    List<EscalationLog> findByTransactionIdOrderByEscalatedAtDesc(String transactionId);
}
