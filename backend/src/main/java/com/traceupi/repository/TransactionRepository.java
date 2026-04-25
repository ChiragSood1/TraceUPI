package com.traceupi.repository;

import com.traceupi.enums.TransactionStatus;
import com.traceupi.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findByStatus(TransactionStatus status);

    List<Transaction> findByStatusInAndUpdatedAtBefore(List<TransactionStatus> statuses, LocalDateTime cutoff);

    boolean existsByTransactionId(String transactionId);
}
