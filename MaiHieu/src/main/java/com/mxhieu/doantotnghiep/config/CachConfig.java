package com.mxhieu.doantotnghiep.config;


import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.concurrent.TimeUnit;

@Configuration
public class CachConfig {
    @Bean
    public Cache<String, String> otpCache() {
        // Cache lưu tối đa 1000 mã OTP, tự xóa sau 5 phút
        return CacheBuilder.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(1000)
                .build();
    }
}
