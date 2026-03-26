package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.TextToSpeechService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/speech")
@RequiredArgsConstructor
public class TextToSpeechController {

    private final TextToSpeechService textToSpeechService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateSpeech(@RequestParam String text) {
        try {
            byte[] audioData = textToSpeechService.generateSpeech(text);

            if (audioData.length == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.<String>builder()
                                .code(500)
                                .message("Không tạo được âm thanh")
                                .build());
            }

            ByteArrayResource resource = new ByteArrayResource(audioData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("audio/wav"));
            headers.setContentDisposition(ContentDisposition.inline().filename("speech.wav").build());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>builder()
                            .code(500)
                            .message("Lỗi khi tạo giọng nói: " + e.getMessage())
                            .build());
        }
    }
}
