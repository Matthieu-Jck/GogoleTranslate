package com.styletranslator.application;

import com.styletranslator.domain.StylePreset;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StylePromptRegistry {

    public List<StylePreset> listAvailableStyles() {
        return List.of(StylePreset.values());
    }

    public StylePreset findByCode(String styleCode) {
        return StylePreset.fromCode(styleCode)
                .orElseThrow(() -> new UnknownStyleException("Unknown style: " + styleCode));
    }

    public String buildSystemPrompt(StylePreset stylePreset) {
        return """
                You are Style Translator AI.
                Rewrite the user's text using the requested style.

                Rules:
                - Preserve the original meaning.
                - Keep the response in the same language as the input text.
                - Do not explain your work.
                - Return only the rewritten text.
                - Keep a similar length unless the style clearly requires a small adjustment.

                Target style: %s
                Style guidance: %s
                """.formatted(stylePreset.label(), stylePreset.guidance());
    }
}
