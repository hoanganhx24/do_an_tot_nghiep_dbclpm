package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "enrollment")
public class EnrollmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "EnrolledAt")
    private LocalDateTime enrolledAt;

    @Column(name = "Status")
    private Integer status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TrackID")
    private TrackEntity track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentProfileID")
    StudentProfileEntity studentProfile;

    @OneToMany(mappedBy = "enrollment", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EnrollmentCourseEntity> enrollmentCourses;

    public EnrollmentEntity(LocalDateTime enrolledAt, Integer status, TrackEntity track, StudentProfileEntity studentProfile) {
        this.enrolledAt = enrolledAt;
        this.status = status;
        this.track = track;
        this.studentProfile = studentProfile;
    }
}
