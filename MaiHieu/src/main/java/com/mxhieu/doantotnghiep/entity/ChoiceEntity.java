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
@Table(name = "choice")
public class ChoiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Content")
    private String content;

    @Column(name = "Attribute")
    private String attribute;

    @Column(name = "IsCorrect")
    private Boolean isCorrect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "QuestionID")
    private QuestionEntity question;

    @OneToMany(mappedBy = "choice",fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<AttemptAnswerEntity> attemptAnswers;

    public ChoiceEntity clone(QuestionEntity question) {
        ChoiceEntity cloned = new ChoiceEntity();

        cloned.setId(null); // MUST: tạo bản ghi mới
        cloned.setQuestion(question);

        // Clone basic fields
        cloned.setContent(this.content);
        cloned.setAttribute(this.attribute);
        cloned.setIsCorrect(this.isCorrect);

        // Attempt answers KHÔNG clone (đây là kết quả học của học viên)
        cloned.setAttemptAnswers(null);

        return cloned;
    }

}
