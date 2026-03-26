package com.mxhieu.doantotnghiep.dto.request;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class AttemptanswerRequest {
    private Integer id;
    private Integer questionId;
    private Integer choiceId;
}
