package com.traceupi.dto;

import com.traceupi.model.Transaction;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;
    private String transactionId;
    private BigDecimal amount;
    private String senderUpi;
    private String receiverUpi;
    private String status;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime escalatedAt;
    private LocalDateTime resolvedAt;

    public static TransactionResponse from(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionId(txn.getTransactionId())
                .amount(txn.getAmount())
                .senderUpi(txn.getSenderUpi())
                .receiverUpi(txn.getReceiverUpi())
                .status(txn.getStatus().name())
                .failureReason(txn.getFailureReason())
                .createdAt(txn.getCreatedAt())
                .updatedAt(txn.getUpdatedAt())
                .escalatedAt(txn.getEscalatedAt())
                .resolvedAt(txn.getResolvedAt())
                .build();
    }
}
