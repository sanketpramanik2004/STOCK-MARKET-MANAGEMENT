package com.stockmarket.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private String transactionType;

    private BigDecimal amount;

    private BigDecimal balanceAfter;

    private String description;

    private String referenceType;

    private String referenceSymbol;

    private LocalDateTime createdAt;
}
