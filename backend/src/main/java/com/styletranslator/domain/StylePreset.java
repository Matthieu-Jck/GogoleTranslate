package com.styletranslator.domain;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

public enum StylePreset {
    CORPORATE(
            "corporate",
            "Corporate",
            "Ton professionnel, structuré et diplomatique.",
            "Use polished business language, clear structure and neutral confidence."
    ),
    POLITICIAN(
            "politician",
            "Politicien",
            "Ton rassembleur, prudent, convaincant et parfois evasif.",
            "Sound persuasive, reassuring, public-facing and slightly strategic."
    ),
    LEGAL(
            "legal",
            "Juridique",
            "Ton formel, precis et rigoureux.",
            "Use formal legal phrasing, precise wording and explicit conditions."
    ),
    FANTASY(
            "fantasy",
            "Fantasy",
            "Ton epique, imaginaire et narratif.",
            "Use evocative fantasy imagery, a sense of wonder and elevated diction."
    ),
    TECH_STARTUP(
            "tech-startup",
            "Tech startup",
            "Ton dynamique, produit, innovation et croissance.",
            "Sound energetic, product-driven, modern and investor-friendly."
    ),
    ARTISTIC(
            "artistic",
            "Artistique",
            "Ton poetique, sensible et image.",
            "Use expressive and sensory language with a creative rhythm."
    );

    private final String code;
    private final String label;
    private final String description;
    private final String guidance;

    StylePreset(String code, String label, String description, String guidance) {
        this.code = code;
        this.label = label;
        this.description = description;
        this.guidance = guidance;
    }

    public String code() {
        return code;
    }

    public String label() {
        return label;
    }

    public String description() {
        return description;
    }

    public String guidance() {
        return guidance;
    }

    public static Optional<StylePreset> fromCode(String code) {
        String normalizedCode = code == null ? "" : code.trim().toLowerCase(Locale.ROOT);

        return Arrays.stream(values())
                .filter(style -> style.code.equals(normalizedCode))
                .findFirst();
    }
}
