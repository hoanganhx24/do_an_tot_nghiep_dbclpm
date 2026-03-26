package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class MailServiceImpl implements MailService {
    @Autowired
    JavaMailSender javaMailSender;
    @Autowired
    SpringTemplateEngine templateEngine;
    @Value("${spring.mail.username}")
    private String fromEmail;
    @Override
    public void sendMail(DataMailDTO dataMail, String templateName) throws MessagingException {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");

            Context context = new Context();
            context.setVariables(dataMail.getProps());

            String html = templateEngine.process(templateName, context);
            helper.setFrom(fromEmail);
            helper.setTo(dataMail.getTo());
            helper.setSubject(dataMail.getSubject());
            helper.setText(html, true);

            javaMailSender.send(message);

        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

}
