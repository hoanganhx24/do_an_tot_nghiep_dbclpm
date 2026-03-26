package com.mxhieu.doantotnghiep.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class CourseRequest {
    private Integer id;
    private String trackCode;
    private String title;
    private String description;
    private Integer levelTag;
    private Integer isPublished;
    private Integer teacherId;
    private Integer studentProfileId;
    private String type;
    private Integer version;
}
