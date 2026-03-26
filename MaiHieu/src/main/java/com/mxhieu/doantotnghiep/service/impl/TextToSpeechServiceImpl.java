package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.service.TextToSpeechService;
import com.microsoft.cognitiveservices.speech.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

@Service
public class TextToSpeechServiceImpl implements TextToSpeechService {

    @Value("${azure.speech.key}")
    private String subscriptionKey;

    @Value("${azure.speech.region}")
    private String region;

    @Override
    public byte[] generateSpeech(String text) {
        try {
            SpeechConfig speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
            speechConfig.setSpeechSynthesisVoiceName("en-US-GuyNeural");

            // Không ghi file, chỉ lấy bytes trong bộ nhớ
            SpeechSynthesizer synthesizer = new SpeechSynthesizer(speechConfig, null);
            SpeechSynthesisResult result = synthesizer.SpeakTextAsync(text).get();

            if (result.getReason() == ResultReason.SynthesizingAudioCompleted) {
                return result.getAudioData();
            } else if (result.getReason() == ResultReason.Canceled) {
                SpeechSynthesisCancellationDetails cancellation = SpeechSynthesisCancellationDetails.fromResult(result);
                throw new RuntimeException("Speech synthesis canceled: " + cancellation.getErrorDetails());
            }

            synthesizer.close();
            return new byte[0];
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Lỗi khi tổng hợp giọng nói", e);
        }
    }
}
