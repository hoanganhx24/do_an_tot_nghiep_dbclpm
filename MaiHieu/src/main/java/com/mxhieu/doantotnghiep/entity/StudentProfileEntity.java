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
@Table(name = "studentprofile")
public class StudentProfileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "TargetScore")
    private Integer targetScore;

    @Column(name = "DailyStudyMinutes")
    private Integer dailyStudyMinutes;

    @Column(name = "GoalDate")
    private LocalDateTime goalDate;

    @Column(name = "PlacementLevel")
    private String placementLevel;

    @Column(name = "LastActiveAt")
    private LocalDateTime lastActiveAt;

    @Column(name = "FirstLogin")
    private Boolean firstLogin;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<EnrollmentEntity> enrollments;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<LessonProgressEntity> lessonProgresses;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", referencedColumnName = "ID")
    private UserEntity user;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<AttemptEntity> attemptEntities;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<TestProgressEntity> testProgresses;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<StudyPlanEntity> studyPlans;

    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<TestAttemptEntity> testAttempts;


    @OneToMany(mappedBy = "studentProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<StudentDictionaryEntity> studentDictionaries;
}
