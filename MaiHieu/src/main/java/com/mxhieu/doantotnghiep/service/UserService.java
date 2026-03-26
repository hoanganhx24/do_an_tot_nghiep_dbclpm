package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.UserRequest;
import com.mxhieu.doantotnghiep.dto.response.UserRespone;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {
    List<UserEntity> getUsers();
    void checkEmailExistsAndSendCode(UserRequest user);
    void createUser(UserRequest user, String otp);
    UserRespone getMyInfor();
    void createStudent(UserEntity user, String otp);

    void updateInformation(UserRequest user);

    void changePassword(UserRequest user);

    UserRespone getUserByEmail(String email);

    void forGotPassword(String email);
}






