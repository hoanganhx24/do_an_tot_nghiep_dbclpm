package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.web.service.annotation.GetExchange;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessmentanswer")
public class AssessmentAnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "IsCorrect")
    private Boolean isCorrect;

    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    @JoinColumn(name = "AssessmentAttemptID")
    private AssessmentAttemptEntity assessmentAttempt;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "assessmentOptionID")
    private AssessmentOptionEntity assessmentOption;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "assessmentQuestionId")
    private AssessmentQuestionEntity assessmentQuestion;
}
