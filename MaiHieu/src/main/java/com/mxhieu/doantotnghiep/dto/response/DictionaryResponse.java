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
public class DictionaryResponse {
    private Integer id;

    private String word;

    private String partOfSpeechString; // noun, verb, adjectivea

    private String ipa;

    private String audio;

    private String definition;

    private String example;

    private List<PartOfSpeechResponse> partsOfSpeech;
}

