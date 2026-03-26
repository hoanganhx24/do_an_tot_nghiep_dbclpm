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
@Table(name = "assessmentattempt")
public class AssessmentAttemptEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "StartedAt")
    private LocalDateTime startedAt;

    @Column(name = "SubmittedAt")
    private LocalDateTime submittedAt;

    @Column(name = "Score")
    private Integer score;

    @Column(name = "LevelMapped")
    private Integer levelMapped;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "assessmentID")
    private AssessmentEntity assessment;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL )
    @JoinColumn(name = "TestAtemptID")
    private TestAttemptEntity testAttempt;

    @OneToMany(mappedBy = "assessmentAttempt", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<AssessmentAnswerEntity> assessmentAnswers;

}
