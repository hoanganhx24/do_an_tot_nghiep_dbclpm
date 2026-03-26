package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EnrollmentResponst {
    private Integer id;
    private LocalDateTime enrolledAt;
    private Integer status;
    private Integer studentProfileId;
    private TrackResponse trackResponse;
    private Integer vertion;
}
