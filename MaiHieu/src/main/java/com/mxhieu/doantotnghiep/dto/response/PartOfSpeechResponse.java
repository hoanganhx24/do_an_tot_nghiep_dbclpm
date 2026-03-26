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
public class PartOfSpeechResponse {
    private Integer id;

    private String partOfSpeech; // noun, verb, adjectivea

    private String ipa;

    private String audio;

    private List<DefinitionAndExampleResponse> senses;
}

