package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.AuthResponse;
import com.stockmarket.backend.dto.GoogleLoginRequest;
import com.stockmarket.backend.dto.LoginRequest;
import com.stockmarket.backend.dto.RegisterRequest;
import com.stockmarket.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${google.client-id:}")
    private String googleClientId;

    @PostMapping("/register")
    public AuthResponse registerUser(@RequestBody RegisterRequest request) {

        return authService.registerUser(request);
    }

    @PostMapping("/login")
    public AuthResponse loginUser(@RequestBody LoginRequest request) {

        return authService.loginUser(request);
    }

    @PostMapping("/google")
    public AuthResponse loginWithGoogle(@RequestBody GoogleLoginRequest request) {

        return authService.loginWithGoogle(request);
    }

    @GetMapping("/google-config")
    public Map<String, String> getGoogleConfig() {

        return Map.of("clientId", googleClientId == null ? "" : googleClientId);
    }

    @GetMapping("/me")
    public AuthResponse getCurrentUser(Authentication authentication) {

        return authService.getCurrentUser(authentication.getName());
    }
}
