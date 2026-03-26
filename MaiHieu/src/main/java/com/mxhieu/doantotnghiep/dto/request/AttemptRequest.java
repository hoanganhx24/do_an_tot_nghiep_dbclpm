package com.mxhieu.doantotnghiep.dto.request;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class AttemptRequest {
    private Integer id;
    private Integer studentProfileId;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer exerciseId;
    private List<AttemptanswerRequest> attemptanswerRequests;
}
