package com.mxhieu.doantotnghiep.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DefinitionAndExampleResponse {
    private Integer id;
    private String definition;
    private String example;
    private Boolean saved;
}
