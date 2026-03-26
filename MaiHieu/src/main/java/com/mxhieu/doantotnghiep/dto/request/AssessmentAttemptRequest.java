package com.mxhieu.doantotnghiep.dto.request;

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
public class AssessmentAttemptRequest {
    private Integer id;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer score;
    private Integer levelMapped;
    private Integer assessmentId;
    private Integer testAtemptId;
    List<AssessmentAnswerRequest> assessmentAnswerRequests;
}
