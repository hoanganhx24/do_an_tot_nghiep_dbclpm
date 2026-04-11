package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.StudentProfileConverter;
import com.mxhieu.doantotnghiep.dto.request.StudentprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentprofileResponse;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.StudentProfileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.service.MailService;
import com.mxhieu.doantotnghiep.service.UserService;
import com.mxhieu.doantotnghiep.service.VerificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentProfileServiceImplTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private MailService mailService;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VerificationService verificationService;

    @Mock
    private StudentProfileConverter studentProfileConverter;

    @InjectMocks
    private StudentProfileServiceImpl service;

    @Test
    void createStudentProfile_shouldCreateUserThenPersistStudentProfile() {
        // Test Case ID: MAI-SPS-001
        StudentprofileRequest request = StudentprofileRequest.builder().email("student@mail.com").otp("123456").build();
        UserEntity mappedUser = UserEntity.builder().email("student@mail.com").build();
        UserEntity savedUser = UserEntity.builder().id(10).email("student@mail.com").build();

        when(modelMapper.map(request, UserEntity.class)).thenReturn(mappedUser);
        when(userRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(savedUser));

        service.createStudentProfile(request);

        verify(userService).createStudent(mappedUser, "123456");
        ArgumentCaptor<StudentProfileEntity> captor = ArgumentCaptor.forClass(StudentProfileEntity.class);
        verify(studentProfileRepository).save(captor.capture());
        assertEquals(10, captor.getValue().getUser().getId());
    }

    @Test
    void getStudentProfiles_shouldMapAllProfiles() {
        // Test Case ID: MAI-SPS-002
        StudentProfileEntity p1 = StudentProfileEntity.builder().id(1).build();
        when(studentProfileRepository.findAll()).thenReturn(List.of(p1));
        when(studentProfileConverter.toResponse(p1, StudentprofileResponse.class))
                .thenReturn(StudentprofileResponse.builder().id(1).build());

        List<StudentprofileResponse> result = service.getStudentProfiles();

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getId());
    }

    @Test
    void getStudentProfileById_shouldThrowWhenNotFound() {
        // Test Case ID: MAI-SPS-003
        when(studentProfileRepository.findById(99)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getStudentProfileById(99));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void updateStudentProfile_shouldThrowWhenProfileNotFound() {
        // Test Case ID: MAI-SPS-004
        StudentprofileRequest request = StudentprofileRequest.builder().id(99).build();
        when(studentProfileRepository.findById(99)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.updateStudentProfile(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void khoaTaiKhoanStudentProfile_shouldSetUserInactive() {
        // Test Case ID: MAI-SPS-005
        UserEntity user = UserEntity.builder().id(1).status("ACTIVE").build();
        StudentProfileEntity profile = StudentProfileEntity.builder().id(5).user(user).build();
        when(studentProfileRepository.findById(5)).thenReturn(Optional.of(profile));

        service.khoaTaiKhoanStudentProfile(5);

        assertEquals("INACTIVE", profile.getUser().getStatus());
        verify(studentProfileRepository).save(profile);
    }
}
