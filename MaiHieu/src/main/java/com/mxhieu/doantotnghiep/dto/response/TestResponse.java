package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mxhieu.doantotnghiep.entity.AssessmentEntity;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestResponse {
    private Integer id;
    private String type;
    private String name;
    private int completedStar;
    private String status;
}
