package com.stockmarket.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TradeRequest {

    private String email;

    private String stockSymbol;

    private Integer quantity;
}
