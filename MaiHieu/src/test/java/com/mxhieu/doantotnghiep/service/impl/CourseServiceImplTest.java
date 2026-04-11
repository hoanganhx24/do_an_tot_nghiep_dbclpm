package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.CourseConverter;
import com.mxhieu.doantotnghiep.converter.LessonConverter;
import com.mxhieu.doantotnghiep.converter.ModuleConverter;
import com.mxhieu.doantotnghiep.converter.TestConverter;
import com.mxhieu.doantotnghiep.dto.request.CourseRequest;
import com.mxhieu.doantotnghiep.dto.response.CourseResponse;
import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.CourseRepository;
import com.mxhieu.doantotnghiep.service.LessonService;
import com.mxhieu.doantotnghiep.service.ModuleService;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseConverter courseConverter;

    @Mock
    private LessonService lessonService;

    @Mock
    private ModuleService moduleService;

    @Mock
    private LessonConverter lessonConverter;

    @Mock
    private TestConverter testConverter;

    @Mock
    private ModuleConverter moduleConverter;

    @InjectMocks
    private CourseServiceImpl service;

    @Test
    void addCourseToTrack_shouldConvertAndSave() {
        // Test Case ID: MAI-CRS-001
        CourseRequest request = CourseRequest.builder().title("Course A").build();
        MultipartFile file = null;
        CourseEntity entity = CourseEntity.builder().title("Course A").build();

        when(courseConverter.toCourseEntity(request, file)).thenReturn(entity);

        service.addCourseToTrack(request, file);

        verify(courseRepository).save(entity);
    }

    @Test
    void getAllCourses_shouldMapAllEntitiesToResponses() {
        // Test Case ID: MAI-CRS-002
        CourseEntity c1 = CourseEntity.builder().id(1).build();
        CourseEntity c2 = CourseEntity.builder().id(2).build();

        when(courseRepository.findAll()).thenReturn(List.of(c1, c2));
        when(courseConverter.toCourseResponse(c1)).thenReturn(CourseResponse.builder().id(1).title("A").build());
        when(courseConverter.toCourseResponse(c2)).thenReturn(CourseResponse.builder().id(2).title("B").build());

        List<CourseResponse> result = service.getAllCourses();

        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getId());
        assertEquals(2, result.get(1).getId());
    }

    @Test
    void getCourseById_shouldThrowWhenCourseNotFound() {
        // Test Case ID: MAI-CRS-003
        when(courseRepository.findById(101)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getCourseById(101));

        assertEquals(ErrorCode.COURSE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getCourseById_shouldReturnConvertedResponse() {
        // Test Case ID: MAI-CRS-004
        CourseEntity course = CourseEntity.builder().id(1).build();
        CourseResponse response = CourseResponse.builder().id(1).title("Course A").build();

        when(courseRepository.findById(1)).thenReturn(Optional.of(course));
        when(courseConverter.toCourseResponse(course)).thenReturn(response);

        CourseResponse actual = service.getCourseById(1);

        assertSame(response, actual);
    }

    @Test
    void getCoursesByTeacherId_shouldMapResponsesByTeacher() {
        // Test Case ID: MAI-CRS-005
        CourseEntity c1 = CourseEntity.builder().id(10).build();
        when(courseRepository.findByTeacherprofile_Id(9)).thenReturn(List.of(c1));
        when(courseConverter.toCourseResponseByTeacher(c1)).thenReturn(CourseResponse.builder().id(10).title("Teacher Course").build());

        List<CourseResponse> result = service.getCoursesByTeacherId(9);

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).getId());
    }

    @Test
    void publishCourse_shouldThrowWhenCourseNotFound() {
        // Test Case ID: MAI-CRS-006
        when(courseRepository.findById(200)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.publishCourse(200));

        assertEquals(ErrorCode.COURSE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void publishCourse_shouldThrowWhenCourseAlreadyPublishStatus() {
        // Test Case ID: MAI-CRS-007
        CourseEntity course = CourseEntity.builder().id(1).status("PUBLISH").version(0).modules(new ArrayList<>()).build();
        when(courseRepository.findById(1)).thenReturn(Optional.of(course));

        AppException ex = assertThrows(AppException.class, () -> service.publishCourse(1));

        assertEquals(ErrorCode.COURSE_PUBLISHED, ex.getErrorCode());
    }

    @Test
    void publishCourse_shouldThrowWhenCourseHasNoModule() {
        // Test Case ID: MAI-CRS-008
        CourseEntity course = CourseEntity.builder().id(2).status("NEW").version(1).modules(new ArrayList<>()).build();
        when(courseRepository.findById(2)).thenReturn(Optional.of(course));

        AppException ex = assertThrows(AppException.class, () -> service.publishCourse(2));

        assertEquals(ErrorCode.COURSE_EMPTY_MODULE, ex.getErrorCode());
    }

    @Test
    void completedCups_shouldAggregateFromAllModules() {
        // Test Case ID: MAI-CRS-009
        ModuleEntity m1 = ModuleEntity.builder().id(1).lessons(List.of()).build();
        ModuleEntity m2 = ModuleEntity.builder().id(2).lessons(List.of()).build();
        CourseEntity course = CourseEntity.builder().id(11).modules(List.of(m1, m2)).build();

        when(courseRepository.findById(11)).thenReturn(Optional.of(course));
        when(moduleService.completedCups(1, 5)).thenReturn(1);
        when(moduleService.completedCups(2, 5)).thenReturn(2);

        String actual = service.completedCups(11, 5);

        assertEquals("3/0", actual);
    }

    @Test
    void getCourseForStudent_shouldSortModulesAndSetCompletedCup() {
        // Test Case ID: MAI-CRS-010
        CourseRequest request = CourseRequest.builder().id(10).studentProfileId(8).build();
        CourseEntity course = CourseEntity.builder().id(10).status("UNLOCK").modules(List.of()).build();
        CourseResponse response = CourseResponse.builder().id(10).build();

        ModuleResponse m1 = ModuleResponse.builder().id(1).orderIndex(3L).completeCups(1).build();
        ModuleResponse m2 = ModuleResponse.builder().id(2).orderIndex(1L).completeCups(2).build();

        when(courseRepository.findById(10)).thenReturn(Optional.of(course));
        when(courseConverter.toCourseResponseByStudent(course, "UNLOCK")).thenReturn(response);
        when(moduleService.getResponseDetailList(course.getModules(), 8)).thenReturn(new ArrayList<>(List.of(m1, m2)));

        CourseResponse actual = service.getCourseForStudent(request);

        assertEquals("3/6", actual.getCompletedCup());
        assertEquals(1L, actual.getModules().get(0).getOrderIndex());
        assertEquals(3L, actual.getModules().get(1).getOrderIndex());
    }

    @Test
    void isCompleted_shouldReturnFalseWhenAnyModuleIncomplete() {
        // Test Case ID: MAI-CRS-011
        ModuleEntity m1 = ModuleEntity.builder().id(1).type(ModuleType.LESSON).build();
        ModuleEntity m2 = ModuleEntity.builder().id(2).type(ModuleType.TEST).build();
        CourseEntity course = CourseEntity.builder().id(7).modules(List.of(m1, m2)).build();

        when(courseRepository.findById(7)).thenReturn(Optional.of(course));
        when(moduleService.isCompleted(1, 9)).thenReturn(true);
        when(moduleService.isCompleted(2, 9)).thenReturn(false);

        assertFalse(service.isCompleted(7, 9));
    }

    @Test
    void isCompleted_shouldReturnTrueWhenAllModulesCompleted() {
        // Test Case ID: MAI-CRS-012
        ModuleEntity m1 = ModuleEntity.builder().id(1).build();
        ModuleEntity m2 = ModuleEntity.builder().id(2).build();
        CourseEntity course = CourseEntity.builder().id(8).modules(List.of(m1, m2)).build();

        when(courseRepository.findById(8)).thenReturn(Optional.of(course));
        when(moduleService.isCompleted(1, 99)).thenReturn(true);
        when(moduleService.isCompleted(2, 99)).thenReturn(true);

        assertTrue(service.isCompleted(8, 99));
    }
}
