package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExerciseResponse {
    private Integer id;
    private String typeCode;
    private String typeName;
    private String title;
    private String instruction;
    private String orderIndex;
    private Integer userId;
    private Boolean isCompleted;
    List<QuestionResponse> questions;
    byte[] mediaData;
    byte[] imageData;
    List<String> paragraphs;
    private LocalTime showTime;
}
