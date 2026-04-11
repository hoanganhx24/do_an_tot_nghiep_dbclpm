package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.UserConverter;
import com.mxhieu.doantotnghiep.dto.request.UserRequest;
import com.mxhieu.doantotnghiep.dto.response.UserRespone;
import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.RoleRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.repository.UserRoleRepository;
import com.mxhieu.doantotnghiep.service.VerificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VerificationService verificationService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MailServiceImpl mailService;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private UserConverter userConverter;

    @InjectMocks
    private UserServiceImpl service;

    @Test
    void checkEmailExistsAndSendCode_shouldThrowWhenEmailAlreadyExists() {
        // Test Case ID: MAI-USR-001
        UserRequest request = new UserRequest();
        request.setEmail("exists@mail.com");
        when(userRepository.existsByEmail("exists@mail.com")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> service.checkEmailExistsAndSendCode(request));

        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode());
    }

    @Test
    void checkEmailExistsAndSendCode_shouldSendOtpWhenEmailIsNew() {
        // Test Case ID: MAI-USR-002
        UserRequest request = new UserRequest();
        request.setEmail("new@mail.com");
        when(userRepository.existsByEmail("new@mail.com")).thenReturn(false);

        service.checkEmailExistsAndSendCode(request);

        verify(verificationService).sendVerificationCode("new@mail.com");
    }

    @Test
    void createUser_shouldThrowWhenOtpInvalid() {
        // Test Case ID: MAI-USR-003
        UserRequest request = new UserRequest();
        request.setEmail("student@mail.com");

        when(verificationService.verifyCode("student@mail.com", "000000")).thenReturn(false);

        AppException ex = assertThrows(AppException.class, () -> service.createUser(request, "000000"));

        assertEquals(ErrorCode.INVALID_OTP, ex.getErrorCode());
    }

    @Test
    void createUser_shouldThrowWhenRoleNotFound() {
        // Test Case ID: MAI-USR-004
        UserRequest request = new UserRequest();
        request.setEmail("teacher@mail.com");
        request.setRole("TEACHER");

        when(verificationService.verifyCode("teacher@mail.com", "123456")).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("ENC");
        when(roleRepository.findByValue("TEACHER")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.createUser(request, "123456"));

        assertEquals(ErrorCode.ROLE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createUser_shouldCreateAccountWithStudentRoleWhenOtpValid() throws Exception {
        // Test Case ID: MAI-USR-005
        UserRequest request = new UserRequest();
        request.setEmail("student@mail.com");
        request.setRole("STUDENT");

        RoleEntity role = new RoleEntity();
        role.setId(2);
        role.setValue("STUDENT");

        when(verificationService.verifyCode("student@mail.com", "123456")).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("ENC");
        when(roleRepository.findByValue("STUDENT")).thenReturn(Optional.of(role));

        service.createUser(request, "123456");

        verify(userRepository).save(any(UserEntity.class));
        verify(userRoleRepository).save(any());
        verify(mailService).sendMail(any(), anyString());
    }

    @Test
    void changePassword_shouldThrowWhenUserNotFound() {
        // Test Case ID: MAI-USR-006
        UserRequest request = new UserRequest();
        request.setEmail("none@mail.com");
        when(userRepository.findByEmail("none@mail.com")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.changePassword(request));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void changePassword_shouldThrowWhenOldPasswordCheckFailsByCurrentLogic() {
        // Test Case ID: MAI-USR-007
        UserRequest request = new UserRequest();
        request.setEmail("user@mail.com");
        request.setPassword("old");
        UserEntity user = UserEntity.builder().email("user@mail.com").password("stored").build();

        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("stored", "old")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> service.changePassword(request));

        assertEquals(ErrorCode.PASSWORD_NOT_MATCH, ex.getErrorCode());
    }

    @Test
    void getUserByEmail_shouldReturnConvertedResponse() {
        // Test Case ID: MAI-USR-008
        UserEntity user = UserEntity.builder().email("user@mail.com").build();
        UserRespone response = UserRespone.builder().email("user@mail.com").build();

        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(userConverter.toResponse(user, UserRespone.class)).thenReturn(response);

        UserRespone actual = service.getUserByEmail("user@mail.com");

        assertEquals("user@mail.com", actual.getEmail());
    }

    @Test
    void forGotPassword_shouldThrowWhenUserNotFound() {
        // Test Case ID: MAI-USR-009
        when(userRepository.findByEmail("none@mail.com")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.forGotPassword("none@mail.com"));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void forGotPassword_shouldSendMailAndSaveNewPassword() throws Exception {
        // Test Case ID: MAI-USR-010
        UserEntity user = UserEntity.builder().email("user@mail.com").password("old").build();
        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("ENC");

        service.forGotPassword("user@mail.com");

        verify(mailService).sendMail(any(), anyString());
        verify(userRepository).save(user);
        assertTrue("ENC".equals(user.getPassword()));
    }
}
