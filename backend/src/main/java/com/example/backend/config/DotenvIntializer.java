package com.example.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
public class DotenvIntializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final String[] CANDIDATE_DIRS = {".", "backend", "..", "../backend"};

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Map<String, Object> props = loadEnvProperties();
        if (props.isEmpty()) {
            return;
        }
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        MutablePropertySources propertySources = environment.getPropertySources();
        propertySources.addFirst(new MapPropertySource("dotenv", props));
    }

    public static Map<String, Object> loadEnvProperties() {
        for (String dir : CANDIDATE_DIRS) {
            Path candidate = Paths.get(dir, ".env");
            if (Files.exists(candidate)) {
                Dotenv dotenv = Dotenv.configure()
                        .directory(dir)
                        .filename(".env")
                        .ignoreIfMalformed()
                        .load();
                Map<String, Object> map = new HashMap<>();
                for (DotenvEntry entry : dotenv.entries()) {
                    map.put(entry.getKey(), entry.getValue());
                }
                return map;
            }
        }
        return Map.of();
    }
}
