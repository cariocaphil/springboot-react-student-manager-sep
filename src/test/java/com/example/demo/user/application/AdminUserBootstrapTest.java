package com.example.demo.user.application;

import com.example.demo.user.domain.AppUser;
import com.example.demo.user.persistence.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminUserBootstrapTest {

    @Mock
    private AppUserRepository appUserRepository;

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    void run_createsUserWithBcryptHashWhenMissing() {
        given(appUserRepository.existsByUsername("admin")).willReturn(false);

        AdminUserBootstrap bootstrap = new AdminUserBootstrap(
                appUserRepository, passwordEncoder, "admin", "secret");
        bootstrap.run(new DefaultApplicationArguments());

        ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
        verify(appUserRepository).save(captor.capture());
        AppUser saved = captor.getValue();
        assertThat(saved.getUsername()).isEqualTo("admin");
        assertThat(saved.getPasswordHash()).startsWith("$2");
        assertThat(saved.getPasswordHash()).isNotEqualTo("secret");
        assertThat(passwordEncoder.matches("secret", saved.getPasswordHash())).isTrue();
    }

    @Test
    void run_skipsWhenUserAlreadyExists() {
        given(appUserRepository.existsByUsername("admin")).willReturn(true);

        AdminUserBootstrap bootstrap = new AdminUserBootstrap(
                appUserRepository, passwordEncoder, "admin", "secret");
        bootstrap.run(new DefaultApplicationArguments());

        verify(appUserRepository, never()).save(any());
    }

    @Test
    void run_failsWhenCredentialsMissing() {
        AdminUserBootstrap bootstrap = new AdminUserBootstrap(
                appUserRepository, passwordEncoder, " ", "");

        assertThatThrownBy(() -> bootstrap.run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("APP_ADMIN");
        verify(appUserRepository, never()).save(any());
    }
}
