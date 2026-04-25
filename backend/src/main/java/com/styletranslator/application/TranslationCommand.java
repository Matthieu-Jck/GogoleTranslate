package com.styletranslator.application;

public record TranslationCommand(
        String text,
        String sourceStyleCode,
        String targetStyleCode
) {
}
