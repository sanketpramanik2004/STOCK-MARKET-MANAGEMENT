package com.stockmarket.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LiveStockQuote {

    private String stockSymbol;

    private String companyName;

    private BigDecimal currentPrice;

    private BigDecimal previousClose;

    private BigDecimal change;

    private BigDecimal changePercentage;

    private Long volume;

    private String latestTradingDay;

    private String marketTrend;

    private String sector;

    private String source;
}
