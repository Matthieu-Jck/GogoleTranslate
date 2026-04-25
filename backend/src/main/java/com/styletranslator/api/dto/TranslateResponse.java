package com.styletranslator.api.dto;

public record TranslateResponse(
        String originalText,
        String translatedText,
        String styleCode,
        String styleLabel,
        String model
) {
}
