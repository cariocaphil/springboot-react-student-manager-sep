package com.example.demo.security;

import com.example.demo.user.domain.AppUser;
import com.example.demo.user.persistence.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Test helper to seed a database-backed Basic-auth user (BCrypt hash).
 * Production bootstrap via env vars is a separate concern.
 */
@Component
public class TestAppUserFactory {

    public static final String TEST_USERNAME = "test";
    public static final String TEST_PASSWORD = "test";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public TestAppUserFactory(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser ensureTestUser() {
        return appUserRepository.findByUsername(TEST_USERNAME)
                .orElseGet(() -> appUserRepository.save(
                        AppUser.createNew(TEST_USERNAME, passwordEncoder.encode(TEST_PASSWORD))));
    }
}
