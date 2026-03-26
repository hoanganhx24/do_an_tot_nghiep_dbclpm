package com.mxhieu.doantotnghiep.entity;

import com.mxhieu.doantotnghiep.converter.ParagraphsConverter;
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
@Table(name = "assessment")
public class AssessmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Version")
    private Integer version;

    @Column(name = "Title")
    private String title;

    @Column(name = "IsActive")
    private Integer isActive;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "MediaData")
    private byte[] mediaData;

    @Column(name = "ImageData")
    private byte[] imageData;

    @Column(name = "Paragraphs", columnDefinition = "MEDIUMTEXT")
    @Convert(converter = ParagraphsConverter.class)
    private List<String> paragraphs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TestID")
    private TestEntity test;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "TypeID")
    private ExerciseTypeEntity exercisetype;

    @OneToMany(mappedBy = "assessment", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentAttemptEntity> assessmentAttemptEntities;

    @OneToMany(mappedBy = "assessment", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentQuestionEntity> assessmentQuestions;

    public AssessmentEntity clone(TestEntity newTest) {
        AssessmentEntity cloned = new AssessmentEntity();

        cloned.setId(null);
        cloned.setVersion(this.version);
        cloned.setIsActive(this.isActive);
        cloned.setCreatedAt(this.createdAt);
        cloned.setExercisetype(this.exercisetype);
        cloned.setTest(newTest);

        // Clone mediaData
        if (this.mediaData != null) {
            cloned.setMediaData(this.mediaData.clone());
        }

        // Clone imageData
        if (this.imageData != null) {
            cloned.setImageData(this.imageData.clone());
        }

        // Clone paragraphs (tạo list mới)
        if (this.paragraphs != null) {
            cloned.setParagraphs(
                    this.paragraphs.stream().toList() // list mới
            );
        }

        // Clone câu hỏi
        if (this.assessmentQuestions != null) {
            cloned.setAssessmentQuestions(
                    this.assessmentQuestions.stream()
                            .map(q -> q.clone(cloned))
                            .toList()
            );
        }

        // Không clone AssessmentAttempt (attempt là kết quả bài làm)
        cloned.setAssessmentAttemptEntities(null);

        return cloned;
    }

}
