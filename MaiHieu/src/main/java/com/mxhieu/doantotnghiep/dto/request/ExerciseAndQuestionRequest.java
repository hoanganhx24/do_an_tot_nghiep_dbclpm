package com.mxhieu.doantotnghiep.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseAndQuestionRequest {
    private String type;
    private String title;
    private int lessonID;
    private int orderIndex;
    private byte[] mediaData;
    private List<QuestionRequest> questions;
}
