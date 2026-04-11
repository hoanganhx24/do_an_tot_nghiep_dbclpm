# CHI TIET TEST CASE - MAIHIEU SERVICE LAYER

Tong so test case co gan Test Case ID: 180
ChatBotServiceImpl duoc loai bo khoi pham vi theo yeu cau user: 'bo chatbot'.

## AssessmentOptionServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-AOS-001 | deleteAssessmentOptionByQuestionId shouldForwardQuestionIdToRepository | Tham so truyen vao: questionId=99; khong can stub bo sung. | verify(assessmentOptionRepository).deleteByAssessmentQuestion_Id(99) | JUnit5 + Mockito |
| MAI-AOS-002 | deleteAssessmentOptionByQuestionId shouldStillCallRepositoryWhenIdIsNull | Tham so truyen vao: questionId=null; khong can stub bo sung. | verify(assessmentOptionRepository).deleteByAssessmentQuestion_Id(null) | JUnit5 + Mockito |

## AssessmentQuestionAndChoiceServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-AQC-001 | createQuestionAndChoices shouldThrowWhenAssessmentNotFound | Stub setup: when(assessmentRepository.findById(100)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-AQC-002 | createQuestionAndChoices shouldCreateTrueFalseOptions | Mock values: 'TRUE_FALSE', 'Question', 'Explain', 'True', 'False'. Stub setup: when(assessmentRepository.findById(1)).thenReturn(Optional.of(assessment)) | verify(assessmentQuestionRepository).save(captor.capture()); assertEquals(2, options.size()); assertTrue(options.stream().anyMatch(o -> "True".equals(o.getContent()) && Boolean.TRUE.equals(o.getIsCorrect()))); assertTrue(options.stream().anyMatch(o -> "False".equals(o.getContent()) && Boolean.FALSE.equals(o.getIsCorrect()))) | JUnit5 + Mockito |
| MAI-AQC-003 | createQuestionAndChoices shouldCreateFillInBlankOptionsAsCorrect | Mock values: 'FILL_IN_THE_BLANK', 'Question', 'A', 'B'. Stub setup: when(assessmentRepository.findById(2)).thenReturn(Optional.of(assessment)) | verify(assessmentQuestionRepository).save(captor.capture()); assertEquals(2, captor.getValue().getAssessmentOptions().size()); assertTrue(captor.getValue().getAssessmentOptions().stream().allMatch(o -> Boolean.TRUE.equals(o.getIsCorrect()))) | JUnit5 + Mockito |
| MAI-AQC-004 | createQuestionAndChoices shouldThrowRuntimeWhenListeningFileCannotRead | Mock values: 'LISTENING_1', 'A', 'B', 'cannot read file'. Stub setup: when(assessmentRepository.findById(3)).thenReturn(Optional.of(assessment)); when(file.getBytes()).thenThrow(new IOException("cannot read file")) | assertThrows(RuntimeException.class, () -> service.createQuestionAndChoices(request, file)) | JUnit5 + Mockito |
| MAI-AQC-005 | updateQuestionndChoices shouldThrowWhenQuestionNotFound | Stub setup: when(assessmentQuestionRepository.findById(200)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.ASSESSMENT_QUESSTION_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-AQC-006 | updateQuestionndChoices shouldUpdateExistingOptionAndAppendNewOption | Mock values: 'A', 'SINGLE_CHOICE', 'A1', 'B', 'New question'. Stub setup: when(assessmentQuestionRepository.findById(10)).thenReturn(Optional.of(question)) | verify(assessmentQuestionRepository).save(captor.capture()); assertEquals(2, options.size()); assertTrue(options.stream().anyMatch(o -> "A1".equals(o.getContent()) && Boolean.FALSE.equals(o.getIsCorrect()))); assertTrue(options.stream().anyMatch(o -> "B".equals(o.getContent()) && Boolean.TRUE.equals(o.getIsCorrect()))) | JUnit5 + Mockito |
| MAI-AQC-007 | deleteAssessmentQuestionById shouldDelegateToRepository | Tham so truyen vao: assessmentQuestionId=500; khong can stub bo sung. | verify(assessmentQuestionRepository).deleteById(500) | JUnit5 + Mockito |

## AssessmentServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-ASS-001 | createAssessment shouldThrowWhenExerciseTypeNotFound | Mock values: 'READING_5'. Stub setup: when(exerciseTypeRepository.findByCode("READING_5")).thenReturn(Optional.empty()) | assertEquals(ErrorCode.EXERCISE_TYPE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ASS-002 | createAssessment shouldThrowWhenTestNotFound | Mock values: 'READING_5'. Stub setup: when(exerciseTypeRepository.findByCode("READING_5")) .thenReturn(Optional.of(ExerciseTypeEntity.builder().code("READING_5").build())); when(testRepository.findById(10)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ASS-003 | createAssessment shouldAssignTestAndTypeBeforeSave | Mock values: 'READING_5', 'Title', 'Mini'. Stub setup: when(exerciseTypeRepository.findByCode("READING_5")).thenReturn(Optional.of(type)); when(testRepository.findById(10)).thenReturn(Optional.of(test)); when(assessmentConverter.toEntity(request, AssessmentEntity.class)).thenReturn(mappedEntity) | verify(assessmentRepository).save(captor.capture()); assertSame(test, captor.getValue().getTest()); assertSame(type, captor.getValue().getExercisetype()) | JUnit5 + Mockito |
| MAI-ASS-004 | updateAssessment shouldThrowWhenAssessmentNotFound | Stub setup: when(assessmentRepository.findById(999)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ASS-005 | updateAssessment shouldOnlyUpdateProvidedFields | Mock values: 'old', 'new', 'p1', 'p2'. Stub setup: when(assessmentRepository.findById(1)).thenReturn(Optional.of(entity)) | verify(assessmentRepository).save(entity); assertEquals("new", entity.getTitle()); assertEquals(2, entity.getParagraphs().size()) | JUnit5 + Mockito |
| MAI-ASS-006 | getSummaryAssessmentsByTestId shouldReturnConverterResult | Mock values: 'A1'. Stub setup: when(assessmentRepository.findByTestId(12)).thenReturn(entities); when(assessmentConverter.toResponseSummaryList(entities)).thenReturn(expected) | assertSame(expected, actual) | JUnit5 + Mockito |
| MAI-ASS-007 | getAssessmentDetailById shouldThrowWhenNotFound | Tham so truyen vao: assessmentId=9; stub setup: when(assessmentRepository.findById(9)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ASS-008 | getAssessmentDetailById shouldReturnDetailedResponse | Mock values: 'Detail'. Stub setup: when(assessmentRepository.findById(9)).thenReturn(Optional.of(entity)); when(assessmentConverter.toAssessmentDetailResponse(entity)).thenReturn(expected) | assertEquals(9, actual.getId()); assertEquals("Detail", actual.getTitle()) | JUnit5 + Mockito |
| MAI-ASS-009 | deleteAssessmentById shouldDelegateToRepository | Tham so truyen vao: assessmentId=55; khong can stub bo sung. | verify(assessmentRepository).deleteById(55) | JUnit5 + Mockito |
| MAI-ASS-010 | getAssessmentDetailForFistTest shouldThrowWhenNoValidTestFound | Mock values: 'FIRST_TEST', 'No test found' | assertEquals("No test found", ex.getMessage()) | JUnit5 + Mockito |
| MAI-ASS-011 | getAssessmentsDetailByTestId shouldMixDetailAndSplitByExerciseType | Mock values: 'LISTENING_1', 'MULTIPLE_CHOICE', 'L', 'S1', 'S2'. Stub setup: when(assessmentRepository.findByTestId(999)).thenReturn(List.of(listening, splitType)); when(assessmentConverter.toAssessmentDetailResponse(listening)) .thenReturn(AssessmentResponse.builder().id(1).title("L").build()); when(assessmentConverter.toSplitAssessmentDetailResponse(splitType)) .thenReturn(... | assertEquals(3, actual.size()); assertEquals(1, actual.get(0).getId()); assertEquals(20, actual.get(1).getId()); assertEquals(21, actual.get(2).getId()) | JUnit5 + Mockito |

## AttemptSeviceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-ATS-001 | saveAttempt shouldThrowWhenStudentNotFound | Stub setup: when(studentProfileRepository.findById(1)).thenReturn(Optional.empty()); when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build())) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ATS-002 | saveAttempt shouldThrowWhenExerciseNotFound | Stub setup: when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build())); when(exerciseRepository.findById(2)).thenReturn(Optional.empty()); when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build())) | assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ATS-003 | saveAttempt shouldThrowWhenChoiceNotFound | Stub setup: when(choiceRepository.findById(99)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.CHOICE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ATS-004 | saveAttempt shouldThrowWhenQuestionNotFound | Stub setup: when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build())); when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build())); when(exerciseRepository.findById(2)).thenReturn(Optional.of(ExerciseEntity.builder().id(2).build())) | assertEquals(ErrorCode.QUESTION_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ATS-005 | saveAttempt shouldCalculateScorePercentAndPersistAttempt | Stub setup: when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build())); when(exerciseRepository.findById(2)).thenReturn(Optional.of(ExerciseEntity.builder().id(2).build())); when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build())) | verify(attemptRepository).save(captor.capture()); assertEquals(50, saved.getScorePercent()); assertEquals(2, saved.getAttemptAnswers().size()); assertEquals(1, saved.getStudentProfile().getId()) | JUnit5 + Mockito |
| MAI-ATS-006 | saveAttempt shouldSetScoreTo100WhenAllAnswersCorrect | Stub setup: when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build())); when(exerciseRepository.findById(2)).thenReturn(Optional.of(ExerciseEntity.builder().id(2).build())); when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build())) | verify(attemptRepository).save(captor.capture()); assertEquals(100, captor.getValue().getScorePercent()) | JUnit5 + Mockito |

## AuthenticationServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-AUT-001 | logIn shouldThrowWhenUserNotExists | Mock values: 'notfound@mail.com', '123' | assertEquals(ErrorCode.USER_NOT_EXISTS, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-AUT-002 | logIn shouldThrowWhenPasswordNotMatch | Mock values: 'u@mail.com', 'hashed', 'ACTIVE', 'wrong'. Stub setup: when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user)); when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false) | assertEquals(ErrorCode.PASSWORD_NOT_MATCH, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-AUT-003 | logIn shouldThrowWhenUserInactive | Mock values: 'u@mail.com', 'hashed', 'INACTIVE', '123'. Stub setup: when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user)); when(passwordEncoder.matches("123", "hashed")).thenReturn(true) | assertEquals(ErrorCode.USER_INACTIVE, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-AUT-004 | logIn shouldReturnTeacherProfileIdWhenRoleTeacher | Mock values: 'teacher@mail.com', 'hashed', 'Teacher', 'ACTIVE', 'TEACHER', '123'. Stub setup: when(userRepository.findByEmail("teacher@mail.com")).thenReturn(Optional.of(user)); when(passwordEncoder.matches("123", "hashed")).thenReturn(true); when(roleRepository.findByEmail("teacher@mail.com")).thenReturn(Optional.of(List.of(teacherRole))) | assertEquals(55, response.getId()); assertTrue(response.getVerified()); assertNotNull(response.getToken()); assertNotNull(response.getRefreshToken()) | JUnit5 + Mockito |
| MAI-AUT-005 | logIn shouldReturnStudentProfileIdAndFirstLoginFlagWhenRoleStudent | Mock values: 'student@mail.com', 'hashed', 'Student', 'ACTIVE', 'STUDENT', '123'. Stub setup: when(userRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(user)); when(passwordEncoder.matches("123", "hashed")).thenReturn(true); when(roleRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(List.of(studentRole))) | assertEquals(77, response.getId()); assertTrue(response.getFirstLogin()); assertTrue(response.getVerified()) | JUnit5 + Mockito |
| MAI-AUT-006 | refreshToken shouldThrowRuntimeWhenTokenFormatInvalid | Mock values: 'invalid-token' | assertThrows(RuntimeException.class, () -> service.refreshToken(request)); token 'invalid-token' khong parse duoc. | JUnit5 + Mockito |
| MAI-AUT-007 | refreshToken shouldThrowWhenTokenExpired | Mock values: 'expired@mail.com', 'Expired' | assertEquals(ErrorCode.INVALID_REFRESH_TOKEN, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-AUT-008 | refreshToken shouldIssueNewAccessTokenWhenRefreshTokenValid | Mock values: 'STUDENT', 'student@mail.com', 'Student'. Stub setup: when(roleRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(List.of(studentRole))) | assertNotNull(response.getToken()); assertEquals(refreshToken, response.getRefreshToken()) | JUnit5 + Mockito |
| MAI-AUT-009 | generateToken shouldThrowWhenRoleNotFound | Mock values: 'norole@mail.com', 'Name' | assertEquals(ErrorCode.ROLE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-AUT-010 | generateToken shouldReturnSerializedToken | Mock values: 'ADMIN', 'admin@mail.com', 'Admin'. Stub setup: when(roleRepository.findByEmail("admin@mail.com")).thenReturn(Optional.of(List.of(adminRole))) | assertNotNull(token); assertFalse(token.isBlank()) | JUnit5 + Mockito |

## CourseServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-CRS-001 | addCourseToTrack shouldConvertAndSave | Mock values: 'Course A'. Stub setup: when(courseConverter.toCourseEntity(request, file)).thenReturn(entity) | verify(courseRepository).save(entity) | JUnit5 + Mockito |
| MAI-CRS-002 | getAllCourses shouldMapAllEntitiesToResponses | Mock values: 'A', 'B'. Stub setup: when(courseRepository.findAll()).thenReturn(List.of(c1, c2)); when(courseConverter.toCourseResponse(c1)).thenReturn(CourseResponse.builder().id(1).title("A").build()); when(courseConverter.toCourseResponse(c2)).thenReturn(CourseResponse.builder().id(2).title("B").build()) | assertEquals(2, result.size()); assertEquals(1, result.get(0).getId()); assertEquals(2, result.get(1).getId()) | JUnit5 + Mockito |
| MAI-CRS-003 | getCourseById shouldThrowWhenCourseNotFound | Tham so truyen vao: courseId=1; stub setup: when(courseRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.COURSE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-CRS-004 | getCourseById shouldReturnConvertedResponse | Mock values: 'Course A'. Stub setup: when(courseRepository.findById(1)).thenReturn(Optional.of(course)); when(courseConverter.toCourseResponse(course)).thenReturn(response) | assertSame(response, actual) | JUnit5 + Mockito |
| MAI-CRS-005 | getCoursesByTeacherId shouldMapResponsesByTeacher | Mock values: 'Teacher Course'. Stub setup: when(courseRepository.findByTeacherprofile_Id(9)).thenReturn(List.of(c1)); when(courseConverter.toCourseResponseByTeacher(c1)).thenReturn(CourseResponse.builder().id(10).title("Teacher Course").build()) | assertEquals(1, result.size()); assertEquals(10, result.get(0).getId()) | JUnit5 + Mockito |
| MAI-CRS-006 | publishCourse shouldThrowWhenCourseNotFound | Tham so truyen vao: courseId=1; stub setup: when(courseRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.COURSE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-CRS-007 | publishCourse shouldThrowWhenCourseAlreadyPublishStatus | Mock values: 'PUBLISH'. Stub setup: when(courseRepository.findById(1)).thenReturn(Optional.of(course)) | assertEquals(ErrorCode.COURSE_PUBLISHED, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-CRS-008 | publishCourse shouldThrowWhenCourseHasNoModule | Mock values: 'NEW'. Stub setup: when(courseRepository.findById(2)).thenReturn(Optional.of(course)) | assertEquals(ErrorCode.COURSE_EMPTY_MODULE, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-CRS-009 | completedCups shouldAggregateFromAllModules | Mock values: '3/0'. Stub setup: when(courseRepository.findById(11)).thenReturn(Optional.of(course)); when(moduleService.completedCups(1, 5)).thenReturn(1); when(moduleService.completedCups(2, 5)).thenReturn(2) | assertEquals("3/0", actual) | JUnit5 + Mockito |
| MAI-CRS-010 | getCourseForStudent shouldSortModulesAndSetCompletedCup | Mock values: 'UNLOCK', '3/6'. Stub setup: when(courseRepository.findById(10)).thenReturn(Optional.of(course)); when(courseConverter.toCourseResponseByStudent(course, "UNLOCK")).thenReturn(response); when(moduleService.getResponseDetailList(course.getModules(), 8)).thenReturn(new ArrayList<>(List.of(m1, m2))) | assertEquals("3/6", actual.getCompletedCup()); assertEquals(1L, actual.getModules().get(0).getOrderIndex()); assertEquals(3L, actual.getModules().get(1).getOrderIndex()) | JUnit5 + Mockito |
| MAI-CRS-011 | isCompleted shouldReturnFalseWhenAnyModuleIncomplete | Stub setup: when(courseRepository.findById(7)).thenReturn(Optional.of(course)); when(moduleService.isCompleted(1, 9)).thenReturn(true); when(moduleService.isCompleted(2, 9)).thenReturn(false) | assertFalse(service.isCompleted(7, 9)) | JUnit5 + Mockito |
| MAI-CRS-012 | isCompleted shouldReturnTrueWhenAllModulesCompleted | Stub setup: when(courseRepository.findById(8)).thenReturn(Optional.of(course)); when(moduleService.isCompleted(1, 99)).thenReturn(true); when(moduleService.isCompleted(2, 99)).thenReturn(true) | assertTrue(service.isCompleted(8, 99)) | JUnit5 + Mockito |

## DictionaryServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-DIC-001 | getSuggestionWord shouldReturnTopWords | Mock values: 'ab', 'about', 'ability' | assertEquals(List.of("about", "ability"), result) | JUnit5 + Mockito |
| MAI-DIC-002 | search shouldUseCachedDictionaryWhenWordExists | Mock values: 'focus', 'noun', '/fo-kus/', 'audio-url', 'ability to concentrate', 'Keep focus'. Stub setup: when(dictionaryRepository.findByWord("focus")).thenReturn(Optional.of(dictionary)); when(studentDictionaryRepository.existsByStudentProfile_IdAndDefinitionExample_Id(9, 111)).thenReturn(true) | assertEquals("focus", response.getWord()); assertEquals(1, response.getPartsOfSpeech().size()); assertEquals("noun", response.getPartsOfSpeech().get(0).getPartOfSpeech()); assertEquals(true, response.getPartsOfSpeech().get(0).getSenses().get(0).getSaved()) | JUnit5 + Mockito |
| MAI-DIC-003 | search shouldReturnEmptyPartOfSpeechListWhenCachedEntityHasNoPartOfSpeech | Mock values: 'empty'. Stub setup: when(dictionaryRepository.findByWord("empty")).thenReturn(Optional.of(dictionary)) | assertEquals("empty", response.getWord()); assertEquals(0, response.getPartsOfSpeech().size()) | JUnit5 + Mockito |

## EnrollmentServeceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-ENR-001 | saveEnrollment shouldThrowWhenStudentNotFound | Stub setup: when(studentProfileRepository.findById(99)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-ENR-002 | saveEnrollment shouldCreateThreeEnrollmentsAndSetStatusByScore | Mock values: '0-300', '300-600', '600+', 'OLD'. Stub setup: when(studentProfileRepository.findById(1)).thenReturn(Optional.of(student)); when(trackRepository.findByCode("0-300")).thenReturn(Optional.of(TrackEntity.builder().id(1).code("0-300").build())); when(trackRepository.findByCode("300-600")).thenReturn(Optional.of(TrackEntity.builder().id(2).code("300-600").build())) | verify(enrollmentRepository).saveAll(captor.capture()); assertEquals(3, saved.size()); assertEquals(1, saved.get(0).getStatus()); assertEquals(0, saved.get(1).getStatus()) | JUnit5 + Mockito |
| MAI-ENR-003 | getStudentEnrollmenteds shouldMapSummaryAndTrackResponse | Mock values: '0-300'. Stub setup: when(enrollmentRepository.findByStudentProfile_Id(1)).thenReturn(List.of(enrollment)); when(enrollmentConverter.toResponseSummary(enrollment)).thenReturn(summary); when(trackConverter.toTrackForStudent(enrollment)).thenReturn(track) | assertEquals(1, result.size()); assertEquals("0-300", result.get(0).getTrackResponse().getCode()) | JUnit5 + Mockito |
| MAI-ENR-004 | getPreviewStudyFlow shouldReturnConverterOutput | Stub setup: when(enrollmentRepository.findByStudentProfile_Id(9)).thenReturn(List.of(enrollment)); when(enrollmentConverter.toStudyFlow(List.of(enrollment))).thenReturn(List.of(response)) | assertEquals(1, result.size()); assertEquals(10, result.get(0).getId()) | JUnit5 + Mockito |

## ExerciseServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-EXS-001 | getExerciseDetailById shouldThrowWhenExerciseNotFound | Tham so truyen vao: exerciseId=1; stub setup: when(exerciseRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-EXS-002 | createExercise shouldThrowWhenLessonNotFound | Mock values: 'READING_5'. Stub setup: when(lessonRepository.findById(10)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-EXS-003 | createExercise shouldThrowWhenExerciseTypeNotFound | Mock values: 'UNKNOWN_TYPE'. Stub setup: when(lessonRepository.findById(10)).thenReturn(Optional.of(LessonEntity.builder().id(10).build())); when(exerciseTypeRepository.findByCode("UNKNOWN_TYPE")).thenReturn(Optional.empty()) | assertEquals(ErrorCode.EXERCISE_TYPE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-EXS-004 | createExercise shouldThrowWhenShowTimeButLessonHasNoMedia | Mock values: 'INTERACTIVE'. Stub setup: when(lessonRepository.findById(10)).thenReturn(Optional.of(lesson)); when(exerciseTypeRepository.findByCode("INTERACTIVE")).thenReturn(Optional.of(type)); when(exerciseConverter.toEntity(request, ExerciseEntity.class)).thenReturn(mapped) | assertEquals(ErrorCode.LESSON_NOT_HAS_MEDIA, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-EXS-005 | getSummaryExercisesByLessonId shouldReturnConverterOutput | Mock values: 'E1'. Stub setup: when(exerciseRepository.findByLessonId(3)).thenReturn(List.of(entity)); when(exerciseConverter.toResponseSummaryList(List.of(entity))).thenReturn(List.of(response)) | assertEquals(1, actual.size()); assertEquals("E1", actual.get(0).getTitle()) | JUnit5 + Mockito |
| MAI-EXS-006 | updateExercise shouldThrowWhenExerciseNotFound | Stub setup: when(exerciseRepository.findById(99)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-EXS-007 | deleteExcercise shouldDelegateDeleteById | Tham so truyen vao: exerciseId=55; khong can stub bo sung. | verify(exerciseRepository).deleteById(55) | JUnit5 + Mockito |

## ExerciseTypeServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-ETS-001 | getExerciseTypes shouldReturnMappedResponses | Mock values: 'READING_5'. Stub setup: when(exerciseTypeRepository.findAll()).thenReturn(entities); when(exerciseTypeConverter.toResponseList(entities, ExerciseTypeResponse.class)).thenReturn(responses) | assertSame(responses, actual); verify(exerciseTypeRepository).findAll() | JUnit5 + Mockito |
| MAI-ETS-002 | getExerciseTypes shouldPassRepositoryResultToConverter | Mock values: 'TRUE_FALSE'. Stub setup: when(exerciseTypeRepository.findAll()).thenReturn(entities); when(exerciseTypeConverter.toResponseList(anyList(), eq(ExerciseTypeResponse.class))).thenReturn(Collections.emptyList()) | verify(exerciseTypeConverter).toResponseList(entities, ExerciseTypeResponse.class) | JUnit5 + Mockito |
| MAI-ETS-003 | getExerciseTypes shouldReturnEmptyListWhenNoEntityExists | Stub setup: when(exerciseTypeConverter.toResponseList(Collections.emptyList(), ExerciseTypeResponse.class)) .thenReturn(Collections.emptyList()) | assertEquals(0, actual.size()) | JUnit5 + Mockito |

## LessonProgressServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-LPS-001 | checkCompletionCondition shouldThrowWhenLessonNotFound | Stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-LPS-002 | checkCompletionCondition shouldThrowWhenStudentNotFound | Stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.of(LessonEntity.builder().id(1).build())); when(studentProfileRepository.findById(2)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-LPS-003 | checkCompletionCondition shouldThrowWhenProgressRecordMissing | Stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.of(LessonEntity.builder().id(1).build())); when(studentProfileRepository.findById(2)).thenReturn(Optional.of(StudentProfileEntity.builder().id(2).build())); when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of()) | assertEquals(ErrorCode.LESSON_PROGRESS_NOT_EXISTS, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-LPS-004 | checkCompletionCondition shouldReturnFalseWhenGatingRuleNotReached | Stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson)); when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student)); when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress)) | assertFalse(result); assertEquals(1, progress.getProcess()); verify(lessonProgressRepository).save(progress) | JUnit5 + Mockito |
| MAI-LPS-005 | checkCompletionCondition shouldReturnTrueWhenCompletedAndUnlockByFallback | Stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson)); when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student)); when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress)) | assertTrue(result); assertEquals(2, progress.getProcess()); verify(lessonProgressRepository).save(progress) | JUnit5 + Mockito |

## LessonServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-LSS-001 | getLesson shouldThrowWhenLessonNotFound | Tham so truyen vao: lessonId=1; stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-LSS-002 | getLesson shouldReturnConvertedResponse | Mock values: 'Lesson A'. Stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson)); when(lessonConverter.toResponse(lesson, LessonResponse.class)).thenReturn(response) | assertEquals(1, actual.getId()); assertEquals("Lesson A", actual.getTitle()) | JUnit5 + Mockito |
| MAI-LSS-003 | getMaxOrder shouldReturnRepositoryValuePlusOne | Stub setup: when(lessonRepository.getMaxOrder(moduleId)).thenReturn(7L). | assertEquals(8, max) | JUnit5 + Mockito |
| MAI-LSS-004 | isCompletedLesson shouldReturnFalseWhenNoProgress | Tham so truyen vao: lessonId=1, studentProfileId=9; stub lessonProgressRepository tra ve danh sach rong. | assertFalse(service.isCompletedLesson(1, 9)) | JUnit5 + Mockito |
| MAI-LSS-005 | isCompletedLesson shouldReturnFalseWhenProcessIsOne | Tham so truyen vao: lessonId=1, studentProfileId=9; stub process=1. | assertFalse(service.isCompletedLesson(1, 9)) | JUnit5 + Mockito |
| MAI-LSS-006 | isCompletedLesson shouldReturnTrueWhenProcessIsTwo | Tham so truyen vao: lessonId=1, studentProfileId=9; stub process=2. | assertTrue(service.isCompletedLesson(1, 9)) | JUnit5 + Mockito |
| MAI-LSS-007 | isLockLesson shouldThrowWhenLessonNotFound | Tham so truyen vao: lessonId=1, studentProfileId=9; stub setup: when(lessonRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-LSS-008 | getLessonPath shouldReturnHierarchyPath | Mock values: 'Track A', 'Course A', 'Module A', 'Lesson A', 'Track A/Course A/Module A/Lesson A'. Stub setup: when(lessonRepository.findById(20)).thenReturn(Optional.of(lesson)) | assertEquals("Track A/Course A/Module A/Lesson A", actual) | JUnit5 + Mockito |
| MAI-LSS-009 | completedStar shouldReturnThreeWhenLessonHasNoExerciseAndIsCompleted | Stub setup: when(lessonRepository.findById(30)).thenReturn(Optional.of(lesson)); when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(30, 3)) .thenReturn(List.of(LessonProgressEntity.builder().process(2).build())) | assertEquals(3, stars) | JUnit5 + Mockito |
| MAI-LSS-010 | deleteLesson shouldThrowWhenLessonNotFound | Tham so truyen vao: lessonId=1000; stub setup: when(lessonRepository.findById(1000)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-LSS-011 | deleteLesson shouldDeleteWhenFound | Stub setup: when(lessonRepository.findById(1000)).thenReturn(Optional.of(lesson)) | verify(lessonRepository).delete(lesson) | JUnit5 + Mockito |

## MailServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-MLS-001 | sendMail shouldSendMimeMessageSuccessfully | Mock values: 'user@example.com', 'Subject', 'otp', '123456', 'verify_email_template', '<html>ok</html>'. Stub setup: when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage); when(templateEngine.process(eq("verify_email_template"), any())).thenReturn("<html>ok</html>") | verify(javaMailSender).send(mimeMessage) | JUnit5 + Mockito |
| MAI-MLS-002 | sendMail shouldThrowAppExceptionWhenCreateMimeMessageFails | Mock values: 'user@example.com', 'Subject', 'mail error', 'verify_email_template'. Stub setup: when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("mail error")) | assertEquals(ErrorCode.EMAIL_SEND_FAILED, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-MLS-003 | sendMail shouldThrowAppExceptionWhenTemplateEngineFails | Mock values: 'user@example.com', 'Subject', 'otp', '123456', 'verify_email_template', 'template error'. Stub setup: when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage); when(templateEngine.process(eq("verify_email_template"), any())).thenThrow(new RuntimeException("template error")) | assertEquals(ErrorCode.EMAIL_SEND_FAILED, ex.getErrorCode()) | JUnit5 + Mockito |

## MaterialServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-MTS-001 | materialServiceImpl shouldBeInstantiable | Khoi tao service = new MaterialServiceImpl(...); khong can mock du lieu domain. | assertNotNull(service); assertTrue(service instanceof MaterialServiceImpl) | JUnit5 + Mockito |

## MediaAssetServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-MAS-001 | mediaAssetServiceImpl shouldBeInstantiable | Khoi tao service = new MediaAssetServiceImpl(...); khong can mock du lieu domain. | assertNotNull(service); assertTrue(service instanceof MediaAssetServiceImpl) | JUnit5 + Mockito |

## ModuleServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-MDS-001 | addModule shouldFlushOrderIndexWhenNewOrderIsInRange | Stub setup: when(moduleConverter.toEntity(request, ModuleEntity.class)).thenReturn(entity); when(moduleRepository.getMaxOrder(1)).thenReturn(1L) | verify(moduleRepository).flushOrderIndex(1, 1L); verify(moduleRepository).save(entity) | JUnit5 + Mockito |
| MAI-MDS-002 | addModule shouldNotFlushWhenOrderIsAfterMaxOrder | Stub setup: when(moduleConverter.toEntity(request, ModuleEntity.class)).thenReturn(entity); when(moduleRepository.getMaxOrder(1)).thenReturn(1L) | verify(moduleRepository).save(entity) | JUnit5 + Mockito |
| MAI-MDS-003 | getAll shouldConvertEveryEntity | Stub setup: when(moduleRepository.findAll()).thenReturn(List.of(m1, m2)); when(moduleConverter.toResponse(m1, ModuleResponse.class)).thenReturn(ModuleResponse.builder().id(1).build()); when(moduleConverter.toResponse(m2, ModuleResponse.class)).thenReturn(ModuleResponse.builder().id(2).build()) | assertEquals(2, result.size()) | JUnit5 + Mockito |
| MAI-MDS-004 | getMaxOrder shouldReturnRepositoryValuePlusOne | Stub setup: when(moduleRepository.getMaxOrder(courseId)).thenReturn(6L). | assertEquals(7L, actual) | JUnit5 + Mockito |
| MAI-MDS-005 | completedCups shouldReturnThreeWhenCompletionIsHundredPercent | Stub setup: when(lessonRepository.findByModuleId(1)).thenReturn(List.of(lesson)); when(testRepository.findByModuleId(1)).thenReturn(List.of(test)); when(lessonService.completedStar(1, 100)).thenReturn(3) | assertEquals(3, cups) | JUnit5 + Mockito |
| MAI-MDS-006 | completedCups shouldReturnTwoWhenCompletionBetweenFiftyAndNinetyNine | Stub setup: when(lessonRepository.findByModuleId(2)).thenReturn(List.of(lesson)); when(testRepository.findByModuleId(2)).thenReturn(List.of(test)); when(lessonService.completedStar(1, 200)).thenReturn(3) | assertEquals(2, cups) | JUnit5 + Mockito |
| MAI-MDS-007 | completedCups shouldReturnOneWhenCompletionIsPositiveButLow | Stub setup: when(lessonRepository.findByModuleId(3)).thenReturn(List.of(lesson)); when(testRepository.findByModuleId(3)).thenReturn(List.of(test)); when(lessonService.completedStar(1, 300)).thenReturn(1) | assertEquals(1, cups) | JUnit5 + Mockito |
| MAI-MDS-008 | completedCups shouldReturnZeroWhenNoStarCollected | Stub setup: when(lessonRepository.findByModuleId(4)).thenReturn(List.of(lesson)); when(testRepository.findByModuleId(4)).thenReturn(List.of(test)); when(lessonService.completedStar(1, 400)).thenReturn(0) | assertEquals(0, cups) | JUnit5 + Mockito |
| MAI-MDS-009 | getResponseDetailList shouldBuildLessonModuleDetail | Stub setup: when(moduleConverter.toResponseForStudent(module)).thenReturn(mapped); when(lessonRepository.countByModuleId(1)).thenReturn(1L); when(lessonService.getListLessonResponseDetail(module.getLessons(), 88)).thenReturn(new ArrayList<>(List.of(lessonResponse))) | assertEquals(1, result.size()); assertEquals(1, result.get(0).getTotalLessons()); assertEquals(1, result.get(0).getCompletedLessons()) | JUnit5 + Mockito |
| MAI-MDS-010 | updateModule shouldThrowWhenModuleNotFound | Stub setup: when(moduleRepository.findById(999)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-MDS-011 | deleteModule shouldThrowWhenModuleNotFound | Tham so truyen vao: moduleId=999; stub setup: when(moduleRepository.findById(999)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-MDS-012 | isCompleted shouldReturnFalseWhenLessonModuleHasIncompleteLesson | Stub setup: when(moduleRepository.findById(12)).thenReturn(Optional.of(module)); when(lessonService.isCompletedLesson(9, 5)).thenReturn(false) | assertFalse(actual) | JUnit5 + Mockito |
| MAI-MDS-013 | isCompleted shouldReturnTrueWhenTestModuleAllCompleted | Stub setup: when(moduleRepository.findById(13)).thenReturn(Optional.of(module)); when(testService.isCompletedTest(10, 5)).thenReturn(true) | assertTrue(actual) | JUnit5 + Mockito |

## QuestionServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-QUS-001 | createQuestionAndChoices shouldThrowWhenExerciseNotFound | Stub setup: when(exerciseRepository.findById(10)).thenReturn(Optional.empty()) | assertThrows(RuntimeException.class, () -> service.createQuestionAndChoices(request, null)) | JUnit5 + Mockito |
| MAI-QUS-002 | createQuestionAndChoices shouldCreateTwoOptionsForTrueFalseType | Mock values: 'TRUE_FALSE', 'Q1', 'True', 'False'. Stub setup: when(exerciseRepository.findById(1)).thenReturn(Optional.of(exercise)) | verify(questionRepository).save(captor.capture()); assertEquals(2, choices.size()); assertTrue(choices.stream().anyMatch(c -> "True".equals(c.getContent()) && Boolean.TRUE.equals(c.getIsCorrect()))); assertTrue(choices.stream().anyMatch(c -> "False".equals(c.getContent()) && Boolean.FALSE.equals(c.getIsCorrect()))) | JUnit5 + Mockito |
| MAI-QUS-003 | deleteQuestionAndChoies shouldThrowWhenQuestionNotFound | Tham so truyen vao: questionId=99; stub setup: when(questionRepository.findById(99)).thenReturn(Optional.empty()). | assertThrows(RuntimeException.class, () -> service.deleteQuestionAndChoies(99)) | JUnit5 + Mockito |
| MAI-QUS-004 | deleteQuestionAndChoies shouldDeleteWhenQuestionExists | Stub setup: when(questionRepository.findById(8)).thenReturn(Optional.of(question)) | verify(questionRepository).delete(question) | JUnit5 + Mockito |
| MAI-QUS-005 | updateQuestionndChoices shouldThrowWhenQuestionNotFound | Stub setup: when(questionRepository.findById(100)).thenReturn(Optional.empty()) | assertThrows(RuntimeException.class, () -> service.updateQuestionndChoices(request, null)) | JUnit5 + Mockito |
| MAI-QUS-006 | updateQuestionndChoices shouldUpdateQuestionTextAndChoices | Mock values: 'SINGLE_CHOICE', 'Old', 'New question', 'A', 'B'. Stub setup: when(questionRepository.findById(2)).thenReturn(Optional.of(question)) | verify(questionRepository).flush(); verify(questionRepository).save(question); assertEquals("New question", question.getQuestionText()); assertEquals(2, question.getChoices().size()) | JUnit5 + Mockito |

## StudentDictionaryServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-SDS-001 | save shouldThrowWhenStudentProfileNotFound | Stub setup: when(studentProfileRepository.findById(10)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-SDS-002 | save shouldThrowWhenDefinitionExampleNotFound | Stub setup: when(studentProfileRepository.findById(10)).thenReturn(Optional.of(StudentProfileEntity.builder().id(10).build())); when(definitionExampleRepository.findById(20)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.DEFINITION_EXAMPLE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-SDS-003 | save shouldPersistStudentDictionaryWhenInputIsValid | Stub setup: when(studentProfileRepository.findById(10)).thenReturn(Optional.of(studentProfile)); when(definitionExampleRepository.findById(20)).thenReturn(Optional.of(definitionExample)) | verify(studentDictionaryRepository).save(captor.capture()); assertEquals(10, captor.getValue().getStudentProfile().getId()); assertEquals(20, captor.getValue().getDefinitionExample().getId()) | JUnit5 + Mockito |
| MAI-SDS-004 | getAllForStudent shouldMapNestedEntityToDictionaryResponse | Mock values: 'focus', 'noun', '/fo-kus/', 'audio-url', 'ability to concentrate', 'Stay focused'. Stub setup: when(studentDictionaryRepository.findByStudentProfile_Id(studentId)).thenReturn(List.of(studentDictionary)) | assertEquals(studentId, response.getStudentProfileId()); assertEquals(1, response.getDictionaries().size()); assertEquals("focus", response.getDictionaries().get(0).getWord()); assertEquals("noun", response.getDictionaries().get(0).getPartOfSpeechString()) | JUnit5 + Mockito |
| MAI-SDS-005 | getAllForStudent shouldReturnEmptyDictionaryListWhenNoSavedWord | Stub setup: when(studentDictionaryRepository.findByStudentProfile_Id(studentId)).thenReturn(Collections.emptyList()) | assertEquals(studentId, response.getStudentProfileId()); assertEquals(0, response.getDictionaries().size()) | JUnit5 + Mockito |

## StudentProfileServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-SPS-001 | createStudentProfile shouldCreateUserThenPersistStudentProfile | Mock values: 'student@mail.com', '123456'. Stub setup: when(modelMapper.map(request, UserEntity.class)).thenReturn(mappedUser); when(userRepository.findByEmail("student@mail.com")).thenReturn(Optional.of(savedUser)) | verify(userService).createStudent(mappedUser, "123456"); verify(studentProfileRepository).save(captor.capture()); assertEquals(10, captor.getValue().getUser().getId()) | JUnit5 + Mockito |
| MAI-SPS-002 | getStudentProfiles shouldMapAllProfiles | Stub setup: when(studentProfileRepository.findAll()).thenReturn(List.of(p1)); when(studentProfileConverter.toResponse(p1, StudentprofileResponse.class)) .thenReturn(StudentprofileResponse.builder().id(1).build()) | assertEquals(1, result.size()); assertEquals(1, result.get(0).getId()) | JUnit5 + Mockito |
| MAI-SPS-003 | getStudentProfileById shouldThrowWhenNotFound | Tham so truyen vao: studentProfileId=99; stub setup: when(studentProfileRepository.findById(99)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-SPS-004 | updateStudentProfile shouldThrowWhenProfileNotFound | Stub setup: when(studentProfileRepository.findById(99)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-SPS-005 | khoaTaiKhoanStudentProfile shouldSetUserInactive | Mock values: 'ACTIVE', 'INACTIVE'. Stub setup: when(studentProfileRepository.findById(5)).thenReturn(Optional.of(profile)) | assertEquals("INACTIVE", profile.getUser().getStatus()); verify(studentProfileRepository).save(profile) | JUnit5 + Mockito |

## StudyPlanServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-STP-001 | checkExistStudyPlan shouldThrowWhenNoPlanFound | Tham so truyen vao: studentProfileId=10; stub setup: when(studyPlanRepository.findByStudentProfile_Id(10)).thenReturn(List.of()). | assertEquals(ErrorCode.STUDYPLAN_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-STP-002 | checkExistStudyPlan shouldThrowWhenOnlyInactivePlansExist | Stub setup: when(studyPlanRepository.findByStudentProfile_Id(10)).thenReturn(List.of(inactive)) | assertEquals(ErrorCode.STUDYPLAN_NOT_ACTIVE, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-STP-003 | checkExistStudyPlan shouldReturnActiveStudyPlanId | Stub setup: when(studyPlanRepository.findByStudentProfile_Id(10)).thenReturn(List.of(inactive, active)) | assertEquals(2, id) | JUnit5 + Mockito |
| MAI-STP-004 | getStudyPlanDetail shouldThrowWhenStudyPlanNotFound | Tham so truyen vao: studyPlanId=1; stub setup: when(studyPlanRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.STUDYPLAN_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-STP-005 | getStudyPlanDetail shouldReturnSummaryAndEmptyItemList | Stub setup: when(studyPlanRepository.findById(1)).thenReturn(Optional.of(entity)); when(studyPlanConverter.toResponseSummery(entity)).thenReturn(summary) | assertEquals(1, response.getId()); assertEquals(0, response.getStudyPlanItems().size()) | JUnit5 + Mockito |

## TeacherprofileServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-THS-001 | checkEmailExists shouldThrowWhenEmailAlreadyExists | Mock values: 'exists@mail.com' | assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-THS-002 | createTeacherProfile shouldThrowEmailSendFailedWhenMailThrowsRuntimeException | Mock values: 'teacher@mail.com', '2000-01-01', 'TEACHER', 'ENC', 'mail fail'. Stub setup: when(modelMapper.map(request, UserEntity.class)).thenReturn(mappedUser); when(modelMapper.map(request, TeacherprofileEntity.class)).thenReturn(mappedTeacher); when(passwordEncoder.encode(anyString())).thenReturn("ENC") | assertEquals(ErrorCode.EMAIL_SEND_FAILED, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-THS-003 | getAllTeacherProfilesActive shouldReturnConverterResult | Stub setup: when(teacherprofileRepository.findAllActiveTeachers()).thenReturn(List.of(teacher)); when(teacherprofileConverter.toResponseList(List.of(teacher), TeacherprofileResponse.class)).thenReturn(List.of(response)) | assertEquals(1, actual.size()); assertEquals(1, actual.get(0).getId()) | JUnit5 + Mockito |
| MAI-THS-004 | terminateTeacherProfile shouldThrowWhenTeacherNotFound | Tham so truyen vao: teacherProfileId=11; stub setup: when(teacherprofileRepository.findById(11)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.TEACHERPROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-THS-005 | terminateTeacherProfile shouldSetTeacherUserInactive | Mock values: 'ACTIVE', 'INACTIVE'. Stub setup: when(teacherprofileRepository.findById(11)).thenReturn(Optional.of(teacher)) | assertEquals("INACTIVE", user.getStatus()); verify(userRepository).save(user) | JUnit5 + Mockito |

## TestAttemptServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-TAS-001 | saveResultFirstTest shouldThrowWhenStudentNotFound | Stub setup: when(studentProfileRepository.findById(10)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TAS-002 | saveResultFirstTest shouldSetFirstLoginFalseAndSaveAttempt | Stub setup: when(studentProfileRepository.findById(10)).thenReturn(Optional.of(student)); when(testRepository.findById(1)).thenReturn(Optional.of(test)) | verify(studentProfileRepository).save(student); verify(testAttemptRepository).save(any(TestAttemptEntity.class)); verify(enrollmentServece).saveEnrollment(any()); assertEquals(false, student.getFirstLogin()) | JUnit5 + Mockito |
| MAI-TAS-003 | saveResultMiniTest shouldThrowWhenTestNotFound | Stub setup: when(testRepository.findById(2)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TAS-004 | saveResultMiniTest shouldThrowWhenStudentNotFound | Stub setup: when(testRepository.findById(2)).thenReturn(Optional.of(TestEntity.builder().id(2).build())); when(studentProfileRepository.findById(10)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TAS-005 | getTestAttemptDetailById shouldThrowWhenAttemptNotFound | Tham so truyen vao: testAttemptId=1; stub setup: when(testAttemptRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.TEST_ATTEMPT_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TAS-006 | getTestAttemptDetailById shouldReturnSummaryWhenNoAssessmentAttempt | Stub setup: when(testAttemptRepository.findById(1)).thenReturn(Optional.of(entity)); when(testAttemptConverter.toResponseSummery(entity)).thenReturn(response) | assertEquals(1, actual.getId()); assertEquals(0, actual.getAssessmentResponses().size()) | JUnit5 + Mockito |

## TestProgressServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-TPR-001 | checkCompletionCondition shouldThrowWhenTestNotFound | Stub setup: when(testRepository.findById(1)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TPR-002 | checkCompletionCondition shouldThrowWhenStudentNotFound | Stub setup: when(testRepository.findById(1)).thenReturn(Optional.of(TestEntity.builder().id(1).build())); when(studentProfileRepository.findById(2)).thenReturn(Optional.empty()) | assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TPR-003 | checkCompletionCondition shouldThrowWhenProgressRecordMissing | Stub setup: when(testRepository.findById(1)).thenReturn(Optional.of(TestEntity.builder().id(1).build())); when(studentProfileRepository.findById(2)).thenReturn(Optional.of(StudentProfileEntity.builder().id(2).build())); when(testProgressRepository.findByTest_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of()) | assertEquals(ErrorCode.TEST_PROGRESS_NOT_EXISTS, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TPR-004 | checkCompletionCondition shouldReturnFalseWhenMaxAttemptBelowThreshold | Stub setup: when(testRepository.findById(1)).thenReturn(Optional.of(test)); when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student)); when(testProgressRepository.findByTest_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress)) | assertFalse(result); assertEquals(1, progress.getProcess()); verify(testProgressRepository).save(progress) | JUnit5 + Mockito |
| MAI-TPR-005 | checkCompletionCondition shouldReturnTrueAndUseFallbackUnlockWhenNoNextItem | Stub setup: when(testRepository.findById(1)).thenReturn(Optional.of(test)); when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student)); when(testProgressRepository.findByTest_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress)) | assertTrue(result); assertEquals(2, progress.getProcess()); verify(testProgressRepository).save(progress); verify(lessonProgressService).unLockNextCourse(course, student) | JUnit5 + Mockito |

## TestServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-TES-001 | createTest shouldThrowWhenModuleNotFound | Stub setup: when(moduleRepository.findById(10)).thenReturn(Optional.empty()); when(testConverter.toEntity(request, TestEntity.class)).thenReturn(TestEntity.builder().build()) | assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TES-002 | createTest shouldSetModuleAndSave | Mock values: 'Mini Test'. Stub setup: when(testConverter.toEntity(request, TestEntity.class)).thenReturn(entity); when(moduleRepository.findById(10)).thenReturn(Optional.of(module)) | verify(testRepository).save(captor.capture()); assertEquals(10, captor.getValue().getModule().getId()) | JUnit5 + Mockito |
| MAI-TES-003 | getTestById shouldThrowWhenNotFound | Tham so truyen vao: testId=1; stub setup: when(testRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TES-004 | getTestById shouldReturnConvertedResponse | Mock values: 'A'. Stub setup: when(testRepository.findById(1)).thenReturn(Optional.of(entity)); when(testConverter.toResponse(entity, TestResponse.class)).thenReturn(expected) | assertEquals(1, actual.getId()); assertEquals("A", actual.getName()) | JUnit5 + Mockito |
| MAI-TES-005 | createFirstTest shouldSaveMappedEntity | Mock values: 'First Test'. Stub setup: when(testConverter.toEntity(request, TestEntity.class)).thenReturn(entity) | verify(testRepository).save(entity) | JUnit5 + Mockito |
| MAI-TES-006 | getFirstTestsSummery shouldConvertEveryEntity | Mock values: 'FIRST_TEST'. Stub setup: when(testRepository.findByType("FIRST_TEST")).thenReturn(List.of(e1, e2)); when(testConverter.toResponseSummery(e1)).thenReturn(TestResponse.builder().id(1).build()); when(testConverter.toResponseSummery(e2)).thenReturn(TestResponse.builder().id(2).build()) | assertEquals(2, result.size()) | JUnit5 + Mockito |
| MAI-TES-007 | commpletedStar shouldReturnZeroWhenNoAttempt | Tham so truyen vao: testId=1, studentProfileId=1; stub testAttemptRepository.findByTestIdAndStudentProfileId tra ve List.rong(). | assertEquals(0, star) | JUnit5 + Mockito |
| MAI-TES-008 | commpletedStar shouldReturnThreeForPerfectScore | Stub setup: when(testAttemptRepository.findByTestIdAndStudentProfileId(2, 2)).thenReturn(List.of(attempt)) | assertEquals(3, star) | JUnit5 + Mockito |
| MAI-TES-009 | commpletedStar shouldReturnTwoForScoreFromSeventy | Stub setup: when(testAttemptRepository.findByTestIdAndStudentProfileId(3, 3)).thenReturn(List.of(attempt)) | assertEquals(2, star) | JUnit5 + Mockito |
| MAI-TES-010 | commpletedStar shouldReturnOneForPositiveLowScore | Stub setup: when(testAttemptRepository.findByTestIdAndStudentProfileId(4, 4)).thenReturn(List.of(attempt)) | assertEquals(1, star) | JUnit5 + Mockito |
| MAI-TES-011 | getTestAttemptIds shouldReturnEmptyWhenNoAttemptExists | Tham so truyen vao: testId=6, studentProfileId=6; stub testAttemptRepository.findByTestIdAndStudentProfileId tra ve List.rong(). | assertEquals(0, ids.size()) | JUnit5 + Mockito |
| MAI-TES-012 | getTestAttemptIds shouldReturnAllAttemptIds | Stub setup: when(testAttemptRepository.findByTestIdAndStudentProfileId(6, 6)).thenReturn(List.of(a1, a2)) | assertEquals(List.of(10, 11), ids) | JUnit5 + Mockito |
| MAI-TES-013 | isLock shouldReturnTrueWhenCourseStatusIsLock | Mock values: 'LOCK'. Stub setup: when(testRepository.findById(7)).thenReturn(Optional.of(test)); when(enrollmentcourseRepository.findStatus(8, 70)).thenReturn("LOCK") | assertTrue(service.isLock(7, 8)) | JUnit5 + Mockito |
| MAI-TES-014 | isLock shouldReturnFalseWhenCourseStatusDone | Mock values: 'DONE'. Stub setup: when(testRepository.findById(8)).thenReturn(Optional.of(test)); when(enrollmentcourseRepository.findStatus(9, 80)).thenReturn("DONE") | assertFalse(service.isLock(8, 9)) | JUnit5 + Mockito |
| MAI-TES-015 | isLock shouldReturnTrueWhenCourseUnlockedButNoProgress | Mock values: 'UNLOCK'. Stub setup: when(testRepository.findById(9)).thenReturn(Optional.of(test)); when(enrollmentcourseRepository.findStatus(10, 90)).thenReturn("UNLOCK"); when(testProgressRepository.findByTest_IdAndStudentProfile_Id(9, 10)).thenReturn(List.of()) | assertTrue(service.isLock(9, 10)) | JUnit5 + Mockito |
| MAI-TES-016 | isLock shouldReturnFalseWhenCourseUnlockedAndHasProgress | Mock values: 'UNLOCK'. Stub setup: when(testRepository.findById(10)).thenReturn(Optional.of(test)); when(enrollmentcourseRepository.findStatus(11, 100)).thenReturn("UNLOCK"); when(testProgressRepository.findByTest_IdAndStudentProfile_Id(10, 11)).thenReturn(List.of(TestProgressEntity.builder().process(0).build())) | assertFalse(service.isLock(10, 11)) | JUnit5 + Mockito |
| MAI-TES-017 | isCompletedTest shouldReturnFalseWhenNoProgressRecord | Tham so truyen vao: testId=20, studentProfileId=21; stub testProgressRepository tra ve List.rong(). | assertFalse(service.isCompletedTest(20, 21)) | JUnit5 + Mockito |
| MAI-TES-018 | isCompletedTest shouldReturnFalseWhenProcessIsOne | Tham so truyen vao: testId=22, studentProfileId=23; stub process=1. | assertFalse(service.isCompletedTest(22, 23)) | JUnit5 + Mockito |
| MAI-TES-019 | isCompletedTest shouldReturnTrueWhenProcessIsTwo | Tham so truyen vao: testId=24, studentProfileId=25; stub process=2. | assertTrue(service.isCompletedTest(24, 25)) | JUnit5 + Mockito |
| MAI-TES-020 | deleteTest shouldDelegateToRepository | Tham so truyen vao: testId=66; khong can stub bo sung. | verify(testRepository).deleteById(66) | JUnit5 + Mockito |

## TextToSpeechServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-TTS-001 | generateSpeech shouldThrowRuntimeWhenConfigurationInvalid | Mock values: 'subscriptionKey', 'region', 'hello' | assertThrows(RuntimeException.class, () -> service.generateSpeech("hello")) | JUnit5 + Mockito |

## TrackServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-TRS-001 | findAll shouldConvertEveryTrackEntity | Mock values: '0-300', '300-600', 'ALL'. Stub setup: when(trackRepository.findAll()).thenReturn(List.of(trackA, trackB)); when(trackConverter.toResponse(any(TrackEntity.class), eq(TrackResponse.class))) .thenAnswer(invocation -> TrackResponse.builder().code(invocation.getArgument(0, TrackEntity.class).getCode()).build()) | assertEquals(2, result.size()); assertEquals("0-300", result.get(0).getCode()); assertEquals("300-600", result.get(1).getCode()) | JUnit5 + Mockito |
| MAI-TRS-002 | getCoursesByTrackCode shouldThrowWhenTrackNotFound | Mock values: 'NOT_FOUND', 'ALL' | assertEquals(ErrorCode.TRACK_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TRS-003 | getCoursesByTrackCode shouldReturnConvertedTrackResponse | Mock values: '0-300', 'Starter', 'ALL'. Stub setup: when(trackRepository.findByCode("0-300")).thenReturn(Optional.of(track)); when(trackConverter.toTrackResponseWithCourses(track, "ALL")).thenReturn(expected) | assertEquals("0-300", actual.getCode()); assertEquals("Starter", actual.getName()) | JUnit5 + Mockito |
| MAI-TRS-004 | trackDauTienChuaHoanThanhVaMoKhoa shouldThrowWhenStudentHasNoEnrollment | Tham so truyen vao: studentProfileId=123; stub setup: when(enrollmentRepository.findByStudentProfile_Id(123)).thenReturn(List.of()). | assertEquals(ErrorCode.STUDENT_NOT_HAVE_ENROLLMENT, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TRS-005 | trackDauTienChuaHoanThanhVaMoKhoa shouldReturnUnlockedTrackId | Stub setup: when(enrollmentRepository.findByStudentProfile_Id(123)).thenReturn(List.of(done, unlocked)) | assertEquals(3, actual) | JUnit5 + Mockito |
| MAI-TRS-006 | getLastLessonOfTrack shouldThrowWhenTrackNotFound | Tham so truyen vao: trackId=1; stub setup: when(trackRepository.findById(1)).thenReturn(Optional.empty()). | assertEquals(ErrorCode.TRACK_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-TRS-007 | getLastLessonOfTrack shouldReturnLastLessonWhenLastModuleIsLessonType | Mock values: 'id', 'LESSON', 'type'. Stub setup: when(trackRepository.findById(1)).thenReturn(Optional.of(track)) | assertEquals(12, actual.get("id")); assertEquals("LESSON", actual.get("type")) | JUnit5 + Mockito |
| MAI-TRS-008 | getLastLessonOfTrack shouldReturnTestWhenLastModuleIsTestType | Mock values: 'Mini Test', 'id', 'TEST', 'type'. Stub setup: when(trackRepository.findById(2)).thenReturn(Optional.of(track)) | assertTrue(actual.containsKey("id")); assertEquals(22, actual.get("id")); assertEquals("TEST", actual.get("type")) | JUnit5 + Mockito |

## UserServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-USR-001 | checkEmailExistsAndSendCode shouldThrowWhenEmailAlreadyExists | Mock values: 'exists@mail.com'. Stub setup: when(userRepository.existsByEmail("exists@mail.com")).thenReturn(true) | assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-USR-002 | checkEmailExistsAndSendCode shouldSendOtpWhenEmailIsNew | Mock values: 'new@mail.com'. Stub setup: when(userRepository.existsByEmail("new@mail.com")).thenReturn(false) | verify(verificationService).sendVerificationCode("new@mail.com") | JUnit5 + Mockito |
| MAI-USR-003 | createUser shouldThrowWhenOtpInvalid | Mock values: 'student@mail.com', '000000'. Stub setup: when(verificationService.verifyCode("student@mail.com", "000000")).thenReturn(false) | assertEquals(ErrorCode.INVALID_OTP, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-USR-004 | createUser shouldThrowWhenRoleNotFound | Mock values: 'teacher@mail.com', 'TEACHER', '123456', 'ENC'. Stub setup: when(verificationService.verifyCode("teacher@mail.com", "123456")).thenReturn(true); when(passwordEncoder.encode(anyString())).thenReturn("ENC"); when(roleRepository.findByValue("TEACHER")).thenReturn(Optional.empty()) | assertEquals(ErrorCode.ROLE_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-USR-005 | createUser shouldCreateAccountWithStudentRoleWhenOtpValid | Mock values: 'student@mail.com', 'STUDENT', '123456', 'ENC'. Stub setup: when(verificationService.verifyCode("student@mail.com", "123456")).thenReturn(true); when(passwordEncoder.encode(anyString())).thenReturn("ENC"); when(roleRepository.findByValue("STUDENT")).thenReturn(Optional.of(role)) | verify(userRepository).save(any(UserEntity.class)); verify(userRoleRepository).save(any()); verify(mailService).sendMail(any(), anyString()) | JUnit5 + Mockito |
| MAI-USR-006 | changePassword shouldThrowWhenUserNotFound | Mock values: 'none@mail.com'. Stub setup: when(userRepository.findByEmail("none@mail.com")).thenReturn(Optional.empty()) | assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-USR-007 | changePassword shouldThrowWhenOldPasswordCheckFailsByCurrentLogic | Mock values: 'user@mail.com', 'old', 'stored'. Stub setup: when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user)); when(passwordEncoder.matches("stored", "old")).thenReturn(true) | assertEquals(ErrorCode.PASSWORD_NOT_MATCH, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-USR-008 | getUserByEmail shouldReturnConvertedResponse | Mock values: 'user@mail.com'. Stub setup: when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user)); when(userConverter.toResponse(user, UserRespone.class)).thenReturn(response) | assertEquals("user@mail.com", actual.getEmail()) | JUnit5 + Mockito |
| MAI-USR-009 | forGotPassword shouldThrowWhenUserNotFound | Mock values: 'none@mail.com' | assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode()) | JUnit5 + Mockito |
| MAI-USR-010 | forGotPassword shouldSendMailAndSaveNewPassword | Mock values: 'user@mail.com', 'old', 'ENC'. Stub setup: when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user)); when(passwordEncoder.encode(anyString())).thenReturn("ENC") | verify(mailService).sendMail(any(), anyString()); verify(userRepository).save(user); assertTrue("ENC".equals(user.getPassword())) | JUnit5 + Mockito |

## VerificationServiceImplTest.java

| Test Case ID | Test Objective | Input (Mock Data) | Expected Output | Notes |
|---|---|---|---|---|
| MAI-VFS-001 | sendVerificationCode shouldGenerateOtpPutCacheAndSendMail | Mock values: 'user@example.com', '\\d{6}', 'verify_email_template', 'otp' | verify(otpCache).put(eq("user@example.com"), otpCaptor.capture()); assertNotNull(generatedOtp); assertTrue(generatedOtp.matches("\\d{6}")); verify(mailService).sendMail(mailCaptor.capture(), eq("verify_email_template")) | JUnit5 + Mockito |
| MAI-VFS-002 | sendVerificationCode shouldNotThrowWhenMailServiceFails | Mock values: 'mail error', 'verify_email_template', 'user@example.com' | verify(otpCache).put(eq("user@example.com"), any(String.class)) | JUnit5 + Mockito |
| MAI-VFS-003 | verifyCode shouldReturnFalseWhenCacheHasNoOtp | Mock values: 'user@example.com', '123456' | assertFalse(actual) | JUnit5 + Mockito |
| MAI-VFS-004 | verifyCode shouldReturnTrueAndInvalidateWhenOtpMatches | Mock values: 'user@example.com', '123456' | assertTrue(actual); verify(otpCache).invalidate("user@example.com") | JUnit5 + Mockito |
| MAI-VFS-005 | verifyCode shouldReturnFalseWhenOtpDoesNotMatch | Mock values: 'user@example.com', '654321', '123456' | assertFalse(actual) | JUnit5 + Mockito |



