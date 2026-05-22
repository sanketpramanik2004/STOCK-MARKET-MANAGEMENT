package com.stockmarket.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    public String generateToken(String email) {

        long expiry = Instant.now().toEpochMilli() + expirationMs;
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = "{\"sub\":\"" + email + "\",\"exp\":" + expiry + "}";
        String unsignedToken = encode(header) + "." + encode(payload);

        return unsignedToken + "." + sign(unsignedToken);
    }

    public String getEmailFromToken(String token) {

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid token");
        }

        String expectedSignature = sign(parts[0] + "." + parts[1]);
        if (!constantTimeEquals(expectedSignature, parts[2])) {
            throw new IllegalArgumentException("Invalid token signature");
        }

        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        long expiry = Long.parseLong(extract(payload, "\"exp\":", "}"));

        if (Instant.now().toEpochMilli() > expiry) {
            throw new IllegalArgumentException("Token expired");
        }

        return extract(payload, "\"sub\":\"", "\"");
    }

    private String encode(String value) {

        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String value) {

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign token", exception);
        }
    }

    private String extract(String source, String start, String end) {

        int startIndex = source.indexOf(start);
        if (startIndex < 0) {
            throw new IllegalArgumentException("Invalid token payload");
        }

        startIndex += start.length();
        int endIndex = source.indexOf(end, startIndex);
        if (endIndex < 0) {
            endIndex = source.length();
        }

        return source.substring(startIndex, endIndex);
    }

    private boolean constantTimeEquals(String left, String right) {

        if (left.length() != right.length()) {
            return false;
        }

        int result = 0;
        for (int i = 0; i < left.length(); i++) {
            result |= left.charAt(i) ^ right.charAt(i);
        }

        return result == 0;
    }
}
