package com.example.demo.student.api;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI studentManagerOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Student Manager API")
                        .version("v1")
                        .description(
                                "HTTP contract for the Student Manager UI. "
                                        + "Spring Boot owns this contract; the React app generates TypeScript types from the exported OpenAPI document."))
                // Relative server keeps the committed OpenAPI document environment-agnostic.
                .servers(List.of(new Server().url("/").description("Same origin as the bundled UI")));
    }
}
