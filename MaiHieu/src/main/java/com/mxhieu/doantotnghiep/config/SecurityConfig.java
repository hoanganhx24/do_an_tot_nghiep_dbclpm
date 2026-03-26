package com.mxhieu.doantotnghiep.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Value("${jwt.signer-key}")
    private String secretKey;

    private String[] publicEndpoints = {
            "/auth/login",
            "/auth/refresh-token",
            "/users/check-email",
            "/verify/otp",
            "/studentprofiles/create",
            "/chunk",
            "/chunk/merge",
            "/videos/stream",
            "/users/forgotPassword/{email}"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF (vì ứng dụng thường dùng token thay cho cookie session)
                .cors(cors -> {})
                .authorizeHttpRequests(request ->
                        request
                                // Cho phép POST vào các endpoint public không cần authentication
                                .requestMatchers(publicEndpoints).permitAll()
                                // GET /users chỉ cho ADMIN truy cập
//                                .requestMatchers(HttpMethod.GET, "/teacherprofiles/**").hasRole("ADMIN")
                                // Các request còn lại đều yêu cầu authentication
                                .anyRequest().authenticated()
                );

        // Cấu hình Resource Server dùng JWT
        http.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                                jwt.decoder(jwtDecoder()) // Giải mã JWT với secret key
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter()) // Convert JWT thành Authentication

                        ).authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                        .accessDeniedHandler(new JwtAccessDeniedHandler())
        );

        return http.build();
    }


    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("role"); // lấy quyền từ claim "role"
        converter.setAuthorityPrefix("ROLE_");          // không thêm "ROLE_"
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HS512");
        return NimbusJwtDecoder.withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
