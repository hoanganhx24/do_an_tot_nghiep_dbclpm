package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.repository.AssessmentOptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AssessmentOptionServiceImplTest {

    @Mock
    private AssessmentOptionRepository assessmentOptionRepository;

    @InjectMocks
    private AssessmentOptionServiceImpl assessmentOptionService;

    @Test
    void deleteAssessmentOptionByQuestionId_shouldForwardQuestionIdToRepository() {
        // Test Case ID: MAI-AOS-001
        assessmentOptionService.deleteAssessmentOptionByQuestionId(99);

        verify(assessmentOptionRepository).deleteByAssessmentQuestion_Id(99);
    }

    @Test
    void deleteAssessmentOptionByQuestionId_shouldStillCallRepositoryWhenIdIsNull() {
        // Test Case ID: MAI-AOS-002
        assessmentOptionService.deleteAssessmentOptionByQuestionId(null);

        verify(assessmentOptionRepository).deleteByAssessmentQuestion_Id(null);
    }
}
