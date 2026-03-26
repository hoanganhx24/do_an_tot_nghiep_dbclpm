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
public class CourseResponse {
    private Integer id;
    private String title;
    private String description;
    private byte[] imgData;
//    private String trackCode;
//    private String trackName;
    List<ModuleResponse> modules;
    String trackName;
    String teacherName;
    String status;
    String lock;
    String completedCup;
    int version;
    List<Integer> versions;
}
