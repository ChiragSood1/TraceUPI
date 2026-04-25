package com.traceupi.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "escalation_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscalationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, length = 50)
    private String transactionId;

    @Column(name = "previous_status", nullable = false, length = 20)
    private String previousStatus;

    @Column(name = "new_status", nullable = false, length = 20)
    private String newStatus;

    @Column(length = 255)
    private String reason;

    @Column(name = "escalated_at", nullable = false)
    private LocalDateTime escalatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.escalatedAt == null) {
            this.escalatedAt = LocalDateTime.now();
        }
    }
}
