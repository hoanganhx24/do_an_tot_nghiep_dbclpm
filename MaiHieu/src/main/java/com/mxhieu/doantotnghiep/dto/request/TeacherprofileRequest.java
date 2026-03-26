package com.mxhieu.doantotnghiep.dto.request;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeacherprofileRequest {
    private Integer teacherid;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String sex;
    private String birthday;
    private String bio;
    private String title;
    private Integer officeHourStart;
    private Integer officeHourEnd;
    private String cccd;
    private String university;
    private Integer graduationYear;
    private String major;
    private String degree;
    private String teachingExperience;
    private String englishCertificate;
}
