package com.example.demo.user.api;

import com.example.demo.user.domain.Role;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(name = "CurrentUserResponse", description = "Currently authenticated user")
public record CurrentUserResponse(
        @NotBlank
        @Schema(description = "Username", example = "dev", requiredMode = Schema.RequiredMode.REQUIRED)
        String username,
        @NotNull
        @Schema(description = "Application role", requiredMode = Schema.RequiredMode.REQUIRED)
        Role role
) {
}
