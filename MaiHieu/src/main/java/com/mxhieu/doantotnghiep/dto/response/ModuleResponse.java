package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ModuleResponse {
    private Integer id;
    private Integer courseId;
    private String title;
    private String description;
    private Long orderIndex;
    private Long Score;
    private Long totalLessons;
    private int completedLessons;
    private Long totalStar;
    private int completeCups;
    private Long completedStars;
    private ModuleType type;
    List<LessonResponse> lessons;
    List<TestResponse> tests;
}
