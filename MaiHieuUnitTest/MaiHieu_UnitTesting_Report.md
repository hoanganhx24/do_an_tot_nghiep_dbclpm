# BAO CAO KIEM THU DON VI - MaiHieu (Service Layer)

## Thong tin chung
- Pham vi: Module MaiHieu, service layer.
- Thoi gian thuc hien: 2026-04-12.
- Nguoi thuc hien: GitHub Copilot (GPT-5.3-Codex).
- Duong dan module: d:/DBCLPM/do_an_tot_nghiep_final/MaiHieu.
- Ghi chu scope: ChatBotServiceImpl duoc loai bo theo yeu cau user ("bo chatbot").

---

## 1. Unit Testing Report

### 1.1 Cong cu va thu vien

- Testing framework chinh:
  - JUnit 5 (Jupiter)
- Thu vien ho tro:
  - Mockito
  - Spring Boot Starter Test
- Cong cu build va test runner:
  - Maven Wrapper (mvnw.cmd)
  - Maven Surefire Plugin
- Cong cu do coverage:
  - JaCoCo Maven Plugin 0.8.12

---

### 1.2 Pham vi kiem thu

#### Cac thanh phan DUOC kiem thu

1. Service implementation classes trong src/main/java/com/mxhieu/doantotnghiep/service/impl (tru ChatBot):
- AssessmentOptionServiceImpl
- AssessmentQuestionAndChoiceServiceImpl
- AssessmentServiceImpl
- AttemptSeviceImpl
- AuthenticationServiceImpl
- CourseServiceImpl
- DictionaryServiceImpl
- EnrollmentServeceImpl
- ExerciseServiceImpl
- ExerciseTypeServiceImpl
- LessonProgressServiceImpl
- LessonServiceImpl
- MailServiceImpl
- MaterialServiceImpl
- MediaAssetServiceImpl
- ModuleServiceImpl
- QuestionServiceImpl
- StudentDictionaryServiceImpl
- StudentProfileServiceImpl
- StudyPlanServiceImpl
- TeacherprofileServiceImpl
- TestAttemptServiceImpl
- TestProgressServiceImpl
- TestServiceImpl
- TextToSpeechServiceImpl
- TrackServiceImpl
- UserServiceImpl
- VerificationServiceImpl

2. Test scripts tuong ung trong src/test/java/com/mxhieu/doantotnghiep/service/impl:
- AssessmentOptionServiceImplTest.java
- AssessmentQuestionAndChoiceServiceImplTest.java
- AssessmentServiceImplTest.java
- AttemptSeviceImplTest.java
- AuthenticationServiceImplTest.java
- CourseServiceImplTest.java
- DictionaryServiceImplTest.java
- EnrollmentServeceImplTest.java
- ExerciseServiceImplTest.java
- ExerciseTypeServiceImplTest.java
- LessonProgressServiceImplTest.java
- LessonServiceImplTest.java
- MailServiceImplTest.java
- MaterialServiceImplTest.java
- MediaAssetServiceImplTest.java
- ModuleServiceImplTest.java
- QuestionServiceImplTest.java
- StudentDictionaryServiceImplTest.java
- StudentProfileServiceImplTest.java
- StudyPlanServiceImplTest.java
- TeacherprofileServiceImplTest.java
- TestAttemptServiceImplTest.java
- TestProgressServiceImplTest.java
- TestServiceImplTest.java
- TextToSpeechServiceImplTest.java
- TrackServiceImplTest.java
- UserServiceImplTest.java
- VerificationServiceImplTest.java

#### Cac thanh phan KHONG kiem thu trong dot nay

- ChatBotServiceImpl:
  - Loai tru theo yeu cau user trong pham vi bai lam.
- Lop interface service (src/main/java/.../service/*.java):
  - Khong chua business logic, chu yeu khai bao contract.
- Controller, repository, entity, DTO, converter:
  - Khong nam trong scope service-layer unit test cua dot nay.
- External infrastructure thuc te (DB, mail server, cloud TTS, API tu dien):
  - Duoc mock trong unit test de dam bao tinh doc lap va repeatable.

---

### 1.3 Unit Test Cases

- Toan bo test case duoc to chuc theo ten file test.
- Moi test case deu co du 5 truong theo Yeucau.md:
  - Test Case ID
  - Test Objective
  - Input
  - Expected Output
  - Notes

Phu luc chi tiet day du (180 test case co gan Test Case ID):
- d:/DBCLPM/do_an_tot_nghiep_final/UnitTest/MaiHieu_Service_Testcase_Detail.md

Tong hop so luong test case theo tung file service test:

| Test File | So test case (Test Case ID) |
|---|---:|
| AssessmentOptionServiceImplTest.java | 2 |
| AssessmentQuestionAndChoiceServiceImplTest.java | 7 |
| AssessmentServiceImplTest.java | 11 |
| AttemptSeviceImplTest.java | 6 |
| AuthenticationServiceImplTest.java | 10 |
| CourseServiceImplTest.java | 12 |
| DictionaryServiceImplTest.java | 3 |
| EnrollmentServeceImplTest.java | 4 |
| ExerciseServiceImplTest.java | 7 |
| ExerciseTypeServiceImplTest.java | 3 |
| LessonProgressServiceImplTest.java | 5 |
| LessonServiceImplTest.java | 11 |
| MailServiceImplTest.java | 3 |
| MaterialServiceImplTest.java | 1 |
| MediaAssetServiceImplTest.java | 1 |
| ModuleServiceImplTest.java | 13 |
| QuestionServiceImplTest.java | 6 |
| StudentDictionaryServiceImplTest.java | 5 |
| StudentProfileServiceImplTest.java | 5 |
| StudyPlanServiceImplTest.java | 5 |
| TeacherprofileServiceImplTest.java | 5 |
| TestAttemptServiceImplTest.java | 6 |
| TestProgressServiceImplTest.java | 5 |
| TestServiceImplTest.java | 20 |
| TextToSpeechServiceImplTest.java | 1 |
| TrackServiceImplTest.java | 8 |
| UserServiceImplTest.java | 10 |
| VerificationServiceImplTest.java | 5 |
| **Tong cong** | **180** |

Luu y:
- Lan chay maven test/verify moi nhat ghi nhan tong 181 tests run.
- Chenh 1 test la test khung ung dung (DoantotnghiepApplicationTests), khong thuoc nhom service test co Test Case ID.

---

### 1.4 Project Link

- Source code (local):
  - d:/DBCLPM/do_an_tot_nghiep_final
- Unit test scripts (local):
  - d:/DBCLPM/do_an_tot_nghiep_final/MaiHieu/src/test/java/com/mxhieu/doantotnghiep/service/impl
- Link GitHub:
  - https://github.com/hoanganhx24/do_an_tot_nghiep_dbclpm.git

---

### 1.5 Execution Report

#### Lenh chay kiem thu

Chay tat ca test:
- Set-Location "d:\DBCLPM\do_an_tot_nghiep_final\MaiHieu"; .\mvnw.cmd test

Chay verify de sinh coverage (bao gom test):
- Set-Location "d:\DBCLPM\do_an_tot_nghiep_final\MaiHieu"; .\mvnw.cmd verify

Chay rieng nhom service tests (neu can):
- Set-Location "d:\DBCLPM\do_an_tot_nghiep_final\MaiHieu"; .\mvnw.cmd -Dtest=*ServiceImplTest test

#### Ket qua thuc thi moi nhat

- Tests run: 181
- Failures: 0
- Errors: 0
- Skipped: 0
- Build: SUCCESS

#### Minh chung dinh kem

- Console output lan chay test:
  - d:/DBCLPM/do_an_tot_nghiep_final/UnitTest/MaiHieu_service_test_console_output.txt
- Console output lan chay verify:
  - d:/DBCLPM/do_an_tot_nghiep_final/UnitTest/MaiHieu_mvn_verify_output.txt

Ghi chu:
- Log co in stack trace debug trong mot so luong test path, nhung ket qua cuoi cung van PASS 100% (0 fail, 0 error).

---

### 1.6 Code Coverage Report

Cong cu:
- JaCoCo Maven Plugin 0.8.12

Artifact coverage duoc sinh tai:
- d:/DBCLPM/do_an_tot_nghiep_final/MaiHieu/target/site/jacoco/index.html
- d:/DBCLPM/do_an_tot_nghiep_final/MaiHieu/target/site/jacoco/jacoco.xml
- d:/DBCLPM/do_an_tot_nghiep_final/MaiHieu/target/site/jacoco/jacoco.csv

Lenh mo bao cao coverage tren Windows:
- Invoke-Item "d:\DBCLPM\do_an_tot_nghiep_final\MaiHieu\target\site\jacoco\index.html"

Ket qua coverage tong the (toan bo module):

| Metric | Coverage |
|---|---:|
| Instructions | 33.12% |
| Branches | 20.99% |
| Methods | 36.69% |
| Lines | 27.55% |
| Classes | 56.15% |

Ket qua coverage rieng package service implementation (com/mxhieu/doantotnghiep/service/impl):

| Metric | Coverage |
|---|---:|
| Instructions | 39.25% |
| Branches | 25.19% |
| Methods | 51.16% |
| Lines | 37.42% |
| Classes | 93.55% |

Nhan xet:
- Class coverage cua service.impl rat cao (93.55%), cho thay hieu qua bao phu theo chieu rong class.
- Branch va line coverage chua cao do nhieu nhanh nghiep vu sau, logic throw/exception va cac path phu thuoc IO/external.

---

### 1.7 Tai lieu tham khao va Prompt

#### Tai lieu tham khao

- JUnit 5 User Guide: https://junit.org/junit5/docs/current/user-guide/
- Mockito Documentation: https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html
- Spring Boot Testing: https://docs.spring.io/spring-boot/reference/testing/
- JaCoCo Maven Plugin: https://www.jacoco.org/jacoco/trunk/doc/maven.html

#### Prompt da su dung

1. thuc hien theo yeu cau trong Yeucau.md, lam chi tiet nhat co the, voi thu muc MaiHieu, phu all service, tong tam 100 test case
2. bo chatbot
3. bao cao chi tiet giong Ngan va cung cap lenh run + mo coverage

---

## 2. Yeu cau ve Unit Test Scripts

### 2.1 Comment

- Da dap ung.
- Moi test case trong cac file service test deu co comment dang:
  - // Test Case ID: ...

### 2.2 Naming Convention

- Da dap ung.
- Ten method test theo mau:
  - methodName_shouldExpectedBehavior_whenCondition
- Ten bien test ro nghia: request, response, expected, savedEntity, ...

### 2.3 Check Database (CheckDB)

- Khong ap dung truc tiep trong dot unit test nay.
- Ly do:
  - Bai test su dung mock cho repository/service phu thuoc, khong thao tac DB that.
  - Kiem tra DB that phu hop hon voi integration test hoac repository test.

### 2.4 Rollback

- Khong ap dung truc tiep trong dot unit test nay.
- Ly do:
  - Khong co transaction DB that duoc tao trong unit test.
  - Trang thai test duoc co lap qua Mockito va lifecycle @BeforeEach.

---

## 3. Tong ket

- Da hoan tat unit test service layer cho MaiHieu theo Yeucau.md.
- Da bao phu 28/29 service impl classes, loai tru ChatBot theo dung yeu cau user.
- Tong so test case co Test Case ID: 180.
- Ket qua chay test moi nhat: 181 run, 0 fail, 0 error, BUILD SUCCESS.
- Da sinh day du artifact coverage JaCoCo va bo minh chung console output.
- Lenh chay va lenh mo coverage da duoc cung cap de co the tai lap nhanh.
