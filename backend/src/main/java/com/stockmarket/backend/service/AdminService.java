package com.stockmarket.backend.service;

import com.stockmarket.backend.dto.AdminStockRequest;
import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.entity.StockTransaction;
import com.stockmarket.backend.entity.User;
import com.stockmarket.backend.repository.StockRepository;
import com.stockmarket.backend.repository.StockTransactionRepository;
import com.stockmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private StockTransactionRepository transactionRepository;

    public void verifyAdmin(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Admin access required");
        }
    }

    public List<Map<String, Object>> getAllUsers(String email) {

        verifyAdmin(email);
        return userRepository.findAll().stream().map(user -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", user.getId());
            row.put("name", user.getName());
            row.put("email", user.getEmail());
            row.put("role", user.getRole());
            row.put("walletBalance", user.getWalletBalance());
            return row;
        }).toList();
    }

    public List<StockTransaction> getAllTransactions(String email) {

        verifyAdmin(email);
        return transactionRepository.findAll();
    }

    public List<Stock> getAllStocks(String email) {

        verifyAdmin(email);
        return stockRepository.findAll();
    }

    public Stock addStock(String email, AdminStockRequest request) {

        verifyAdmin(email);
        validateStock(request);

        if (stockRepository.findByStockSymbol(request.getStockSymbol().trim().toUpperCase()).isPresent()) {
            throw new IllegalArgumentException("Stock symbol already exists");
        }

        Stock stock = new Stock();
        applyStockRequest(stock, request);
        return stockRepository.save(stock);
    }

    public Stock updateStock(String email, Long id, AdminStockRequest request) {

        verifyAdmin(email);
        validateStock(request);

        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));

        stockRepository.findByStockSymbol(request.getStockSymbol().trim().toUpperCase())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Stock symbol already exists");
                });

        applyStockRequest(stock, request);
        return stockRepository.save(stock);
    }

    public Stock updateStockPrice(String email, Long id, BigDecimal price) {

        verifyAdmin(email);

        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }

        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));

        stock.setPreviousClose(stock.getCurrentPrice());
        stock.setCurrentPrice(price);
        stock.setMarketTrend(price.compareTo(stock.getPreviousClose()) >= 0 ? "UP" : "DOWN");
        return stockRepository.save(stock);
    }

    public String deleteStock(String email, Long id) {

        verifyAdmin(email);

        if (!stockRepository.existsById(id)) {
            throw new IllegalArgumentException("Stock not found");
        }

        stockRepository.deleteById(id);
        return "Stock deleted successfully";
    }

    public String seedThirtyStocks(String email) {

        verifyAdmin(email);

        Object[][] stocks = {
                {"TCS", "Tata Consultancy Services", "3800", "3720", "UP", "IT", 2100000L},
                {"INFY", "Infosys", "1450", "1466", "DOWN", "IT", 4800000L},
                {"RELIANCE", "Reliance Industries", "2900", "2847", "UP", "Energy", 6400000L},
                {"HDFCBANK", "HDFC Bank", "1684", "1671", "UP", "Banking", 8700000L},
                {"ICICIBANK", "ICICI Bank", "1128", "1106", "UP", "Banking", 7600000L},
                {"SBIN", "State Bank of India", "822", "815", "UP", "Banking", 9800000L},
                {"KOTAKBANK", "Kotak Mahindra Bank", "1742", "1765", "DOWN", "Banking", 2100000L},
                {"AXISBANK", "Axis Bank", "1186", "1179", "UP", "Banking", 3900000L},
                {"HINDUNILVR", "Hindustan Unilever", "2416", "2438", "DOWN", "Consumer", 1200000L},
                {"ITC", "ITC", "436", "429", "UP", "Consumer", 11200000L},
                {"ASIANPAINT", "Asian Paints", "2914", "2933", "DOWN", "Consumer", 1300000L},
                {"NESTLEIND", "Nestle India", "2538", "2509", "UP", "Consumer", 620000L},
                {"BHARTIARTL", "Bharti Airtel", "1394", "1371", "UP", "Telecom", 5300000L},
                {"LT", "Larsen and Toubro", "3612", "3588", "UP", "Infrastructure", 1800000L},
                {"MARUTI", "Maruti Suzuki India", "12570", "12615", "DOWN", "Auto", 740000L},
                {"TATAMOTORS", "Tata Motors", "968", "937", "UP", "Auto", 9200000L},
                {"M&M", "Mahindra and Mahindra", "2948", "2899", "UP", "Auto", 2400000L},
                {"BAJFINANCE", "Bajaj Finance", "6890", "6814", "UP", "Financial Services", 1100000L},
                {"BAJAJFINSV", "Bajaj Finserv", "1624", "1641", "DOWN", "Financial Services", 930000L},
                {"HCLTECH", "HCL Technologies", "1348", "1329", "UP", "IT", 2600000L},
                {"WIPRO", "Wipro", "462", "468", "DOWN", "IT", 3900000L},
                {"TECHM", "Tech Mahindra", "1287", "1268", "UP", "IT", 1400000L},
                {"SUNPHARMA", "Sun Pharmaceutical", "1518", "1494", "UP", "Pharma", 3100000L},
                {"DRREDDY", "Dr Reddy's Laboratories", "6184", "6248", "DOWN", "Pharma", 660000L},
                {"CIPLA", "Cipla", "1462", "1440", "UP", "Pharma", 1900000L},
                {"TITAN", "Titan Company", "3428", "3381", "UP", "Consumer", 1500000L},
                {"ULTRACEMCO", "UltraTech Cement", "10184", "10022", "UP", "Cement", 420000L},
                {"JSWSTEEL", "JSW Steel", "928", "941", "DOWN", "Metals", 2700000L},
                {"TATASTEEL", "Tata Steel", "156", "153", "UP", "Metals", 15100000L},
                {"POWERGRID", "Power Grid Corporation", "318", "314", "UP", "Utilities", 8400000L},
        };

        for (Object[] row : stocks) {
            saveOrUpdateStock(
                    (String) row[0],
                    (String) row[1],
                    (String) row[2],
                    (String) row[3],
                    (String) row[4],
                    (String) row[5],
                    (Long) row[6]);
        }

        return "30 admin demo stocks added/refreshed successfully";
    }

    private void validateStock(AdminStockRequest request) {

        if (request.getStockSymbol() == null || request.getStockSymbol().isBlank()) {
            throw new IllegalArgumentException("Stock symbol is required");
        }

        if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
            throw new IllegalArgumentException("Company name is required");
        }

        if (request.getCurrentPrice() == null || request.getCurrentPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Current price must be greater than zero");
        }
    }

    private void applyStockRequest(Stock stock, AdminStockRequest request) {

        stock.setStockSymbol(request.getStockSymbol().trim().toUpperCase());
        stock.setCompanyName(request.getCompanyName().trim());
        stock.setCurrentPrice(request.getCurrentPrice());
        stock.setPreviousClose(request.getPreviousClose() == null ? request.getCurrentPrice() : request.getPreviousClose());
        stock.setMarketTrend(request.getMarketTrend() == null || request.getMarketTrend().isBlank() ? "UP" : request.getMarketTrend().trim().toUpperCase());
        stock.setSector(request.getSector() == null || request.getSector().isBlank() ? "Market" : request.getSector().trim());
        stock.setVolume(request.getVolume() == null ? 0L : request.getVolume());
    }

    private void saveOrUpdateStock(String symbol, String companyName, String currentPrice, String previousClose, String trend, String sector, Long volume) {

        Stock stock = stockRepository.findByStockSymbol(symbol).orElse(new Stock());

        stock.setStockSymbol(symbol);
        stock.setCompanyName(companyName);
        stock.setCurrentPrice(new BigDecimal(currentPrice));
        stock.setPreviousClose(new BigDecimal(previousClose));
        stock.setMarketTrend(trend);
        stock.setSector(sector);
        stock.setVolume(volume);

        stockRepository.save(stock);
    }
}
