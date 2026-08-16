package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.map.MAP;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import com.example.backend.state.ROLE;
import com.example.backend.state.TypeOfAuth;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RefreshTokenService refreshTokenService,
                        JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        // Must be the Spring-managed bean, not `new JwtUtil()` - a manually
        // constructed instance never gets its @Value(jwt.secret) injected,
        // which NPEs the very first time a token is signed.
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }


    public AuthResponse register(RegisterRequest request) {
        User user = MAP.map(request, User::new);
        // RegisterRequest never carries role/authType (clients can't self-assign one),
        // and the password must be encoded here before saving.
        user.setRole(ROLE.USER);
        user.setAuthType(TypeOfAuth.BASIC_AUTH);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Invalid email"));
        return buildAuthResponse(user);
    }

    /** Validates and rotates a refresh token, returning a fresh access+refresh pair for its owner. */
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshTokenService.RotatedTokens rotated = refreshTokenService.rotate(rawRefreshToken);
        return buildAuthResponse(rotated.user(), rotated.rawRefreshToken());
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    public Boolean existByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /** Builds an AuthResponse carrying a fresh access token and a newly-issued refresh token. */
    public AuthResponse buildAuthResponse(User user) {
        return buildAuthResponse(user, refreshTokenService.issue(user));
    }

    private AuthResponse buildAuthResponse(User user, String refreshToken) {
        if (user.getRole() == null) {
            throw new InvalidRequestException("User has no role assigned");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        AuthResponse authResponse = MAP.map(user, AuthResponse::new);
        authResponse.setToken(token);
        authResponse.setRefreshToken(refreshToken);
        return authResponse;
    }
}
