package com.stockmarket.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "stocks")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stockSymbol;

    private String companyName;

    private BigDecimal currentPrice;

    private BigDecimal previousClose;

    private String marketTrend;

    private String sector;

    private Long volume;
}
