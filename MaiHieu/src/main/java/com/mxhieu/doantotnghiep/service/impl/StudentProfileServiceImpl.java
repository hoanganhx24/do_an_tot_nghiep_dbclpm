package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.StudentProfileConverter;
import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import com.mxhieu.doantotnghiep.dto.request.StudentprofileRequest;
import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentprofileResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.StudentProfileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.service.MailService;
import com.mxhieu.doantotnghiep.service.StudentProfileService;
import com.mxhieu.doantotnghiep.service.UserService;
import com.mxhieu.doantotnghiep.service.VerificationService;
import com.mxhieu.doantotnghiep.utils.PasswordUtil;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final MailService mailService;
    private final ModelMapper modelMapper;
    private final UserService userService;
    private final UserRepository userRepository;
    private final VerificationService verificationService;
    private final StudentProfileConverter studentProfileConverter;

    @Override
    public void createStudentProfile(StudentprofileRequest request) {
        UserEntity user = modelMapper.map(request, UserEntity.class);
        userService.createStudent(user, request.getOtp());
        UserEntity savedUser = userRepository.findByEmail(request.getEmail()).get();
        StudentProfileEntity studentProfileEntity = new StudentProfileEntity();
        studentProfileEntity.setUser(savedUser);
        studentProfileRepository.save(studentProfileEntity);
    }

    @Override
    public List<StudentprofileResponse> getStudentProfiles() {
        List<StudentProfileEntity> studentProfiles = studentProfileRepository.findAll();
        return studentProfiles.stream().map(studentProfile -> studentProfileConverter.toResponse(studentProfile, StudentprofileResponse.class)).toList();
    }

    @Override
    public StudentprofileResponse getStudentProfileById(int id) {
        StudentProfileEntity studentProfile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));
        return studentProfileConverter.toResponse(studentProfile, StudentprofileResponse.class);
    }

    @Override
    public void updateStudentProfile(StudentprofileRequest request) {
        StudentProfileEntity existingProfile = studentProfileRepository.findById(request.getId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        // Cập nhật thông tin từ request vào existingProfile
        existingProfile.getUser().setFullName(request.getFullName());
        existingProfile.getUser().setPhone(request.getPhone());
        existingProfile.getUser().setEmail(request.getEmail());
        existingProfile.getUser().setAddress(request.getAddress());
        existingProfile.getUser().setSex(request.getSex());
        existingProfile.getUser().setBirthday(request.getBirthday());

        existingProfile.setTargetScore(request.getTargetScore());
        existingProfile.setDailyStudyMinutes(request.getDailyStudyMinutes());
        existingProfile.setPlacementLevel(request.getPlacementLevel());


        studentProfileRepository.save(existingProfile);
    }

    @Override
    public void khoaTaiKhoanStudentProfile(int id) {
        StudentProfileEntity studentProfile = studentProfileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));
        studentProfile.getUser().setStatus("INACTIVE");
        studentProfileRepository.save(studentProfile);
    }

}
