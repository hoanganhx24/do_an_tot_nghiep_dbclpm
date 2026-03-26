package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.AuthenticationRequest;
import com.mxhieu.doantotnghiep.dto.response.AuthenticationResponse;
import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.RoleRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.service.AuthenticationService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AuthenticationServiceImpl implements AuthenticationService {
    @Value("${jwt.signer-key}")
    protected String SIGNER_KEY;

    final PasswordEncoder passwordEncoder;
    final UserRepository userRepository;
    final RoleRepository roleRepository;

    @Override
    public AuthenticationResponse logIn(AuthenticationRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        if(user.getStatus().equals("INACTIVE")) {
            throw new AppException(ErrorCode.USER_INACTIVE);
        }
        int id;
        String name = user.getFullName();
        Boolean firstLogin = false;
        List<RoleEntity> roles = roleRepository.findByEmail(user.getEmail()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        if(roles.stream().anyMatch(role -> role.getValue().equals("TEACHER")) && user.getTeacherprofile() != null) {
            id = user.getTeacherprofile().getId();
        } else if(roles.stream().anyMatch(role -> role.getValue().equals("STUDENT")) && user.getStudentprofile() != null) {
            id = user.getStudentprofile().getId();
            firstLogin = user.getStudentprofile().getFirstLogin();
        }else {
            id = user.getId();
        }
        return AuthenticationResponse.builder()
                .id(id)
                .name(name)
                .token(generateToken(request.getEmail(),id,name))
                .refreshToken(generateRefreshToken(request.getEmail(), id, name))
                .verified(authenticated)
                .firstLogin(firstLogin)
                .build();
    }

    @Override
    public AuthenticationResponse refreshToken(String refreshToken) {
        try{
            JWSObject jwsObject = JWSObject.parse(refreshToken);
            JWTClaimsSet jwtClaimsSet = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());
            String email = jwtClaimsSet.getSubject();
            int id = jwtClaimsSet.getIntegerClaim("id");
            String name = jwtClaimsSet.getStringClaim("name");

            if(jwtClaimsSet.getExpirationTime().before(new Date()) || !"refresh".equals(jwtClaimsSet.getStringClaim("type"))) {
                throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
            }

            return AuthenticationResponse.builder()
                    .token(generateToken(email, id, name))
                    .refreshToken(refreshToken)
                    .build();

        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }

    private String generateRefreshToken(String email, int id, String name) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer("com.mxhieu")
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(7, java.time.temporal.ChronoUnit.DAYS)))
                .claim("type", "refresh")
                .claim("id", id)
                .claim("name",name)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    public String generateToken(String requestEmail, int id, String name) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(requestEmail)
                .issuer("com.mxhieu")
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(7, java.time.temporal.ChronoUnit.DAYS)))
                .claim("role", getRoleFromEmail(requestEmail))
                .claim("type", "access")
                .claim("id", id)
                .claim("name",name)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    private Object getRoleFromEmail(String email) {
        List<RoleEntity> roles = roleRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return roles.stream().map(roleEntity -> roleEntity.getValue()).collect(Collectors.joining(" "));
    }
}
