package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.converter.ModuleConverter;
import com.mxhieu.doantotnghiep.dto.request.ModuleRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import com.mxhieu.doantotnghiep.entity.TrackEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.CourseRepository;
import com.mxhieu.doantotnghiep.repository.LessonRepository;
import com.mxhieu.doantotnghiep.repository.ModuleRepository;
import com.mxhieu.doantotnghiep.repository.TeacheprofileRepository;
import com.mxhieu.doantotnghiep.repository.TestRepository;
import com.mxhieu.doantotnghiep.repository.TrackRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.service.LessonService;
import com.mxhieu.doantotnghiep.service.TestService;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class ModuleServiceImplTest {

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TrackRepository trackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacheprofileRepository teacheprofileRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @MockBean
    private ModuleConverter moduleConverter;

    @MockBean
    private LessonService lessonService;

    @MockBean
    private TestService testService;

    @Autowired
    private ModuleServiceImpl service;

    @Test
    void addModule_shouldFlushOrderIndexWhenNewOrderIsInRange() {
        // Test Case ID: MAI-MDS-001
        CourseEntity course = createCourse("AddFlush");
        ModuleEntity existing = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .orderIndex(1L)
                .type(ModuleType.LESSON)
                .build());
        ModuleRequest request = ModuleRequest.builder().courseId(course.getId()).orderIndex(1L).build();
        ModuleEntity entity = ModuleEntity.builder().course(course).orderIndex(1L).type(ModuleType.LESSON).build();

        when(moduleConverter.toEntity(request, ModuleEntity.class)).thenReturn(entity);

        service.addModule(request);

        entityManager.flush();
        entityManager.clear();
        ModuleEntity shifted = moduleRepository.findById(existing.getId()).orElseThrow();
        assertEquals(2L, shifted.getOrderIndex());
        assertTrue(moduleRepository.findByCourseIdOrderByOrderIndex(course.getId()).stream()
                .anyMatch(module -> module.getId() != null && module.getId().equals(entity.getId()) && module.getOrderIndex().equals(1L)));
    }

    @Test
    void addModule_shouldNotFlushWhenOrderIsAfterMaxOrder() {
        // Test Case ID: MAI-MDS-002
        CourseEntity course = createCourse("AddNoFlush");
        ModuleEntity existing = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .orderIndex(1L)
                .type(ModuleType.LESSON)
                .build());
        ModuleRequest request = ModuleRequest.builder().courseId(course.getId()).orderIndex(5L).build();
        ModuleEntity entity = ModuleEntity.builder().course(course).orderIndex(5L).type(ModuleType.LESSON).build();

        when(moduleConverter.toEntity(request, ModuleEntity.class)).thenReturn(entity);

        service.addModule(request);

        ModuleEntity unchanged = moduleRepository.findById(existing.getId()).orElseThrow();
        assertEquals(1L, unchanged.getOrderIndex());
        assertTrue(moduleRepository.findByCourseIdOrderByOrderIndex(course.getId()).stream()
                .anyMatch(module -> module.getId() != null && module.getId().equals(entity.getId()) && module.getOrderIndex().equals(5L)));
    }

    @Test
    void getAll_shouldConvertEveryEntity() {
        // Test Case ID: MAI-MDS-003
        CourseEntity course = createCourse("GetAll");
        ModuleEntity m1 = moduleRepository.save(ModuleEntity.builder().course(course).orderIndex(1L).type(ModuleType.LESSON).build());
        ModuleEntity m2 = moduleRepository.save(ModuleEntity.builder().course(course).orderIndex(2L).type(ModuleType.TEST).build());

        when(moduleConverter.toResponse(any(ModuleEntity.class), eq(ModuleResponse.class)))
                .thenAnswer(invocation -> ModuleResponse.builder()
                        .id(invocation.getArgument(0, ModuleEntity.class).getId())
                        .build());

        List<ModuleResponse> result = service.getAll();

        assertTrue(result.size() >= 2);
        assertTrue(result.stream().anyMatch(response -> response != null && m1.getId().equals(response.getId())));
        assertTrue(result.stream().anyMatch(response -> response != null && m2.getId().equals(response.getId())));
    }

    @Test
    void getMaxOrder_shouldReturnRepositoryValuePlusOne() {
        // Test Case ID: MAI-MDS-004
        CourseEntity course = createCourse("MaxOrder");
        moduleRepository.save(ModuleEntity.builder().course(course).orderIndex(6L).type(ModuleType.LESSON).build());

        Long actual = service.getMaxOrder(course.getId());

        assertEquals(7L, actual);
    }

    @Test
    void completedCups_shouldReturnThreeWhenCompletionIsHundredPercent() {
        // Test Case ID: MAI-MDS-005
        ModuleEntity module = createModuleWithLessonAndTest("CupsThree");
        LessonEntity lesson = module.getLessons().get(0);
        TestEntity test = module.getTests().get(0);

        when(lessonService.completedStar(lesson.getId(), 100)).thenReturn(3);
        when(testService.commpletedStar(test.getId(), 100)).thenReturn(3);

        int cups = service.completedCups(module.getId(), 100);

        assertEquals(3, cups);
    }

    @Test
    void completedCups_shouldReturnTwoWhenCompletionBetweenFiftyAndNinetyNine() {
        // Test Case ID: MAI-MDS-006
        ModuleEntity module = createModuleWithLessonAndTest("CupsTwo");
        LessonEntity lesson = module.getLessons().get(0);
        TestEntity test = module.getTests().get(0);

        when(lessonService.completedStar(lesson.getId(), 200)).thenReturn(3);
        when(testService.commpletedStar(test.getId(), 200)).thenReturn(0);

        int cups = service.completedCups(module.getId(), 200);

        assertEquals(2, cups);
    }

    @Test
    void completedCups_shouldReturnOneWhenCompletionIsPositiveButLow() {
        // Test Case ID: MAI-MDS-007
        ModuleEntity module = createModuleWithLessonAndTest("CupsOne");
        LessonEntity lesson = module.getLessons().get(0);
        TestEntity test = module.getTests().get(0);

        when(lessonService.completedStar(lesson.getId(), 300)).thenReturn(1);
        when(testService.commpletedStar(test.getId(), 300)).thenReturn(0);

        int cups = service.completedCups(module.getId(), 300);

        assertEquals(1, cups);
    }

    @Test
    void completedCups_shouldReturnZeroWhenNoStarCollected() {
        // Test Case ID: MAI-MDS-008
        ModuleEntity module = createModuleWithLessonAndTest("CupsZero");
        LessonEntity lesson = module.getLessons().get(0);
        TestEntity test = module.getTests().get(0);

        when(lessonService.completedStar(lesson.getId(), 400)).thenReturn(0);
        when(testService.commpletedStar(test.getId(), 400)).thenReturn(0);

        int cups = service.completedCups(module.getId(), 400);

        assertEquals(0, cups);
    }

    @Test
    void getResponseDetailList_shouldBuildLessonModuleDetail() {
        // Test Case ID: MAI-MDS-009
        CourseEntity course = createCourse("DetailLesson");
        ModuleEntity module = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .type(ModuleType.LESSON)
                .orderIndex(1L)
                .lessons(new ArrayList<>())
                .tests(new ArrayList<>())
                .build());
        LessonEntity lesson = lessonRepository.save(LessonEntity.builder().module(module).orderIndex(2).build());
        module.setLessons(new ArrayList<>(List.of(lesson)));
        module.setTests(new ArrayList<>());

        ModuleResponse mapped = ModuleResponse.builder().id(module.getId()).build();
        LessonResponse lessonResponse = LessonResponse.builder().id(lesson.getId()).orderIndex(2).completedStar(3).build();

        when(moduleConverter.toResponseForStudent(module)).thenReturn(mapped);
        when(lessonService.getListLessonResponseDetail(module.getLessons(), 88)).thenReturn(new ArrayList<>(List.of(lessonResponse)));
        when(lessonService.isCompletedLesson(lesson.getId(), 88)).thenReturn(true);
        when(lessonService.completedStar(lesson.getId(), 88)).thenReturn(3);

        List<ModuleResponse> result = service.getResponseDetailList(List.of(module), 88);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getTotalLessons());
        assertEquals(1, result.get(0).getCompletedLessons());
    }

    @Test
    void updateModule_shouldThrowWhenModuleNotFound() {
        // Test Case ID: MAI-MDS-010
        ModuleRequest request = ModuleRequest.builder().id(-9999).build();

        AppException ex = assertThrows(AppException.class, () -> service.updateModule(request));

        assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void deleteModule_shouldThrowWhenModuleNotFound() {
        // Test Case ID: MAI-MDS-011
        AppException ex = assertThrows(AppException.class, () -> service.deleteModule(-9999));

        assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void isCompleted_shouldReturnFalseWhenLessonModuleHasIncompleteLesson() {
        // Test Case ID: MAI-MDS-012
        CourseEntity course = createCourse("IncompleteLesson");
        ModuleEntity module = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .type(ModuleType.LESSON)
                .orderIndex(1L)
                .lessons(new ArrayList<>())
                .build());
        LessonEntity lesson = lessonRepository.save(LessonEntity.builder().module(module).build());
        module.setLessons(List.of(lesson));

        when(lessonService.isCompletedLesson(lesson.getId(), 5)).thenReturn(false);

        boolean actual = service.isCompleted(module.getId(), 5);

        assertFalse(actual);
    }

    @Test
    void isCompleted_shouldReturnTrueWhenTestModuleAllCompleted() {
        // Test Case ID: MAI-MDS-013
        CourseEntity course = createCourse("CompletedTest");
        ModuleEntity module = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .type(ModuleType.TEST)
                .orderIndex(1L)
                .tests(new ArrayList<>())
                .build());
        TestEntity test = testRepository.save(TestEntity.builder().module(module).name("Module Test").build());
        module.setTests(List.of(test));

        when(testService.isCompletedTest(test.getId(), 5)).thenReturn(true);

        boolean actual = service.isCompleted(module.getId(), 5);

        assertTrue(actual);
    }

    private ModuleEntity createModuleWithLessonAndTest(String title) {
        CourseEntity course = createCourse(title);
        ModuleEntity module = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .type(ModuleType.LESSON)
                .orderIndex(1L)
                .lessons(new ArrayList<>())
                .tests(new ArrayList<>())
                .build());
        LessonEntity lesson = lessonRepository.save(LessonEntity.builder().module(module).orderIndex(1).build());
        TestEntity test = testRepository.save(TestEntity.builder().module(module).name(title + " Test").build());
        module.setLessons(List.of(lesson));
        module.setTests(List.of(test));
        return module;
    }

    private CourseEntity createCourse(String title) {
        UserEntity teacherUser = userRepository.save(UserEntity.builder()
                .email("teacher-module-" + UUID.randomUUID() + "@example.com")
                .password("password")
                .fullName("Teacher Module")
                .build());

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacheprofileRepository.save(teacher);

        TrackEntity track = trackRepository.save(TrackEntity.builder()
                .code("TRACK-" + UUID.randomUUID())
                .build());

        return courseRepository.save(CourseEntity.builder()
                .title(title)
                .type("COURSE")
                .status("ACTIVE")
                .levelTag(1)
                .isPublished(1)
                .version(1)
                .teacherprofile(teacher)
                .track(track)
                .build());
    }
}
