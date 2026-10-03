package com.example.demo.security;

import com.example.demo.student.api.StudentApiPaths;
import com.example.demo.user.domain.AppUser;
import com.example.demo.user.domain.Role;
import com.example.demo.user.persistence.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static com.example.demo.security.TestAppUserFactory.TEST_PASSWORD;
import static com.example.demo.security.TestAppUserFactory.TEST_USERNAME;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    private static final String STUDENTS_URI = "/" + StudentApiPaths.BASE;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TestAppUserFactory testAppUserFactory;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void seedUser() {
        testAppUserFactory.ensureTestUser();
    }

    @Test
    void protectedStudentEndpoint_returnsUnauthorizedWithoutCredentials() throws Exception {
        mockMvc.perform(get(STUDENTS_URI))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedStudentEndpoint_allowsAccessWithBasicAuth() throws Exception {
        mockMvc.perform(get(STUDENTS_URI).with(httpBasic(TEST_USERNAME, TEST_PASSWORD)))
                .andExpect(status().isOk());
    }

    @Test
    void protectedStudentEndpoint_returnsUnauthorizedWithWrongPassword() throws Exception {
        mockMvc.perform(get(STUDENTS_URI).with(httpBasic(TEST_USERNAME, "wrong-password")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedStudentEndpoint_returnsUnauthorizedForUnknownUser() throws Exception {
        mockMvc.perform(get(STUDENTS_URI).with(httpBasic("nobody", TEST_PASSWORD)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void databaseUser_passwordIsStoredAsBcryptHash() {
        AppUser user = appUserRepository.findByUsername(TEST_USERNAME).orElseThrow();

        assertThat(user.getRole()).isEqualTo(Role.ADMIN);
        assertThat(user.getPasswordHash()).startsWith("$2");
        assertThat(user.getPasswordHash()).isNotEqualTo(TEST_PASSWORD);
        assertThat(passwordEncoder.matches(TEST_PASSWORD, user.getPasswordHash())).isTrue();
    }

    @Test
    void openApiDocs_remainPublicWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }
}
