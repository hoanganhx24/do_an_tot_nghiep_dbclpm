package com.mxhieu.doantotnghiep.service.impl;

import com.google.common.cache.Cache;
import com.mxhieu.doantotnghiep.config.CachConfig;
import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import com.mxhieu.doantotnghiep.service.MailService;
import com.mxhieu.doantotnghiep.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {
    private final MailService mailService;
    private final Cache<String, String> otpCache;

    @Override
    public void sendVerificationCode(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));

        otpCache.put(email, otp);

        DataMailDTO dataMail = new DataMailDTO();
        dataMail.setTo(email);
        dataMail.setSubject("Mã xác thực tài khoản");

        Map<String, Object> props = new HashMap<>();
        props.put("email", email);
        props.put("otp", otp);
        dataMail.setProps(props);
        try {
            mailService.sendMail(dataMail, "verify_email_template");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public boolean verifyCode(String email, String code) {
        String storedCode = otpCache.getIfPresent(email);
        if (storedCode == null) return false;

        boolean valid = storedCode.equals(code);
        if (valid) otpCache.invalidate(email); // Xóa mã sau khi dùng thành công
        return valid;
    }
}
