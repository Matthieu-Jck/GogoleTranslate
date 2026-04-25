package com.styletranslator.application;

public record TranslationResult(
        String originalText,
        String translatedText,
        String styleCode,
        String styleLabel,
        String model
) {
}
