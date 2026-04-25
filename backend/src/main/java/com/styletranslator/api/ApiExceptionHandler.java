package com.styletranslator.api;

import com.styletranslator.api.dto.ApiErrorResponse;
import com.styletranslator.application.UnknownStyleException;
import com.styletranslator.infrastructure.llm.LlmClientException;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        List<String> details = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        return ResponseEntity.badRequest().body(new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Invalid request payload",
                details
        ));
    }

    @ExceptionHandler(UnknownStyleException.class)
    public ResponseEntity<ApiErrorResponse> handleUnknownStyle(UnknownStyleException exception) {
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                exception.getMessage(),
                List.of()
        ));
    }

    @ExceptionHandler(LlmClientException.class)
    public ResponseEntity<ApiErrorResponse> handleLlmError(LlmClientException exception) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_GATEWAY.value(),
                exception.getMessage(),
                List.of()
        ));
    }
}
