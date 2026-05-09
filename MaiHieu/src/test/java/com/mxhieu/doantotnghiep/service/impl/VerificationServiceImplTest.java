package com.mxhieu.doantotnghiep.service.impl;

import com.google.common.cache.Cache;
import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import org.mockito.ArgumentCaptor;

@SpringBootTest(classes = Application.class)
class VerificationServiceImplTest {

    @Autowired
    private VerificationServiceImpl verificationService;

    @Autowired
    private Cache<String, String> otpCache;

    @MockBean
    private MailServiceImpl mailService;

    @BeforeEach
    void setUp() {
        otpCache.invalidateAll();
    }

    @Test
    void sendVerificationCode_shouldGenerateOtpPutCacheAndSendMail() throws Exception {
        // Test Case ID: MAI-VFS-001
        verificationService.sendVerificationCode("user@example.com");

        String generatedOtp = otpCache.getIfPresent("user@example.com");
        assertNotNull(generatedOtp);
        assertTrue(generatedOtp.matches("\\d{6}"));

        ArgumentCaptor<DataMailDTO> mailCaptor = ArgumentCaptor.forClass(DataMailDTO.class);
        verify(mailService).sendMail(mailCaptor.capture(), eq("verify_email_template"));
        assertTrue(mailCaptor.getValue().getProps().containsKey("otp"));
        assertEquals(generatedOtp, mailCaptor.getValue().getProps().get("otp"));
    }

    @Test
    void sendVerificationCode_shouldNotThrowWhenMailServiceFails() throws Exception {
        // Test Case ID: MAI-VFS-002
        doThrow(new RuntimeException("mail error")).when(mailService).sendMail(any(DataMailDTO.class), eq("verify_email_template"));

        verificationService.sendVerificationCode("user@example.com");

        String generatedOtp = otpCache.getIfPresent("user@example.com");
        assertNotNull(generatedOtp);
        verify(mailService).sendMail(any(DataMailDTO.class), eq("verify_email_template"));
    }

    @Test
    void verifyCode_shouldReturnFalseWhenCacheHasNoOtp() {
        // Test Case ID: MAI-VFS-003
        otpCache.invalidate("user@example.com");

        boolean actual = verificationService.verifyCode("user@example.com", "123456");

        assertFalse(actual);
    }

    @Test
    void verifyCode_shouldReturnTrueAndInvalidateWhenOtpMatches() {
        // Test Case ID: MAI-VFS-004
        otpCache.put("user@example.com", "123456");

        boolean actual = verificationService.verifyCode("user@example.com", "123456");

        assertTrue(actual);
        assertFalse(otpCache.asMap().containsKey("user@example.com"));
    }

    @Test
    void verifyCode_shouldReturnFalseWhenOtpDoesNotMatch() {
        // Test Case ID: MAI-VFS-005
        otpCache.put("user@example.com", "654321");

        boolean actual = verificationService.verifyCode("user@example.com", "123456");

        assertFalse(actual);
        assertTrue(otpCache.asMap().containsKey("user@example.com"));
    }
}
