package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.AuthenticationRequest;
import com.mxhieu.doantotnghiep.dto.response.AuthenticationResponse;
import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.RoleRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    private static final String SIGNER_KEY = "1234567890123456789012345678901234567890123456789012345678901234";

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthenticationServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "SIGNER_KEY", SIGNER_KEY);
    }

    @Test
    void logIn_shouldThrowWhenUserNotExists() {
        // Test Case ID: MAI-AUT-001
        when(userRepository.findByEmail("notfound@mail.com")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class,
                () -> service.logIn(new AuthenticationRequest("notfound@mail.com", "123")));

        assertEquals(ErrorCode.USER_NOT_EXISTS, ex.getErrorCode());
    }

    @Test
    void logIn_shouldThrowWhenPasswordNotMatch() {
        // Test Case ID: MAI-AUT-002
        UserEntity user = UserEntity.builder().email("u@mail.com").password("hashed").status("ACTIVE").build();
        when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        AppException ex = assertThrows(AppException.class,
                () -> service.logIn(new AuthenticationRequest("u@mail.com", "wrong")));

        assertEquals(ErrorCode.PASSWORD_NOT_MATCH, ex.getErrorCode());
    }

    @Test
    void logIn_shouldThrowWhenUserInactive() {
        // Test Case ID: MAI-AUT-003
        UserEntity user = UserEntity.builder().email("u@mail.com").password("hashed").status("INACTIVE").build();
        when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123", "hashed")).thenReturn(true);

        AppException ex = assertThrows(AppException.class,
                () -> service.logIn(new AuthenticationRequest("u@mail.com", "123")));

        assertEquals(ErrorCode.USER_INACTIVE, ex.getErrorCode());
    }

    @Test
    void logIn_shouldReturnTeacherProfileIdWhenRoleTeacher() {
        // Test Case ID: MAI-AUT-004
        TeacherprofileEntity teacherprofile = new TeacherprofileEntity();
        teacherprofile.setId(55);

        UserEntity user = UserEntity.builder()
                .id(10)
                .email("teacher@mail.com")
                .password("hashed")
                .fullName("Teacher")
                .status("ACTIVE")
                .teacherprofile(teacherprofile)
                .build();

        RoleEntity teacherRole = new RoleEntity();
        teacherRole.setValue("TEACHER");

        when(userRepository.findByEmail("teacher@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123", "hashed")).thenReturn(true);
        when(roleRepository.findByEmail("teacher@mail.com")).thenReturn(Optional.of(List.of(teacherRole)));

        AuthenticationResponse response = service.logIn(new AuthenticationRequest("teacher@mail.com", "123"));

        assertEquals(55, response.getId());
        assertTrue(response.getVerified());
        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    void logIn_shouldReturnStudentProfileIdAndFirstLoginFlagWhenRoleStudent() {
        // Test Case ID: MAI-AUT-005
        StudentProfileEntity studentProfile = StudentProfileEntity.builder().id(77).firstLogin(true).build();

        UserEntity user = UserEntity.builder()
                .id(10)
                .email("student@mail.com")
                .password("hashed")
                .fullName("Student")
                .status("ACTIVE")
                .studentprofile(studentProfile)
                .build();

        RoleEntity studentRole = new RoleEntity();
        studentRole.setValue("STUDENT");

        when(userRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123", "hashed")).thenReturn(true);
        when(roleRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(List.of(studentRole)));

        AuthenticationResponse response = service.logIn(new AuthenticationRequest("student@mail.com", "123"));

        assertEquals(77, response.getId());
        assertTrue(response.getFirstLogin());
        assertTrue(response.getVerified());
    }

    @Test
    void refreshToken_shouldThrowRuntimeWhenTokenFormatInvalid() {
        // Test Case ID: MAI-AUT-006
        assertThrows(RuntimeException.class, () -> service.refreshToken("invalid-token"));
    }

    @Test
    void refreshToken_shouldThrowWhenTokenExpired() throws JOSEException {
        // Test Case ID: MAI-AUT-007
        String expiredRefreshToken = createRefreshToken("expired@mail.com", 1, "Expired", Date.from(Instant.now().minus(1, ChronoUnit.DAYS)));

        AppException ex = assertThrows(AppException.class, () -> service.refreshToken(expiredRefreshToken));

        assertEquals(ErrorCode.INVALID_REFRESH_TOKEN, ex.getErrorCode());
    }

    @Test
    void refreshToken_shouldIssueNewAccessTokenWhenRefreshTokenValid() throws JOSEException {
        // Test Case ID: MAI-AUT-008
        RoleEntity studentRole = new RoleEntity();
        studentRole.setValue("STUDENT");
        when(roleRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(List.of(studentRole)));

        String refreshToken = createRefreshToken(
                "student@mail.com",
                7,
                "Student",
                Date.from(Instant.now().plus(1, ChronoUnit.DAYS))
        );

        AuthenticationResponse response = service.refreshToken(refreshToken);

        assertNotNull(response.getToken());
        assertEquals(refreshToken, response.getRefreshToken());
    }

    @Test
    void generateToken_shouldThrowWhenRoleNotFound() {
        // Test Case ID: MAI-AUT-009
        when(roleRepository.findByEmail("norole@mail.com")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.generateToken("norole@mail.com", 10, "Name"));

        assertEquals(ErrorCode.ROLE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void generateToken_shouldReturnSerializedToken() {
        // Test Case ID: MAI-AUT-010
        RoleEntity adminRole = new RoleEntity();
        adminRole.setValue("ADMIN");
        when(roleRepository.findByEmail("admin@mail.com")).thenReturn(Optional.of(List.of(adminRole)));

        String token = service.generateToken("admin@mail.com", 1, "Admin");

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    private String createRefreshToken(String email, int id, String name, Date expireDate) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer("com.mxhieu")
                .issueTime(new Date())
                .expirationTime(expireDate)
                .claim("type", "refresh")
                .claim("id", id)
                .claim("name", name)
                .build();

        JWSObject jwsObject = new JWSObject(header, new Payload(claimsSet.toJSONObject()));
        jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
        return jwsObject.serialize();
    }
}
