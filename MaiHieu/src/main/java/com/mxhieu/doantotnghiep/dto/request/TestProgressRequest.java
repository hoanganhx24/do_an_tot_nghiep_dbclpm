package com.mxhieu.doantotnghiep.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestProgressRequest {
    private Integer id;
    private Integer status;
    private Float totalScore;
    private Integer testId;
    private Integer studentprofileId;
}
