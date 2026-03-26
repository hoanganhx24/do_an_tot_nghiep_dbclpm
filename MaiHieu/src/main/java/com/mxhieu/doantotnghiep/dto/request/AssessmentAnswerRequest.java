package com.mxhieu.doantotnghiep.dto.request;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssessmentAnswerRequest {
    private Integer id;
    private Integer assessmentAttemptId;
    private Boolean isCorrect;
    private Integer assessmentOptionId;
    private Integer assessmentQuestionId;
}
