package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.dto.request.StudentDictionaryRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentDictionaryResponse;
import com.mxhieu.doantotnghiep.entity.DefinitionExampleEntity;
import com.mxhieu.doantotnghiep.entity.DictionaryEntity;
import com.mxhieu.doantotnghiep.entity.PartOfSpeechEntity;
import com.mxhieu.doantotnghiep.entity.StudentDictionaryEntity;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.DictionaryRepository;
import com.mxhieu.doantotnghiep.repository.StudentDictionaryRepository;
import com.mxhieu.doantotnghiep.repository.StudentProfileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class StudentDictionaryServiceImplTest {

    @Autowired
    private StudentDictionaryRepository studentDictionaryRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private DictionaryRepository dictionaryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentDictionaryServiceImpl studentDictionaryService;

    @Test
    void save_shouldThrowWhenStudentProfileNotFound() {
        // Test Case ID: MAI-SDS-001
        StudentDictionaryRequest request = StudentDictionaryRequest.builder()
                .studentProfileId(-9999)
                .definitionExampleId(-9999)
                .build();

        AppException ex = assertThrows(AppException.class, () -> studentDictionaryService.save(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void save_shouldThrowWhenDefinitionExampleNotFound() {
        // Test Case ID: MAI-SDS-002
        StudentProfileEntity studentProfile = createStudentProfile("student-dict-missing-def");
        StudentDictionaryRequest request = StudentDictionaryRequest.builder()
                .studentProfileId(studentProfile.getId())
                .definitionExampleId(-9999)
                .build();

        AppException ex = assertThrows(AppException.class, () -> studentDictionaryService.save(request));

        assertEquals(ErrorCode.DEFINITION_EXAMPLE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void save_shouldPersistStudentDictionaryWhenInputIsValid() {
        // Test Case ID: MAI-SDS-003
        StudentProfileEntity studentProfile = createStudentProfile("student-dict-valid");
        DefinitionExampleEntity definitionExample = createDefinitionExample(
                "focus",
                "noun",
                "/fo-kus/",
                "audio-url",
                "ability to concentrate",
                "Stay focused"
        );

        StudentDictionaryRequest request = StudentDictionaryRequest.builder()
                .studentProfileId(studentProfile.getId())
                .definitionExampleId(definitionExample.getId())
                .build();

        studentDictionaryService.save(request);

        List<StudentDictionaryEntity> saved = studentDictionaryRepository.findByStudentProfile_Id(studentProfile.getId());

        assertEquals(1, saved.size());
        assertEquals(studentProfile.getId(), saved.get(0).getStudentProfile().getId());
        assertEquals(definitionExample.getId(), saved.get(0).getDefinitionExample().getId());
    }

    @Test
    void getAllForStudent_shouldMapNestedEntityToDictionaryResponse() {
        // Test Case ID: MAI-SDS-004
        StudentProfileEntity studentProfile = createStudentProfile("student-dict-map");
        DefinitionExampleEntity definitionExample = createDefinitionExample(
                "focus",
                "noun",
                "/fo-kus/",
                "audio-url",
                "ability to concentrate",
                "Stay focused"
        );
        studentDictionaryRepository.save(StudentDictionaryEntity.builder()
                .studentProfile(studentProfile)
                .definitionExample(definitionExample)
                .build());

        StudentDictionaryResponse response = studentDictionaryService.getAllForStudent(studentProfile.getId());

        assertEquals(studentProfile.getId(), response.getStudentProfileId());
        assertEquals(1, response.getDictionaries().size());
        assertEquals("focus", response.getDictionaries().get(0).getWord());
        assertEquals("noun", response.getDictionaries().get(0).getPartOfSpeechString());
        assertEquals("ability to concentrate", response.getDictionaries().get(0).getDefinition());
    }

    @Test
    void getAllForStudent_shouldReturnEmptyDictionaryListWhenNoSavedWord() {
        // Test Case ID: MAI-SDS-005
        StudentProfileEntity studentProfile = createStudentProfile("student-dict-empty");

        StudentDictionaryResponse response = studentDictionaryService.getAllForStudent(studentProfile.getId());

        assertEquals(studentProfile.getId(), response.getStudentProfileId());
        assertEquals(0, response.getDictionaries().size());
    }

    private StudentProfileEntity createStudentProfile(String emailPrefix) {
        UserEntity user = userRepository.save(UserEntity.builder()
                .email(emailPrefix + "-" + Math.abs(System.nanoTime() % 100000) + "@test.com")
                .password("password")
                .fullName("Student Dictionary")
                .status("ACTIVE")
                .build());

        return studentProfileRepository.save(StudentProfileEntity.builder()
                .firstLogin(false)
                .user(user)
                .build());
    }

    private DefinitionExampleEntity createDefinitionExample(
            String word,
            String partOfSpeechValue,
            String ipa,
            String audio,
            String definition,
            String example
    ) {
        DefinitionExampleEntity definitionExample = DefinitionExampleEntity.builder()
                .definition(definition)
                .example(example)
                .build();

        PartOfSpeechEntity partOfSpeech = PartOfSpeechEntity.builder()
                .partOfSpeech(partOfSpeechValue)
                .ipa(ipa)
                .audio(audio)
                .definitionExample(List.of(definitionExample))
                .build();
        definitionExample.setPartOfSpeech(partOfSpeech);

        DictionaryEntity dictionary = DictionaryEntity.builder()
                .word(word)
                .partOfSpeech(List.of(partOfSpeech))
                .build();
        partOfSpeech.setDictionary(dictionary);

        DictionaryEntity savedDictionary = dictionaryRepository.save(dictionary);
        return savedDictionary.getPartOfSpeech().get(0).getDefinitionExample().get(0);
    }
}
