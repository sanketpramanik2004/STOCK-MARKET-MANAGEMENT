package com.stockmarket.backend.config;

import com.stockmarket.backend.entity.User;
import com.stockmarket.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminSeeder(UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {

        userRepository.findByEmail("admin@stockpulse.com").ifPresentOrElse(user -> {
            if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                user.setRole("ADMIN");
                userRepository.save(user);
            }
        }, () -> {
            User admin = new User();
            admin.setName("StockPulse Admin");
            admin.setEmail("admin@stockpulse.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setWalletBalance(new BigDecimal("1000000"));
            userRepository.save(admin);
        });
    }
}
