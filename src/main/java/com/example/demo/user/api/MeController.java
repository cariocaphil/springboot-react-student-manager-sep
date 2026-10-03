package com.example.demo.user.api;

import com.example.demo.user.domain.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Current-user projection for the SPA. Username and role come from the authenticated
 * {@link UserDetails} principal (already loaded by {@code DatabaseUserDetailsService});
 * no extra repository lookup.
 */
@RestController
@RequestMapping(path = MeApiPaths.BASE)
@Tag(name = "Current user", description = "Authenticated caller identity")
public class MeController {

    private static final String ROLE_PREFIX = "ROLE_";

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get the authenticated user")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Current user",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CurrentUserResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthenticated")
    })
    public CurrentUserResponse getCurrentUser(@AuthenticationPrincipal UserDetails principal) {
        return new CurrentUserResponse(principal.getUsername(), roleFrom(principal));
    }

    private static Role roleFrom(UserDetails principal) {
        return principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith(ROLE_PREFIX))
                .map(authority -> authority.substring(ROLE_PREFIX.length()))
                .map(Role::valueOf)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Authenticated user has no application role"));
    }
}
