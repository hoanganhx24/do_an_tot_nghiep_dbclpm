package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.response.DictionaryResponse;
import com.mxhieu.doantotnghiep.entity.DefinitionExampleEntity;
import com.mxhieu.doantotnghiep.entity.DictionaryEntity;
import com.mxhieu.doantotnghiep.entity.PartOfSpeechEntity;
import com.mxhieu.doantotnghiep.repository.DefinitionExampleRepository;
import com.mxhieu.doantotnghiep.repository.DictionaryRepository;
import com.mxhieu.doantotnghiep.repository.PartOfSpeechRepository;
import com.mxhieu.doantotnghiep.repository.StudentDictionaryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DictionaryServiceImplTest {

    @Mock
    private DictionaryRepository dictionaryRepository;

    @Mock
    private PartOfSpeechRepository partOfSpeechRepository;

    @Mock
    private DefinitionExampleRepository definitionExampleRepository;

    @Mock
    private StudentDictionaryRepository studentDictionaryRepository;

    @Mock
    private WebClient.Builder webClientBuilder;

    @InjectMocks
    private DictionaryServiceImpl service;

    @Test
    void getSuggestionWord_shouldReturnTopWords() {
        // Test Case ID: MAI-DIC-001
        when(dictionaryRepository.findTop10ByWordContainingIgnoreCase("ab"))
                .thenReturn(List.of(
                        DictionaryEntity.builder().word("about").build(),
                        DictionaryEntity.builder().word("ability").build()
                ));

        List<String> result = service.getSuggestionWord("ab");

        assertEquals(List.of("about", "ability"), result);
    }

    @Test
    void search_shouldUseCachedDictionaryWhenWordExists() {
        // Test Case ID: MAI-DIC-002
        DictionaryEntity dictionary = DictionaryEntity.builder().id(1).word("focus").build();
        PartOfSpeechEntity pos = PartOfSpeechEntity.builder()
                .id(11)
                .partOfSpeech("noun")
                .ipa("/fo-kus/")
                .audio("audio-url")
                .dictionary(dictionary)
                .build();
        DefinitionExampleEntity def = DefinitionExampleEntity.builder()
                .id(111)
                .definition("ability to concentrate")
                .example("Keep focus")
                .partOfSpeech(pos)
                .build();
        pos.setDefinitionExample(List.of(def));
        dictionary.setPartOfSpeech(List.of(pos));

        when(dictionaryRepository.findByWord("focus")).thenReturn(Optional.of(dictionary));
        when(studentDictionaryRepository.existsByStudentProfile_IdAndDefinitionExample_Id(9, 111)).thenReturn(true);

        DictionaryResponse response = service.search("focus", 9);

        assertEquals("focus", response.getWord());
        assertEquals(1, response.getPartsOfSpeech().size());
        assertEquals("noun", response.getPartsOfSpeech().get(0).getPartOfSpeech());
        assertEquals(true, response.getPartsOfSpeech().get(0).getSenses().get(0).getSaved());
    }

    @Test
    void search_shouldReturnEmptyPartOfSpeechListWhenCachedEntityHasNoPartOfSpeech() {
        // Test Case ID: MAI-DIC-003
        DictionaryEntity dictionary = DictionaryEntity.builder().id(2).word("empty").partOfSpeech(List.of()).build();
        when(dictionaryRepository.findByWord("empty")).thenReturn(Optional.of(dictionary));

        DictionaryResponse response = service.search("empty", 1);

        assertEquals("empty", response.getWord());
        assertEquals(0, response.getPartsOfSpeech().size());
    }
}
