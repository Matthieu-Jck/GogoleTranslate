package com.styletranslator.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.styletranslator.infrastructure.llm.LlmClient;
import com.styletranslator.infrastructure.llm.LlmPrompt;
import com.styletranslator.infrastructure.llm.LlmResult;
import org.junit.jupiter.api.Test;

class TranslationServiceTest {

    @Test
    void shouldTranslateUsingSelectedStyle() {
        StylePromptRegistry registry = new StylePromptRegistry();
        LlmClient fakeClient = prompt -> new LlmResult("Translated with " + prompt.styleCode(), "test-model");
        TranslationService service = new TranslationService(registry, fakeClient);

        TranslationResult result = service.translate(new TranslationCommand("Hello world", "fantasy"));

        assertThat(result.translatedText()).isEqualTo("Translated with fantasy");
        assertThat(result.styleLabel()).isEqualTo("Fantasy");
        assertThat(result.model()).isEqualTo("test-model");
    }
}
