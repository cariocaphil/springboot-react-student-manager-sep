package com.example.demo.student.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Keeps the committed OpenAPI document in sync with the Springdoc export.
 *
 * <p>Regenerate the committed file (when the API contract changes):
 * {@code ./mvnw -Dopenapi.export=true test -Dtest=OpenApiContractTest -P'!build-frontend'}
 */
@SpringBootTest
@AutoConfigureMockMvc
class OpenApiContractTest {

    static final Path COMMITTED_SPEC = Path.of("api/openapi.json");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void committedOpenApiMatchesRuntimeContract() throws Exception {
        String body = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ObjectMapper normalizingMapper = objectMapper.copy()
                .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true)
                .configure(SerializationFeature.INDENT_OUTPUT, true);

        JsonNode actualTree = normalizingMapper.readTree(body);
        String normalized = normalizingMapper.writeValueAsString(actualTree) + "\n";

        if (Boolean.getBoolean("openapi.export")) {
            Files.createDirectories(COMMITTED_SPEC.getParent());
            Files.writeString(COMMITTED_SPEC, normalized);
            return;
        }

        assertThat(COMMITTED_SPEC)
                .as("Missing %s — run with -Dopenapi.export=true to create it", COMMITTED_SPEC)
                .exists();

        JsonNode expectedTree = normalizingMapper.readTree(Files.readString(COMMITTED_SPEC));
        assertThat(actualTree)
                .as("OpenAPI drift detected. Re-export with -Dopenapi.export=true and regenerate frontend types.")
                .isEqualTo(expectedTree);
    }
}
