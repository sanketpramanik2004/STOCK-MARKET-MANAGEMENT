package com.stockmarket.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<Map<String, String>> handleApiError(RestClientResponseException exception) {

        String message = exception.getStatusCode().is4xxClientError()
                ? "AI provider rejected the request. Check your OpenAI API key, billing, and model access."
                : "AI provider is temporarily unavailable. Please try again.";

        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("message", message));
    }
}
