package com.mxhieu.doantotnghiep.service;
import java.io.File;

public interface TextToSpeechService {
    byte[] generateSpeech(String text);
}
