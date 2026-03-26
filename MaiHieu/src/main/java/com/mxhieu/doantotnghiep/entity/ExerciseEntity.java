package com.mxhieu.doantotnghiep.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mxhieu.doantotnghiep.converter.ParagraphsConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "exercise")
public class ExerciseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Type")
    private String type;

    @Column(name = "Title")
    private String title;

    @Column(name = "Instruction")
    private String instruction;

    @Column(name = "OrderIndex")
    private int orderIndex;

    @Column(name = "UserID")
    private Integer userId;

    @Column(name = "MediaData")
    private byte[] mediaData;

    @Column(name = "ImageData")
    private byte[] imageData;

    @Column(name = "ShowTime")
    private LocalTime showTime;

    @Column(name = "Paragraphs", columnDefinition = "MEDIUMTEXT")
    @Convert(converter = ParagraphsConverter.class)
    private List<String> paragraphs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ExerciseTypeID")
    private ExerciseTypeEntity exercisetype;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LessonID")
    private LessonEntity lesson;

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<QuestionEntity> questions;

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<AttemptEntity> attempts;

    public ExerciseEntity clone(LessonEntity lesson) {
        ExerciseEntity cloned = new ExerciseEntity();

        cloned.setId(null);
        cloned.setLesson(lesson);

        // Clone primitive fields
        cloned.setType(this.type);
        cloned.setTitle(this.title);
        cloned.setInstruction(this.instruction);
        cloned.setOrderIndex(this.orderIndex);
        cloned.setUserId(this.userId);
        cloned.setShowTime(this.showTime);

        // Clone byte arrays safely
        cloned.setMediaData(
                this.mediaData != null ? this.mediaData.clone() : null
        );
        cloned.setImageData(
                this.imageData != null ? this.imageData.clone() : null
        );

        // Clone paragraphs (List<String>)
        cloned.setParagraphs(
                this.paragraphs != null ? List.copyOf(this.paragraphs) : null
        );

        // ExerciseType không clone → gán lại loại cũ
        cloned.setExercisetype(this.exercisetype);

        // Clone QUESTIONS (deep clone)
        if (this.questions != null) {
            cloned.setQuestions(
                    this.questions.stream()
                            .map(q -> q.clone(cloned))
                            .toList()
            );
        }

        // ATTEMPTS KHÔNG clone (nằm trong kết quả học)
        cloned.setAttempts(null);

        return cloned;
    }



}
