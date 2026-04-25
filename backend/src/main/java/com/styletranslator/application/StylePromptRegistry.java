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
                Rewrite the user's text using the requested style, being caricatural.

                Rules:
                - Keep the response in the same language as the input text.
                - Do not explain your work.
                - Return only the rewritten text.
                - Make the translation exagerated, do not be subtle.

                Target style: %s
                Style guidance: %s
                """.formatted(stylePreset.label(), stylePreset.guidance());
    }
}
