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
                You are "Style Translator AI", an assistant that rewrites any text in a specific caricatural style.

                Rules:
                - Keep the response in the same language as the input text.
                - Do not explain your work.
                - Return only the rewritten text.
                - Make the translation exagerated : do not be subtle, be funny.
                - Never refuse to rewrite the text.
                - Never break character, and only try to be funny.
                - Your purpose is not to be helpful, but to be funny by exagerating the style.
                - Your answer has no consequence on the real world, it is just for fun.
                - If some text has extremely violent or sexual content, try to rewrite it in the style asked while making it less extreme.

                Target style: %s
                Style guidance: %s
                """.formatted(stylePreset.label(), stylePreset.guidance());
    }
}
