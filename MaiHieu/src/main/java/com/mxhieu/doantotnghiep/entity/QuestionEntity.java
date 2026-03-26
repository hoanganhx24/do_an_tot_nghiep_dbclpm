package com.mxhieu.doantotnghiep.entity;

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
@Table(name = "question")
public class QuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "QuestionText")
    private String questionText;

    @Column(name = "ExamID")
    private Integer examId;

    @Column(name = "`Explain`")
    private String explain;

    @Column(name = "ShowTime")
    private LocalTime showTime;

    @OneToMany(mappedBy = "question",fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<ChoiceEntity> choices;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ExerciseID")
    private ExerciseEntity exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID")
    UserEntity user;

    @OneToMany(mappedBy = "question",fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<AttemptAnswerEntity> attemptAnswers;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "MediaQuestionID")
    private MediaQuestionEntity mediaQuestion;

    public QuestionEntity clone(ExerciseEntity exercise) {
        QuestionEntity cloned = new QuestionEntity();

        // Bắt buộc reset ID để INSERT bản mới
        cloned.setId(null);

        // Gán exercise mới
        cloned.setExercise(exercise);

        // Copy fields đơn giản
        cloned.setQuestionText(this.questionText);
        cloned.setExamId(this.examId);
        cloned.setExplain(this.explain);
        cloned.setShowTime(this.showTime);

        // Gán user (không clone user)
        cloned.setUser(this.user);

        // KHÔNG clone Attempt Answers (đây là dữ liệu làm bài)
        cloned.setAttemptAnswers(null);

        // Clone MediaQuestion nếu nó là thực thể riêng
        if (this.mediaQuestion != null) {
            MediaQuestionEntity mediaClone = this.mediaQuestion.clone();
            cloned.setMediaQuestion(mediaClone);
            mediaClone.setQuestion(cloned); // ⭐ MUST: thiết lập quan hệ 2 chiều
        }

        // Clone ChoiceEntities (deep clone)
        if (this.choices != null) {
            cloned.setChoices(
                    this.choices.stream()
                            .map(choice -> choice.clone(cloned))
                            .toList()
            );
        }

        return cloned;
    }




}
