package com.mxhieu.doantotnghiep.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssessmentQuestionResponse {
    private Integer id;
    private Integer assessmentId;
    private String section;
    private String questionText;
    private  String explain;
    private byte[] mediData;
    List<AssessmentOptionResponse> choices;
}
