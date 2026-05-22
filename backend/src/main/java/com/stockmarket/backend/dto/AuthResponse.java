package com.stockmarket.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String message;

    private String token;

    private String email;

    private String name;

    private BigDecimal walletBalance;

    private String role;
}
