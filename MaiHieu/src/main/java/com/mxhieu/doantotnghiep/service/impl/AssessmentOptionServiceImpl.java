package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.repository.AssessmentOptionRepository;
import com.mxhieu.doantotnghiep.service.AssessmentOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssessmentOptionServiceImpl implements AssessmentOptionService {
    private final AssessmentOptionRepository assessmentOptionRepository;
    @Transactional
    @Override
    public void deleteAssessmentOptionByQuestionId(Integer questionId) {
        assessmentOptionRepository.deleteByAssessmentQuestion_Id(questionId);
    }
}
