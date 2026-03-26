package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Email")
    private String email;

    @Column(name = "Password")
    private String password;

    @Column(name = "FullName")
    private String fullName;

    @Column(name = "Status")
    private String status;

    @Column(name = "CreateAt")
    private LocalDateTime createAt;

    @Column(name = "Token")
    private String token;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Address")
    private String address;

    @Column(name = "Sex")
    private String sex;

    @Column(name = "Birthday")
    private LocalDate birthday;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserRoleEntity> userRole;

    @OneToOne(mappedBy = "user",fetch = FetchType.LAZY)
    private TeacherprofileEntity teacherprofile;

    @OneToOne(mappedBy = "user",fetch = FetchType.LAZY)
    private StudentProfileEntity studentprofile ;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<QuestionEntity> questions;
}
