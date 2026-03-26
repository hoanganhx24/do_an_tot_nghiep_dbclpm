package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.UserConverter;
import com.mxhieu.doantotnghiep.dto.request.DataMailDTO;
import com.mxhieu.doantotnghiep.dto.request.UserRequest;
import com.mxhieu.doantotnghiep.dto.response.UserRespone;
import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.entity.UserRoleEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.RoleRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.repository.UserRoleRepository;
import com.mxhieu.doantotnghiep.service.UserService;
import com.mxhieu.doantotnghiep.service.VerificationService;
import com.mxhieu.doantotnghiep.utils.PasswordUtil;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final VerificationService verificationService;
    private final PasswordEncoder passwordEncoder;
    private final MailServiceImpl mailService;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserConverter userConverter;

    @Override
    public List<UserEntity> getUsers() {
        return userRepository.findAll();
    }

    /**
     * Bước 1️⃣: kiểm tra email và gửi mã xác thực
     */
    @Override
    public void checkEmailExistsAndSendCode(UserRequest user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        verificationService.sendVerificationCode(user.getEmail());
    }

    /**
     * Bước 2️⃣: xác thực mã OTP và tạo user
     */
    @Override
    public void createUser(UserRequest user, String otp) {
        boolean verified = verificationService.verifyCode(user.getEmail(), otp);
        if (!verified) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // 1️⃣ Sinh mật khẩu ngẫu nhiên (8 ký tự gồm chữ + số)
        String generatedPassword = PasswordUtil.generateRandomPassword(8);

        // 2️⃣ Tạo user mới
        UserEntity newUser = new UserEntity();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(generatedPassword));
        newUser.setStatus("ACTIVE");
        newUser.setCreateAt(LocalDateTime.now());

        userRepository.save(newUser);
        RoleEntity role;

        if(user.getRole().equals("TEACHER")){
            role = roleRepository.findByValue("TEACHER").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        }else{
            role = roleRepository.findByValue("STUDENT").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        }
        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setUser(newUser);
        userRole.setRole(role);
        userRole.setAssignedAt(LocalDateTime.now());
        userRoleRepository.save(userRole);


        // 3️⃣ Gửi email thông báo mật khẩu
        try {
            DataMailDTO dataMail = new DataMailDTO();
            dataMail.setTo(user.getEmail());
            dataMail.setSubject("Tài khoản của bạn đã được tạo thành công");

            Map<String, Object> props = new HashMap<>();
            props.put("email", user.getEmail());
            props.put("password", generatedPassword); // gửi mật khẩu thật
            props.put("loginUrl", "https://your-frontend-app.com/login");
            dataMail.setProps(props);

            mailService.sendMail(dataMail, "user_created_template"); // HTML template bạn sẽ tạo
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public UserRespone getMyInfor() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<RoleEntity> roles = roleRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        return userConverter.toInForUser(userEntity, roles);
    }

    @Override
    public void createStudent(UserEntity user, String otp) {
        boolean verified = verificationService.verifyCode(user.getEmail(), otp);
        if (!verified) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // 1️⃣ Sinh mật khẩu ngẫu nhiên (8 ký tự gồm chữ + số)
        String generatedPassword = PasswordUtil.generateRandomPassword(8);

        // 2️⃣ Tạo user mới
        UserEntity newUser = new UserEntity();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(generatedPassword));
        newUser.setStatus("ACTIVE");
        newUser.setCreateAt(LocalDateTime.now());

        userRepository.save(newUser);
        RoleEntity role = roleRepository.findByValue("STUDENT").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setUser(newUser);
        userRole.setRole(role);
        userRole.setAssignedAt(LocalDateTime.now());
        userRoleRepository.save(userRole);


        // 3️⃣ Gửi email thông báo mật khẩu
        try {
            DataMailDTO dataMail = new DataMailDTO();
            dataMail.setTo(user.getEmail());
            dataMail.setSubject("Tài khoản của bạn đã được tạo thành công");

            Map<String, Object> props = new HashMap<>();
            props.put("email", user.getEmail());
            props.put("password", generatedPassword); // gửi mật khẩu thật
            props.put("loginUrl", "https://your-frontend-app.com/login");
            dataMail.setProps(props);

            mailService.sendMail(dataMail, "user_created_template"); // HTML template bạn sẽ tạo
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    @Override
    public void updateInformation(UserRequest userRequest) {
        UserEntity userEntity = userRepository.findByEmail(userRequest.getEmail()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userEntity.setFullName(userRequest.getFullName());
        userEntity.setBirthday(LocalDate.parse(userRequest.getBirthday()));
        userEntity.setPhone(userRequest.getPhone());
        userEntity.setAddress(userRequest.getAddress());
        userRepository.save(userEntity);
    }

    @Override
    public void changePassword(UserRequest userRequest) {
        UserEntity userEntity = userRepository.findByEmail(userRequest.getEmail()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if(passwordEncoder.matches(userEntity.getPassword(), userRequest.getPassword())){
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        if(!userRequest.getNewPassword().equals(userRequest.getConfirmNewPassword())){
            throw new AppException(ErrorCode.BOTH_NEW_PASS_NOT_MATCH);
        }

        userEntity.setPassword(passwordEncoder.encode(userRequest.getNewPassword()));
        userRepository.save(userEntity);

    }

    @Override
    public UserRespone getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        UserRespone respone = userConverter.toResponse(userEntity,UserRespone.class);
        return respone;
    }

    @Override
    public void forGotPassword(String email) {
        UserEntity userEntity = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String newPass = PasswordUtil.generateRandomPassword(8);
        userEntity.setPassword(passwordEncoder.encode(newPass));

        try {
            DataMailDTO dataMail = new DataMailDTO();
            dataMail.setTo(userEntity.getEmail());
            dataMail.setSubject("Mật khẩu của bạn đã được cấp lại!");

            Map<String, Object> props = new HashMap<>();
            props.put("email", userEntity.getEmail());
            props.put("newPassword", newPass);
            props.put("year", LocalDate.now().getYear());
            dataMail.setProps(props);

            mailService.sendMail(dataMail, "for_got_password_teamplate");

            userRepository.save(userEntity);
        }catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
