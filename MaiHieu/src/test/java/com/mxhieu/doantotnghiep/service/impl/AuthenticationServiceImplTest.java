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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho AuthenticationServiceImpl
 *
 * Theo docs UC 1.3: Đăng nhập, xác thực JWT.
 * Xử lý: logIn, refreshToken, generateToken.
 * Phân quyền: ADMIN, TEACHER, STUDENT.
 *
 * Cấu trúc test: DATA → MOCK → ACTION → CHECK DB/DATA → ROLLBACK
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthenticationServiceImpl authService;

    private UserEntity studentUser;
    private UserEntity teacherUser;
    private UserEntity adminUser;
    private UserEntity inactiveUser;

    @BeforeEach
    void setUp() {
        // SIGNER_KEY phải đủ dài cho HS512 (tối thiểu 64 byte)
        ReflectionTestUtils.setField(authService, "SIGNER_KEY",
                "abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz123456");

        // Student user với StudentProfile
        StudentProfileEntity studentProfile = new StudentProfileEntity();
        studentProfile.setId(100);
        studentProfile.setFirstLogin(true);

        studentUser = new UserEntity();
        studentUser.setId(1);
        studentUser.setEmail("student@test.com");
        studentUser.setPassword("encodedPassword");
        studentUser.setFullName("Nguyen Van A");
        studentUser.setStatus("ACTIVE");
        studentUser.setStudentprofile(studentProfile);

        // Teacher user với TeacherProfile
        TeacherprofileEntity teacherProfile = new TeacherprofileEntity();
        teacherProfile.setId(200);

        teacherUser = new UserEntity();
        teacherUser.setId(2);
        teacherUser.setEmail("teacher@test.com");
        teacherUser.setPassword("encodedPassword");
        teacherUser.setFullName("Tran Van B");
        teacherUser.setStatus("ACTIVE");
        teacherUser.setTeacherprofile(teacherProfile);

        // Admin user (không có profile riêng)
        adminUser = new UserEntity();
        adminUser.setId(3);
        adminUser.setEmail("admin@test.com");
        adminUser.setPassword("encodedPassword");
        adminUser.setFullName("Admin");
        adminUser.setStatus("ACTIVE");

        // Inactive user
        inactiveUser = new UserEntity();
        inactiveUser.setId(4);
        inactiveUser.setEmail("inactive@test.com");
        inactiveUser.setPassword("encodedPassword");
        inactiveUser.setFullName("Locked User");
        inactiveUser.setStatus("INACTIVE");
    }

    // ==================== MAI-AUT-001 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-001: Đăng nhập thành công với tài khoản STUDENT - trả token và firstLogin")
    void logIn_StudentSuccess_ShouldReturnTokenWithFirstLogin() {
        // === DATA ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("student@test.com");
        request.setPassword("rawPassword");

        RoleEntity studentRole = new RoleEntity();
        studentRole.setValue("STUDENT");

        // === MOCK ===
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(studentUser));
        // matches(raw, encoded) → true
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(roleRepository.findByEmail("student@test.com")).thenReturn(Optional.of(List.of(studentRole)));

        // === ACTION ===
        AuthenticationResponse response = authService.logIn(request);

        // === CHECK DB/DATA ===
        assertNotNull(response);
        assertNotNull(response.getToken());          // Phải có token
        assertNotNull(response.getRefreshToken());   // Phải có refresh token
        assertTrue(response.getVerified());           // verified = true
        assertTrue(response.getFirstLogin());         // Student đăng nhập lần đầu
        assertEquals(100, response.getId());           // ID từ StudentProfile
        assertEquals("Nguyen Van A", response.getName());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-002 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-002: Đăng nhập thành công với tài khoản TEACHER - ID từ TeacherProfile")
    void logIn_TeacherSuccess_ShouldReturnTokenWithTeacherId() {
        // === DATA ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("teacher@test.com");
        request.setPassword("rawPassword");

        RoleEntity teacherRole = new RoleEntity();
        teacherRole.setValue("TEACHER");

        // === MOCK ===
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(teacherUser));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(roleRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(List.of(teacherRole)));

        // === ACTION ===
        AuthenticationResponse response = authService.logIn(request);

        // === CHECK DB/DATA: ID phải lấy từ TeacherProfile, không phải User.id ===
        assertEquals(200, response.getId());
        assertNotNull(response.getToken());
        assertFalse(response.getFirstLogin());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-003 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-003: Đăng nhập thành công với ADMIN - ID từ User.id")
    void logIn_AdminSuccess_ShouldReturnUserIdDirectly() {
        // === DATA ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("admin@test.com");
        request.setPassword("rawPassword");

        RoleEntity adminRole = new RoleEntity();
        adminRole.setValue("ADMIN");

        // === MOCK ===
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(roleRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(List.of(adminRole)));

        // === ACTION ===
        AuthenticationResponse response = authService.logIn(request);

        // === CHECK DB/DATA: Admin không có profile riêng → dùng User.id ===
        assertEquals(3, response.getId());
        assertNotNull(response.getToken());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-004 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-004: Đăng nhập - email không tồn tại - ném USER_NOT_EXISTS")
    void logIn_EmailNotFound_ShouldThrowAppException() {
        // === DATA ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("notfound@test.com");
        request.setPassword("password");

        // === MOCK ===
        when(userRepository.findByEmail("notfound@test.com")).thenReturn(Optional.empty());

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> authService.logIn(request));
        assertEquals(ErrorCode.USER_NOT_EXISTS, ex.getErrorCode());

        // === CHECK DB/DATA: Không gọi passwordEncoder ===
        verify(passwordEncoder, never()).matches(any(), any());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-005 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-005: Đăng nhập - mật khẩu sai - ném PASSWORD_NOT_MATCH")
    void logIn_WrongPassword_ShouldThrowAppException() {
        // === DATA ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("student@test.com");
        request.setPassword("wrongPassword");

        // === MOCK: passwordEncoder.matches trả false ===
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> authService.logIn(request));
        assertEquals(ErrorCode.PASSWORD_NOT_MATCH, ex.getErrorCode());

        // === CHECK DB/DATA: Không gọi roleRepository vì bị chặn ở bước password ===
        verify(roleRepository, never()).findByEmail(any());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-006 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-006: Đăng nhập - tài khoản bị INACTIVE - ném USER_INACTIVE")
    void logIn_InactiveUser_ShouldThrowAppException() {
        // === DATA ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("inactive@test.com");
        request.setPassword("rawPassword");

        // === MOCK: Password đúng nhưng user INACTIVE ===
        when(userRepository.findByEmail("inactive@test.com")).thenReturn(Optional.of(inactiveUser));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);

        // === ACTION + CHECK: Theo docs, tài khoản bị khóa không cho đăng nhập ===
        AppException ex = assertThrows(AppException.class, () -> authService.logIn(request));
        assertEquals(ErrorCode.USER_INACTIVE, ex.getErrorCode());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-007 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-007: Refresh token - token type access → ném INVALID_REFRESH_TOKEN")
    void refreshToken_AccessTokenAsRefresh_ShouldThrow() {
        // === DATA: Dùng access token thay cho refresh token ===
        RoleEntity role = new RoleEntity();
        role.setValue("STUDENT");
        // generateToken gọi nội bộ getRoleFromEmail → cần mock
        when(roleRepository.findByEmail("student@test.com")).thenReturn(Optional.of(List.of(role)));

        String accessToken = authService.generateToken("student@test.com", 100, "Test Name");

        // === ACTION + CHECK: Token có type "access" → không phải "refresh" → ném exception ===
        AppException ex = assertThrows(AppException.class,
                () -> authService.refreshToken(accessToken));
        assertEquals(ErrorCode.INVALID_REFRESH_TOKEN, ex.getErrorCode());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-008 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-008: Refresh token - chuỗi không phải JWT - ném RuntimeException")
    void refreshToken_MalformedToken_ShouldThrowRuntimeException() {
        // === DATA: Chuỗi bất kỳ không phải JWT ===
        String invalidToken = "this-is-not-a-jwt-token";

        // === ACTION + CHECK: Parse thất bại → RuntimeException ===
        assertThrows(RuntimeException.class, () -> authService.refreshToken(invalidToken));

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-009 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-009: generateToken - sinh token không null, có thể serialize")
    void generateToken_ShouldReturnNonNullSerializedToken() {
        // === DATA ===
        String email = "test@test.com";
        int id = 1;
        String name = "Test User";

        // generateToken gọi nội bộ getRoleFromEmail → cần mock
        RoleEntity role = new RoleEntity();
        role.setValue("STUDENT");
        when(roleRepository.findByEmail(email)).thenReturn(Optional.of(List.of(role)));

        // === ACTION: generateToken là public method ===
        String token = authService.generateToken(email, id, name);

        // === CHECK DB/DATA: Token phải không null, không rỗng, có format JWT (3 phần ngăn cách bởi dấu chấm) ===
        assertNotNull(token);
        assertFalse(token.isEmpty());
        // JWT format: header.payload.signature
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length, "JWT phải có đúng 3 phần (header.payload.signature)");

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-010 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-010: Đăng nhập - role không tìm thấy - ném ROLE_NOT_FOUND")
    void logIn_RoleNotFound_ShouldThrowAppException() {
        // === DATA ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("student@test.com");
        request.setPassword("rawPassword");

        // === MOCK: Password đúng nhưng không tìm thấy role ===
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(roleRepository.findByEmail("student@test.com")).thenReturn(Optional.empty());

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> authService.logIn(request));
        assertEquals(ErrorCode.ROLE_NOT_FOUND, ex.getErrorCode());

        // === ROLLBACK ===
    }

    // ==================== MAI-AUT-011 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AUT-011: Đăng nhập - email sai định dạng (DN-08) - Phải ném ngoại lệ")
    void logIn_InvalidEmailFormat_ShouldThrow() {
        // === DATA: Email sai định dạng ===
        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("myemail@.com"); // Sai định dạng
        request.setPassword("password");

        // === MOCK ===
        when(userRepository.findByEmail("myemail@.com")).thenReturn(Optional.of(studentUser));

        // === ACTION + CHECK ===
        // PHÁT HIỆN BUG TỪ SYSTEM TEST: Code KHÔNG validate định dạng email ở form login.
        AppException ex = assertThrows(AppException.class, 
            () -> authService.logIn(request), 
            "Hệ thống phải báo lỗi khi email sai định dạng (DN-08)");

        if (ex.getErrorCode() == ErrorCode.PASSWORD_NOT_MATCH) {
            fail("Bug: Hệ thống bỏ qua bước validate định dạng email và đi thẳng vào check password!");
        }

        // === ROLLBACK ===
    }
}
