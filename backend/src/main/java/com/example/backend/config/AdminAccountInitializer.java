package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.state.ROLE;
import jakarta.annotation.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminAccountInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed-email:}")
    private String seedEmail;

    @Value("${app.admin.seed-password:}")
    private String seedPassword;

    @Value("${app.admin.seed-name:System Admin}")
    private String seedName;

    public AdminAccountInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(@Nullable String... args) {
        if (!StringUtils.hasText(seedEmail) || !StringUtils.hasText(seedPassword)) {
            log.info("No ADMIN_EMAIL/ADMIN_PASSWORD configured — skipping admin account seeding.");
            return;
        }

        String normalizedEmail = seedEmail.toLowerCase().trim();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return; // already provisioned
        }

        User admin = new User();
        admin.setName(seedName);
        admin.setEmail(normalizedEmail);
        admin.setPassword(passwordEncoder.encode(seedPassword));
        admin.setRole(ROLE.ADMIN);
        userRepository.save(admin);

        log.info("Seeded initial ADMIN account for {}", normalizedEmail);
    }
}
