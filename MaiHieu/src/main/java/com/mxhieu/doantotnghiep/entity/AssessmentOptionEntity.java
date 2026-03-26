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
@Table(name = "assessmentoption")
public class AssessmentOptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Content")
    private String content;

    @Column(name = "IsCorrect")
    private Boolean isCorrect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AssessmentQuestionID")
    private AssessmentQuestionEntity assessmentQuestion;

    @OneToMany(mappedBy = "assessmentOption", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<AssessmentAnswerEntity> assessmentAnswers;

    public AssessmentOptionEntity duplicate(AssessmentQuestionEntity newQuestion) {
        AssessmentOptionEntity cloned = new AssessmentOptionEntity();

        cloned.setId(null);
        cloned.setContent(this.content);
        cloned.setIsCorrect(this.isCorrect);
        cloned.setAssessmentQuestion(newQuestion);

        // Không clone AssessmentAnswer (answer là câu trả lời của học viên)
        cloned.setAssessmentAnswers(null);

        return cloned;
    }

}
