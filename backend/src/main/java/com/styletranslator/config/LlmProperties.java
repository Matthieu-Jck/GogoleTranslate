package com.styletranslator.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.llm")
public record LlmProperties(
        boolean enabled,
        String baseUrl,
        String chatPath,
        String apiKey,
        String model,
        int timeoutSeconds
) {
}
