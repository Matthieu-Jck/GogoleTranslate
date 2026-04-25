package com.styletranslator.application;

import com.styletranslator.domain.StylePreset;
import com.styletranslator.infrastructure.llm.LlmClient;
import com.styletranslator.infrastructure.llm.LlmPrompt;
import com.styletranslator.infrastructure.llm.LlmResult;
import org.springframework.stereotype.Service;

@Service
public class TranslationService {

    private final StylePromptRegistry stylePromptRegistry;
    private final LlmClient llmClient;

    public TranslationService(StylePromptRegistry stylePromptRegistry, LlmClient llmClient) {
        this.stylePromptRegistry = stylePromptRegistry;
        this.llmClient = llmClient;
    }

    public TranslationResult translate(TranslationCommand command) {
        StylePreset stylePreset = stylePromptRegistry.findByCode(command.styleCode());
        String systemPrompt = stylePromptRegistry.buildSystemPrompt(stylePreset);

        LlmResult llmResult = llmClient.complete(new LlmPrompt(
                systemPrompt,
                command.text(),
                stylePreset.code(),
                stylePreset.label()
        ));

        return new TranslationResult(
                command.text(),
                llmResult.content(),
                stylePreset.code(),
                stylePreset.label(),
                llmResult.model()
        );
    }
}
