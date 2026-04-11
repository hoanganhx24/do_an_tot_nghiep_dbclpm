# PHU LUC CHI TIET TEST CASE - Ngan Full Service

Tong so test case: 109

## 1) AuthService (10 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-AUTH-001 | loginUser should call login API with auth/login endpoint and return API response | const input = { email: "user@example.com", password: "123456" }; login.mockResolvedValue(expected) | expect(login).toHaveBeenCalledWith("auth/login", input); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-002 | refreshToken should read refresh token then call refresh API and return API response | getRefreshToken.mockReturnValue("refresh-token-value"); refresh.mockResolvedValue(expected) | expect(getRefreshToken).toHaveBeenCalledTimes(1); expect(refresh).toHaveBeenCalledWith( "auth/refresh-token", "refresh-token-value" ); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-003 | saveToken should persist both access token and refresh token | Mock values: 'saveToken should persist both access token and refresh token', 'access-1', 'refresh-1' | expect(setAccessToken).toHaveBeenCalledWith("access-1"); expect(setRefreshToken).toHaveBeenCalledWith("refresh-1") | Jest + mock request/token |
| TC-NGAN-AUTH-004 | checkEmail should call check endpoint users/check-email with input payload | const input = { email: "check@example.com" }; check.mockResolvedValue(expected) | expect(check).toHaveBeenCalledWith("users/check-email", input); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-005 | checkCode should call check endpoint studentprofiles/create with input payload | const input = { code: "ABC123" }; check.mockResolvedValue(expected) | expect(check).toHaveBeenCalledWith("studentprofiles/create", input); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-006 | checkCodeTeacher should call check endpoint verify/otp with input payload | const input = { otp: "123456" }; check.mockResolvedValue(expected) | expect(check).toHaveBeenCalledWith("verify/otp", input); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-007 | getUser should decode refresh token email and call users/{email} endpoint | getRefreshToken.mockReturnValue("refresh-token"); parseJwt.mockReturnValue({ sub: "student@example.com" }); get.mockResolvedValue(expected) | expect(parseJwt).toHaveBeenCalledWith("refresh-token"); expect(get).toHaveBeenCalledWith("users/student@example.com"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-008 | updateUser should call put2 users endpoint with input payload | const input = { fullName: "Updated Name" }; put2.mockResolvedValue(expected) | expect(put2).toHaveBeenCalledWith("users", input); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-009 | updatePassword should merge decoded email into payload and call users/password endpoint | const input = { oldPassword: "old-pass", newPassword: "new-pass" }; getRefreshToken.mockReturnValue("refresh-token"); parseJwt.mockReturnValue({ sub: "student@example.com" }); put2.mockResolvedValue(expected) | expect(put2).toHaveBeenCalledWith("users/password", { oldPassword: "old-pass", newPassword: "new-pass", email: "student@example.com", }); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-AUTH-010 | forgetPassword should call get2 users/forgotPassword/{email} endpoint | const email = "student@example.com"; get2.mockResolvedValue(expected) | expect(get2).toHaveBeenCalledWith("users/forgotPassword/student@example.com"); expect(result).toEqual(expected) | Jest + mock request/token |

## 2) CourseService (29 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-COURSE-001 | getListCoursesOfTeacher should call đúng endpoint teacher | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith( "tracks/courses/teacher?type=ACTIVE&&teacherId=15" ); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-002 | getListCoursesOfAdmin should call đúng endpoint admin | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("tracks/courses?type=DRAFT"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-003 | getListCoursesOfStudent should call đúng endpoint enrollments | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("enrollments/student/99"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-004 | getDetailCourse should gọi endpoint không có version khi version undefined | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("courses/teacher?courseId=10"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-005 | getDetailCourse should giữ version=0 trong query | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("courses/teacher?courseId=10&&version=0"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-006 | getDetailCourse should gọi endpoint có version khi version > 0 | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("courses/teacher?courseId=10&&version=2"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-007 | getDetailCourseStudent should gọi endpoint course + student | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("courses/5/student/20"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-008 | createCourse should gọi postFormData với đường dẫn courses | const formData = new FormData(); postFormData.mockResolvedValue(expected) | expect(postFormData).toHaveBeenCalledWith("courses", formData); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-009 | getMaxOrderOfCourse should gọi modules/maxOrder/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("modules/maxOrder/7"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-010 | createModuleOfCourse should gọi post modules | const payload = { moduleName: "M1" }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("modules", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-011 | updateModuleOfCourse should gọi put2 modules | const payload = { id: 101, moduleName: "M1 updated" }; put2.mockResolvedValue(expected) | expect(put2).toHaveBeenCalledWith("modules", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-012 | deleteModuleOfCourse should gọi del modules/{id} | del.mockResolvedValue(expected) | expect(del).toHaveBeenCalledWith("modules/101"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-013 | getOrderIndexOfLesson should gọi lessons/max-order/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("lessons/max-order/44"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-014 | getLesson should lấy studentId từ token và gọi endpoint đúng | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("lessons/5/student/888"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-015 | getLessonAdminTeacher should gọi lessons/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("lessons/15"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-016 | createLessionOfModule should gọi postFormData lessons | const formData = new FormData(); postFormData.mockResolvedValue(expected) | expect(postFormData).toHaveBeenCalledWith("lessons", formData); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-017 | updateLessionOfModule should gọi putFormData lessons | const formData = new FormData(); putFormData.mockResolvedValue(expected) | expect(putFormData).toHaveBeenCalledWith("lessons", formData); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-018 | createTestOfModule should gọi post tests | const payload = { lessonId: 12 }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("tests", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-019 | deleteTestOfModule should gọi del tests/{id} | del.mockResolvedValue(expected) | expect(del).toHaveBeenCalledWith("tests/19"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-020 | publicCourse should gọi put courses/publish/{id} | put.mockResolvedValue(expected) | expect(put).toHaveBeenCalledWith("courses/publish/20"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-021 | getLessonPath should gọi lessons/path/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("lessons/path/21"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-022 | getLessonIdNext should gọi endpoint next-lessonID đúng query | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("lessons/next-lessonID?id=10&&type=lesson"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-023 | getLessonIdPrevious should gọi endpoint previous-lessonID đúng query | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith( "lessons/previous-lessonID?id=10&&type=lesson" ); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-024 | getMiniTestSummary should gọi tests/miniTest/summary/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("tests/miniTest/summary/31"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-025 | getMiniTestStar should ghép studentId từ token vào endpoint | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("tests/50/student/888/completedStar"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-026 | getHistoryMiniTest should ghép studentId từ token vào endpoint history | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("tests/50/student/888/testAttempts"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-027 | getIteractiveExercises should ghép studentId từ token vào endpoint interactive | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("exercises/interactive/77/student/888"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-028 | saveProcessLesson should gọi post lesson-progress và trả về Promise từ request | const payload = { lessonId: 1, progress: 75 }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("lesson-progress", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-COURSE-029 | deleteLessonOfModule should gọi del lessons/{id} | del.mockResolvedValue(expected) | expect(del).toHaveBeenCalledWith("lessons/45"); expect(result).toEqual(expected) | Jest + mock request/token |

## 3) ExerciseService (19 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-EXERCISE-001 | getListExercisesOfTeacherLesson should gọi endpoint summary của lesson | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("exercises/lesson/9/summary"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-002 | createExerciseOfTeacherLesson should gọi postFormData exercises | const payload = new FormData(); postFormData.mockResolvedValue(expected) | expect(postFormData).toHaveBeenCalledWith("exercises", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-003 | updateExerciseOfTeacherLesson should gọi putFormData exercises | const payload = new FormData(); putFormData.mockResolvedValue(expected) | expect(putFormData).toHaveBeenCalledWith("exercises", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-004 | createQuestionOfExercise should gọi postFormData questions | const payload = new FormData(); postFormData.mockResolvedValue(expected) | expect(postFormData).toHaveBeenCalledWith("questions", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-005 | updateQuestionOfExercise should gọi putFormData questions | const payload = new FormData(); putFormData.mockResolvedValue(expected) | expect(putFormData).toHaveBeenCalledWith("questions", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-006 | getListQuestionOfExercise should gọi endpoint exercises/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("exercises/22"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-007 | deleteQuestionOfExercise should gọi del questions/{id} | del.mockResolvedValue(expected) | expect(del).toHaveBeenCalledWith("questions/23"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-008 | deleteExerciseOfTeacherLesson should gọi del exercises/{id} | del.mockResolvedValue(expected) | expect(del).toHaveBeenCalledWith("exercises/24"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-009 | getListExercisesOfTest should gọi assessments/test/{id}/summary | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("assessments/test/25/summary"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-010 | createExerciseOfTest should gọi postFormData assessments | const payload = new FormData(); postFormData.mockResolvedValue(expected) | expect(postFormData).toHaveBeenCalledWith("assessments", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-011 | updateExerciseOfTest should gọi putFormData assessments | const payload = new FormData(); putFormData.mockResolvedValue(expected) | expect(putFormData).toHaveBeenCalledWith("assessments", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-012 | deleteExerciseOfTest should gọi del assessments/{id} | del.mockResolvedValue(expected) | expect(del).toHaveBeenCalledWith("assessments/27"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-013 | getListQuestionOfExerciseTest should gọi assessments/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("assessments/28"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-014 | createQuestionOfExerciseTest should gọi postFormData assessmentquesstions | const payload = new FormData(); postFormData.mockResolvedValue(expected) | expect(postFormData).toHaveBeenCalledWith("assessmentquesstions", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-015 | updateQuestionOfExerciseTest should gọi putFormData assessmentquesstions | const payload = new FormData(); putFormData.mockResolvedValue(expected) | expect(putFormData).toHaveBeenCalledWith("assessmentquesstions", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-016 | deleteQuestionOfExerciseTest should gọi del assessmentquesstions/{id} | del.mockResolvedValue(expected) | expect(del).toHaveBeenCalledWith("assessmentquesstions/29"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-017 | getListExercisesOfLessonStudent should ghép studentId từ token | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("exercises/lesson/30/student/777"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-018 | getExerciseDetailOfLessonStudent should ghép query studentProfileId | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("exercises/student?id=31&&studentProfileId=777"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-EXERCISE-019 | saveAnswerEx should gọi put2 attempts | const payload = { attemptId: 100, answer: "A" }; put2.mockResolvedValue(expected) | expect(put2).toHaveBeenCalledWith("attempts", payload); expect(result).toEqual(expected) | Jest + mock request/token |

## 4) FirstTestService (11 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-FIRSTTEST-001 | getFirstTests should gọi endpoint tests/firstTests/summary | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("tests/firstTests/summary"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-002 | getFirstTests should trả về mảng rỗng khi API trả về rỗng | get.mockResolvedValue([]) | expect(get).toHaveBeenCalledWith("tests/firstTests/summary"); expect(result).toEqual([]) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-003 | createFirstTest should gọi post tests/firstTest với payload | const payload = { level: "A2" }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("tests/firstTest", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-004 | getQuestionsOfFirstTest should gọi assessments/firsttest | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("assessments/firsttest"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-005 | getQuestionsOfMiniTest should gọi assessments/mini-test/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("assessments/mini-test/10"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-006 | getQuestionsOfMiniTest should xử lý id dạng chuỗi | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("assessments/mini-test/mini-01"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-007 | getQuestionsHistoryOfFirstTest should gọi testattempt/{id}/testAttemptDetail | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("testattempt/11/testAttemptDetail"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-008 | saveResultFirstTest should gọi post testattempt | const payload = { score: 650 }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("testattempt", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-009 | saveResultMiniTest should gọi post testattempt/mini-test | const payload = { score: 90 }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("testattempt/mini-test", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-010 | getFlow should lấy studentId từ token và gọi enrollments/studyFolow/{id} | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("enrollments/studyFolow/555"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-FIRSTTEST-011 | unlock should gọi post testprogress với payload | const payload = { lessonId: 1, unlocked: true }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("testprogress", payload); expect(result).toEqual(expected) | Jest + mock request/token |

## 5) StudentService (10 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-STUDENT-001 | getListStudents should gọi đúng endpoint studentprofiles | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("studentprofiles"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDENT-002 | getListStudents should trả về mảng kết quả khi API trả mảng | get.mockResolvedValue(expected) | expect(Array.isArray(result)).toBe(true); expect(result).toHaveLength(2) | Jest + mock request/token |
| TC-NGAN-STUDENT-003 | getListStudents should xử lý trường hợp API trả về mảng rỗng | get.mockResolvedValue([]) | expect(result).toEqual([]) | Jest + mock request/token |
| TC-NGAN-STUDENT-004 | getListStudents should trả về object phân trang khi backend trả object | get.mockResolvedValue(expected) | expect(result).toEqual(expected); expect(result.totalElements).toBe(1) | Jest + mock request/token |
| TC-NGAN-STUDENT-005 | getListStudents should throw khi request bị reject | const error = new Error("Network error"); get.mockRejectedValue(error) | await expect(getListStudents()).rejects.toThrow("Network error") | Jest + mock request/token |
| TC-NGAN-STUDENT-006 | getListStudents should gọi request đúng 1 lần mỗi lần thực thi | get.mockResolvedValue([{ id: 3 }]) | expect(get).toHaveBeenCalledTimes(1) | Jest + mock request/token |
| TC-NGAN-STUDENT-007 | getListStudents should gọi lại endpoint ở lần gọi thứ hai | get.mockResolvedValue([{ id: 4 }]) | expect(get).toHaveBeenNthCalledWith(1, "studentprofiles"); expect(get).toHaveBeenNthCalledWith(2, "studentprofiles"); expect(get).toHaveBeenCalledTimes(2) | Jest + mock request/token |
| TC-NGAN-STUDENT-008 | getListStudents should gọi endpoint không kèm query params | get.mockResolvedValue([{ id: 5 }]) | expect(path).toBe("studentprofiles"); expect(path.includes("?")).toBe(false) | Jest + mock request/token |
| TC-NGAN-STUDENT-009 | getListStudents should cho phép backend trả null | get.mockResolvedValue(null) | expect(result).toBeNull() | Jest + mock request/token |
| TC-NGAN-STUDENT-010 | getListStudents should giữ nguyên reference object từ API | get.mockResolvedValue(expected) | expect(result).toBe(expected) | Jest + mock request/token |

## 6) StudyPlanService (10 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-STUDYPLAN-001 | getStudyPlanOverview should lấy studentId từ token | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("study-plans/overview/student/321"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-002 | getMinDayForStudy should ghép id kế hoạch và studentId | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("study-plans/min-day-for-study/12/student/321"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-003 | verifyInformation should gọi post verify-information với payload | const payload = { targetScore: 700 }; post.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(post).toHaveBeenCalledWith("study-plans/verify-information", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-004 | createPlan should gọi post study-plans với payload | const payload = { weeks: 8 }; post.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(post).toHaveBeenCalledWith("study-plans", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-005 | checkExitPlanStudy should gọi checkExist theo studentId | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("study-plans/checkExist?studentId=321"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-006 | getStudyPlanDetail should gọi study-plans/{id} | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("study-plans/44"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-007 | getInformationAboutStudyplan should gọi endpoint information-about-studyplan | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("study-plans/45/information-about-studyplan"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-008 | getStudyPlanOverview should cập nhật endpoint khi studentId thay đổi | getId.mockReturnValue(654); get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("study-plans/overview/student/654"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-009 | getMinDayForStudy should hỗ trợ id dạng chuỗi | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith( "study-plans/min-day-for-study/plan-alpha/student/321" ); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-STUDYPLAN-010 | verifyInformation should throw khi API reject | const payload = { targetScore: 800 }; post.mockRejectedValue(new Error("Invalid profile")) | await expect(verifyInformation(payload)).rejects.toThrow("Invalid profile") | Jest + mock request/token |

## 7) TeacherService (10 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-TEACHER-001 | getListTeachers should gọi endpoint teacherprofiles | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("teacherprofiles"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-002 | getListTeachersActive should gọi endpoint teacherprofiles/active | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("teacherprofiles/active"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-003 | getTeacherDetail should gọi endpoint teachers/{id} với id số | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("teachers/3"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-004 | getTeacherDetail should hỗ trợ id dạng chuỗi | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("teachers/abc"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-005 | createTeacher should gọi post teacherprofiles/create | const payload = { fullName: "Nguyen Van A" }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("teacherprofiles/create", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-006 | updateTeacher should gọi put2 teacherprofiles | const payload = { id: 1, fullName: "Le Thi B" }; put2.mockResolvedValue(expected) | expect(put2).toHaveBeenCalledWith("teacherprofiles", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-007 | deleteTeacher should gọi put teacherprofiles/{id}/terminate | put.mockResolvedValue(expected) | expect(put).toHaveBeenCalledWith("teacherprofiles/10/terminate"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-008 | createTeacher should throw khi backend reject | const payload = { fullName: "" }; post.mockRejectedValue(new Error("Validation failed")) | await expect(createTeacher(payload)).rejects.toThrow("Validation failed") | Jest + mock request/token |
| TC-NGAN-TEACHER-009 | updateTeacher should xử lý payload rỗng | const payload = {}; put2.mockResolvedValue(expected) | expect(put2).toHaveBeenCalledWith("teacherprofiles", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-TEACHER-010 | deleteTeacher should hỗ trợ id bằng 0 | put.mockResolvedValue(expected) | expect(put).toHaveBeenCalledWith("teacherprofiles/0/terminate"); expect(result).toEqual(expected) | Jest + mock request/token |

## 8) VocaService (10 test case)

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-VOCA-001 | getListSuggest should gọi dictionary/suggestion với từ khóa | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("dictionary/suggestion?word=app"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-002 | getListSuggest should giữ nguyên chuỗi có khoảng trắng | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("dictionary/suggestion?word=take off"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-003 | getListSuggest should hoạt động khi từ khóa rỗng | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("dictionary/suggestion?word="); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-004 | getSearchInDictionary should gọi endpoint có word và studentId | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("dictionary?word=bank&&studentId=202"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-005 | getSearchInDictionary should hỗ trợ từ có ký tự đặc biệt | get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("dictionary?word=can't&&studentId=202"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-006 | saveStudentDictionary should gọi post student-dictionarys với object payload | const payload = { word: "focus" }; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("student-dictionarys", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-007 | saveStudentDictionary should gọi post student-dictionarys với string payload | const payload = "achieve"; post.mockResolvedValue(expected) | expect(post).toHaveBeenCalledWith("student-dictionarys", payload); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-008 | getStudentDictionary should lấy studentId từ token | get.mockResolvedValue(expected) | expect(getId).toHaveBeenCalledTimes(1); expect(get).toHaveBeenCalledWith("student-dictionarys/student/202"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-009 | getStudentDictionary should thay đổi endpoint khi studentId thay đổi | getId.mockReturnValue(999); get.mockResolvedValue(expected) | expect(get).toHaveBeenCalledWith("student-dictionarys/student/999"); expect(result).toEqual(expected) | Jest + mock request/token |
| TC-NGAN-VOCA-010 | getSearchInDictionary should throw khi API reject | get.mockRejectedValue(new Error("Dictionary service down")) | await expect(getSearchInDictionary("hello")).rejects.toThrow("Dictionary service down") | Jest + mock request/token |



