package com.mxhieu.doantotnghiep.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssessmentOptionResponse {
    private Integer id;
    private Integer assessmentQuestionId;
    private String content;
    private Boolean isCorrect;
    private Boolean selected;
}
