package com.mxhieu.doantotnghiep.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackResponse {
    private String code;
    private String name;
    private String description;
    private List<CourseResponse> courses;
}
