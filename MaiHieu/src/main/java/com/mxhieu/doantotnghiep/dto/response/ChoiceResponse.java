package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChoiceResponse {
    private Integer id;
    private Integer questionId;
    private String content;
    private String attribute;
    private Boolean isCorrect;
    private Boolean selected;
}
