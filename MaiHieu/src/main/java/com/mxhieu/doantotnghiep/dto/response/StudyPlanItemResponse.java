package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyPlanItemResponse {
    private Integer id;
    private LocalDate date;
    private Integer slotIndex;
    private String type;
    private Integer status;
    private Integer studyPlanId;
    private List<LessonResponse> lessons;
    private List<TestResponse> tests;
}
