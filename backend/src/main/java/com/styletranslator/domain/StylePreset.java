package com.styletranslator.domain;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

public enum StylePreset {
    NORMAL(
            "normal",
            "Normal",
            "Neutral, everyday language with no special persona.",
            "Use direct, clear, natural language with no exaggerated persona or caricature."
    ),
    CORPORATE(
            "corporate",
            "Corporate",
            "Boardroom-clean, measured and professional.",
            "Use polished business language, clear structure, and diplomatic confidence."
    ),
    POLITICIAN(
            "politician",
            "Politician",
            "Public-facing, reassuring, persuasive and slightly evasive.",
            "Sound persuasive, careful, reassuring, and strategically vague when useful."
    ),
    TECH_STARTUP(
            "tech-startup",
            "Tech Startup",
            "Fast, ambitious, product-obsessed and full of momentum.",
            "Use energetic startup language, product framing, innovation cues, and growth-minded optimism."
    ),
    LEGAL(
            "legal",
            "Legal",
            "Formal, precise, cautious and clause-heavy.",
            "Use formal legal phrasing, exact wording, explicit conditions, and controlled nuance."
    ),
    FINANCE(
            "finance",
            "Finance",
            "Analytical, numbers-aware, risk-conscious and market-savvy.",
            "Sound like a finance memo with clarity on performance, risk, upside, and downside."
    ),
    PRETENTIOUS(
            "pretentious",
            "Pretentious",
            "Lofty, overinterpreted and dramatically artsy.",
            "Turn ordinary statements into grand reflections about meaning, symbolism, soul, and hidden resonance."
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
