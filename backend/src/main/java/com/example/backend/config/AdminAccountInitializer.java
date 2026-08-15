package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Ensures at least one ADMIN account exists, sourced from environment variables
 * (ADMIN_EMAIL / ADMIN_PASSWORD, mapped below). This is the only supported way
 * to provision an admin — there is no public "become admin" endpoint.
 *
 * Idempotent: does nothing if the account already exists, and does nothing
 * at all if the properties are left unset (so it's safe in every environment).
 */
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
    public void run(String... args) {
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
        admin.setRole("ADMIN");
        userRepository.save(admin);

        log.info("Seeded initial ADMIN account for {}", normalizedEmail);
    }
}
