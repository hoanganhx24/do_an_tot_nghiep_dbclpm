package com.mxhieu.doantotnghiep.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonOrTestAroundResponse {
    private int Id;
    private String type; // "lesson" or "test"
}
