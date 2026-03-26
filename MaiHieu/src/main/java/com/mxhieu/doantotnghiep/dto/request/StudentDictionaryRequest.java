package com.mxhieu.doantotnghiep.dto.request;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDictionaryRequest {
    private Integer id;
    private Integer studentProfileId;
    private Integer definitionExampleId;
}
