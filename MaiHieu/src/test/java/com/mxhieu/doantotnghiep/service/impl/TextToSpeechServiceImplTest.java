package com.mxhieu.doantotnghiep.service.impl;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;

class TextToSpeechServiceImplTest {

    @Test
    void generateSpeech_shouldThrowRuntimeWhenConfigurationInvalid() {
        // Test Case ID: MAI-TTS-001
        TextToSpeechServiceImpl service = new TextToSpeechServiceImpl();
        ReflectionTestUtils.setField(service, "subscriptionKey", null);
        ReflectionTestUtils.setField(service, "region", null);

        assertThrows(RuntimeException.class, () -> service.generateSpeech("hello"));
    }
}
