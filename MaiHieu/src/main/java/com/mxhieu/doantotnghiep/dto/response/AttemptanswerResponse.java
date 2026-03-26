package com.mxhieu.doantotnghiep.dto.response;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class AttemptanswerResponse {
    private Integer id;
    private Integer attemptId;
    private Boolean isCorrect;
    private Integer questionId;
    private Integer choiceId;
}
