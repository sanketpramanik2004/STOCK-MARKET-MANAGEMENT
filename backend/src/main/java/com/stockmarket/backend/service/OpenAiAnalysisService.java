package com.stockmarket.backend.service;

import com.stockmarket.backend.dto.AiAnalysisResponse;
import com.stockmarket.backend.dto.LiveStockQuote;
import com.stockmarket.backend.dto.StockNewsItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OpenAiAnalysisService {

    private final RestClient restClient;
    private final StockService stockService;
    private final PortfolioService portfolioService;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    public OpenAiAnalysisService(
            @Value("${openai.base-url}") String baseUrl,
            StockService stockService,
            PortfolioService portfolioService,
            ObjectMapper objectMapper) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.stockService = stockService;
        this.portfolioService = portfolioService;
        this.objectMapper = objectMapper;
    }

    public AiAnalysisResponse analyzeStock(String symbol) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API key is not configured");
        }

        LiveStockQuote quote = stockService.getLiveStockBySymbol(symbol);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "instructions", "You are a careful fintech market analyst. Provide educational stock analysis only, not financial advice. Return only valid JSON. Do not use markdown.",
                "input", buildPrompt(quote),
                "max_output_tokens", 550,
                "temperature", 0.3
        );

        Map response = restClient.post()
                .uri("/responses")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        return new AiAnalysisResponse(quote.getStockSymbol(), extractText(response), model);
    }

    public AiAnalysisResponse analyzePortfolio(String email) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API key is not configured");
        }

        Map<String, Object> portfolio = portfolioService.getPortfolio(email);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "instructions", "You are a careful fintech portfolio analyst. Provide educational analysis only, not financial advice. Return only valid JSON. Do not use markdown.",
                "input", buildPortfolioPrompt(portfolio),
                "max_output_tokens", 700,
                "temperature", 0.3
        );

        Map response = restClient.post()
                .uri("/responses")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        return new AiAnalysisResponse("PORTFOLIO", extractText(response), model);
    }

    public List<StockNewsItem> getStockNews(String symbol) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API key is not configured");
        }

        LiveStockQuote quote = stockService.getLiveStockBySymbol(symbol);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "instructions", "You are a financial news research assistant. Use web search for current news. Return only valid JSON, with no markdown or commentary. Do not invent articles, URLs, dates, sources, or summaries.",
                "tools", List.of(Map.of(
                        "type", "web_search",
                        "user_location", Map.of(
                                "type", "approximate",
                                "country", "IN",
                                "timezone", "Asia/Kolkata"
                        )
                )),
                "tool_choice", "auto",
                "text", newsJsonFormat(),
                "input", buildNewsPrompt(quote),
                "max_output_tokens", 1000,
                "temperature", 0.2
        );

        Map response = restClient.post()
                .uri("/responses")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        String rawNews = extractText(response);

        try {
            return parseNewsItems(rawNews);
        } catch (IllegalArgumentException error) {
            return parseNewsItems(repairNewsJson(rawNews));
        }
    }

    private String buildPrompt(LiveStockQuote quote) {

        return """
                Analyze this stock quote for a stock market management dashboard.

                Symbol: %s
                Company: %s
                Current price: %s
                Previous close: %s
                Change: %s
                Change percentage: %s%%
                Volume: %s
                Sector: %s
                Trend: %s
                Quote source: %s
                Latest trading day: %s

                Return only valid JSON in this exact shape:
                {
                  "summary": "One concise market summary sentence.",
                  "sentiment": "Bullish, Bearish, or Neutral",
                  "momentum": "One concise momentum read.",
                  "risks": ["Risk 1", "Risk 2", "Risk 3"],
                  "watchNext": ["Signal 1", "Signal 2", "Signal 3"],
                  "confidence": "Low, Medium, or High",
                  "disclaimer": "One short educational disclaimer."
                }
                """.formatted(
                quote.getStockSymbol(),
                quote.getCompanyName(),
                quote.getCurrentPrice(),
                quote.getPreviousClose(),
                quote.getChange(),
                quote.getChangePercentage(),
                quote.getVolume(),
                quote.getSector(),
                quote.getMarketTrend(),
                quote.getSource(),
                quote.getLatestTradingDay());
    }

    private String buildPortfolioPrompt(Map<String, Object> portfolio) {

        String portfolioJson;
        try {
            portfolioJson = objectMapper.writeValueAsString(portfolio);
        } catch (Exception error) {
            portfolioJson = String.valueOf(portfolio);
        }

        return """
                Analyze this user's portfolio for a stock market management dashboard.
                Focus on realized profit/loss from sold shares, unrealized profit/loss from current holdings, total return, diversification, concentration risk, and watch areas.

                Portfolio JSON:
                %s

                Return only valid JSON in this exact shape:
                {
                  "summary": "One concise portfolio summary sentence.",
                  "riskLevel": "Low, Medium, or High",
                  "returnRead": "One concise sentence comparing realized, unrealized, and total return.",
                  "diversification": "One concise diversification assessment.",
                  "overexposure": ["Exposure 1", "Exposure 2"],
                  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
                  "watchAreas": ["Watch area 1", "Watch area 2", "Watch area 3"],
                  "nextSteps": ["Step 1", "Step 2", "Step 3"],
                  "disclaimer": "One short educational disclaimer."
                }
                """.formatted(portfolioJson);
    }

    private String buildNewsPrompt(LiveStockQuote quote) {

        return """
                Find the latest real market/company news for this listed stock.

                Symbol: %s
                Company: %s
                Sector: %s

                Requirements:
                - Use web search.
                - Prefer recent reputable business, exchange, company, or financial news sources.
                - Include only real articles you found through web search.
                - Do not include generic educational text.
                - If there are fewer than 6 relevant articles, return only the relevant articles found.

                Return only valid JSON with one top-level field named "articles".
                """.formatted(
                quote.getStockSymbol(),
                quote.getCompanyName(),
                quote.getSector());
    }

    private Map<String, Object> newsJsonFormat() {

        Map<String, Object> articleSchema = Map.of(
                "type", "object",
                "additionalProperties", false,
                "properties", Map.of(
                        "title", Map.of("type", "string"),
                        "summary", Map.of("type", "string"),
                        "url", Map.of("type", "string"),
                        "source", Map.of("type", "string"),
                        "sourceDomain", Map.of("type", "string"),
                        "bannerImage", Map.of("type", "string"),
                        "publishedAt", Map.of("type", "string"),
                        "sentimentLabel", Map.of("type", "string"),
                        "sentimentScore", Map.of("type", "number"),
                        "authors", Map.of("type", "array", "items", Map.of("type", "string"))
                ),
                "required", List.of("title", "summary", "url", "source", "sourceDomain", "bannerImage", "publishedAt", "sentimentLabel", "sentimentScore", "authors")
        );

        return Map.of(
                "format", Map.of(
                        "type", "json_schema",
                        "name", "stock_news_response",
                        "strict", true,
                        "schema", Map.of(
                                "type", "object",
                                "additionalProperties", false,
                                "properties", Map.of(
                                        "articles", Map.of(
                                                "type", "array",
                                                "items", articleSchema
                                        )
                                ),
                                "required", List.of("articles")
                        )
                )
        );
    }

    private List<StockNewsItem> parseNewsItems(String rawText) {

        String json = extractJsonPayload(rawText);

        Object parsed;
        try {
            parsed = objectMapper.readValue(json, Object.class);
        } catch (Exception error) {
            throw new IllegalArgumentException("OpenAI news response was not valid JSON");
        }

        List<?> articles = Collections.emptyList();

        if (parsed instanceof List<?> list) {
            articles = list;
        } else if (parsed instanceof Map<?, ?> map && map.get("articles") instanceof List<?> list) {
            articles = list;
        }

        List<StockNewsItem> newsItems = new ArrayList<>();
        Set<String> seenUrls = new LinkedHashSet<>();

        for (Object itemObject : articles) {
            if (!(itemObject instanceof Map<?, ?> item)) {
                continue;
            }

            StockNewsItem newsItem = new StockNewsItem();
            newsItem.setTitle(stringValue(item.get("title")));
            newsItem.setSummary(stringValue(item.get("summary")));
            newsItem.setUrl(stringValue(item.get("url")));
            newsItem.setSource(stringValue(item.get("source")));
            newsItem.setSourceDomain(stringValue(item.get("sourceDomain")));
            newsItem.setBannerImage(stringValue(item.get("bannerImage")));
            newsItem.setPublishedAt(stringValue(item.get("publishedAt")));
            newsItem.setSentimentLabel(stringValue(item.get("sentimentLabel")));
            newsItem.setSentimentScore(decimalValue(item.get("sentimentScore")));
            newsItem.setAuthors(stringList(item.get("authors")));

            if (!newsItem.getTitle().isBlank() && !newsItem.getUrl().isBlank() && seenUrls.add(newsItem.getUrl())) {
                newsItems.add(newsItem);
            }
        }

        return newsItems;
    }

    private String repairNewsJson(String rawText) {

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "instructions", "Convert the supplied stock-news text into strict JSON. Preserve only real articles, URLs, sources, dates, and summaries present in the text. Do not invent missing articles. Return only JSON.",
                "text", newsJsonFormat(),
                "input", """
                        Convert this OpenAI web-search stock news response into the required JSON schema.

                        Raw response:
                        %s
                        """.formatted(rawText),
                "max_output_tokens", 900,
                "temperature", 0
        );

        Map response = restClient.post()
                .uri("/responses")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        return extractText(response);
    }

    private String extractJsonPayload(String rawText) {

        String json = rawText == null ? "" : rawText.trim();

        if (json.startsWith("```")) {
            json = json.replaceFirst("^```json\\s*", "")
                    .replaceFirst("^```\\s*", "")
                    .replaceFirst("\\s*```$", "")
                    .trim();
        }

        if (json.startsWith("{") || json.startsWith("[")) {
            return json;
        }

        String fencedJson = firstRegexGroup(json, "```(?:json)?\\s*([\\s\\S]*?)\\s*```");
        if (!fencedJson.isBlank()) {
            return fencedJson.trim();
        }

        int objectStart = json.indexOf('{');
        int objectEnd = json.lastIndexOf('}');
        int arrayStart = json.indexOf('[');
        int arrayEnd = json.lastIndexOf(']');

        if (objectStart >= 0 && objectEnd > objectStart) {
            return json.substring(objectStart, objectEnd + 1);
        }

        if (arrayStart >= 0 && arrayEnd > arrayStart) {
            return json.substring(arrayStart, arrayEnd + 1);
        }

        return json;
    }

    private String firstRegexGroup(String text, String regex) {

        Matcher matcher = Pattern.compile(regex).matcher(text);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String extractText(Map response) {

        if (response == null) {
            throw new IllegalArgumentException("OpenAI returned an empty response");
        }

        Object outputText = response.get("output_text");
        if (outputText != null && !String.valueOf(outputText).isBlank()) {
            return String.valueOf(outputText);
        }

        Object outputObject = response.get("output");
        if (outputObject instanceof List<?> outputItems) {
            StringBuilder builder = new StringBuilder();

            for (Object outputItem : outputItems) {
                if (outputItem instanceof Map<?, ?> outputMap && outputMap.get("content") instanceof List<?> contentItems) {
                    for (Object contentItem : contentItems) {
                        if (contentItem instanceof Map<?, ?> contentMap && contentMap.get("text") != null) {
                            builder.append(contentMap.get("text")).append("\n");
                        }
                    }
                }
            }

            if (builder.length() > 0) {
                return builder.toString().trim();
            }
        }

        throw new IllegalArgumentException("OpenAI response did not include text output");
    }

    private String stringValue(Object value) {

        return value == null ? "" : String.valueOf(value);
    }

    private BigDecimal decimalValue(Object value) {

        if (value == null || String.valueOf(value).isBlank()) {
            return BigDecimal.ZERO;
        }

        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException error) {
            return BigDecimal.ZERO;
        }
    }

    private List<String> stringList(Object value) {

        if (!(value instanceof List<?> values)) {
            return Collections.emptyList();
        }

        return values.stream()
                .map(String::valueOf)
                .filter(item -> !item.isBlank())
                .toList();
    }
}
