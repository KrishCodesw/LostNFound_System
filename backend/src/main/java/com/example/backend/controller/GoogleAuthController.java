package com.example.backend.controller;

import com.example.backend.dto.GoogleAuthUrlResponse;
import com.example.backend.dto.GoogleCallbackRequest;
import com.example.backend.service.GoogleAuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/google")
@AllArgsConstructor
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    @GetMapping("/url")
    public ResponseEntity<GoogleAuthUrlResponse> authUrl() {
        return ResponseEntity.ok(new GoogleAuthUrlResponse(googleAuthService.buildConsentUrl()));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> callback(@Valid @RequestBody GoogleCallbackRequest request) {
        return ResponseEntity.ok(googleAuthService.handleCallback(request.getCode()));
    }
}
