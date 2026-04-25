package com.styletranslator.infrastructure.llm;

public record LlmPrompt(
        String systemMessage,
        String userMessage,
        String styleCode,
        String styleLabel
) {
}
