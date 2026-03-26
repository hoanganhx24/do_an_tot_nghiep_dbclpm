package com.mxhieu.doantotnghiep.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    EMAIL_ALREADY_EXISTS(1014, "Email already exists", HttpStatus.BAD_REQUEST),
    INVALID_OTP(2000, "Invalid or expired OTP", HttpStatus.UNAUTHORIZED),
    ROLE_NOT_FOUND(404, "Role not found", HttpStatus.NOT_FOUND),
    LOG_IN_FAILED(401, "Log in failed. Invalid email or password", HttpStatus.UNAUTHORIZED),
    USER_NOT_EXISTS(404, "User not found", HttpStatus.NOT_FOUND),
    PASSWORD_NOT_MATCH(400, "Current password is incorrect", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(404, "User not found", HttpStatus.NOT_FOUND),
    TEST_NOT_FOUND(1016,"test not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(403, "you do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(401, "you are not authenticated", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN(1001, "Refresh token is invalid or expired", HttpStatus.UNAUTHORIZED),
    STUDENT_PROFILE_NOT_FOUND(1006, "Student profile not found", HttpStatus.NOT_FOUND),
    MISSING_PARAMETERS(2001, "Missing required parameters", HttpStatus.BAD_REQUEST),
    USER_INACTIVE(1015, "User account is inactive", HttpStatus.FORBIDDEN),
    ASSESSMENT_QUESSTION_NOT_FOUND(1016,"assessmentQuestion not found", HttpStatus.NOT_FOUND),
    LESSON_PROGRESS_NOT_EXISTS(1017,"Lesson progress not exists", HttpStatus.NOT_FOUND),
    SHOWTIME_EXISTED(1018,"showTime da ton tai trong bai tap tuong tac", HttpStatus.BAD_REQUEST),
    CHOICE_NOT_FOUND_BY_QUESTION_AND_STUDENT(10010,"Choice not found by question and student", HttpStatus.NOT_FOUND),
    CHOICE_NOT_FOUND(10011,"Choice not found", HttpStatus.NOT_FOUND),
    TEST_PROGRESS_NOT_EXISTS(1019,"Test progress not exists", HttpStatus.NOT_FOUND),
    MODULE_LESSON_EMPTY(1024, "Module has no lessons", HttpStatus.BAD_REQUEST),
    MODULE_TESR_EMPTY(1024, "Module has no test", HttpStatus.BAD_REQUEST),
    EXERCISE_QUESTION_EMPTY(1025, "Exercise has no questions", HttpStatus.BAD_REQUEST),

    BOTH_NEW_PASS_NOT_MATCH(1000,"mật khẩu mới và confirm khong giong nhau" , HttpStatus.BAD_REQUEST),

    // 🔽 Thêm 3 error code mới cho upload file
    FILE_NAME_EMPTY(1002, "File name must not be empty", HttpStatus.BAD_REQUEST),
    FILE_TYPE_INVALID(1003, "Invalid file type", HttpStatus.BAD_REQUEST),
    FILE_SIZE_EXCEEDED(1004, "File size must not exceed 100MB", HttpStatus.PAYLOAD_TOO_LARGE),
    ASSESSMENT_NOT_FOUND(404, "Assessment not found", HttpStatus.NOT_FOUND),
    COURSE_NOT_FOUND(1005, "Course not found", HttpStatus.NOT_FOUND),
    LESSON_NOT_FOUND(1011, "Lesson not found", HttpStatus.NOT_FOUND),
    EXERCISE_TYPE_NOT_FOUND(1010, "Exercise type not found", HttpStatus.NOT_FOUND),
    EXERCISE_NOT_FOUND(1009, "Exercise not found", HttpStatus.NOT_FOUND),
    TEACHERPROFILE_NOT_FOUND(1008, "Teacher profile not found", HttpStatus.NOT_FOUND),
    EMAIL_SEND_FAILED(1007, "Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR),
    SHOWTIME_AND_LENGTHSEC_NULL(1014,"show time và length sec bang null", HttpStatus.BAD_REQUEST),
    SHOWTIME_INVALID(1015,"showTime phai nho hon thoi luong video",HttpStatus.BAD_REQUEST),

    // 🔽 Thêm lỗi mới cho track
    TRACK_NOT_FOUND(1012, "Track not found", HttpStatus.NOT_FOUND),

    // 🔽 Thêm lỗi mới cho module
    MODULE_NOT_FOUND(1013, "Module not found", HttpStatus.NOT_FOUND),

    COURSE_PUBLISHED(1016, "Course published", HttpStatus.BAD_REQUEST),
    LESSON_NOT_HAS_NEXT(1019, "do not has next lesson",  HttpStatus.NOT_FOUND),
    LESSON_NOT_HAS_PREVIOUS(1020, "do not has previous lesson",  HttpStatus.NOT_FOUND),
    TEST_ATTEMPT_NOT_FOUND(1020, "bai test chưa được làm",  HttpStatus.NOT_FOUND),
    QUESTION_NOT_FOUND(1020, "không tìm thấy câu hỏi",  HttpStatus.NOT_FOUND),
    COURSE_EMPTY_MODULE(1021,"khóa học này chưa có module",HttpStatus.BAD_REQUEST),
    LESSON_NOT_HAS_MEDIA(1022,"khóa học không có video" ,HttpStatus.NOT_FOUND ),
    STUDYPLAN_NOT_FOUND(1025,"không tìm thấy stuyplan" ,HttpStatus.NOT_FOUND ),
    STUDYPLAN_NOT_ACTIVE(1022,"Không có plan nào hoạt động" ,HttpStatus.NOT_FOUND  ),
    STUDENT_NOT_HAVE_ENROLLMENT(1021,"học sinh chưa làm bài test đầu vào" , HttpStatus.NOT_FOUND),
    ASSESSMENT_QUESSTION_EMPTY(1021,"assessment has not questions" , HttpStatus.BAD_REQUEST),
    ASSESSMENT_OF_TEST_EMPTY(1021,"test has not assessment" , HttpStatus.BAD_REQUEST),
    NEXT_NOT_FOUND(1000,"khong tim thay course tiep theo" , HttpStatus.NOT_FOUND),
    LESSON_IS_LOCK(1000,"lesson nay bị khóa" ,HttpStatus.BAD_REQUEST ),
    DEFINITION_EXAMPLE_NOT_FOUND(1000,"Khong tim thấy nghĩa và ví dụ" ,HttpStatus.NOT_FOUND ),
    QUESSTION_CHOICE_EMPTY(1000,"câu hỏi không có lựa chọn" , HttpStatus.BAD_REQUEST);
    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}
