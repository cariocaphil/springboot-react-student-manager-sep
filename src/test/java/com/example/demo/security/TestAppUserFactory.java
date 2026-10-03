package com.example.demo.security;

import com.example.demo.user.domain.AppUser;
import com.example.demo.user.domain.Role;
import com.example.demo.user.persistence.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Test helper to seed a database-backed Basic-auth user (BCrypt hash + role).
 * Production bootstrap via env vars is a separate concern.
 */
@Component
public class TestAppUserFactory {

    public static final String ADMIN_USERNAME = "test";
    public static final String ADMIN_PASSWORD = "test";

    public static final String USER_USERNAME = "user";
    public static final String USER_PASSWORD = "user";

    /** Alias kept for existing tests; same credentials as {@link #ADMIN_USERNAME}. */
    public static final String TEST_USERNAME = ADMIN_USERNAME;
    public static final String TEST_PASSWORD = ADMIN_PASSWORD;

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public TestAppUserFactory(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser ensureAdminUser() {
        return ensureUser(ADMIN_USERNAME, ADMIN_PASSWORD, Role.ADMIN);
    }

    public AppUser ensureRegularUser() {
        return ensureUser(USER_USERNAME, USER_PASSWORD, Role.USER);
    }

    /** Alias for {@link #ensureAdminUser()} used by existing student integration tests. */
    public AppUser ensureTestUser() {
        return ensureAdminUser();
    }

    public AppUser ensureUser(String username, String password, Role role) {
        return appUserRepository.findByUsername(username)
                .orElseGet(() -> appUserRepository.save(
                        AppUser.createNew(username, passwordEncoder.encode(password), role)));
    }
}
