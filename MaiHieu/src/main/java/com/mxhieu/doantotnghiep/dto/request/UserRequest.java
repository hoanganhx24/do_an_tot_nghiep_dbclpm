package com.mxhieu.doantotnghiep.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private Integer id;

    private String email;
    private String password;
    private String fullName;
    private String status;
    private LocalDateTime createAt;
    private String token;
    private String phone;
    private String address;
    private String sex;
    private String birthday;
    private String role;

    private String newPassword;
    private String confirmNewPassword;
}
