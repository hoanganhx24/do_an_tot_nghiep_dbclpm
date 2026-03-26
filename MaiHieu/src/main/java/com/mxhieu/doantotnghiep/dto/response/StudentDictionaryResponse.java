package com.mxhieu.doantotnghiep.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudentDictionaryResponse {
    private Integer id;
    private Integer studentProfileId;

    List<DictionaryResponse> dictionaries;

}
