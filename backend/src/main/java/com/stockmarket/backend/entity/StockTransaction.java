package com.stockmarket.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private String stockSymbol;

    private String companyName;

    private String transactionType;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime transactionDate;
}
