package com.styletranslator.api;

import com.styletranslator.api.dto.StyleOptionResponse;
import com.styletranslator.api.dto.TranslateRequest;
import com.styletranslator.api.dto.TranslateResponse;
import com.styletranslator.application.StylePromptRegistry;
import com.styletranslator.application.TranslationCommand;
import com.styletranslator.application.TranslationResult;
import com.styletranslator.application.TranslationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class TranslationController {

    private final TranslationService translationService;
    private final StylePromptRegistry stylePromptRegistry;

    public TranslationController(
            TranslationService translationService,
            StylePromptRegistry stylePromptRegistry
    ) {
        this.translationService = translationService;
        this.stylePromptRegistry = stylePromptRegistry;
    }

    @GetMapping("/styles")
    public ResponseEntity<List<StyleOptionResponse>> getStyles() {
        List<StyleOptionResponse> styles = stylePromptRegistry.listAvailableStyles()
                .stream()
                .map(style -> new StyleOptionResponse(style.code(), style.label(), style.description()))
                .toList();
        return ResponseEntity.ok(styles);
    }

    @GetMapping("/health")
    public ResponseEntity<Void> health() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/translate")
    public ResponseEntity<TranslateResponse> translate(@Valid @RequestBody TranslateRequest request) {
        TranslationResult result = translationService.translate(
                new TranslationCommand(request.text(), request.sourceStyle(), request.targetStyle())
        );

        TranslateResponse response = new TranslateResponse(
                result.originalText(),
                result.translatedText(),
                result.styleCode(),
                result.styleLabel(),
                result.model()
        );

        return ResponseEntity.ok(response);
    }
}
