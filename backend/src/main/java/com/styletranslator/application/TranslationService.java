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
        StylePreset sourceStylePreset = stylePromptRegistry.findByCode(command.sourceStyleCode());
        StylePreset targetStylePreset = stylePromptRegistry.findByCode(command.targetStyleCode());

        if (sourceStylePreset == targetStylePreset) {
            return new TranslationResult(
                    command.text(),
                    command.text(),
                    targetStylePreset.code(),
                    targetStylePreset.label(),
                    "identity-pass-through"
            );
        }

        String systemPrompt = stylePromptRegistry.buildSystemPrompt(sourceStylePreset, targetStylePreset);

        LlmResult llmResult = llmClient.complete(new LlmPrompt(
                systemPrompt,
                command.text(),
                targetStylePreset.code(),
                targetStylePreset.label()
        ));

        return new TranslationResult(
                command.text(),
                llmResult.content(),
                targetStylePreset.code(),
                targetStylePreset.label(),
                llmResult.model()
        );
    }
}
