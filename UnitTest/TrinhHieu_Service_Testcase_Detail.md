# UNIT TEST REPORT - TRINHHIEU SERVICE LAYER

Tong so test case co Test Case ID: 166

## 1. Unit Testing Report

### 1.1 Tools and Libraries
- Testing framework: Jest
- TypeScript transformer: ts-jest
- Mocking: Jest mock function (mock repository layer)
- Coverage: Istanbul (qua Jest coverage), bao cao JSON Summary + LCOV HTML

### 1.2 Scope of Testing

#### Cac thanh phan DUOC kiem thu
- src/application/services/attempt.service.ts
- src/application/services/comment.service.ts
- src/application/services/exam.service.ts
- src/application/services/media-group.service.ts
- src/application/services/question.service.ts

#### Cac thanh phan KHONG kiem thu
- Controllers: khong test trong dot nay vi tap trung Unit Test business logic service.
- Repositories: da duoc mock hoan toan de dam bao unit test doc lap, khong phu thuoc DB.
- Entities/DTOs: chu yeu la cau truc du lieu, khong chua business logic can unit test rieng o scope nay.
- Infrastructure (database config, upload adapters): thuoc integration/system test scope.

### 1.3 Unit Test Cases

## AttemptService (22 test cases)

- Test file: src/application/services/attempt.service.test.ts
- Source file under test: src/application/services/attempt.service.ts

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-TRINH-ATT-001 | startAttempt should throw when exam does not exist | Goi service.startAttempt({ ExamID: 1, Type: 'FULL_TEST' }, 20). | Nem loi: "Exam not found". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-002 | startAttempt should reject PRACTICE_BY_PART when Parts is empty | Goi service.startAttempt( { ExamID: 1, Type: 'PRACTICE_BY_PART', Parts: [] }, 20 ). | Nem loi: "Parts must be specified for practice by part mode". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-003 | startAttempt should reject invalid part values outside 1-7 | Goi service.startAttempt( { ExamID: 1, Type: 'PRACTICE_BY_PART', Parts: [0, 8] }, 20 ). | Nem loi: "Invalid part numbers: 0, 8". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-004 | startAttempt should create attempt with null score fields for FULL_TEST | Goi service.startAttempt( { ExamID: 1, Type: 'FULL_TEST' }, 20 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-005 | startAttempt should create attempt for PRACTICE_BY_PART when parts are valid | Goi service.startAttempt( { ExamID: 2, Type: 'PRACTICE_BY_PART', Parts: [1, 3, 5] }, 20 ). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-006 | submitAttempt should throw when attempt does not exist | Goi service.submitAttempt( { AttemptID: 1, answers: [{ QuestionID: 1, ChoiceID: 10 }] }, 20 ). | Nem loi: "Attempt not found". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-007 | submitAttempt should reject when attempt belongs to another student | Goi service.submitAttempt( { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] }, 20 ). | Nem loi: "You can only submit your own attempts". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-008 | submitAttempt should reject already submitted attempt | Goi service.submitAttempt( { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] }, 20 ). | Nem loi: "This attempt has already been submitted". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-009 | submitAttempt should reject when elapsed time exceeds limit + 1 minute | Goi service.submitAttempt( { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] }, 20 ). | Nem loi: "Time limit exceeded. Limit: 60 minutes, Actual: 150 minutes". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-010 | submitAttempt should throw when grading result is null | Goi service.submitAttempt( { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] }, 20 ). | Nem loi: "Failed to grade attempt". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-011 | submitAttempt should return detailed graded response with total score and analysis | Goi service.submitAttempt( { AttemptID: 500, answers: [ { QuestionID: 1, ChoiceID: 10 }, { QuestionID: 2, ChoiceID: 20 }, ], }, 20 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-012 | submitAttempt should identify weak area when accuracy by type is below 60% | Goi service.submitAttempt( { AttemptID: 500, answers: [ { QuestionID: 1, ChoiceID: 10 }, { QuestionID: 2, ChoiceID: 20 }, ], }, 20 ). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-013 | getAttemptResults should throw when attempt is not found | Goi service.getAttemptResults(88, 20). | Nem loi: "Attempt not found". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-014 | getAttemptResults should reject access to another student attempt | Goi service.getAttemptResults(88, 20). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-015 | getAttemptResults should reject when attempt has not been submitted | Goi service.getAttemptResults(88, 20). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-016 | getAttemptResults should return result using StartedAt and SubmittedAt for time taken | Goi service.getAttemptResults(500, 20). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-017 | getStudentAttempts should pass through filters to repository | Goi service.getStudentAttempts(20, filters). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-018 | getBestScore should delegate to repository with student and exam IDs | Goi service.getBestScore(20, 900). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-019 | getProgressStatistics should delegate and return statistics object | Goi service.getProgressStatistics(20). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-020 | deleteAttempt should throw when attempt not found | Goi service.deleteAttempt(500, 20). | Nem loi: "Attempt not found". | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-021 | deleteAttempt should reject deleting attempt from another student | Goi service.deleteAttempt(500, 20). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-ATT-022 | deleteAttempt should call repository delete and return true on success | Goi service.deleteAttempt(500, 20). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |


## CommentService (33 test cases)

- Test file: src/application/services/comment.service.test.ts
- Source file under test: src/application/services/comment.service.ts

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-TRINH-CMT-001 | createComment should reject empty content | Goi service.createComment( { Content: ' ', ExamID: 11, ParentId: 0 }, 20 ). | Nem loi: "Comment content cannot be empty". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-002 | createComment should reject content length greater than 1000 | Goi service.createComment( { Content: 'a'.repeat(1001), ExamID: 11, ParentId: 0 }, 20 ). | Nem loi: "Comment content too long (max 1000 characters)". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-003 | createComment should reject reply when parent comment is not found | Goi service.createComment( { Content: 'Reply', ExamID: 11, ParentId: 999 }, 20 ). | Nem loi: "Parent comment not found". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-004 | createComment should reject reply when parent belongs to different exam | Goi service.createComment( { Content: 'Reply', ExamID: 11, ParentId: 8 }, 20 ). | Nem loi: "Cannot reply to comment from different exam". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-005 | createComment should create top-level comment with ParentId=0 and Status=1 | Goi service.createComment( { Content: 'Top level', ExamID: 11, ParentId: 0 }, 20 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-006 | createComment should create reply when parent is valid and same exam | Goi service.createComment( { Content: 'Reply hop le', ExamID: 11, ParentId: 6 }, 20 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-007 | getExamComments should return paginated comments and include reply counts | Goi service.getExamComments(11, { Status: 1, ParentId: 0, Page: 1, Limit: 10, }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-008 | getExamComments should apply default page=1 and limit=20 when filters absent | Goi service.getExamComments(11). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-009 | getCommentThread should throw when parent comment is not found | Goi service.getCommentThread(99). | Nem loi: "Comment not found". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-010 | getCommentThread should return full thread data from repository | Goi service.getCommentThread(1). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-011 | updateComment should throw when comment does not exist | Goi service.updateComment(1, { Content: 'New content' }, 20). | Nem loi: "Comment not found". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-012 | updateComment should reject when user is not author | Goi service.updateComment(1, { Content: 'New content' }, 20). | Nem loi: "You can only edit your own comments". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-013 | updateComment should reject empty updated content | Goi service.updateComment(1, { Content: ' ' }, 20). | Nem loi: "Comment content cannot be empty". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-014 | updateComment should reject content too long | Goi service.updateComment(1, { Content: 'x'.repeat(1001) }, 20). | Nem loi: "Comment content too long (max 1000 characters)". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-015 | updateComment should throw when repository update returns null | Goi service.updateComment(1, { Content: 'New content' }, 20). | Nem loi: "Failed to update comment". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-016 | updateComment should return updated comment successfully | Goi service.updateComment(1, { Content: 'Noi dung moi' }, 20). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-017 | deleteComment should throw when comment does not exist | Goi service.deleteComment(1, 20). | Nem loi: "Comment not found". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-018 | deleteComment should reject non-author when not admin | Goi service.deleteComment(1, 20, false). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-019 | deleteComment should allow admin and return true | Goi service.deleteComment(1, 20, true). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-020 | moderateComment should throw when comment does not exist | Goi service.moderateComment(1, { Status: 2 }). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-021 | moderateComment should throw when repository updateStatus fails | Goi service.moderateComment(1, { Status: 3 }). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-022 | moderateComment should update status and return moderated comment | Goi service.moderateComment(1, { Status: 2 }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-023 | getStudentComments should delegate to repository with limit | Goi service.getStudentComments(20, 5). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-024 | getFlaggedComments should return repository flagged list | Goi service.getFlaggedComments(). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-025 | searchComments should reject empty search text | Goi service.searchComments(' '). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-026 | searchComments should call repository with search text and examId | Goi service.searchComments('TOEIC', 11). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-027 | getExamCommentCount should return count from repository | Goi service.getExamCommentCount(11). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-028 | getAllComments should reject page less than 1 | Goi service.getAllComments({ page: 0, limit: 20 }). | Nem loi: "Page must be greater than 0". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-029 | getAllComments should reject limit outside 1-100 | Goi service.getAllComments({ page: 1, limit: 101 }). | Nem loi: "Limit must be between 1 and 100". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-030 | getAllComments should reject invalid order value | Goi service.getAllComments({ page: 1, limit: 20, order: 'DOWN' }). | Nem loi: "Order must be ASC or DESC". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-031 | getAllComments should reject invalid sortBy field | Goi service.getAllComments({ page: 1, limit: 20, sortBy: 'random' }). | Nem loi: "SortBy must be one of: createdAt, updatedAt, likes". | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-032 | getAllComments should use default status=1 and return pagination metadata | Goi service.getAllComments({ page: 1, limit: 1 }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-CMT-033 | getAllComments should pass explicit status filter to repository | Goi service.getAllComments({ page: 2, limit: 10, status: 3, sortBy: 'updatedAt', order: 'ASC', }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |


## ExamService (50 test cases)

- Test file: src/application/services/exam.service.test.ts
- Source file under test: src/application/services/exam.service.ts

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-TRINH-EXM-001 | createExam should reject empty title | Goi service.createExam( { Title: ' ', TimeExam: 120, Type: 'FULL_TEST', ExamTypeID: 2, }, 10 ). | Nem loi: "Exam title cannot be empty". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-002 | createExam should reject time lower than 1 minute | Goi service.createExam( { Title: 'Exam A', TimeExam: 0, Type: 'FULL_TEST', ExamTypeID: 2, }, 10 ). | Nem loi: "Exam time must be between 1 and 240 minutes". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-003 | createExam should reject time over 240 minutes | Goi service.createExam( { Title: 'Exam A', TimeExam: 241, Type: 'FULL_TEST', ExamTypeID: 2, }, 10 ). | Nem loi: "Exam time must be between 1 and 240 minutes". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-004 | createExam should reject when explicit question IDs are missing in repository | Goi service.createExam( { Title: 'Exam B', TimeExam: 90, Type: 'FULL_TEST', ExamTypeID: 2, questions: [ { QuestionID: 1, OrderIndex: 1 }, { QuestionID: 2, OrderIndex: 2 }, ], }, 10 ). | Nem loi: "Some questions do not exist". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-005 | createExam should reject when MediaQuestionIDs provided but no media questions found | Goi service.createExam( { Title: 'Exam C', TimeExam: 60, Type: 'FULL_TEST', ExamTypeID: 2, MediaQuestionIDs: [50], }, 10 ). | Nem loi: "No questions found for selected media blocks". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-006 | createExam should merge explicit questions and media-derived questions with deduplication | Goi service.createExam( { Title: 'Exam Merge', TimeExam: 75, Type: 'FULL_TEST', ExamTypeID: 2, questions: [{ QuestionID: 1, OrderIndex: 5 }], MediaQuestionIDs: [50], }, 10 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-007 | createExam should throw when created exam cannot be reloaded | Goi service.createExam( { Title: 'Exam Reload Fail', TimeExam: 80, Type: 'FULL_TEST', ExamTypeID: 2, }, 10 ). | Nem loi: "Failed to retrieve created exam". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-008 | getExamById should throw when exam does not exist | Goi service.getExamById(999). | Nem loi: "Exam not found". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-009 | getExamById should transform entity to response and hide IsCorrect | Goi service.getExamById(1). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-010 | getAllExams should forward filter criteria to repository | Goi service.getAllExams({ ExamTypeID: 2, Type: 'FULL_TEST' }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-011 | updateExam should throw when exam does not exist | Goi service.updateExam(1, { Title: 'New' }, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-012 | updateExam should throw when user does not own exam | Goi service.updateExam(1, { Title: 'New' }, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-013 | updateExam should validate TimeExam in range 1..240 | Goi service.updateExam(1, { TimeExam: 500 }, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-014 | updateExam should throw when repository returns null after update | Goi service.updateExam(1, { Title: 'Updated' }, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-015 | updateExam should return updated exam on success | Goi service.updateExam(1, { Title: 'Updated title' }, 10). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-016 | deleteExam should throw when exam not found | Goi service.deleteExam(1, 10). | Nem loi: "Exam not found". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-017 | deleteExam should throw when user has no permission | Goi service.deleteExam(1, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-018 | deleteExam should block deletion when exam has attempts | Goi service.deleteExam(1, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-019 | deleteExam should call repository delete and return true | Goi service.deleteExam(1, 10). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-020 | addQuestionsToExam should reject duplicate question already present in exam | Goi service.addQuestionsToExam(1, [{ QuestionID: 10, OrderIndex: 1 }], 10). | Nem loi: "Questions 10 are already in this exam". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-021 | addQuestionsToExam should add questions and return updated exam | Goi service.addQuestionsToExam( 1, [{ QuestionID: 11, OrderIndex: 2 }], 10 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-022 | removeQuestionsFromExam should throw when user has no permission | Goi service.removeQuestionsFromExam(1, [11], 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-023 | removeQuestionsFromExam should return number of removed questions | Goi service.removeQuestionsFromExam(1, [11, 12], 10). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-024 | getExamStatistics should throw when exam does not exist | Goi service.getExamStatistics(1). | Nem loi: "Exam not found". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-025 | searchExams should reject empty search term | Goi service.searchExams(' '). | Nem loi: "Search term cannot be empty". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-026 | duplicateExam should clone with media tracking when source has examQuestions | Goi service.duplicateExam(10, 99). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-027 | addMediaGroupToExam should throw when media group already exists in exam | Goi service.addMediaGroupToExam(1, 50, 10, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-028 | addMediaGroupToExam should throw when media group has no questions | Goi service.addMediaGroupToExam(1, 50, 10, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-029 | addMediaGroupToExam should add all media questions with sequential order | Goi service.addMediaGroupToExam(1, 50, 10, 10). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-030 | removeMediaGroupFromExam should throw when group not found in exam | Goi service.removeMediaGroupFromExam(1, 50, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-031 | removeMediaGroupFromExam should remove all question links in that group | Goi service.removeMediaGroupFromExam(1, 50, 10). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-032 | getExamContentOrganized should throw when a grouped media cannot be loaded | Goi service.getExamContentOrganized(1). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-033 | getExamContentOrganized should sort grouped and standalone questions by order | Goi service.getExamContentOrganized(1). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-034 | compactExamOrder should reorder by existing OrderIndex into 1..N sequence | Goi service.compactExamOrder(1, 10). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-035 | replaceQuestionInExam should block replacement with question from different media group | Goi service.replaceQuestionInExam(1, 10, 20, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-036 | replaceQuestionInExam should update QuestionID and return true on success | Goi service.replaceQuestionInExam(1, 10, 20, 10). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-037 | createExamType should reject duplicate code | Goi service.createExamType({ Code: 'FULL', Description: 'Duplicate' }). | Nem loi: "Exam type with code "FULL" already exists". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-038 | createExamType should create new exam type when code is unique | Goi service.createExamType({ Code: 'MINI' }). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-039 | updateExamType should reject duplicate code used by another record | Goi service.updateExamType(5, { Code: 'NEW' }). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-040 | updateExamType should update and return exam type when valid | Goi service.updateExamType(5, { Description: 'Updated desc' }). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-041 | deleteExamType should block deletion when at least one exam is using this type | Goi service.deleteExamType(7). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-042 | deleteExamType should delete successfully when no exam uses this type | Goi service.deleteExamType(7). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-043 | getNextOrderIndex should throw when exam does not exist | Goi service.getNextOrderIndex(999). | Nem loi: "Exam not found". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-044 | getNextOrderIndex should return repository-provided next index | Goi service.getNextOrderIndex(1). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-045 | moveMediaGroupInExam should reject when user does not own exam | Goi service.moveMediaGroupInExam(1, 50, 10, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-046 | validateExamStructure should throw when exam does not exist | Goi service.validateExamStructure(1). | Nem loi: "Exam not found". | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-047 | validateExamStructure should return repository validation payload | Goi service.validateExamStructure(1). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-048 | getExamMediaGroupSummary should build fallback title when media metadata is missing | Goi service.getExamMediaGroupSummary(1). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-049 | getExamTypes should return exam type list from repository | Goi service.getExamTypes(). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-EXM-050 | getExamStatistics should return enhanced statistics payload when exam exists | Goi service.getExamStatistics(1). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |


## MediaGroupService (30 test cases)

- Test file: src/application/services/media-group.service.test.ts
- Source file under test: src/application/services/media-group.service.ts

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-TRINH-MGR-001 | getMediaGroupsForBrowsing should request MinQuestions=1 and build summary with fallback count/preview | Goi service.getMediaGroupsForBrowsing({ Skill: 'READING', Page: 2, Limit: 5, }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-002 | getMediaGroupsForBrowsing should use loaded questions and generated default title when GroupTitle missing | Goi service.getMediaGroupsForBrowsing(). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-003 | getMediaGroupsForBrowsing should truncate preview text to 100 chars + ellipsis | Goi service.getMediaGroupsForBrowsing(). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-004 | getMediaGroupDetail should throw when media group does not exist | Goi service.getMediaGroupDetail(999). | Nem loi: "Media group not found". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-005 | getMediaGroupDetail should sort questions by OrderInGroup and return mapped detail | Goi service.getMediaGroupDetail(20). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-006 | createMediaGroup should reject when no questions are provided | Goi service.createMediaGroup( { Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' }, Questions: [], }, 10 ). | Nem loi: "Media group must have at least one question". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-007 | createMediaGroup should reject duplicate OrderInGroup values | Goi service.createMediaGroup( { Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' }, Questions: [ { OrderInGroup: 1, Choices: [ { Content: 'A', Attribute: 'A', .... | Nem loi: "OrderInGroup values must be unique within the group". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-008 | createMediaGroup should reject question with less than 2 choices | Goi service.createMediaGroup( { Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' }, Questions: [ { OrderInGroup: 1, Choices: [{ Content: 'A', Attribute: 'A', I.... | Nem loi: "Question at position 1 must have at least 2 choices". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-009 | createMediaGroup should reject when question has zero correct answers | Goi service.createMediaGroup( { Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' }, Questions: [ { OrderInGroup: 1, Choices: [ { Content: 'A', Attribute: 'A', .... | Nem loi: "Question at position 1 must have exactly one correct answer". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-010 | createMediaGroup should create media and questions then return complete detail | Goi service.createMediaGroup( { Title: 'Listening bundle', Description: 'Create media group test', Media: { Skill: 'LISTENING', Type: 'SHORT_TALK', Section: '4', Script: 'Talk scrip.... | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-011 | updateMediaGroupMetadata should throw when media group not found | Goi service.updateMediaGroupMetadata(1, { Title: 'New title' }). | Nem loi: "Media group not found". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-012 | updateMediaGroupMetadata should map metadata and media fields before update | Goi service.updateMediaGroupMetadata( 40, { Title: 'Updated title', Description: 'Updated desc', Difficulty: 'HARD', Tags: ['updated'], Media: { Skill: 'READING', Type: 'READING_COM.... | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-013 | updateMediaGroupMetadata should allow partial update payload | Goi service.updateMediaGroupMetadata(41, { Tags: ['new-tag'] }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-014 | deleteMediaGroup should throw when media group does not exist | Goi service.deleteMediaGroup(50). | Nem loi: "Media group not found". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-015 | deleteMediaGroup should reject when group is used in exams | Goi service.deleteMediaGroup(50). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-016 | deleteMediaGroup should delete child questions first then media record | Goi service.deleteMediaGroup(51). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-017 | getMediaGroupStatistics should throw when media group does not exist | Goi service.getMediaGroupStatistics(60). | Nem loi: "Media group not found". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-018 | getMediaGroupStatistics should compute rounded average success rate when attempts exist | Goi service.getMediaGroupStatistics(60). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-019 | getMediaGroupStatistics should return undefined averageSuccessRate when totalAttempts is zero | Goi service.getMediaGroupStatistics(61). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-020 | cloneMediaGroup should throw when source media does not exist | Goi service.cloneMediaGroup(70, 10). | Nem loi: "Media group not found". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-021 | cloneMediaGroup should throw when repository clone returns null | Goi service.cloneMediaGroup(70, 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-022 | cloneMediaGroup should clone media, clone questions, and return cloned detail | Goi service.cloneMediaGroup(70, 77, 'Clone title'). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-023 | addQuestionToGroup should throw when media group does not exist | Goi service.addQuestionToGroup( 90, { OrderInGroup: 1, Choices: [ { Content: 'A', Attribute: 'A', IsCorrect: true }, { Content: 'B', Attribute: 'B', IsCorrect: false }, ], }, 10 ). | Nem loi: "Media group not found". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-024 | addQuestionToGroup should auto-assign OrderInGroup when missing | Goi service.addQuestionToGroup( 90, { OrderInGroup: 0, Choices: [ { Content: 'A', Attribute: 'A', IsCorrect: true }, { Content: 'B', Attribute: 'B', IsCorrect: false }, ], }, 10 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-025 | addQuestionToGroup should reject duplicate OrderInGroup | Goi service.addQuestionToGroup( 91, { OrderInGroup: 2, Choices: [ { Content: 'A', Attribute: 'A', IsCorrect: true }, { Content: 'B', Attribute: 'B', IsCorrect: false }, ], }, 10 ). | Nem loi: "OrderInGroup 2 is already used in this media group". | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-026 | addQuestionToGroup should create question when order is unique | Goi service.addQuestionToGroup( 92, { QuestionText: 'Created question', OrderInGroup: 2, Choices: [ { Content: 'A', Attribute: 'A', IsCorrect: true }, { Content: 'B', Attribute: 'B'.... | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-027 | removeQuestionFromGroup should throw when question not found | Goi service.removeQuestionFromGroup(100, 200). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-028 | removeQuestionFromGroup should throw when question belongs to different media group | Goi service.removeQuestionFromGroup(100, 200). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-029 | removeQuestionFromGroup should block removal when question is used in exams | Goi service.removeQuestionFromGroup(100, 200). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-MGR-030 | removeQuestionFromGroup should delete question when it has no exam usage | Goi service.removeQuestionFromGroup(100, 200). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |


## QuestionService (31 test cases)

- Test file: src/application/services/question.service.test.ts
- Source file under test: src/application/services/question.service.ts

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| TC-TRINH-QST-001 | createQuestion should reject when number of choices is less than 2 | Goi service.createQuestion( { QuestionText: 'Q1', Media: { Skill: 'READING', Type: 'INCOMPLETE_SENTENCE', Section: '5', }, Choices: [{ Attribute: 'A', Content: 'One option', IsCorre.... | Nem loi: "Question must have at least 2 choices". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-002 | createQuestion should reject when no choice is marked correct | Goi service.createQuestion( { QuestionText: 'Q2', Media: { Skill: 'READING', Type: 'INCOMPLETE_SENTENCE', Section: '5', }, Choices: [ { Attribute: 'A', Content: 'A', IsCorrect: fals.... | Nem loi: "Question must have exactly one correct answer". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-003 | createQuestion should reject when multiple choices are marked correct | Goi service.createQuestion( { QuestionText: 'Q3', Media: { Skill: 'READING', Type: 'INCOMPLETE_SENTENCE', Section: '5', }, Choices: [ { Attribute: 'A', Content: 'A', IsCorrect: true.... | Nem loi: "Question must have exactly one correct answer". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-004 | createQuestion should reject duplicate choice attributes | Goi service.createQuestion( { QuestionText: 'Q4', Media: { Skill: 'READING', Type: 'INCOMPLETE_SENTENCE', Section: '5', }, Choices: [ { Attribute: 'A', Content: 'A1', IsCorrect: tru.... | Nem loi: "Choice attributes must be unique". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-005 | createQuestion should reject empty choice content | Goi service.createQuestion( { QuestionText: 'Q5', Media: { Skill: 'READING', Type: 'INCOMPLETE_SENTENCE', Section: '5', }, Choices: [ { Attribute: 'A', Content: ' ', IsCorrect: true.... | Nem loi: "All choices must have content". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-006 | createQuestion should reject listening question without audio URL | Goi service.createQuestion( { QuestionText: 'Q6', Media: { Skill: 'LISTENING', Type: 'PHOTO_DESCRIPTION', Section: '1', ImageUrl: '/images/p1.jpg', }, Choices: baseChoices, }, 10 ). | Nem loi: "Listening questions must have audio URL". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-007 | createQuestion should reject part 1 question without image | Goi service.createQuestion( { QuestionText: 'Q7', Media: { Skill: 'READING', Type: 'PHOTO_DESCRIPTION', Section: '1', }, Choices: baseChoices, }, 10 ). | Nem loi: "Part 1 questions must have an image". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-008 | createQuestion should reject invalid audio URL format | Goi service.createQuestion( { QuestionText: 'Q8', Media: { Skill: 'LISTENING', Type: 'SHORT_TALK', Section: '4', AudioUrl: 'invalid-audio-path', }, Choices: baseChoices, }, 10 ). | Nem loi: "Invalid audio URL format". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-009 | createQuestion should reject invalid image URL format | Goi service.createQuestion( { QuestionText: 'Q9', Media: { Skill: 'READING', Type: 'PHOTO_DESCRIPTION', Section: '1', ImageUrl: 'invalid-image-path', }, Choices: baseChoices, }, 10 ). | Nem loi: "Invalid image URL format". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-010 | createQuestion should map data and call repository.create on valid input | Goi service.createQuestion( { QuestionText: 'Valid question', Media: { Skill: 'LISTENING', Type: 'SHORT_CONVERSATION', Section: '3', AudioUrl: '/uploads/audio/conversation.mp3', Ima.... | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-011 | getQuestionById should throw when question is not found | Goi service.getQuestionById(999). | Nem loi: "Question not found". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-012 | getQuestionById should return question when found | Goi service.getQuestionById(12). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-013 | searchQuestions should forward filters and transform to paginated response | Goi service.searchQuestions({ Skill: 'READING', Section: '5', Type: 'INCOMPLETE_SENTENCE', SearchText: 'sentence', Page: 2, Limit: 5, }). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-014 | searchQuestions should apply default page=1 and limit=20 when omitted | Goi service.searchQuestions({}). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-015 | updateQuestion should throw when question does not exist | Goi service.updateQuestion(1, { QuestionText: 'New' }, 99). | Nem loi: "Question not found". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-016 | updateQuestion should log warning when question is widely used and still proceed | Goi service.updateQuestion( 16, { QuestionText: 'Updated' }, 99 ). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-017 | updateQuestion should validate updated choices and reject invalid payload | Goi service.updateQuestion( 17, { Choices: [{ Attribute: 'A', Content: 'Only one', IsCorrect: true }], }, 99 ). | Nem loi: "Question must have at least 2 choices". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-018 | updateQuestion should validate updated media and reject listening without audio | Goi service.updateQuestion( 18, { Media: { Skill: 'LISTENING', Type: 'SHORT_TALK', Section: '4', }, }, 99 ). | Nem loi: "Listening questions must have audio URL". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-019 | updateQuestion should throw when repository update returns null | Goi service.updateQuestion( 19, { QuestionText: 'Will fail update' }, 99 ). | Nem loi: "Failed to update question". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-020 | updateQuestion should map fields and return updated question on success | Goi service.updateQuestion( 20, { QuestionText: 'Updated text', Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7', AudioUrl: '/audio/new.mp3', ImageUrl: '/img/n.... | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-021 | deleteQuestion should throw when question does not exist | Goi service.deleteQuestion(21, 99). | Nem loi: "Question not found". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-022 | deleteQuestion should reject when question is used in exams | Goi service.deleteQuestion(22, 99). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-023 | deleteQuestion should call repository.delete and return result when no usage | Goi service.deleteQuestion(23, 99). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-024 | getQuestionStatistics should throw when question does not exist | Goi service.getQuestionStatistics(24). | Nem loi: "Question not found". | Jest + ts-jest, mock repository |
| TC-TRINH-QST-025 | getQuestionStatistics should return repository usage statistics | Goi service.getQuestionStatistics(25). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-026 | getQuestionsBySection should throw when section array is empty | Goi service.getQuestionsBySection([], 10). | Dap ung dung dieu kien mong doi cua testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-027 | getQuestionsBySection should forward sections and limit to repository | Goi service.getQuestionsBySection(['5', '6'], 15). | Goi dung dependency/repository voi tham so mong doi. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-028 | performBulkOperation DELETE should return success count when repository succeeds | Thiet lap mock theo dieu kien testcase va goi method. | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-029 | performBulkOperation DELETE should report errors when repository throws | Thiet lap mock theo dieu kien testcase va goi method. | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-030 | performBulkOperation ADD_TO_EXAM should return not-implemented message | Thiet lap mock theo dieu kien testcase va goi method. | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |
| TC-TRINH-QST-031 | performBulkOperation should return error for unknown operation | Goi service.performBulkOperation( { Operation: 'ARCHIVE', QuestionIDs: [1], }, 99 ). | Ket qua tra ve dung theo cac assertion trong testcase. | Jest + ts-jest, mock repository |


### 1.4 Project Link
- Chua cung cap URL GitHub public trong phien lam viec nay.
- Duong dan local workspace: d:/DBCLPM/do_an_tot_nghiep_final/TrinhHieu/toeic-exam-backend

### 1.5 Execution Report
- Lenh chay tat ca service tests:
  - npm test -- --runInBand --testPathPatterns "src/application/services"
- Ket qua:
  - Test Suites: 5 passed, 5 total
  - Tests: 166 passed, 166 total
  - Fail: 0

Lenh da chay rieng theo tung service:
- npm test -- --runInBand --testPathPatterns "src/application/services/attempt.service.test.ts"
- npm test -- --runInBand --testPathPatterns "src/application/services/comment.service.test.ts"
- npm test -- --runInBand --testPathPatterns "src/application/services/exam.service.test.ts"
- npm test -- --runInBand --testPathPatterns "src/application/services/media-group.service.test.ts"
- npm test -- --runInBand --testPathPatterns "src/application/services/question.service.test.ts"

### 1.6 Code Coverage Report
- Lenh chay coverage:
  - npm run test:cov -- --runInBand --testPathPatterns "src/application/services" --coverageReporters=json-summary --coverageReporters=text
- Lenh mo bao cao HTML coverage (Windows PowerShell):
  - cd d:/DBCLPM/do_an_tot_nghiep_final/TrinhHieu/toeic-exam-backend
  - start "" "./coverage/lcov-report/index.html"

Tong coverage service layer:
- Statements: 95.20% (576/605)
- Branches: 80.94% (446/551)
- Functions: 97.67% (126/129)
- Lines: 95.36% (556/583)

Chi tiet theo file:

| Service File | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| src/application/services/attempt.service.ts | 100.00% (85/85) | 74.35% (58/78) | 100.00% (21/21) | 100.00% (80/80) |
| src/application/services/comment.service.ts | 100.00% (81/81) | 95.52% (64/67) | 100.00% (15/15) | 100.00% (81/81) |
| src/application/services/exam.service.ts | 87.87% (203/231) | 72.16% (140/194) | 94.00% (47/50) | 87.78% (194/221) |
| src/application/services/media-group.service.ts | 99.15% (118/119) | 83.33% (110/132) | 100.00% (23/23) | 100.00% (115/115) |
| src/application/services/question.service.ts | 100.00% (89/89) | 92.50% (74/80) | 100.00% (20/20) | 100.00% (86/86) |


### 1.7 Tai lieu tham khao va Prompt
- Tai lieu tham khao:
  - UnitTest/Yeucau.md
  - Jest docs: https://jestjs.io/docs/getting-started
  - ts-jest docs: https://kulshekhar.github.io/ts-jest/
- Prompt/yeu cau da su dung de thuc hien:
  - "thuc hien theo yeu cau trong yeucau.md voi thu muc TrinhHieu"
  - "phu all service, tong tam 100 test case"
  - "bao cao chi tiet bang tieng Viet, input/output ro rang"

## 2. Yeu cau ve Unit Test Scripts

### 2.1 Comment
- Tat ca test case deu co comment Test Case ID theo format: // Test Case ID: TC-TRINH-...

### 2.2 Naming Convention
- Ten test tuan thu mau: <method> should <condition/result>
- Ten bien mock co y nghia: examRepositoryMock, questionRepositoryMock, mediaQuestionRepositoryMock, ...

### 2.3 Check Database (CheckDB)
- Scope unit test nay mock toan bo repository, khong ghi doc DB that.
- Vi vay CheckDB khong ap dung trong dot unit test service layer nay.

### 2.4 Rollback
- Khong co thao tac thay doi DB that nen khong can rollback.
- Cac test doc lap va co the chay lai nhieu lan ma khong anh huong du lieu.

## 3. Tong ket
- Da hoan tat unit test cho toan bo 5 service files trong TrinhHieu backend.
- Tong so testcase: 166 (vuot yeu cau ~100 testcase).
- Tat ca testcase deu PASS.
- Bao cao coverage dat muc cao cho service layer, trong do branch coverage tong the con du dia de tiep tuc nang cao (dac biet exam.service.ts).
