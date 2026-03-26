package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssessmentResponse {
    private Integer id;
    private Integer version;
    private Integer isActive;
    private LocalDateTime createdAt;
    private String typeName;
    private Integer testId;
    private String title;
    private byte[] mediaData;
    private byte[] imageData;
    private List<String> paragraphs;
    List<AssessmentQuestionResponse> assessmentQuestions;
}
