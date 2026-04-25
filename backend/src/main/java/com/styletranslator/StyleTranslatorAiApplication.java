package com.styletranslator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class StyleTranslatorAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(StyleTranslatorAiApplication.class, args);
    }
}
