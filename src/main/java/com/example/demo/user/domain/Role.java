package com.example.demo.user.domain;

/**
 * Single application role per {@link AppUser}.
 * Mapped to Spring Security as {@code ROLE_ADMIN} / {@code ROLE_USER}.
 */
public enum Role {
    ADMIN,
    USER
}
