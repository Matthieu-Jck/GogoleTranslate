package com.styletranslator.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TranslateRequest(
        @NotBlank(message = "text is required")
        @Size(max = 5000, message = "text must not exceed 5000 characters")
        String text,

        @NotBlank(message = "sourceStyle is required")
        String sourceStyle,

        @NotBlank(message = "targetStyle is required")
        String targetStyle
) {
}
