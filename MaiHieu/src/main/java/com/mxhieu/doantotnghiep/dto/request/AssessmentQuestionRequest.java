package com.mxhieu.doantotnghiep.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssessmentQuestionRequest {
    private Integer id;
    private Integer assessmentId;
    private String section;
    private String question;
    private String explain;
    private String type;
    private List<String> options;
    private List<AssessmentOptionRequest> choices;
    private Object answer;
}
