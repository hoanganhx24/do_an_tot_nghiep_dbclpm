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
public class TestAttemptRequest {
    private Integer id;
    private Integer totalScore;
    private LocalDateTime testAt;
    private Integer testId;
    private Integer studentProfileId;
    List<AssessmentAttemptRequest> assessmentAttemptRequests;
}
