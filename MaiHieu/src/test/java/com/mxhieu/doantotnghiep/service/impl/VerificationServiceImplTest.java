package com.mxhieu.doantotnghiep.service.impl;

import com.google.common.cache.Cache;
import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import com.mxhieu.doantotnghiep.service.MailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerificationServiceImplTest {

    @Mock
    private MailService mailService;

    @Mock
    private Cache<String, String> otpCache;

    @InjectMocks
    private VerificationServiceImpl verificationService;

    @Test
    void sendVerificationCode_shouldGenerateOtpPutCacheAndSendMail() throws Exception {
        // Test Case ID: MAI-VFS-001
        verificationService.sendVerificationCode("user@example.com");

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(otpCache).put(eq("user@example.com"), otpCaptor.capture());

        String generatedOtp = otpCaptor.getValue();
        assertNotNull(generatedOtp);
        assertTrue(generatedOtp.matches("\\d{6}"));

        ArgumentCaptor<DataMailDTO> mailCaptor = ArgumentCaptor.forClass(DataMailDTO.class);
        verify(mailService).sendMail(mailCaptor.capture(), eq("verify_email_template"));
        assertTrue(mailCaptor.getValue().getProps().containsKey("otp"));
    }

    @Test
    void sendVerificationCode_shouldNotThrowWhenMailServiceFails() throws Exception {
        // Test Case ID: MAI-VFS-002
        doThrow(new RuntimeException("mail error")).when(mailService).sendMail(any(DataMailDTO.class), eq("verify_email_template"));

        verificationService.sendVerificationCode("user@example.com");

        verify(otpCache).put(eq("user@example.com"), any(String.class));
    }

    @Test
    void verifyCode_shouldReturnFalseWhenCacheHasNoOtp() {
        // Test Case ID: MAI-VFS-003
        when(otpCache.getIfPresent("user@example.com")).thenReturn(null);

        boolean actual = verificationService.verifyCode("user@example.com", "123456");

        assertFalse(actual);
    }

    @Test
    void verifyCode_shouldReturnTrueAndInvalidateWhenOtpMatches() {
        // Test Case ID: MAI-VFS-004
        when(otpCache.getIfPresent("user@example.com")).thenReturn("123456");

        boolean actual = verificationService.verifyCode("user@example.com", "123456");

        assertTrue(actual);
        verify(otpCache).invalidate("user@example.com");
    }

    @Test
    void verifyCode_shouldReturnFalseWhenOtpDoesNotMatch() {
        // Test Case ID: MAI-VFS-005
        when(otpCache.getIfPresent("user@example.com")).thenReturn("654321");

        boolean actual = verificationService.verifyCode("user@example.com", "123456");

        assertFalse(actual);
    }
}
