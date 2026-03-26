package com.mxhieu.doantotnghiep;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    @PostConstruct
    public void initFreeTts() {
        System.setProperty("freetts.voices",
                "com.sun.speech.freetts.en.us.cmu_us_kal.KevinVoiceDirectory");
    }
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
