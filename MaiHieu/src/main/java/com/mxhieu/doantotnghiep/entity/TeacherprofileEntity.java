package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "teacherprofile")
public class TeacherprofileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Bio")
    private String bio;

    @Column(name = "Title")
    private String title;

    @Column(name = "OfficeHourStart")
    private Integer officeHourStart;

    @Column(name = "OfficeHourEnd")
    private Integer officeHourEnd;

    @Column(name = "CCCD")
    private String cccd;

    @Column(name = "University")
    private String university;

    @Column(name = "GraduationYear")
    private Integer graduationYear;

    @Column(name = "Major")
    private String major;

    @Column(name = "Degree")
    private String degree;

    @Column(name = "TeachingExperience")
    private String teachingExperience;

    @Column(name = "EnglishCertificate")
    private String englishCertificate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", referencedColumnName = "ID")
    private UserEntity user;

    @OneToMany(mappedBy = "teacherprofile", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseEntity> courses;
}
