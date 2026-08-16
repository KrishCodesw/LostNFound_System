package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RefreshTokenRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final UserService userRepository;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
       if(!userRepository.existByEmail(request.getEmail()))throw new ResourceNotFoundException("Invalid email");
       return ResponseEntity.ok(userRepository.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
      return ResponseEntity.ok(userRepository.login(request));
    }

    // Exchanges a valid, unexpired refresh token for a brand-new access+refresh
    // pair, revoking the presented one (rotation) so it can't be replayed.
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(userRepository.refresh(request.getRefreshToken()));
    }

    // Revokes a refresh token, ending that session. Best-effort: an already
    // expired/unknown token still returns 204 so client-side logout never fails.
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody RefreshTokenRequest request) {
        userRepository.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }
}