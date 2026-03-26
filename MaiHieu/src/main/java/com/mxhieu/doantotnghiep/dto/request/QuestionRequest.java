package com.mxhieu.doantotnghiep.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionRequest {
    private int id;
    private String question;
    private Integer userId;
    private Integer exerciseId;
    private Integer mediaQuestionId;
    private Integer examId;
    private String explain;
    private List<String> options;
    private Object answer;
}
