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
@Table(name = "assessmentquestion")
public class AssessmentQuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Section")
    private String section;

    @Column(name = "Stem")
    private String stem;

    @Column(name = "ExplainText")
    private  String explain;

    @Column(name = "MediaData")
    private byte[] mediData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AssessmentID")
    private AssessmentEntity assessment;

    @OneToMany(mappedBy = "assessmentQuestion",fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentOptionEntity> assessmentOptions;

    @OneToMany(mappedBy = "assessmentQuestion",fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentAnswerEntity> assessmentAnswers;

    public AssessmentQuestionEntity clone(AssessmentEntity newAssessment) {
        AssessmentQuestionEntity cloned = new AssessmentQuestionEntity();

        cloned.setId(null);
        cloned.setSection(this.section);
        cloned.setStem(this.stem);

        // Copy metadata
        cloned.setMediData(this.mediData != null ? this.mediData : null);

        cloned.setAssessment(newAssessment);

        // Clone options
        if (this.assessmentOptions != null) {
            cloned.setAssessmentOptions(
                    this.assessmentOptions.stream()
                            .map(op -> op.duplicate(cloned))
                            .toList()
            );
        }

        // Không clone answers (answer là câu trả lời của học viên)
        cloned.setAssessmentAnswers(null);

        return cloned;
    }

}
