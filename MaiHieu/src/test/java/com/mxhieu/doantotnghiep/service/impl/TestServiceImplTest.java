package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.TestConverter;
import com.mxhieu.doantotnghiep.dto.request.TestRequest;
import com.mxhieu.doantotnghiep.dto.response.TestResponse;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.entity.TestAttemptEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import com.mxhieu.doantotnghiep.entity.TestProgressEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.EnrollmentCourseRepository;
import com.mxhieu.doantotnghiep.repository.ModuleRepository;
import com.mxhieu.doantotnghiep.repository.TestAttemptRepository;
import com.mxhieu.doantotnghiep.repository.TestProgressRepository;
import com.mxhieu.doantotnghiep.repository.TestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TestServiceImplTest {

    @Mock
    private TestRepository testRepository;

    @Mock
    private TestConverter testConverter;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private EnrollmentCourseRepository enrollmentcourseRepository;

    @Mock
    private TestProgressRepository testProgressRepository;

    @InjectMocks
    private TestServiceImpl service;

    @Test
    void createTest_shouldThrowWhenModuleNotFound() {
        // Test Case ID: MAI-TES-001
        TestRequest request = TestRequest.builder().moduleId(10).build();
        when(moduleRepository.findById(10)).thenReturn(Optional.empty());
        when(testConverter.toEntity(request, TestEntity.class)).thenReturn(TestEntity.builder().build());

        AppException ex = assertThrows(AppException.class, () -> service.createTest(request));

        assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createTest_shouldSetModuleAndSave() {
        // Test Case ID: MAI-TES-002
        TestRequest request = TestRequest.builder().moduleId(10).name("Mini Test").build();
        ModuleEntity module = ModuleEntity.builder().id(10).build();
        TestEntity entity = TestEntity.builder().name("Mini Test").build();

        when(testConverter.toEntity(request, TestEntity.class)).thenReturn(entity);
        when(moduleRepository.findById(10)).thenReturn(Optional.of(module));

        service.createTest(request);

        ArgumentCaptor<TestEntity> captor = ArgumentCaptor.forClass(TestEntity.class);
        verify(testRepository).save(captor.capture());
        assertEquals(10, captor.getValue().getModule().getId());
    }

    @Test
    void getTestById_shouldThrowWhenNotFound() {
        // Test Case ID: MAI-TES-003
        when(testRepository.findById(99)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getTestById(99));

        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getTestById_shouldReturnConvertedResponse() {
        // Test Case ID: MAI-TES-004
        TestEntity entity = TestEntity.builder().id(1).build();
        TestResponse expected = TestResponse.builder().id(1).name("A").build();

        when(testRepository.findById(1)).thenReturn(Optional.of(entity));
        when(testConverter.toResponse(entity, TestResponse.class)).thenReturn(expected);

        TestResponse actual = service.getTestById(1);

        assertEquals(1, actual.getId());
        assertEquals("A", actual.getName());
    }

    @Test
    void createFirstTest_shouldSaveMappedEntity() {
        // Test Case ID: MAI-TES-005
        TestRequest request = TestRequest.builder().name("First Test").build();
        TestEntity entity = TestEntity.builder().name("First Test").build();

        when(testConverter.toEntity(request, TestEntity.class)).thenReturn(entity);

        service.createFirstTest(request);

        verify(testRepository).save(entity);
    }

    @Test
    void getFirstTestsSummery_shouldConvertEveryEntity() {
        // Test Case ID: MAI-TES-006
        TestEntity e1 = TestEntity.builder().id(1).build();
        TestEntity e2 = TestEntity.builder().id(2).build();

        when(testRepository.findByType("FIRST_TEST")).thenReturn(List.of(e1, e2));
        when(testConverter.toResponseSummery(e1)).thenReturn(TestResponse.builder().id(1).build());
        when(testConverter.toResponseSummery(e2)).thenReturn(TestResponse.builder().id(2).build());

        List<TestResponse> result = service.getFirstTestsSummery();

        assertEquals(2, result.size());
    }

    @Test
    void commpletedStar_shouldReturnZeroWhenNoAttempt() {
        // Test Case ID: MAI-TES-007
        when(testAttemptRepository.findByTestIdAndStudentProfileId(1, 1)).thenReturn(List.of());

        int star = service.commpletedStar(1, 1);

        assertEquals(0, star);
    }

    @Test
    void commpletedStar_shouldReturnThreeForPerfectScore() {
        // Test Case ID: MAI-TES-008
        TestAttemptEntity attempt = TestAttemptEntity.builder().totalScore(100f).build();
        when(testAttemptRepository.findByTestIdAndStudentProfileId(2, 2)).thenReturn(List.of(attempt));

        int star = service.commpletedStar(2, 2);

        assertEquals(3, star);
    }

    @Test
    void commpletedStar_shouldReturnTwoForScoreFromSeventy() {
        // Test Case ID: MAI-TES-009
        TestAttemptEntity attempt = TestAttemptEntity.builder().totalScore(75f).build();
        when(testAttemptRepository.findByTestIdAndStudentProfileId(3, 3)).thenReturn(List.of(attempt));

        int star = service.commpletedStar(3, 3);

        assertEquals(2, star);
    }

    @Test
    void commpletedStar_shouldReturnOneForPositiveLowScore() {
        // Test Case ID: MAI-TES-010
        TestAttemptEntity attempt = TestAttemptEntity.builder().totalScore(40f).build();
        when(testAttemptRepository.findByTestIdAndStudentProfileId(4, 4)).thenReturn(List.of(attempt));

        int star = service.commpletedStar(4, 4);

        assertEquals(1, star);
    }

    @Test
    void getTestAttemptIds_shouldReturnEmptyWhenNoAttemptExists() {
        // Test Case ID: MAI-TES-011
        when(testAttemptRepository.findByTestIdAndStudentProfileId(5, 5)).thenReturn(List.of());

        List<Integer> ids = service.getTestAttemptIds(5, 5);

        assertEquals(0, ids.size());
    }

    @Test
    void getTestAttemptIds_shouldReturnAllAttemptIds() {
        // Test Case ID: MAI-TES-012
        TestAttemptEntity a1 = TestAttemptEntity.builder().id(10).build();
        TestAttemptEntity a2 = TestAttemptEntity.builder().id(11).build();
        when(testAttemptRepository.findByTestIdAndStudentProfileId(6, 6)).thenReturn(List.of(a1, a2));

        List<Integer> ids = service.getTestAttemptIds(6, 6);

        assertEquals(List.of(10, 11), ids);
    }

    @Test
    void isLock_shouldReturnTrueWhenCourseStatusIsLock() {
        // Test Case ID: MAI-TES-013
        TestEntity test = TestEntity.builder().id(7).module(ModuleEntity.builder().course(CourseEntity.builder().id(70).build()).build()).build();
        when(testRepository.findById(7)).thenReturn(Optional.of(test));
        when(enrollmentcourseRepository.findStatus(8, 70)).thenReturn("LOCK");

        assertTrue(service.isLock(7, 8));
    }

    @Test
    void isLock_shouldReturnFalseWhenCourseStatusDone() {
        // Test Case ID: MAI-TES-014
        TestEntity test = TestEntity.builder().id(8).module(ModuleEntity.builder().course(CourseEntity.builder().id(80).build()).build()).build();
        when(testRepository.findById(8)).thenReturn(Optional.of(test));
        when(enrollmentcourseRepository.findStatus(9, 80)).thenReturn("DONE");

        assertFalse(service.isLock(8, 9));
    }

    @Test
    void isLock_shouldReturnTrueWhenCourseUnlockedButNoProgress() {
        // Test Case ID: MAI-TES-015
        TestEntity test = TestEntity.builder().id(9).module(ModuleEntity.builder().course(CourseEntity.builder().id(90).build()).build()).build();
        when(testRepository.findById(9)).thenReturn(Optional.of(test));
        when(enrollmentcourseRepository.findStatus(10, 90)).thenReturn("UNLOCK");
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(9, 10)).thenReturn(List.of());

        assertTrue(service.isLock(9, 10));
    }

    @Test
    void isLock_shouldReturnFalseWhenCourseUnlockedAndHasProgress() {
        // Test Case ID: MAI-TES-016
        TestEntity test = TestEntity.builder().id(10).module(ModuleEntity.builder().course(CourseEntity.builder().id(100).build()).build()).build();
        when(testRepository.findById(10)).thenReturn(Optional.of(test));
        when(enrollmentcourseRepository.findStatus(11, 100)).thenReturn("UNLOCK");
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(10, 11)).thenReturn(List.of(TestProgressEntity.builder().process(0).build()));

        assertFalse(service.isLock(10, 11));
    }

    @Test
    void isCompletedTest_shouldReturnFalseWhenNoProgressRecord() {
        // Test Case ID: MAI-TES-017
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(20, 21)).thenReturn(List.of());

        assertFalse(service.isCompletedTest(20, 21));
    }

    @Test
    void isCompletedTest_shouldReturnFalseWhenProcessIsOne() {
        // Test Case ID: MAI-TES-018
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(22, 23))
                .thenReturn(List.of(TestProgressEntity.builder().process(1).build()));

        assertFalse(service.isCompletedTest(22, 23));
    }

    @Test
    void isCompletedTest_shouldReturnTrueWhenProcessIsTwo() {
        // Test Case ID: MAI-TES-019
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(24, 25))
                .thenReturn(List.of(TestProgressEntity.builder().process(2).build()));

        assertTrue(service.isCompletedTest(24, 25));
    }

    @Test
    void deleteTest_shouldDelegateToRepository() {
        // Test Case ID: MAI-TES-020
        service.deleteTest(66);

        verify(testRepository).deleteById(66);
    }
}
