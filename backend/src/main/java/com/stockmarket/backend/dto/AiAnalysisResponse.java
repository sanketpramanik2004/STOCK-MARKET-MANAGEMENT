package com.stockmarket.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponse {

    private String symbol;

    private String analysis;

    private String model;
}
