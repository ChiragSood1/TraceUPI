package com.traceupi.repository;

import com.traceupi.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTransactionId(String transactionId);

    List<Notification> findAllByOrderBySentAtDesc();
}
