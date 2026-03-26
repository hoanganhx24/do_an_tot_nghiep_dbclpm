package com.mxhieu.doantotnghiep.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestAttemptResponse {
    private Integer id;
    private Float totalScore;
    private Integer count;
    private LocalDateTime testAt;
    private Integer testId;
    private Integer studentProfileId;

    List<AssessmentResponse> assessmentResponses;
}
