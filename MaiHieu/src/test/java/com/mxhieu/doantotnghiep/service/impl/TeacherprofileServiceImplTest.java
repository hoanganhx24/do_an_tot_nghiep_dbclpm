package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.converter.TeacherprofileConverter;
import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.TeacheprofileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class TeacherprofileServiceImplTest {

    @Autowired
    private TeacherprofileServiceImpl service;

    @Autowired
    private TeacheprofileRepository teacherprofileRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private MailServiceImpl mailService;

    @MockBean
    private TeacherprofileConverter teacherprofileConverter;

    @Test
    void checkEmailExists_shouldThrowWhenEmailAlreadyExists() {
        // Test Case ID: MAI-THS-001
        String email = "exists-" + UUID.randomUUID() + "@mail.com";
        UserEntity user = userRepository.save(UserEntity.builder()
                .email(email)
                .password("password")
                .fullName("Existing Teacher")
                .status("ACTIVE")
                .build());

        AppException ex = assertThrows(AppException.class, () -> service.checkEmailExists(email));

        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode());
    }

    @Test
    void createTeacherProfile_shouldThrowEmailSendFailedWhenMailThrowsRuntimeException() throws Exception {
        // Test Case ID: MAI-THS-002
        String email = "teacher-mail-fail-" + UUID.randomUUID() + "@mail.com";
        TeacherprofileRequest request = new TeacherprofileRequest();
        request.setEmail(email);
        request.setFullName("Teacher Mail Test");
        request.setBirthday("2000-01-01");

        doThrow(new RuntimeException("mail fail")).when(mailService).sendMail(any(), anyString());

        AppException ex = assertThrows(AppException.class, () -> service.createTeacherProfile(request));

        assertEquals(ErrorCode.EMAIL_SEND_FAILED, ex.getErrorCode());
    }

    @Test
    void getAllTeacherProfilesActive_shouldReturnConverterResult() {
        // Test Case ID: MAI-THS-003
        UserEntity teacherUser = userRepository.save(UserEntity.builder()
                .email("active-teacher-" + UUID.randomUUID() + "@mail.com")
                .password("password")
                .fullName("Active Teacher")
                .status("ACTIVE")
                .build());

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacherprofileRepository.save(teacher);

        TeacherprofileResponse response = TeacherprofileResponse.builder().id(teacher.getId()).build();
        when(teacherprofileConverter.toResponseList(any(), any())).thenReturn(List.of(response));

        List<TeacherprofileResponse> actual = service.getAllTeacherProfilesActive();

        assertEquals(1, actual.size());
        assertEquals(teacher.getId(), actual.get(0).getId());
    }

    @Test
    void terminateTeacherProfile_shouldThrowWhenTeacherNotFound() {
        // Test Case ID: MAI-THS-004
        int missingTeacherId = -9999;

        AppException ex = assertThrows(AppException.class, () -> service.terminateTeacherProfile(missingTeacherId));

        assertEquals(ErrorCode.TEACHERPROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void terminateTeacherProfile_shouldSetTeacherUserInactive() {
        // Test Case ID: MAI-THS-005
        UserEntity user = userRepository.save(UserEntity.builder()
                .email("terminate-teacher-" + UUID.randomUUID() + "@mail.com")
                .password("password")
                .fullName("Teacher to Terminate")
                .status("ACTIVE")
                .birthday(LocalDate.of(2000, 1, 1))
                .build());

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(user);
        teacher = teacherprofileRepository.save(teacher);

        service.terminateTeacherProfile(teacher.getId());

        UserEntity updated = userRepository.findById(user.getId()).orElseThrow();
        assertEquals("INACTIVE", updated.getStatus());
    }
}
