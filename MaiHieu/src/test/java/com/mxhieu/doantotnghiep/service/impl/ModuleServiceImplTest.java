package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.LessonConverter;
import com.mxhieu.doantotnghiep.converter.ModuleConverter;
import com.mxhieu.doantotnghiep.dto.request.ModuleRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.dto.response.TestResponse;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.LessonRepository;
import com.mxhieu.doantotnghiep.repository.ModuleRepository;
import com.mxhieu.doantotnghiep.repository.TestRepository;
import com.mxhieu.doantotnghiep.service.LessonService;
import com.mxhieu.doantotnghiep.service.TestService;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModuleServiceImplTest {

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private ModuleConverter moduleConverter;

    @Mock
    private LessonService lessonService;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonConverter lessonConverter;

    @Mock
    private TestRepository testRepository;

    @Mock
    private TestService testService;

    @InjectMocks
    private ModuleServiceImpl service;

    @Test
    void addModule_shouldFlushOrderIndexWhenNewOrderIsInRange() {
        // Test Case ID: MAI-MDS-001
        ModuleRequest request = ModuleRequest.builder().courseId(1).orderIndex(1L).build();
        ModuleEntity entity = ModuleEntity.builder().orderIndex(1L).build();

        when(moduleConverter.toEntity(request, ModuleEntity.class)).thenReturn(entity);
        when(moduleRepository.getMaxOrder(1)).thenReturn(1L);

        service.addModule(request);

        verify(moduleRepository).flushOrderIndex(1, 1L);
        verify(moduleRepository).save(entity);
    }

    @Test
    void addModule_shouldNotFlushWhenOrderIsAfterMaxOrder() {
        // Test Case ID: MAI-MDS-002
        ModuleRequest request = ModuleRequest.builder().courseId(1).orderIndex(5L).build();
        ModuleEntity entity = ModuleEntity.builder().orderIndex(5L).build();

        when(moduleConverter.toEntity(request, ModuleEntity.class)).thenReturn(entity);
        when(moduleRepository.getMaxOrder(1)).thenReturn(1L);

        service.addModule(request);

        verify(moduleRepository).save(entity);
    }

    @Test
    void getAll_shouldConvertEveryEntity() {
        // Test Case ID: MAI-MDS-003
        ModuleEntity m1 = ModuleEntity.builder().id(1).course(CourseEntity.builder().id(9).build()).build();
        ModuleEntity m2 = ModuleEntity.builder().id(2).course(CourseEntity.builder().id(9).build()).build();

        when(moduleRepository.findAll()).thenReturn(List.of(m1, m2));
        when(moduleConverter.toResponse(m1, ModuleResponse.class)).thenReturn(ModuleResponse.builder().id(1).build());
        when(moduleConverter.toResponse(m2, ModuleResponse.class)).thenReturn(ModuleResponse.builder().id(2).build());

        List<ModuleResponse> result = service.getAll();

        assertEquals(2, result.size());
    }

    @Test
    void getMaxOrder_shouldReturnRepositoryValuePlusOne() {
        // Test Case ID: MAI-MDS-004
        when(moduleRepository.getMaxOrder(10)).thenReturn(6L);

        Long actual = service.getMaxOrder(10);

        assertEquals(7L, actual);
    }

    @Test
    void completedCups_shouldReturnThreeWhenCompletionIsHundredPercent() {
        // Test Case ID: MAI-MDS-005
        LessonEntity lesson = LessonEntity.builder().id(1).build();
        TestEntity test = TestEntity.builder().id(2).build();

        when(lessonRepository.findByModuleId(1)).thenReturn(List.of(lesson));
        when(testRepository.findByModuleId(1)).thenReturn(List.of(test));
        when(lessonService.completedStar(1, 100)).thenReturn(3);
        when(testService.commpletedStar(2, 100)).thenReturn(3);

        int cups = service.completedCups(1, 100);

        assertEquals(3, cups);
    }

    @Test
    void completedCups_shouldReturnTwoWhenCompletionBetweenFiftyAndNinetyNine() {
        // Test Case ID: MAI-MDS-006
        LessonEntity lesson = LessonEntity.builder().id(1).build();
        TestEntity test = TestEntity.builder().id(2).build();

        when(lessonRepository.findByModuleId(2)).thenReturn(List.of(lesson));
        when(testRepository.findByModuleId(2)).thenReturn(List.of(test));
        when(lessonService.completedStar(1, 200)).thenReturn(3);
        when(testService.commpletedStar(2, 200)).thenReturn(0);

        int cups = service.completedCups(2, 200);

        assertEquals(2, cups);
    }

    @Test
    void completedCups_shouldReturnOneWhenCompletionIsPositiveButLow() {
        // Test Case ID: MAI-MDS-007
        LessonEntity lesson = LessonEntity.builder().id(1).build();
        TestEntity test = TestEntity.builder().id(2).build();

        when(lessonRepository.findByModuleId(3)).thenReturn(List.of(lesson));
        when(testRepository.findByModuleId(3)).thenReturn(List.of(test));
        when(lessonService.completedStar(1, 300)).thenReturn(1);
        when(testService.commpletedStar(2, 300)).thenReturn(0);

        int cups = service.completedCups(3, 300);

        assertEquals(1, cups);
    }

    @Test
    void completedCups_shouldReturnZeroWhenNoStarCollected() {
        // Test Case ID: MAI-MDS-008
        LessonEntity lesson = LessonEntity.builder().id(1).build();
        TestEntity test = TestEntity.builder().id(2).build();

        when(lessonRepository.findByModuleId(4)).thenReturn(List.of(lesson));
        when(testRepository.findByModuleId(4)).thenReturn(List.of(test));
        when(lessonService.completedStar(1, 400)).thenReturn(0);
        when(testService.commpletedStar(2, 400)).thenReturn(0);

        int cups = service.completedCups(4, 400);

        assertEquals(0, cups);
    }

    @Test
    void getResponseDetailList_shouldBuildLessonModuleDetail() {
        // Test Case ID: MAI-MDS-009
        LessonEntity lesson = LessonEntity.builder().id(5).orderIndex(2).build();
        ModuleEntity module = ModuleEntity.builder()
                .id(1)
                .type(ModuleType.LESSON)
                .orderIndex(1L)
                .lessons(List.of(lesson))
                .tests(List.of())
                .build();

        ModuleResponse mapped = ModuleResponse.builder().id(1).build();
        LessonResponse lessonResponse = LessonResponse.builder().id(5).orderIndex(2).completedStar(3).build();

        when(moduleConverter.toResponseForStudent(module)).thenReturn(mapped);
        when(lessonRepository.countByModuleId(1)).thenReturn(1L);
        when(lessonService.getListLessonResponseDetail(module.getLessons(), 88)).thenReturn(new ArrayList<>(List.of(lessonResponse)));
        when(lessonService.isCompletedLesson(5, 88)).thenReturn(true);
        when(lessonService.completedStar(5, 88)).thenReturn(3);
        when(lessonRepository.findByModuleId(1)).thenReturn(module.getLessons());
        when(testRepository.findByModuleId(1)).thenReturn(List.of());

        List<ModuleResponse> result = service.getResponseDetailList(List.of(module), 88);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getTotalLessons());
        assertEquals(1, result.get(0).getCompletedLessons());
    }

    @Test
    void updateModule_shouldThrowWhenModuleNotFound() {
        // Test Case ID: MAI-MDS-010
        ModuleRequest request = ModuleRequest.builder().id(999).build();
        when(moduleRepository.findById(999)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.updateModule(request));

        assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void deleteModule_shouldThrowWhenModuleNotFound() {
        // Test Case ID: MAI-MDS-011
        when(moduleRepository.findById(888)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.deleteModule(888));

        assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void isCompleted_shouldReturnFalseWhenLessonModuleHasIncompleteLesson() {
        // Test Case ID: MAI-MDS-012
        LessonEntity lesson = LessonEntity.builder().id(9).build();
        ModuleEntity module = ModuleEntity.builder().id(12).type(ModuleType.LESSON).lessons(List.of(lesson)).build();

        when(moduleRepository.findById(12)).thenReturn(Optional.of(module));
        when(lessonService.isCompletedLesson(9, 5)).thenReturn(false);

        boolean actual = service.isCompleted(12, 5);

        assertFalse(actual);
    }

    @Test
    void isCompleted_shouldReturnTrueWhenTestModuleAllCompleted() {
        // Test Case ID: MAI-MDS-013
        TestEntity test = TestEntity.builder().id(10).build();
        ModuleEntity module = ModuleEntity.builder().id(13).type(ModuleType.TEST).tests(List.of(test)).build();

        when(moduleRepository.findById(13)).thenReturn(Optional.of(module));
        when(testService.isCompletedTest(10, 5)).thenReturn(true);

        boolean actual = service.isCompleted(13, 5);

        assertTrue(actual);
    }
}
