package com.mxhieu.doantotnghiep.dto.request;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentOptionRequest {
    private Integer id;
    private Integer assessmentQuestionId;
    private String content;
    private Boolean isCorrect;
}
