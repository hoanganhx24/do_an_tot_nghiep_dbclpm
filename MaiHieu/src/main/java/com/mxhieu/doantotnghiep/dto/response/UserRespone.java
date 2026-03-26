package com.mxhieu.doantotnghiep.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserRespone {
    private String email;
    private String password;
    private String fullName;
    private String status;
    private LocalDate createAt;
    private String phone;
    private String address;
    private String sex;
    private LocalDate birthday;
    List<String> roles;
}
