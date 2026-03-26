package com.mxhieu.doantotnghiep.dto.request;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgressRequest {
    private Integer id;
    private Integer studentProfileId;
    private Integer lessonId;
    private Integer percentageWatched;
}
