package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class UserServiceImplTest {

    @Autowired
    private UserServiceImpl service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @MockBean
    private VerificationService verificationService;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private MailServiceImpl mailService;

    @MockBean
    private UserConverter userConverter;

    @Test
    void checkEmailExistsAndSendCode_shouldThrowWhenEmailAlreadyExists() {
        // Test Case ID: MAI-USR-001
        UserEntity existing = UserEntity.builder().email("exists@mail.com").build();
        userRepository.save(existing);

        UserRequest request = new UserRequest();
        request.setEmail("exists@mail.com");

        AppException ex = assertThrows(AppException.class, () -> service.checkEmailExistsAndSendCode(request));

        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode());
    }

    @Test
    void checkEmailExistsAndSendCode_shouldSendOtpWhenEmailIsNew() {
        // Test Case ID: MAI-USR-002
        UserRequest request = new UserRequest();
        request.setEmail("new@mail.com");

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
        RoleEntity role = new RoleEntity();
        role.setValue("STUDENT");
        entityManager.persist(role);
        entityManager.flush();

        UserRequest request = new UserRequest();
        request.setEmail("student@mail.com");
        request.setRole("STUDENT");

        when(verificationService.verifyCode("student@mail.com", "123456")).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("ENC");
        when(roleRepository.findByValue("STUDENT")).thenReturn(Optional.of(role));

        service.createUser(request, "123456");

        UserEntity savedUser = userRepository.findByEmail("student@mail.com").orElseThrow();
        assertEquals("student@mail.com", savedUser.getEmail());
        assertEquals("ENC", savedUser.getPassword());

        boolean userRoleCreated = userRoleRepository.findAll().stream()
                .anyMatch(userRole -> userRole.getUser().getId().equals(savedUser.getId())
                        && userRole.getRole().getValue().equals("STUDENT"));
        assertTrue(userRoleCreated);
        verify(mailService).sendMail(any(), anyString());
    }

    @Test
    void changePassword_shouldThrowWhenUserNotFound() {
        // Test Case ID: MAI-USR-006
        UserRequest request = new UserRequest();
        request.setEmail("none@mail.com");

        AppException ex = assertThrows(AppException.class, () -> service.changePassword(request));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void changePassword_shouldThrowWhenOldPasswordCheckFailsByCurrentLogic() {
        // Test Case ID: MAI-USR-007
        UserEntity user = UserEntity.builder().email("user@mail.com").password("stored").build();
        userRepository.save(user);

        UserRequest request = new UserRequest();
        request.setEmail("user@mail.com");
        request.setPassword("old");

        when(passwordEncoder.matches("stored", "old")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> service.changePassword(request));

        assertEquals(ErrorCode.PASSWORD_NOT_MATCH, ex.getErrorCode());
    }

    @Test
    void getUserByEmail_shouldReturnConvertedResponse() {
        // Test Case ID: MAI-USR-008
        UserEntity user = UserEntity.builder().email("user@mail.com").build();
        userRepository.save(user);

        UserRespone response = UserRespone.builder().email("user@mail.com").build();
        when(userConverter.toResponse(user, UserRespone.class)).thenReturn(response);

        UserRespone actual = service.getUserByEmail("user@mail.com");

        assertEquals("user@mail.com", actual.getEmail());
    }

    @Test
    void forGotPassword_shouldThrowWhenUserNotFound() {
        // Test Case ID: MAI-USR-009
        AppException ex = assertThrows(AppException.class, () -> service.forGotPassword("none@mail.com"));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void forGotPassword_shouldSendMailAndSaveNewPassword() throws Exception {
        // Test Case ID: MAI-USR-010
        UserEntity user = UserEntity.builder().email("user@mail.com").password("old").build();
        userRepository.save(user);

        when(passwordEncoder.encode(anyString())).thenReturn("ENC");

        service.forGotPassword("user@mail.com");

        UserEntity updatedUser = userRepository.findByEmail("user@mail.com").orElseThrow();
        assertEquals("ENC", updatedUser.getPassword());
        verify(mailService).sendMail(any(), anyString());
    }
}
