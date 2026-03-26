package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.TeacherprofileConverter;
import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;
import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.entity.UserRoleEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.RoleRepository;
import com.mxhieu.doantotnghiep.repository.TeacheprofileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.repository.UserRoleRepository;
import com.mxhieu.doantotnghiep.service.TeacherprofileService;
import com.mxhieu.doantotnghiep.service.UserService;
import com.mxhieu.doantotnghiep.utils.PasswordUtil;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TeacherprofileServiceImpl implements TeacherprofileService {
    private final TeacheprofileRepository teacherprofileRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailServiceImpl mailService;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final TeacherprofileConverter teacherprofileConverter;
    private final UserService userService;


    @Override
    public void checkEmailExists(String email) {
        if(userRepository.existsByEmail(email))
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    @Override
    public void createTeacherProfile(TeacherprofileRequest request) {
        UserEntity user = modelMapper.map(request, UserEntity.class);

        user.setBirthday(LocalDate.parse(request.getBirthday()));
        String generatedPassword = PasswordUtil.generateRandomPassword(8);
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setStatus("ACTIVE");
        user.setCreateAt(LocalDateTime.now());
        userRepository.save(user);

        RoleEntity role = roleRepository.findByValue("TEACHER").get();
        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        TeacherprofileEntity teacherprofile = modelMapper.map(request, TeacherprofileEntity.class);
        teacherprofile.setUser(user);
        teacherprofileRepository.save(teacherprofile);

        // 3️⃣ Gửi email thông báo mật khẩu
        try {
            DataMailDTO dataMail = new DataMailDTO();
            dataMail.setTo(request.getEmail());
            dataMail.setSubject("Tài khoản của bạn đã được tạo thành công");

            Map<String, Object> props = new HashMap<>();
            props.put("email", user.getEmail());
            props.put("password", generatedPassword); // gửi mật khẩu thật
            props.put("loginUrl", "https://your-frontend-app.com/login");
            dataMail.setProps(props);

            mailService.sendMail(dataMail, "user_created_template"); // HTML template bạn sẽ tạo
        } catch (MessagingException e) {
            e.printStackTrace();
        }catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }

    }

    @Override
    public List<TeacherprofileResponse> getAllTeacherProfiles() {
        List<TeacherprofileEntity> teacherprofiles = teacherprofileRepository.findAll();
        return teacherprofileConverter.toResponseList(teacherprofiles, TeacherprofileResponse.class);
    }

    @Override
    public List<TeacherprofileResponse> getAllTeacherProfilesActive() {
        List<TeacherprofileEntity> teacherprofiles = teacherprofileRepository.findAllActiveTeachers();
        return teacherprofileConverter.toResponseList(teacherprofiles, TeacherprofileResponse.class);
    }

    @Override
    public TeacherprofileResponse getTeacherProfileByID(Integer id) {

        return teacherprofileConverter.toResponse(teacherprofileRepository.findById(id).get(),TeacherprofileResponse.class);
    }

    @Override
    public void terminateTeacherProfile(Integer id) {
        TeacherprofileEntity teacherprofile = teacherprofileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TEACHERPROFILE_NOT_FOUND));
        UserEntity user = teacherprofile.getUser();
        user.setStatus("INACTIVE");
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateTeacher(TeacherprofileRequest request) {

        TeacherprofileEntity teacherprofile =
                teacherprofileRepository.findById(request.getTeacherid())
                        .orElseThrow(() ->
                                new AppException(ErrorCode.TEACHERPROFILE_NOT_FOUND));

        UserEntity user = teacherprofile.getUser();

        // ===== UPDATE USER =====
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setSex(request.getSex());

        if (request.getBirthday() != null) {
            user.setBirthday(LocalDate.parse(request.getBirthday()));
        }

        // ===== UPDATE TEACHER PROFILE =====
        teacherprofile.setBio(request.getBio());
        teacherprofile.setTitle(request.getTitle());
        teacherprofile.setOfficeHourStart(request.getOfficeHourStart());
        teacherprofile.setOfficeHourEnd(request.getOfficeHourEnd());
        teacherprofile.setCccd(request.getCccd());
        teacherprofile.setUniversity(request.getUniversity());
        teacherprofile.setGraduationYear(request.getGraduationYear());
        teacherprofile.setMajor(request.getMajor());
        teacherprofile.setDegree(request.getDegree());
        teacherprofile.setTeachingExperience(request.getTeachingExperience());
        teacherprofile.setEnglishCertificate(request.getEnglishCertificate());


        teacherprofileRepository.save(teacherprofile);
    }

}
