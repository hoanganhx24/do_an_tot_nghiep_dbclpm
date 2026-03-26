package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import jakarta.mail.MessagingException;

public interface MailService {
    void sendMail(DataMailDTO dataMailDTO, String template) throws MessagingException;
}
