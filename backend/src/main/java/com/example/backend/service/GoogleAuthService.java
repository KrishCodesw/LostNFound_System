package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.GoogleTokenResponse;
import com.example.backend.dto.GoogleUserInfo;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.repository.UserRepository;
import com.example.backend.state.ROLE;
import com.example.backend.state.TypeOfAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.util.Base64;


@Service
public class GoogleAuthService {

    private static final String AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final RestClient restClient = RestClient.create();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${app.oauth.google.redirect-uri}")
    private String redirectUri;

    public GoogleAuthService(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    public String buildConsentUrl() {
        return UriComponentsBuilder.fromUriString(AUTH_ENDPOINT)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                // offline + consent so Google actually (re-)issues a refresh_token
                // instead of only handing one out the very first time ever.
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .encode()
                .build()
                .toUriString();
    }

    public AuthResponse handleCallback(String code) {
        GoogleTokenResponse tokens = exchangeCode(code);
        GoogleUserInfo profile = fetchUserInfo(tokens.accessToken());

        if (profile.email() == null || profile.email().isBlank()) {
            throw new InvalidRequestException("Google did not return an email for this account");
        }

        User user = userRepository.findByEmail(profile.email()).orElseGet(() -> createGoogleUser(profile));

        if (tokens.refreshToken() != null && !tokens.refreshToken().isBlank()) {
            user.setGoogleRefreshToken(tokens.refreshToken());
            userRepository.save(user);
        }

        return userService.buildAuthResponse(user);
    }

    private User createGoogleUser(GoogleUserInfo profile) {
        User user = new User();
        user.setName(profile.name() != null ? profile.name() : profile.email());
        user.setEmail(profile.email());
        user.setRole(ROLE.USER);
        user.setAuthType(TypeOfAuth.GOOGLE);
        // Google-authenticated accounts never log in with a password, but the
        // column is non-nullable, so store an encoded, unguessable, unusable value.
        user.setPassword(passwordEncoder.encode(generateUnusablePassword()));
        return user;
    }

    private String generateUnusablePassword() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private GoogleTokenResponse exchangeCode(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("code", code);
        form.add("grant_type", "authorization_code");
        form.add("redirect_uri", redirectUri);

        try {
            return restClient.post()
                    .uri(TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .body(form)
                    .retrieve()
                    .body(GoogleTokenResponse.class);
        } catch (Exception e) {
            throw new InvalidRequestException("Failed to exchange Google authorization code: " + e.getMessage());
        }
    }

    private GoogleUserInfo fetchUserInfo(String googleAccessToken) {
        try {
            return restClient.get()
                    .uri(USERINFO_ENDPOINT)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + googleAccessToken)
                    .retrieve()
                    .body(GoogleUserInfo.class);
        } catch (Exception e) {
            throw new InvalidRequestException("Failed to fetch Google user profile: " + e.getMessage());
        }
    }
}
