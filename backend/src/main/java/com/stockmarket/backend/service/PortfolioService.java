package com.stockmarket.backend.service;

import com.stockmarket.backend.entity.PortfolioHolding;
import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.entity.StockTransaction;
import com.stockmarket.backend.repository.PortfolioHoldingRepository;
import com.stockmarket.backend.repository.StockRepository;
import com.stockmarket.backend.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class PortfolioService {

    @Autowired
    private PortfolioHoldingRepository holdingRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private StockTransactionRepository transactionRepository;

    public Map<String, Object> getPortfolio(String email) {

        List<PortfolioHolding> holdings = holdingRepository.findByUserEmail(email);
        List<StockTransaction> transactions = transactionRepository.findByUserEmailOrderByTransactionDateAsc(email);
        List<Map<String, Object>> holdingResponses = new ArrayList<>();
        Map<String, BigDecimal> sectorAllocation = new LinkedHashMap<>();
        BigDecimal investedValue = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;
        BigDecimal unrealizedProfitLoss = BigDecimal.ZERO;

        for (PortfolioHolding holding : holdings) {
            Optional<Stock> stockOptional = stockRepository.findByStockSymbol(holding.getStockSymbol());
            BigDecimal latestPrice = stockOptional.map(Stock::getCurrentPrice).orElse(holding.getAveragePrice());
            String sector = stockOptional.map(Stock::getSector).orElse("Other");
            BigDecimal invested = holding.getAveragePrice().multiply(BigDecimal.valueOf(holding.getQuantity()));
            BigDecimal current = latestPrice.multiply(BigDecimal.valueOf(holding.getQuantity()));
            BigDecimal profitLoss = current.subtract(invested);

            investedValue = investedValue.add(invested);
            currentValue = currentValue.add(current);
            unrealizedProfitLoss = unrealizedProfitLoss.add(profitLoss);
            sectorAllocation.put(sector, sectorAllocation.getOrDefault(sector, BigDecimal.ZERO).add(current));

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("stockSymbol", holding.getStockSymbol());
            row.put("companyName", holding.getCompanyName());
            row.put("quantity", holding.getQuantity());
            row.put("averagePrice", holding.getAveragePrice());
            row.put("currentPrice", latestPrice);
            row.put("investedValue", invested);
            row.put("currentValue", current);
            row.put("profitLoss", profitLoss);
            row.put("profitLossPercentage", percentage(profitLoss, invested));
            row.put("sector", sector);
            row.put("portfolioWeight", BigDecimal.ZERO);
            holdingResponses.add(row);
        }

        for (Map<String, Object> row : holdingResponses) {
            BigDecimal rowValue = (BigDecimal) row.get("currentValue");
            row.put("portfolioWeight", percentage(rowValue, currentValue));
        }

        RealizedSummary realizedSummary = calculateRealizedSummary(transactions);
        BigDecimal realizedProfitLoss = realizedSummary.realizedProfitLoss();
        BigDecimal totalReturn = realizedProfitLoss.add(unrealizedProfitLoss);
        BigDecimal totalCapital = calculateTotalBuyValue(transactions);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("holdings", holdingResponses);
        response.put("holdingCount", holdingResponses.size());
        response.put("investedValue", investedValue);
        response.put("currentValue", currentValue);
        response.put("profitLoss", totalReturn);
        response.put("profitLossPercentage", percentage(totalReturn, totalCapital));
        response.put("realizedProfitLoss", realizedProfitLoss);
        response.put("realizedProfitLossPercentage", percentage(realizedProfitLoss, realizedSummary.realizedCostBasis()));
        response.put("realizedCostBasis", realizedSummary.realizedCostBasis());
        response.put("realizedSaleValue", realizedSummary.realizedSaleValue());
        response.put("realizedPositions", realizedSummary.positions());
        response.put("unrealizedProfitLoss", unrealizedProfitLoss);
        response.put("unrealizedProfitLossPercentage", percentage(unrealizedProfitLoss, investedValue));
        response.put("totalReturn", totalReturn);
        response.put("totalReturnPercentage", percentage(totalReturn, totalCapital));
        response.put("sectorAllocation", buildAllocation(sectorAllocation, currentValue));

        return response;
    }

    private RealizedSummary calculateRealizedSummary(List<StockTransaction> transactions) {

        Map<String, Deque<TaxLot>> lotsBySymbol = new HashMap<>();
        Map<String, RealizedPositionAccumulator> positions = new TreeMap<>();
        BigDecimal realizedProfitLoss = BigDecimal.ZERO;
        BigDecimal realizedCostBasis = BigDecimal.ZERO;
        BigDecimal realizedSaleValue = BigDecimal.ZERO;

        for (StockTransaction transaction : transactions) {
            String symbol = transaction.getStockSymbol();

            if ("BUY".equalsIgnoreCase(transaction.getTransactionType())) {
                lotsBySymbol.computeIfAbsent(symbol, ignored -> new LinkedList<>())
                        .add(new TaxLot(transaction.getQuantity(), transaction.getPrice()));
                continue;
            }

            if ("SELL".equalsIgnoreCase(transaction.getTransactionType())) {
                int remainingToSell = transaction.getQuantity();
                Deque<TaxLot> lots = lotsBySymbol.computeIfAbsent(symbol, ignored -> new LinkedList<>());
                RealizedPositionAccumulator position = positions.computeIfAbsent(
                        symbol,
                        ignored -> new RealizedPositionAccumulator(symbol, transaction.getCompanyName()));

                while (remainingToSell > 0 && !lots.isEmpty()) {
                    TaxLot lot = lots.peek();
                    int matchedQuantity = Math.min(remainingToSell, lot.quantity());
                    BigDecimal costBasis = lot.price().multiply(BigDecimal.valueOf(matchedQuantity));
                    BigDecimal saleValue = transaction.getPrice().multiply(BigDecimal.valueOf(matchedQuantity));
                    BigDecimal profitPerShare = transaction.getPrice().subtract(lot.price());
                    BigDecimal matchedProfitLoss = profitPerShare.multiply(BigDecimal.valueOf(matchedQuantity));

                    realizedProfitLoss = realizedProfitLoss.add(matchedProfitLoss);
                    realizedCostBasis = realizedCostBasis.add(costBasis);
                    realizedSaleValue = realizedSaleValue.add(saleValue);
                    position.add(matchedQuantity, costBasis, saleValue, matchedProfitLoss);
                    remainingToSell -= matchedQuantity;

                    if (matchedQuantity == lot.quantity()) {
                        lots.poll();
                    } else {
                        lots.poll();
                        lots.addFirst(new TaxLot(lot.quantity() - matchedQuantity, lot.price()));
                    }
                }
            }
        }

        List<Map<String, Object>> positionResponses = new ArrayList<>();
        for (RealizedPositionAccumulator position : positions.values()) {
            positionResponses.add(position.toResponse());
        }

        return new RealizedSummary(realizedProfitLoss, realizedCostBasis, realizedSaleValue, positionResponses);
    }

    private BigDecimal calculateTotalBuyValue(List<StockTransaction> transactions) {

        return transactions.stream()
                .filter(transaction -> "BUY".equalsIgnoreCase(transaction.getTransactionType()))
                .map(StockTransaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<Map<String, Object>> buildAllocation(Map<String, BigDecimal> sectorAllocation, BigDecimal currentValue) {

        List<Map<String, Object>> allocation = new ArrayList<>();

        for (Map.Entry<String, BigDecimal> entry : sectorAllocation.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", entry.getKey());
            row.put("value", percentage(entry.getValue(), currentValue));
            allocation.add(row);
        }

        return allocation;
    }

    private BigDecimal percentage(BigDecimal value, BigDecimal base) {

        if (base.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return value.multiply(BigDecimal.valueOf(100)).divide(base, 2, RoundingMode.HALF_UP);
    }

    private record TaxLot(int quantity, BigDecimal price) {
    }

    private record RealizedSummary(
            BigDecimal realizedProfitLoss,
            BigDecimal realizedCostBasis,
            BigDecimal realizedSaleValue,
            List<Map<String, Object>> positions) {
    }

    private class RealizedPositionAccumulator {

        private final String stockSymbol;
        private final String companyName;
        private int quantity;
        private BigDecimal costBasis = BigDecimal.ZERO;
        private BigDecimal saleValue = BigDecimal.ZERO;
        private BigDecimal profitLoss = BigDecimal.ZERO;

        private RealizedPositionAccumulator(String stockSymbol, String companyName) {

            this.stockSymbol = stockSymbol;
            this.companyName = companyName;
        }

        private void add(int matchedQuantity, BigDecimal matchedCostBasis, BigDecimal matchedSaleValue, BigDecimal matchedProfitLoss) {

            quantity += matchedQuantity;
            costBasis = costBasis.add(matchedCostBasis);
            saleValue = saleValue.add(matchedSaleValue);
            profitLoss = profitLoss.add(matchedProfitLoss);
        }

        private Map<String, Object> toResponse() {

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("stockSymbol", stockSymbol);
            row.put("companyName", companyName);
            row.put("quantitySold", quantity);
            row.put("costBasis", costBasis);
            row.put("saleValue", saleValue);
            row.put("profitLoss", profitLoss);
            row.put("profitLossPercentage", percentage(profitLoss, costBasis));
            row.put("averageBuyPrice", quantity == 0 ? BigDecimal.ZERO : costBasis.divide(BigDecimal.valueOf(quantity), 2, RoundingMode.HALF_UP));
            row.put("averageSellPrice", quantity == 0 ? BigDecimal.ZERO : saleValue.divide(BigDecimal.valueOf(quantity), 2, RoundingMode.HALF_UP));
            return row;
        }
    }
}
