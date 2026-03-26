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
@Table(name = "attempt")
public class AttemptEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "StartedAt")
    private LocalDateTime startedAt;

    @Column(name = "SubmittedAt")
    private LocalDateTime submittedAt;

    @Column(name = "ScorePercent")
    private Integer scorePercent;

    @Column(name = "ScoreReading")
    private Integer scoreReading;

    @Column(name = "ScoreListening")
    private Integer scoreListening;

    @OneToMany(mappedBy = "attempt", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<AttemptAnswerEntity> attemptAnswers;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentProfileID")
    StudentProfileEntity studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ExerciseID")
    ExerciseEntity exercise;
}

