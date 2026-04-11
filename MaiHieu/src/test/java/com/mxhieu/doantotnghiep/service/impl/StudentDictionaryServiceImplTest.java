package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.StudentDictionaryRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentDictionaryResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.DefinitionExampleRepository;
import com.mxhieu.doantotnghiep.repository.StudentDictionaryRepository;
import com.mxhieu.doantotnghiep.repository.StudentProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentDictionaryServiceImplTest {

    @Mock
    private StudentDictionaryRepository studentDictionaryRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private DefinitionExampleRepository definitionExampleRepository;

    @InjectMocks
    private StudentDictionaryServiceImpl studentDictionaryService;

    @Test
    void save_shouldThrowWhenStudentProfileNotFound() {
        // Test Case ID: MAI-SDS-001
        StudentDictionaryRequest request = StudentDictionaryRequest.builder()
                .studentProfileId(10)
                .definitionExampleId(20)
                .build();

        when(studentProfileRepository.findById(10)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> studentDictionaryService.save(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void save_shouldThrowWhenDefinitionExampleNotFound() {
        // Test Case ID: MAI-SDS-002
        StudentDictionaryRequest request = StudentDictionaryRequest.builder()
                .studentProfileId(10)
                .definitionExampleId(20)
                .build();

        when(studentProfileRepository.findById(10)).thenReturn(Optional.of(StudentProfileEntity.builder().id(10).build()));
        when(definitionExampleRepository.findById(20)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> studentDictionaryService.save(request));

        assertEquals(ErrorCode.DEFINITION_EXAMPLE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void save_shouldPersistStudentDictionaryWhenInputIsValid() {
        // Test Case ID: MAI-SDS-003
        StudentProfileEntity studentProfile = StudentProfileEntity.builder().id(10).build();
        DefinitionExampleEntity definitionExample = DefinitionExampleEntity.builder().id(20).build();

        StudentDictionaryRequest request = StudentDictionaryRequest.builder()
                .studentProfileId(10)
                .definitionExampleId(20)
                .build();

        when(studentProfileRepository.findById(10)).thenReturn(Optional.of(studentProfile));
        when(definitionExampleRepository.findById(20)).thenReturn(Optional.of(definitionExample));

        studentDictionaryService.save(request);

        ArgumentCaptor<StudentDictionaryEntity> captor = ArgumentCaptor.forClass(StudentDictionaryEntity.class);
        verify(studentDictionaryRepository).save(captor.capture());

        assertEquals(10, captor.getValue().getStudentProfile().getId());
        assertEquals(20, captor.getValue().getDefinitionExample().getId());
    }

    @Test
    void getAllForStudent_shouldMapNestedEntityToDictionaryResponse() {
        // Test Case ID: MAI-SDS-004
        Integer studentId = 5;
        DictionaryEntity dictionary = DictionaryEntity.builder().word("focus").build();
        PartOfSpeechEntity partOfSpeech = PartOfSpeechEntity.builder()
                .partOfSpeech("noun")
                .ipa("/fo-kus/")
                .audio("audio-url")
                .dictionary(dictionary)
                .build();
        DefinitionExampleEntity definitionExample = DefinitionExampleEntity.builder()
                .definition("ability to concentrate")
                .example("Stay focused")
                .partOfSpeech(partOfSpeech)
                .build();
        StudentDictionaryEntity studentDictionary = StudentDictionaryEntity.builder()
                .studentProfile(StudentProfileEntity.builder().id(studentId).build())
                .definitionExample(definitionExample)
                .build();

        when(studentDictionaryRepository.findByStudentProfile_Id(studentId)).thenReturn(List.of(studentDictionary));

        StudentDictionaryResponse response = studentDictionaryService.getAllForStudent(studentId);

        assertEquals(studentId, response.getStudentProfileId());
        assertEquals(1, response.getDictionaries().size());
        assertEquals("focus", response.getDictionaries().get(0).getWord());
        assertEquals("noun", response.getDictionaries().get(0).getPartOfSpeechString());
        assertEquals("ability to concentrate", response.getDictionaries().get(0).getDefinition());
    }

    @Test
    void getAllForStudent_shouldReturnEmptyDictionaryListWhenNoSavedWord() {
        // Test Case ID: MAI-SDS-005
        Integer studentId = 6;
        when(studentDictionaryRepository.findByStudentProfile_Id(studentId)).thenReturn(Collections.emptyList());

        StudentDictionaryResponse response = studentDictionaryService.getAllForStudent(studentId);

        assertEquals(studentId, response.getStudentProfileId());
        assertEquals(0, response.getDictionaries().size());
    }
}
