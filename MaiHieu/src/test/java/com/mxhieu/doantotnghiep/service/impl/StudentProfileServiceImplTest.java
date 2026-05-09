package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.converter.StudentProfileConverter;
import com.mxhieu.doantotnghiep.dto.request.StudentprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentprofileResponse;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.StudentProfileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class StudentProfileServiceImplTest {

    @Autowired
    private StudentProfileServiceImpl service;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private ModelMapper modelMapper;

    @MockBean
    private StudentProfileConverter studentProfileConverter;

    @Test
    void createStudentProfile_shouldCreateUserThenPersistStudentProfile() {
        // Test Case ID: MAI-SPS-001
        StudentprofileRequest request = StudentprofileRequest.builder()
                .email(uniqueEmail("student"))
                .otp("123456")
                .build();
        UserEntity mappedUser = UserEntity.builder()
                .email(request.getEmail())
                .password("password")
                .fullName("Student")
                .status("ACTIVE")
                .build();
        UserEntity savedUser = userRepository.save(mappedUser);

        when(modelMapper.map(request, UserEntity.class)).thenReturn(mappedUser);

        service.createStudentProfile(request);

        StudentProfileEntity persisted = studentProfileRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(savedUser.getId()))
                .findFirst()
                .orElseThrow();

        assertEquals(savedUser.getId(), persisted.getUser().getId());
    }

    @Test
    void getStudentProfiles_shouldMapAllProfiles() {
        // Test Case ID: MAI-SPS-002
        // Get count before adding our test profile
        int initialCount = studentProfileRepository.findAll().size();

        UserEntity user = createUser(uniqueEmail("profile"));
        StudentProfileEntity profile = studentProfileRepository.save(StudentProfileEntity.builder()
                .user(user)
                .firstLogin(false)
                .build());

        StudentprofileResponse response = StudentprofileResponse.builder()
                .id(profile.getId())
                .build();
        when(studentProfileConverter.toResponse(profile, StudentprofileResponse.class))
                .thenReturn(response);

        List<StudentprofileResponse> result = service.getStudentProfiles();

        assertEquals(initialCount + 1, result.size());
        // Verify our profile is in the result
        assertEquals(profile.getId(), result.get(result.size() - 1).getId());
    }

    @Test
    void getStudentProfileById_shouldThrowWhenNotFound() {
        // Test Case ID: MAI-SPS-003
        int missingId = -9999;

        AppException ex = assertThrows(AppException.class, () -> service.getStudentProfileById(missingId));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void updateStudentProfile_shouldThrowWhenProfileNotFound() {
        // Test Case ID: MAI-SPS-004
        StudentprofileRequest request = StudentprofileRequest.builder()
                .id(-9999)
                .build();

        AppException ex = assertThrows(AppException.class, () -> service.updateStudentProfile(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void khoaTaiKhoanStudentProfile_shouldSetUserInactive() {
        // Test Case ID: MAI-SPS-005
        UserEntity user = createUser(uniqueEmail("inactive"));
        StudentProfileEntity profile = studentProfileRepository.save(StudentProfileEntity.builder()
                .user(user)
                .firstLogin(false)
                .build());

        service.khoaTaiKhoanStudentProfile(profile.getId());

        StudentProfileEntity updated = studentProfileRepository.findById(profile.getId()).orElseThrow();
        assertEquals("INACTIVE", updated.getUser().getStatus());
    }

    private UserEntity createUser(String email) {
        return userRepository.save(UserEntity.builder()
                .email(email)
                .password("password")
                .fullName("Test User")
                .status("ACTIVE")
                .build());
    }

    private String uniqueEmail(String prefix) {
        return prefix + "-" + Math.abs(System.nanoTime() % 10000) + "@test.com";
    }
}
