package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.response.DictionaryResponse;
import com.mxhieu.doantotnghiep.entity.DictionaryEntity;

import java.util.List;

public interface DictionaryService {
    DictionaryResponse search(String word, Integer studentId);

    List<String> getSuggestionWord(String word);
}
