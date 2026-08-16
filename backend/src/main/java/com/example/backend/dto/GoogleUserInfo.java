package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/** Shape of Google's response from GET https://www.googleapis.com/oauth2/v3/userinfo */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleUserInfo(
        String sub,
        String email,
        String name,
        @JsonProperty("email_verified") boolean emailVerified
) {
}
