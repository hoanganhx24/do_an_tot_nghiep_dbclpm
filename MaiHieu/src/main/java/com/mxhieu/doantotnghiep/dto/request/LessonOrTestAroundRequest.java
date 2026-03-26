package com.mxhieu.doantotnghiep.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonOrTestAroundRequest {
    private int Id;
    private String type;
}
