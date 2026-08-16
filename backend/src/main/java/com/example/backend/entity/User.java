package com.example.backend.entity;

import com.example.backend.state.ROLE;
import com.example.backend.state.TypeOfAuth;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Size(min = 3,message = "Please write correct name")
    private String name;
    @Pattern(message = "invalid email address try again later",regexp = "(\\w+[+-]?\\w+)+(\\.[a-z]+)*@[a-z]{2,}(\\.[a-z]{2,})+")
    private String email;
    private String password;
    @Enumerated(value = EnumType.STRING)
    private ROLE role;
    @Enumerated(value = EnumType.STRING)
    private TypeOfAuth authType;
    @Column(columnDefinition = "varchar",length = 10,unique = true,updatable = false)

    private Long phoneNumber;

    @Column(length = 2048)
    private String googleRefreshToken;

}