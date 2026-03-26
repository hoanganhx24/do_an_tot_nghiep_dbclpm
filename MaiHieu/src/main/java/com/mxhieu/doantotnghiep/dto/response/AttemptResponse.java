package com.mxhieu.doantotnghiep.dto.response;


import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class AttemptResponse {
    private Integer id;
    private Integer studentProfileId;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer scorePercent;
    private Integer scoreReading;
    private Integer scoreListening;
    private Integer exerciseId;
}
