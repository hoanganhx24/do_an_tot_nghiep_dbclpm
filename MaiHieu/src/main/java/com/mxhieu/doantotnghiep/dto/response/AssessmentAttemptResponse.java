package com.mxhieu.doantotnghiep.dto.response;

import lombok.*;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttemptResponse {
    private Integer id;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer score;
    private Integer levelMapped;
    private AssessmentResponse assessment;
}
