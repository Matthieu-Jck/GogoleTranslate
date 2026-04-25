package com.styletranslator.infrastructure.llm;

public interface LlmClient {

    LlmResult complete(LlmPrompt prompt);
}
