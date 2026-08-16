package com.example.backend.entity;

import com.example.backend.state.ROLE;
import com.example.backend.state.TypeOfAuth;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, message = "Please write correct name")
    private String name;

    @Pattern(message = "invalid email address try again later", regexp = "(\\w+[+-]?\\w+)+(\\.[a-z]+)*@[a-z]{2,}(\\.[a-z]{2,})+")
    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ROLE role;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_type", length = 30)
    private TypeOfAuth authType;

    @Column(name = "phone_number", length = 20, unique = true, updatable = false)
    private String phoneNumber;

    @Column(name = "google_refresh_token", length = 2048)
    private String googleRefreshToken;
}