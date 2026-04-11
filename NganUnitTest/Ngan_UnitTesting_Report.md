# BÁO CÁO KIỂM THỬ ĐƠN VỊ - Ngan (Full Service)

## Thông tin chung
- Phạm vi: Module Ngan, toàn bộ lớp service trong frontend
- Thời gian thực hiện: 2026-04-12
- Người thực hiện: GitHub Copilot (GPT-5.3-Codex)
- Đường dẫn module: d:/DBCLPM/do_an_tot_nghiep_final/Ngan

---

## 1. Unit Testing Report

### 1.1 Công cụ và thư viện

- Framework kiểm thử chính:
  - Jest (chạy thông qua react-scripts test)
- Thư viện hỗ trợ có trong dự án:
  - @testing-library/jest-dom
  - @testing-library/react
  - @testing-library/user-event
- Kỹ thuật cô lập unit test:
  - jest.mock(...) cho dependencies
  - Mock hàm request (get/post/put/del/...)
  - Mock token provider (getId, getRefreshToken, ...)
- Công cụ đo độ bao phủ:
  - Istanbul coverage tích hợp trong Jest

---

### 1.2 Phạm vi kiểm thử

#### Các thành phần ĐƯỢC kiểm thử

1. Source file service:
- src/services/AuthService.js
- src/services/CourseService.js
- src/services/ExerciseService.js
- src/services/FirstTestService.js
- src/services/StudentService.js
- src/services/StudyPlanService.js
- src/services/TeacherService.js
- src/services/VocaService.js

2. Test script tương ứng:
- src/services/AuthService.test.js
- src/services/CourseService.test.js
- src/services/ExerciseService.test.js
- src/services/FirstTestService.test.js
- src/services/StudentService.test.js
- src/services/StudyPlanService.test.js
- src/services/TeacherService.test.js
- src/services/VocaService.test.js

#### Các thành phần KHÔNG kiểm thử trong đợt này

- Nhóm UI (component, page, layout, route) trong src/components, src/pages, src/layout, src/routes.
- Nhóm utility không thuộc full service scope của yêu cầu lần này (ví dụ src/utils/request.js đã có test riêng từ đợt trước).
- Lý do loại trừ:
  - Đợt này tập trung đúng yêu cầu “full service”.
  - UI cần chiến lược test khác (component/integration/e2e), không phải unit test service wrapper.

---

### 1.3 Unit Test Cases

- Tổ chức test case theo tên tệp (file).
- Mỗi test case đều có đủ 5 trường: Test Case ID, Test Objective, Input, Expected Output, Notes.

#### A) File: src/services/AuthService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-AUTH-001 | Kiểm tra hàm loginUser gọi đúng endpoint đăng nhập | Payload email/password | Gọi login("auth/login", payload), trả về đúng response | Service wrapper |
| TC-NGAN-AUTH-002 | Kiểm tra refreshToken lấy refresh token và gọi API refresh | getRefreshToken trả token giả | Gọi refresh("auth/refresh-token", token), trả response | Dùng mock token |
| TC-NGAN-AUTH-003 | Kiểm tra saveToken lưu cả access và refresh token | accessToken, refreshToken | setAccessToken + setRefreshToken được gọi đúng | Side-effect |
| TC-NGAN-AUTH-004 | Kiểm tra checkEmail gọi endpoint đúng | option chứa email | Gọi check("users/check-email", option), trả response | Validation flow |
| TC-NGAN-AUTH-005 | Kiểm tra checkCode gọi endpoint studentprofiles/create | option chứa code | Gọi check("studentprofiles/create", option), trả response | Student code |
| TC-NGAN-AUTH-006 | Kiểm tra checkCodeTeacher gọi endpoint verify/otp | option chứa otp | Gọi check("verify/otp", option), trả response | Teacher OTP |
| TC-NGAN-AUTH-007 | Kiểm tra getUser giải mã token và gọi users/{email} | refresh token có sub=email | Gọi parseJwt + get("users/{email}"), trả response | JWT decode |
| TC-NGAN-AUTH-008 | Kiểm tra updateUser gọi put2 users | data user | Gọi put2("users", data), trả response | Update profile |
| TC-NGAN-AUTH-009 | Kiểm tra updatePassword tự ghép email vào payload | data mật khẩu + refresh token | Gọi put2("users/password", payload có email), trả response | Logic ghép payload |
| TC-NGAN-AUTH-010 | Kiểm tra forgetPassword gọi users/forgotPassword/{email} | email | Gọi get2 endpoint đúng, trả response | Forgot password |

#### B) File: src/services/CourseService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-COURSE-001 | Lấy khóa học giáo viên đúng endpoint | type, teacherId | Gọi get với tracks/courses/teacher?type=...&&teacherId=... | Query endpoint |
| TC-NGAN-COURSE-002 | Lấy khóa học admin đúng endpoint | type | Gọi get tracks/courses?type=... | Query endpoint |
| TC-NGAN-COURSE-003 | Lấy khóa học học viên đúng endpoint | studentId | Gọi get enrollments/student/{id} | Query endpoint |
| TC-NGAN-COURSE-004 | getDetailCourse khi version undefined | courseId | Gọi courses/teacher?courseId={id} | Nhánh 1 |
| TC-NGAN-COURSE-005 | getDetailCourse khi version = 0 | courseId, 0 | Gọi courses/teacher?courseId={id}&&version=0 | Nhánh biên |
| TC-NGAN-COURSE-006 | getDetailCourse khi version > 0 | courseId, version | Gọi endpoint có version | Nhánh 2 |
| TC-NGAN-COURSE-007 | Lấy chi tiết khóa học học viên | courseId, studentId | Gọi courses/{courseId}/student/{studentId} | Detail endpoint |
| TC-NGAN-COURSE-008 | Tạo khóa học bằng form data | formData | Gọi postFormData("courses", formData) | Upload style |
| TC-NGAN-COURSE-009 | Lấy max order module | courseId | Gọi modules/maxOrder/{id} | Ordering |
| TC-NGAN-COURSE-010 | Tạo module | payload module | Gọi post("modules", payload) | Create module |
| TC-NGAN-COURSE-011 | Cập nhật module | payload module | Gọi put2("modules", payload) | Update module |
| TC-NGAN-COURSE-012 | Xóa module | moduleId | Gọi del("modules/{id}") | Delete module |
| TC-NGAN-COURSE-013 | Lấy max order lesson | moduleId | Gọi lessons/max-order/{id} | Ordering |
| TC-NGAN-COURSE-014 | Lấy lesson theo studentId từ token | lessonId + getId mock | Gọi lessons/{lessonId}/student/{studentId} | Token dependent |
| TC-NGAN-COURSE-015 | Lấy lesson cho admin/teacher | lessonId | Gọi lessons/{id} | Detail endpoint |
| TC-NGAN-COURSE-016 | Tạo lesson bằng form data | formData | Gọi postFormData("lessons", formData) | Create lesson |
| TC-NGAN-COURSE-017 | Cập nhật lesson bằng form data | formData | Gọi putFormData("lessons", formData) | Update lesson |
| TC-NGAN-COURSE-018 | Tạo test trong module | payload test | Gọi post("tests", payload) | Create test |
| TC-NGAN-COURSE-019 | Xóa test trong module | testId | Gọi del("tests/{id}") | Delete test |
| TC-NGAN-COURSE-020 | Public khóa học | courseId | Gọi put("courses/publish/{id}") | Publish flow |
| TC-NGAN-COURSE-021 | Lấy đường dẫn lesson | lessonId | Gọi get("lessons/path/{id}") | Path endpoint |
| TC-NGAN-COURSE-022 | Lấy lesson kế tiếp | id, type | Gọi lessons/next-lessonID?id=...&&type=... | Navigation |
| TC-NGAN-COURSE-023 | Lấy lesson trước đó | id, type | Gọi lessons/previous-lessonID?id=...&&type=... | Navigation |
| TC-NGAN-COURSE-024 | Lấy mini test summary | testId | Gọi tests/miniTest/summary/{id} | Summary |
| TC-NGAN-COURSE-025 | Lấy star mini test theo studentId | testId + getId mock | Gọi tests/{id}/student/{studentId}/completedStar | Token dependent |
| TC-NGAN-COURSE-026 | Lấy lịch sử mini test theo studentId | testId + getId mock | Gọi tests/{id}/student/{studentId}/testAttempts | Token dependent |
| TC-NGAN-COURSE-027 | Lấy interactive exercise theo studentId | lessonId + getId mock | Gọi exercises/interactive/{id}/student/{studentId} | Token dependent |
| TC-NGAN-COURSE-028 | Lưu tiến trình lesson | payload progress | Gọi post("lesson-progress", payload) | Hàm non-async trả Promise |
| TC-NGAN-COURSE-029 | Xóa lesson | lessonId | Gọi del("lessons/{id}") | Delete lesson |

#### C) File: src/services/ExerciseService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-EXERCISE-001 | Lấy danh sách exercise theo lesson cho teacher | lessonId | Gọi exercises/lesson/{id}/summary | Summary endpoint |
| TC-NGAN-EXERCISE-002 | Tạo exercise lesson teacher | formData | Gọi postFormData("exercises", data) | Create |
| TC-NGAN-EXERCISE-003 | Cập nhật exercise lesson teacher | formData | Gọi putFormData("exercises", data) | Update |
| TC-NGAN-EXERCISE-004 | Tạo question của exercise | formData | Gọi postFormData("questions", data) | Create question |
| TC-NGAN-EXERCISE-005 | Cập nhật question của exercise | formData | Gọi putFormData("questions", data) | Update question |
| TC-NGAN-EXERCISE-006 | Lấy danh sách question của exercise | exerciseId | Gọi get("exercises/{id}") | Detail |
| TC-NGAN-EXERCISE-007 | Xóa question của exercise | questionId | Gọi del("questions/{id}") | Delete |
| TC-NGAN-EXERCISE-008 | Xóa exercise của teacher lesson | exerciseId | Gọi del("exercises/{id}") | Delete |
| TC-NGAN-EXERCISE-009 | Lấy danh sách exercise của test | testId | Gọi get("assessments/test/{id}/summary") | Summary |
| TC-NGAN-EXERCISE-010 | Tạo exercise của test | formData | Gọi postFormData("assessments", data) | Create |
| TC-NGAN-EXERCISE-011 | Cập nhật exercise của test | formData | Gọi putFormData("assessments", data) | Update |
| TC-NGAN-EXERCISE-012 | Xóa exercise của test | assessmentId | Gọi del("assessments/{id}") | Delete |
| TC-NGAN-EXERCISE-013 | Lấy danh sách question exercise test | assessmentId | Gọi get("assessments/{id}") | Detail |
| TC-NGAN-EXERCISE-014 | Tạo question exercise test | formData | Gọi postFormData("assessmentquesstions", data) | Typo endpoint giữ nguyên code gốc |
| TC-NGAN-EXERCISE-015 | Cập nhật question exercise test | formData | Gọi putFormData("assessmentquesstions", data) | Typo endpoint giữ nguyên code gốc |
| TC-NGAN-EXERCISE-016 | Xóa question exercise test | id | Gọi del("assessmentquesstions/{id}") | Typo endpoint giữ nguyên code gốc |
| TC-NGAN-EXERCISE-017 | Lấy exercise lesson cho student | lessonId + getId | Gọi exercises/lesson/{id}/student/{studentId} | Token dependent |
| TC-NGAN-EXERCISE-018 | Lấy chi tiết exercise cho student | exerciseId + getId | Gọi exercises/student?id=...&&studentProfileId=... | Query endpoint |
| TC-NGAN-EXERCISE-019 | Lưu đáp án exercise | payload | Gọi put2("attempts", payload) | Save attempt |

#### D) File: src/services/FirstTestService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-FIRSTTEST-001 | Lấy danh sách first test summary | (input không dùng) | Gọi get("tests/firstTests/summary") | Wrapper |
| TC-NGAN-FIRSTTEST-002 | Xử lý first test khi API trả mảng rỗng | none | Trả [] | Valid empty response |
| TC-NGAN-FIRSTTEST-003 | Tạo first test | payload | Gọi post("tests/firstTest", payload) | Create |
| TC-NGAN-FIRSTTEST-004 | Lấy câu hỏi first test | none | Gọi get("assessments/firsttest") | Question list |
| TC-NGAN-FIRSTTEST-005 | Lấy câu hỏi mini test theo id số | id số | Gọi get("assessments/mini-test/{id}") | Mini test |
| TC-NGAN-FIRSTTEST-006 | Lấy câu hỏi mini test theo id chuỗi | id chuỗi | Gọi endpoint đúng với chuỗi | Edge id type |
| TC-NGAN-FIRSTTEST-007 | Lấy history first test | attemptId | Gọi get("testattempt/{id}/testAttemptDetail") | History |
| TC-NGAN-FIRSTTEST-008 | Lưu kết quả first test | payload | Gọi post("testattempt", payload) | Save result |
| TC-NGAN-FIRSTTEST-009 | Lưu kết quả mini test | payload | Gọi post("testattempt/mini-test", payload) | Save result |
| TC-NGAN-FIRSTTEST-010 | Lấy study flow theo studentId token | getId mock | Gọi get("enrollments/studyFolow/{studentId}") | Token dependent |
| TC-NGAN-FIRSTTEST-011 | Mở khóa nội dung | payload | Gọi post("testprogress", payload) | Unlock flow |

#### E) File: src/services/StudentService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-STUDENT-001 | Gọi đúng endpoint danh sách học viên | none | get("studentprofiles") | Endpoint check |
| TC-NGAN-STUDENT-002 | Trả đúng mảng dữ liệu | API trả mảng 2 phần tử | Kết quả là mảng length=2 | Normal data |
| TC-NGAN-STUDENT-003 | Trả đúng mảng rỗng | API trả [] | Kết quả [] | Empty case |
| TC-NGAN-STUDENT-004 | Trả object phân trang | API trả object {content,totalElements} | Kết quả đúng object | Paginated response |
| TC-NGAN-STUDENT-005 | Throw khi request reject | API reject Error | Hàm reject đúng lỗi | Error flow |
| TC-NGAN-STUDENT-006 | Kiểm tra số lần gọi request | Gọi hàm 1 lần | get gọi 1 lần | Invocation count |
| TC-NGAN-STUDENT-007 | Kiểm tra gọi lặp nhiều lần | Gọi hàm 2 lần | get gọi 2 lần cùng endpoint | Idempotent wrapper |
| TC-NGAN-STUDENT-008 | Kiểm tra endpoint không query string | none | Path không chứa ? | Path validation |
| TC-NGAN-STUDENT-009 | Hỗ trợ backend trả null | API trả null | Kết quả null | Edge response |
| TC-NGAN-STUDENT-010 | Giữ nguyên reference object từ API | API trả object reference | result === expected | Reference preservation |

#### F) File: src/services/StudyPlanService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-STUDYPLAN-001 | Lấy overview theo studentId token | getId mock | Gọi get("study-plans/overview/student/{id}") | Token dependent |
| TC-NGAN-STUDYPLAN-002 | Lấy min day for study | planId + getId | Gọi get("study-plans/min-day-for-study/{planId}/student/{id}") | Token dependent |
| TC-NGAN-STUDYPLAN-003 | Verify thông tin trước tạo kế hoạch | payload | Gọi post("study-plans/verify-information", payload) | Verify flow |
| TC-NGAN-STUDYPLAN-004 | Tạo kế hoạch học tập | payload | Gọi post("study-plans", payload) | Create plan |
| TC-NGAN-STUDYPLAN-005 | Kiểm tra tồn tại kế hoạch | getId mock | Gọi get("study-plans/checkExist?studentId={id}") | Check exist |
| TC-NGAN-STUDYPLAN-006 | Lấy chi tiết kế hoạch | planId | Gọi get("study-plans/{id}") | Detail |
| TC-NGAN-STUDYPLAN-007 | Lấy thông tin mở rộng kế hoạch | planId | Gọi get("study-plans/{id}/information-about-studyplan") | Detail info |
| TC-NGAN-STUDYPLAN-008 | Thay đổi studentId động cho overview | getId đổi giá trị | Endpoint đổi theo id mới | Dynamic token |
| TC-NGAN-STUDYPLAN-009 | Hỗ trợ planId dạng chuỗi | planId chuỗi | Query path giữ đúng chuỗi | Edge id type |
| TC-NGAN-STUDYPLAN-010 | Throw khi verifyInformation lỗi | payload + API reject | Hàm reject đúng lỗi | Error flow |

#### G) File: src/services/TeacherService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-TEACHER-001 | Lấy danh sách giáo viên | none | Gọi get("teacherprofiles") | List |
| TC-NGAN-TEACHER-002 | Lấy danh sách giáo viên active | none | Gọi get("teacherprofiles/active") | List active |
| TC-NGAN-TEACHER-003 | Lấy chi tiết giáo viên id số | id số | Gọi get("teachers/{id}") | Detail |
| TC-NGAN-TEACHER-004 | Lấy chi tiết giáo viên id chuỗi | id chuỗi | Gọi endpoint đúng | Edge id type |
| TC-NGAN-TEACHER-005 | Tạo giáo viên | payload | Gọi post("teacherprofiles/create", payload) | Create |
| TC-NGAN-TEACHER-006 | Cập nhật giáo viên | payload | Gọi put2("teacherprofiles", payload) | Update |
| TC-NGAN-TEACHER-007 | Xóa mềm giáo viên | id | Gọi put("teacherprofiles/{id}/terminate") | Soft delete |
| TC-NGAN-TEACHER-008 | Throw khi createTeacher lỗi | payload lỗi | Hàm reject đúng lỗi | Error flow |
| TC-NGAN-TEACHER-009 | Cập nhật với payload rỗng | {} | Vẫn gọi put2 đúng endpoint | Edge payload |
| TC-NGAN-TEACHER-010 | Xóa giáo viên với id=0 | id=0 | Gọi put teacherprofiles/0/terminate | Edge id |

#### H) File: src/services/VocaService.js

| Test Case ID | Test Objective | Input | Expected Output | Notes |
|---|---|---|---|---|
| TC-NGAN-VOCA-001 | Lấy gợi ý từ vựng cơ bản | word="app" | Gọi get("dictionary/suggestion?word=app") | Suggestion |
| TC-NGAN-VOCA-002 | Lấy gợi ý từ có khoảng trắng | word="take off" | Endpoint giữ đúng chuỗi | Phrase |
| TC-NGAN-VOCA-003 | Lấy gợi ý khi từ rỗng | word="" | Endpoint word= rỗng, trả [] | Edge keyword |
| TC-NGAN-VOCA-004 | Tra từ điển theo word + studentId | word + getId mock | Gọi get("dictionary?word=...&&studentId=...") | Token dependent |
| TC-NGAN-VOCA-005 | Tra từ với ký tự đặc biệt | word="can't" | Endpoint giữ đúng ký tự | Edge keyword |
| TC-NGAN-VOCA-006 | Lưu từ điển học viên với object payload | object | Gọi post("student-dictionarys", payload) | Save word |
| TC-NGAN-VOCA-007 | Lưu từ điển với string payload | string | Gọi post đúng endpoint | Save word |
| TC-NGAN-VOCA-008 | Lấy danh sách từ đã lưu theo studentId | getId mock | Gọi get("student-dictionarys/student/{id}") | Token dependent |
| TC-NGAN-VOCA-009 | Kiểm tra endpoint đổi theo studentId mới | getId đổi giá trị | Endpoint cập nhật theo id mới | Dynamic token |
| TC-NGAN-VOCA-010 | Throw khi getSearchInDictionary lỗi | API reject | Hàm reject đúng lỗi | Error flow |

##### Tổng hợp số lượng test case theo service

| Service | Số test case | Đạt yêu cầu >= 10 |
|---|---:|---|
| AuthService | 10 | Đạt |
| CourseService | 29 | Đạt |
| ExerciseService | 19 | Đạt |
| FirstTestService | 11 | Đạt |
| StudentService | 10 | Đạt |
| StudyPlanService | 10 | Đạt |
| TeacherService | 10 | Đạt |
| VocaService | 10 | Đạt |
| **Tổng** | **109** | **Đạt** |

Phụ lục sao lưu danh sách chi tiết vẫn được giữ tại:
- d:/DBCLPM/do_an_tot_nghiep_final/UnitTest/Ngan_Service_Testcase_Detail.md

---

### 1.4 Project Link

- Source code (local):
  - d:/DBCLPM/do_an_tot_nghiep_final
- Unit test scripts (local):
  - d:/DBCLPM/do_an_tot_nghiep_final/Ngan/src/services
- Link GitHub chính thức:
  - https://github.com/hoanganhx24/do_an_tot_nghiep_dbclpm.git

---

### 1.5 Execution Report

#### Lệnh chạy kiểm thử

Chạy tại thư mục Ngan:

- npm test -- --watch=false --runInBand --coverage --testPathPattern "src/services/.*Service.test.js" --collectCoverageFrom="src/services/*.js" --collectCoverageFrom="!src/services/*.test.js"

#### Cách chạy chi tiết

1. Mở terminal và di chuyển vào thư mục d:/DBCLPM/do_an_tot_nghiep_final/Ngan.
2. Chạy lệnh kiểm thử và coverage như trên.
3. Chờ test runner hoàn tất và sinh thư mục coverage.
4. Kiểm tra kết quả tại file console output và báo cáo HTML coverage.

#### Kết quả thực thi

- Test Suites: 8 passed, 8 total
- Test cases: 109 passed, 109 total
- Failed: 0
- Thời gian chạy: khoảng 4.142 giây

#### Minh chứng đính kèm

- Console output:
  - d:/DBCLPM/do_an_tot_nghiep_final/UnitTest/Ngan_service_test_console_output.txt
- Ảnh chụp màn hình test runner:
  - d:/DBCLPM/do_an_tot_nghiep_final/UnitTest/test_runner_output.png
- Coverage artifacts:
  - d:/DBCLPM/do_an_tot_nghiep_final/Ngan/coverage/lcov-report/index.html
  - d:/DBCLPM/do_an_tot_nghiep_final/Ngan/coverage/lcov.info

Ghi chú:
- Có cảnh báo baseline-browser-mapping cũ hơn 2 tháng; đây là warning của môi trường phụ thuộc, không làm fail test.

---

### 1.6 Code Coverage Report

Phạm vi coverage của lần chạy này:
- src/services/AuthService.js
- src/services/CourseService.js
- src/services/ExerciseService.js
- src/services/FirstTestService.js
- src/services/StudentService.js
- src/services/StudyPlanService.js
- src/services/TeacherService.js
- src/services/VocaService.js

Kết quả coverage:

| Metric | Value |
|---|---:|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

Coverage theo từng file service: đều đạt 100%.


---

### 1.7 Tài liệu tham khảo và Prompt

#### Tài liệu tham khảo

- Jest: https://jestjs.io/docs/getting-started
- Create React App Testing: https://create-react-app.dev/docs/running-tests
- Testing Library: https://testing-library.com/docs/

#### Prompt đã sử dụng

1. thực hiện theo yêu cầu trong yeucau.md, làm chi tiết nhất có thể gần như chi tiết tuyệt đối, với thư mục Ngan đầu tiên, tuân thủ chính xác yêu cầu, yêu cầu tối thiểu 20 Testcase
2. mở rộng cho ngân test full service mỗi service tối thiểu 10 testcase và báo cáo ghi bằng tiếng việt có dấu, ghi rõ ràng và làm đúng yêu cầu cho tôi

---

## 2. Yêu cầu về Unit Test Scripts

### 2.1 Comment

- Đáp ứng yêu cầu.
- Mỗi test case đều có comment chứa Test Case ID theo định dạng:
  - // Test Case ID: ...

### 2.2 Naming Convention

- Đáp ứng yêu cầu.
- Tên test mô tả rõ:
  - Chức năng đang kiểm thử
  - Điều kiện kiểm thử
  - Kết quả mong đợi
- Tên biến trong test có ý nghĩa rõ ràng: payload, expected, result, ...

### 2.3 Check Database (CheckDB)

- Không áp dụng cho phạm vi này.
- Lý do:
  - Service phía frontend chỉ là lớp gọi API (wrapper/orchestration), không thực thi transaction DB trực tiếp.
  - Việc kiểm tra DB thuộc backend integration test hoặc repository/service test phía server.

### 2.4 Rollback

- Không áp dụng cho phạm vi này.
- Lý do:
  - Không có thao tác ghi DB trực tiếp trong unit test frontend.
  - Trạng thái test được cô lập bằng mock và reset qua jest.clearAllMocks() trước mỗi test.

---

## 3. Tổng kết

- Đã hoàn tất kiểm thử full service cho Ngan đúng yêu cầu mở rộng.
- Mỗi service đều có tối thiểu 10 test case.
- Kết quả thực thi: 109/109 test case pass.
- Coverage trong phạm vi service: 100% cho tất cả chỉ số.
- Báo cáo và phụ lục chi tiết đã được ghi bằng tiếng Việt có dấu, rõ ràng và bám sát đầy đủ các mục của Yeucau.md.

- Lệnh chạy: Set-Location "d:\DBCLPM\do_an_tot_nghiep_final\Ngan"; $env:CI='true'; npm test -- --watch=false --runInBand --coverage --testPathPattern "src/services/.*Service.test.js" --collectCoverageFrom="src/services/*.js" --collectCoverageFrom="!src/services/*.test.js"
- Mở trang coverage: Invoke-Item "D:\DBCLPM\do_an_tot_nghiep_final\Ngan\coverage\lcov-report\index.html"