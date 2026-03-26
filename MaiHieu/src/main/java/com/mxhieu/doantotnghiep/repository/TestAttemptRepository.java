package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.TestAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestAttemptRepository extends JpaRepository<TestAttemptEntity,Integer> {
    List<TestAttemptEntity> findByTestIdAndStudentProfileId(Integer testId, Integer studentProfileId);
    Optional<TestAttemptEntity> findTopByTest_IdAndStudentProfile_IdOrderByTotalScoreDesc(Integer testId, Integer studentProfileId);

}
