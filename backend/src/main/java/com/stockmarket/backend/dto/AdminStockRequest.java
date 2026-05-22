package com.stockmarket.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdminStockRequest {

    private String stockSymbol;

    private String companyName;

    private BigDecimal currentPrice;

    private BigDecimal previousClose;

    private String marketTrend;

    private String sector;

    private Long volume;
}
