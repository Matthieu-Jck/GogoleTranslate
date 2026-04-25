package com.styletranslator.infrastructure.llm;

import com.styletranslator.config.LlmProperties;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class OpenAiCompatibleLlmClient implements LlmClient {

    private static final String MOCK_MODEL = "mock-style-engine";

    private final RestClient restClient;
    private final LlmProperties properties;

    public OpenAiCompatibleLlmClient(RestClient llmRestClient, LlmProperties properties) {
        this.restClient = llmRestClient;
        this.properties = properties;
    }

    @Override
    public LlmResult complete(LlmPrompt prompt) {
        if (!properties.enabled() || !StringUtils.hasText(properties.apiKey())) {
            return new LlmResult(buildMockResponse(prompt), MOCK_MODEL);
        }

        ChatCompletionRequest request = new ChatCompletionRequest(
                properties.model(),
                List.of(
                        new ChatMessage("system", prompt.systemMessage()),
                        new ChatMessage("user", prompt.userMessage())
                ),
                0.7
        );

        try {
            ChatCompletionResponse response = restClient.post()
                    .uri(properties.chatPath())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiKey())
                    .body(request)
                    .retrieve()
                    .body(ChatCompletionResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                throw new LlmClientException("The LLM API returned an empty response.");
            }

            String content = response.choices().getFirst().message().content();
            return new LlmResult(content == null ? "" : content.trim(), response.model());
        } catch (RestClientException exception) {
            throw new LlmClientException("Failed to call the configured LLM API.", exception);
        }
    }

    private String buildMockResponse(LlmPrompt prompt) {
        return """
                [%s - MOCK]
                %s
                """.formatted(prompt.styleLabel(), prompt.userMessage().trim());
    }

    private record ChatCompletionRequest(
            String model,
            List<ChatMessage> messages,
            double temperature
    ) {
    }

    private record ChatMessage(
            String role,
            String content
    ) {
    }

    private record ChatCompletionResponse(
            String model,
            List<Choice> choices
    ) {
    }

    private record Choice(
            int index,
            ChatMessage message
    ) {
    }
}
