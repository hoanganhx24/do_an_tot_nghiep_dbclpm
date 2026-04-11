package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MailServiceImplTest {

    @Mock
    private JavaMailSender javaMailSender;

    @Mock
    private SpringTemplateEngine templateEngine;

    private MailServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new MailServiceImpl();
        ReflectionTestUtils.setField(service, "javaMailSender", javaMailSender);
        ReflectionTestUtils.setField(service, "templateEngine", templateEngine);
        ReflectionTestUtils.setField(service, "fromEmail", "system@example.com");
    }

    @Test
    void sendMail_shouldSendMimeMessageSuccessfully() throws Exception {
        // Test Case ID: MAI-MLS-001
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        DataMailDTO mail = new DataMailDTO();
        mail.setTo("user@example.com");
        mail.setSubject("Subject");
        mail.setProps(Map.of("otp", "123456"));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("verify_email_template"), any())).thenReturn("<html>ok</html>");

        service.sendMail(mail, "verify_email_template");

        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void sendMail_shouldThrowAppExceptionWhenCreateMimeMessageFails() {
        // Test Case ID: MAI-MLS-002
        DataMailDTO mail = new DataMailDTO();
        mail.setTo("user@example.com");
        mail.setSubject("Subject");
        mail.setProps(Map.of());

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("mail error"));

        AppException ex = assertThrows(AppException.class, () -> service.sendMail(mail, "verify_email_template"));

        assertEquals(ErrorCode.EMAIL_SEND_FAILED, ex.getErrorCode());
    }

    @Test
    void sendMail_shouldThrowAppExceptionWhenTemplateEngineFails() {
        // Test Case ID: MAI-MLS-003
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        DataMailDTO mail = new DataMailDTO();
        mail.setTo("user@example.com");
        mail.setSubject("Subject");
        mail.setProps(Map.of("otp", "123456"));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("verify_email_template"), any())).thenThrow(new RuntimeException("template error"));

        AppException ex = assertThrows(AppException.class, () -> service.sendMail(mail, "verify_email_template"));

        assertEquals(ErrorCode.EMAIL_SEND_FAILED, ex.getErrorCode());
    }
}
