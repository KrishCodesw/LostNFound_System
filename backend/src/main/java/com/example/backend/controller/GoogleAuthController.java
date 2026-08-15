package com.example.backend.controller;

//import lombok.Value;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GoogleAuthController {

    @Value("spring.security.oauth2.client.registration.google.client-id")
    private String clientId;
    @Value("spring.security.oauth2.client.registration.google.client-secret")
    private String clientSecret;
    @GetMapping("callback")
    public ResponseEntity<?> oAuth2(@RequestParam String code){
        return null;
    }
}
