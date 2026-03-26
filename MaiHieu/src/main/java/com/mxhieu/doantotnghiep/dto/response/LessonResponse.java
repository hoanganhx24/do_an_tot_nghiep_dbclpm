package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LessonResponse {
    private Integer id;
    private Integer moduleId;
    private String title;
    private String summary;
    private Integer durationMinutes;
    private Integer orderIndex;
    private Integer gatingRules;
    private byte[] videoData;
    private long videoSize;
    private String videoPath;
    private List<MaterialResponse> materials;
    private Integer completedStar;
    private Float completionRate;
    private String status;
    private Boolean hasExercise;
    private Integer progressWatched;
}
