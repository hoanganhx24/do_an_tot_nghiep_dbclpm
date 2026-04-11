package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.TeacherprofileConverter;
import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;
import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.RoleRepository;
import com.mxhieu.doantotnghiep.repository.TeacheprofileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.repository.UserRoleRepository;
import com.mxhieu.doantotnghiep.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherprofileServiceImplTest {

    @Mock
    private TeacheprofileRepository teacherprofileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MailServiceImpl mailService;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private TeacherprofileConverter teacherprofileConverter;

    @Mock
    private UserService userService;

    @InjectMocks
    private TeacherprofileServiceImpl service;

    @Test
    void checkEmailExists_shouldThrowWhenEmailAlreadyExists() {
        // Test Case ID: MAI-THS-001
        when(userRepository.existsByEmail("exists@mail.com")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> service.checkEmailExists("exists@mail.com"));

        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode());
    }

    @Test
    void createTeacherProfile_shouldThrowEmailSendFailedWhenMailThrowsRuntimeException() throws Exception {
        // Test Case ID: MAI-THS-002
        TeacherprofileRequest request = new TeacherprofileRequest();
        request.setEmail("teacher@mail.com");
        request.setBirthday("2000-01-01");

        UserEntity mappedUser = UserEntity.builder().email("teacher@mail.com").build();
        TeacherprofileEntity mappedTeacher = new TeacherprofileEntity();
        RoleEntity role = new RoleEntity();
        role.setValue("TEACHER");

        when(modelMapper.map(request, UserEntity.class)).thenReturn(mappedUser);
        when(modelMapper.map(request, TeacherprofileEntity.class)).thenReturn(mappedTeacher);
        when(passwordEncoder.encode(anyString())).thenReturn("ENC");
        when(roleRepository.findByValue("TEACHER")).thenReturn(Optional.of(role));
        doThrow(new RuntimeException("mail fail")).when(mailService).sendMail(any(), anyString());

        AppException ex = assertThrows(AppException.class, () -> service.createTeacherProfile(request));

        assertEquals(ErrorCode.EMAIL_SEND_FAILED, ex.getErrorCode());
    }

    @Test
    void getAllTeacherProfilesActive_shouldReturnConverterResult() {
        // Test Case ID: MAI-THS-003
        TeacherprofileEntity teacher = new TeacherprofileEntity();
        TeacherprofileResponse response = TeacherprofileResponse.builder().id(1).build();

        when(teacherprofileRepository.findAllActiveTeachers()).thenReturn(List.of(teacher));
        when(teacherprofileConverter.toResponseList(List.of(teacher), TeacherprofileResponse.class)).thenReturn(List.of(response));

        List<TeacherprofileResponse> actual = service.getAllTeacherProfilesActive();

        assertEquals(1, actual.size());
        assertEquals(1, actual.get(0).getId());
    }

    @Test
    void terminateTeacherProfile_shouldThrowWhenTeacherNotFound() {
        // Test Case ID: MAI-THS-004
        when(teacherprofileRepository.findById(10)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.terminateTeacherProfile(10));

        assertEquals(ErrorCode.TEACHERPROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void terminateTeacherProfile_shouldSetTeacherUserInactive() {
        // Test Case ID: MAI-THS-005
        UserEntity user = UserEntity.builder().id(2).status("ACTIVE").birthday(LocalDate.of(2000, 1, 1)).build();
        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setId(11);
        teacher.setUser(user);

        when(teacherprofileRepository.findById(11)).thenReturn(Optional.of(teacher));

        service.terminateTeacherProfile(11);

        assertEquals("INACTIVE", user.getStatus());
        verify(userRepository).save(user);
    }
}
