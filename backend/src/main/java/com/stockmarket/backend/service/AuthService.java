package com.stockmarket.backend.service;

import com.stockmarket.backend.dto.AuthResponse;
import com.stockmarket.backend.dto.GoogleLoginRequest;
import com.stockmarket.backend.dto.LoginRequest;
import com.stockmarket.backend.dto.RegisterRequest;
import com.stockmarket.backend.entity.User;
import com.stockmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Value("${google.client-id:}")
    private String googleClientId;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final RestClient googleRestClient = RestClient.builder()
            .baseUrl("https://oauth2.googleapis.com")
            .build();

    public AuthResponse registerUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setWalletBalance(new BigDecimal("1000000"));

        User savedUser = userRepository.save(user);

        return buildAuthResponse("User Registered Successfully", savedUser);
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOptional.get();

        if (passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {
            if (user.getWalletBalance() == null) {
                user.setWalletBalance(new BigDecimal("1000000"));
                userRepository.save(user);
            }

            return buildAuthResponse("Login Successful", user);
        }

        throw new IllegalArgumentException("Invalid Password");
    }

    public AuthResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getWalletBalance() == null) {
            user.setWalletBalance(new BigDecimal("1000000"));
            userRepository.save(user);
        }

        return new AuthResponse("Authenticated", null, user.getEmail(), user.getName(), user.getWalletBalance(), user.getRole());
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {

        if (googleClientId == null || googleClientId.isBlank() || googleClientId.contains("PASTE")) {
            throw new IllegalArgumentException("Google Client ID is not configured");
        }

        if (request.getCredential() == null || request.getCredential().isBlank()) {
            throw new IllegalArgumentException("Google credential is required");
        }

        Map response = googleRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tokeninfo")
                        .queryParam("id_token", request.getCredential())
                        .build())
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalArgumentException("Unable to verify Google login");
        }

        String audience = String.valueOf(response.get("aud"));
        String emailVerified = String.valueOf(response.get("email_verified"));
        String email = String.valueOf(response.get("email"));
        String name = String.valueOf(response.getOrDefault("name", email));

        if (!googleClientId.equals(audience)) {
            throw new IllegalArgumentException("Google login audience mismatch");
        }

        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new IllegalArgumentException("Google email is not verified");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode("GOOGLE_AUTH_" + UUID.randomUUID()));
            newUser.setRole("USER");
            newUser.setWalletBalance(new BigDecimal("1000000"));
            return newUser;
        });

        if (user.getWalletBalance() == null) {
            user.setWalletBalance(new BigDecimal("1000000"));
        }

        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(name);
        }

        User savedUser = userRepository.save(user);
        return buildAuthResponse("Google Login Successful", savedUser);
    }

    private AuthResponse buildAuthResponse(String message, User user) {

        return new AuthResponse(
                message,
                jwtService.generateToken(user.getEmail()),
                user.getEmail(),
                user.getName(),
                user.getWalletBalance(),
                user.getRole());
    }
}
