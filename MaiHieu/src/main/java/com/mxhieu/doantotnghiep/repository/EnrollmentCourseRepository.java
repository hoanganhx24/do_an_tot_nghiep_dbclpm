package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.EnrollmentCourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EnrollmentCourseRepository extends JpaRepository<EnrollmentCourseEntity, Integer> {
    @Query(value = "SELECT ec.status FROM enrollmentcourse ec " +
            "JOIN enrollment e ON ec.EnrollmentID = e.id " +
            "WHERE e.StudentProfileID = :studentProfileId " +
            "AND ec.CourseID = :courseId " +
            "LIMIT 1",
            nativeQuery = true)
    String findStatus(Integer studentProfileId, Integer courseId);

    List<EnrollmentCourseEntity> findByEnrollment_Id(Integer enrollmentId);
    List<EnrollmentCourseEntity> findByCourse_IdAndEnrollment_StudentProfile_Id(Integer courseId, Integer studentId);

    Optional<EnrollmentCourseEntity> findTopByIdAfterAndEnrollment_Id(Integer Id, Integer enrollmentId);
}
