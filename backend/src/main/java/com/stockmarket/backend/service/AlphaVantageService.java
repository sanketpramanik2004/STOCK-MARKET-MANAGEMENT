package com.stockmarket.backend.service;

import com.stockmarket.backend.dto.LiveStockQuote;
import com.stockmarket.backend.entity.Stock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@Service
public class AlphaVantageService {

    private final RestClient restClient;

    @Value("${alpha.vantage.api-key}")
    private String apiKey;

    public AlphaVantageService(@Value("${alpha.vantage.base-url}") String baseUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public Optional<LiveStockQuote> getGlobalQuote(Stock stock) {

        Map response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("function", "GLOBAL_QUOTE")
                        .queryParam("symbol", toAlphaVantageSymbol(stock.getStockSymbol()))
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .body(Map.class);

        if (response == null || response.containsKey("Note") || response.containsKey("Information")) {
            return Optional.empty();
        }

        Object quoteObject = response.get("Global Quote");

        if (!(quoteObject instanceof Map quote) || quote.isEmpty()) {
            return Optional.empty();
        }

        BigDecimal currentPrice = decimal(quote.get("05. price"));
        BigDecimal previousClose = decimal(quote.get("08. previous close"));
        BigDecimal change = decimal(quote.get("09. change"));
        BigDecimal changePercentage = percent(quote.get("10. change percent"));

        LiveStockQuote liveStockQuote = new LiveStockQuote();
        liveStockQuote.setStockSymbol(stock.getStockSymbol());
        liveStockQuote.setCompanyName(stock.getCompanyName());
        liveStockQuote.setCurrentPrice(currentPrice);
        liveStockQuote.setPreviousClose(previousClose);
        liveStockQuote.setChange(change);
        liveStockQuote.setChangePercentage(changePercentage);
        liveStockQuote.setVolume(longValue(quote.get("06. volume")));
        liveStockQuote.setLatestTradingDay(String.valueOf(quote.get("07. latest trading day")));
        liveStockQuote.setMarketTrend(changePercentage.compareTo(BigDecimal.ZERO) >= 0 ? "UP" : "DOWN");
        liveStockQuote.setSector(stock.getSector());
        liveStockQuote.setSource("ALPHA_VANTAGE");

        return Optional.of(liveStockQuote);
    }

    private String toAlphaVantageSymbol(String symbol) {

        if (symbol.contains(".") || symbol.contains(":")) {
            return symbol;
        }

        return symbol + ".BSE";
    }

    private BigDecimal decimal(Object value) {

        if (value == null) {
            return BigDecimal.ZERO;
        }

        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException error) {
            return BigDecimal.ZERO;
        }
    }

    private BigDecimal percent(Object value) {

        if (value == null) {
            return BigDecimal.ZERO;
        }

        try {
            return new BigDecimal(String.valueOf(value).replace("%", ""));
        } catch (NumberFormatException error) {
            return BigDecimal.ZERO;
        }
    }

    private Long longValue(Object value) {

        if (value == null) {
            return 0L;
        }

        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException error) {
            return 0L;
        }
    }
}
