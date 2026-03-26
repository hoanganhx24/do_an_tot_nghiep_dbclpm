package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "track")
public class TrackEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Code")
    private String code;

    @Column(name = "Name")
    private String name;

    @Column(name = "Description")
    private String description;

    @OneToMany(mappedBy = "track", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourseEntity> courses;

    @OneToMany(mappedBy = "track", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<EnrollmentEntity> enrollments;

    @OneToMany(mappedBy = "track", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<StudyPlanEntity> studyPlans;
}
