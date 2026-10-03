package com.example.demo.user.application;

import com.example.demo.user.domain.AppUser;
import com.example.demo.user.domain.Role;
import com.example.demo.user.persistence.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the initial {@link AppUser} from env-backed properties when that username
 * is not already present. Does not update existing users or expose registration APIs.
 */
@Component
public class AdminUserBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserBootstrap.class);

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public AdminUserBootstrap(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username}") String username,
            @Value("${app.admin.password}") String password) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "app.admin.username and app.admin.password must be set (APP_ADMIN_USERNAME / APP_ADMIN_PASSWORD)");
        }
        if (appUserRepository.existsByUsername(username)) {
            return;
        }
        appUserRepository.save(AppUser.createNew(username, passwordEncoder.encode(password), Role.ADMIN));
        log.info("Bootstrapped AppUser '{}' with role {}", username, Role.ADMIN);
    }
}
