import {
  createCourse,
  createLessionOfModule,
  createModuleOfCourse,
  createTestOfModule,
  deleteLessonOfModule,
  deleteModuleOfCourse,
  deleteTestOfModule,
  getDetailCourse,
  getDetailCourseStudent,
  getHistoryMiniTest,
  getIteractiveExercises,
  getLesson,
  getLessonAdminTeacher,
  getLessonIdNext,
  getLessonIdPrevious,
  getLessonPath,
  getListCoursesOfAdmin,
  getListCoursesOfStudent,
  getListCoursesOfTeacher,
  getMaxOrderOfCourse,
  getMiniTestStar,
  getMiniTestSummary,
  getOrderIndexOfLesson,
  publicCourse,
  saveProcessLesson,
  updateLessionOfModule,
  updateModuleOfCourse,
} from "./CourseService";
import { getId } from "../components/token";
import {
  del,
  get,
  patch,
  post,
  postFormData,
  put,
  put2,
  putFormData,
} from "../utils/request";

jest.mock("../components/token", () => ({
  getId: jest.fn(),
}));

jest.mock("../utils/request", () => ({
  del: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
  post: jest.fn(),
  postFormData: jest.fn(),
  put: jest.fn(),
  put2: jest.fn(),
  putFormData: jest.fn(),
}));

describe("CourseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getId.mockReturnValue(888);
  });

  // Test Case ID: TC-NGAN-COURSE-001
  test("getListCoursesOfTeacher should call đúng endpoint teacher", async () => {
    const expected = [{ id: 1 }];
    get.mockResolvedValue(expected);

    const result = await getListCoursesOfTeacher("ACTIVE", 15);

    expect(get).toHaveBeenCalledWith(
      "tracks/courses/teacher?type=ACTIVE&&teacherId=15"
    );
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-002
  test("getListCoursesOfAdmin should call đúng endpoint admin", async () => {
    const expected = [{ id: 2 }];
    get.mockResolvedValue(expected);

    const result = await getListCoursesOfAdmin("DRAFT");

    expect(get).toHaveBeenCalledWith("tracks/courses?type=DRAFT");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-003
  test("getListCoursesOfStudent should call đúng endpoint enrollments", async () => {
    const expected = [{ id: 3 }];
    get.mockResolvedValue(expected);

    const result = await getListCoursesOfStudent(99);

    expect(get).toHaveBeenCalledWith("enrollments/student/99");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-004
  test("getDetailCourse should gọi endpoint không có version khi version undefined", async () => {
    const expected = { id: 10 };
    get.mockResolvedValue(expected);

    const result = await getDetailCourse(10);

    expect(get).toHaveBeenCalledWith("courses/teacher?courseId=10");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-005
  test("getDetailCourse should giữ version=0 trong query", async () => {
    const expected = { id: 10, version: 0 };
    get.mockResolvedValue(expected);

    const result = await getDetailCourse(10, 0);

    expect(get).toHaveBeenCalledWith("courses/teacher?courseId=10&&version=0");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-006
  test("getDetailCourse should gọi endpoint có version khi version > 0", async () => {
    const expected = { id: 10, version: 2 };
    get.mockResolvedValue(expected);

    const result = await getDetailCourse(10, 2);

    expect(get).toHaveBeenCalledWith("courses/teacher?courseId=10&&version=2");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-007
  test("getDetailCourseStudent should gọi endpoint course + student", async () => {
    const expected = { id: 5 };
    get.mockResolvedValue(expected);

    const result = await getDetailCourseStudent(5, 20);

    expect(get).toHaveBeenCalledWith("courses/5/student/20");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-008
  test("createCourse should gọi postFormData với đường dẫn courses", async () => {
    const formData = new FormData();
    const expected = { created: true };
    postFormData.mockResolvedValue(expected);

    const result = await createCourse(formData);

    expect(postFormData).toHaveBeenCalledWith("courses", formData);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-009
  test("getMaxOrderOfCourse should gọi modules/maxOrder/{id}", async () => {
    const expected = { maxOrder: 6 };
    get.mockResolvedValue(expected);

    const result = await getMaxOrderOfCourse(7);

    expect(get).toHaveBeenCalledWith("modules/maxOrder/7");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-010
  test("createModuleOfCourse should gọi post modules", async () => {
    const payload = { moduleName: "M1" };
    const expected = { id: 101 };
    post.mockResolvedValue(expected);

    const result = await createModuleOfCourse(payload);

    expect(post).toHaveBeenCalledWith("modules", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-011
  test("updateModuleOfCourse should gọi put2 modules", async () => {
    const payload = { id: 101, moduleName: "M1 updated" };
    const expected = { updated: true };
    put2.mockResolvedValue(expected);

    const result = await updateModuleOfCourse(payload);

    expect(put2).toHaveBeenCalledWith("modules", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-012
  test("deleteModuleOfCourse should gọi del modules/{id}", async () => {
    const expected = { deleted: true };
    del.mockResolvedValue(expected);

    const result = await deleteModuleOfCourse(101);

    expect(del).toHaveBeenCalledWith("modules/101");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-013
  test("getOrderIndexOfLesson should gọi lessons/max-order/{id}", async () => {
    const expected = { maxOrder: 9 };
    get.mockResolvedValue(expected);

    const result = await getOrderIndexOfLesson(44);

    expect(get).toHaveBeenCalledWith("lessons/max-order/44");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-014
  test("getLesson should lấy studentId từ token và gọi endpoint đúng", async () => {
    const expected = { id: 5, done: false };
    get.mockResolvedValue(expected);

    const result = await getLesson(5);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("lessons/5/student/888");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-015
  test("getLessonAdminTeacher should gọi lessons/{id}", async () => {
    const expected = { id: 15 };
    get.mockResolvedValue(expected);

    const result = await getLessonAdminTeacher(15);

    expect(get).toHaveBeenCalledWith("lessons/15");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-016
  test("createLessionOfModule should gọi postFormData lessons", async () => {
    const formData = new FormData();
    const expected = { id: 1 };
    postFormData.mockResolvedValue(expected);

    const result = await createLessionOfModule(formData);

    expect(postFormData).toHaveBeenCalledWith("lessons", formData);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-017
  test("updateLessionOfModule should gọi putFormData lessons", async () => {
    const formData = new FormData();
    const expected = { updated: true };
    putFormData.mockResolvedValue(expected);

    const result = await updateLessionOfModule(formData);

    expect(putFormData).toHaveBeenCalledWith("lessons", formData);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-018
  test("createTestOfModule should gọi post tests", async () => {
    const payload = { lessonId: 12 };
    const expected = { id: 9 };
    post.mockResolvedValue(expected);

    const result = await createTestOfModule(payload);

    expect(post).toHaveBeenCalledWith("tests", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-019
  test("deleteTestOfModule should gọi del tests/{id}", async () => {
    const expected = { deleted: true };
    del.mockResolvedValue(expected);

    const result = await deleteTestOfModule(19);

    expect(del).toHaveBeenCalledWith("tests/19");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-020
  test("publicCourse should gọi put courses/publish/{id}", async () => {
    const expected = { published: true };
    put.mockResolvedValue(expected);

    const result = await publicCourse(20);

    expect(put).toHaveBeenCalledWith("courses/publish/20");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-021
  test("getLessonPath should gọi lessons/path/{id}", async () => {
    const expected = { path: [] };
    get.mockResolvedValue(expected);

    const result = await getLessonPath(21);

    expect(get).toHaveBeenCalledWith("lessons/path/21");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-022
  test("getLessonIdNext should gọi endpoint next-lessonID đúng query", async () => {
    const expected = { nextId: 8 };
    get.mockResolvedValue(expected);

    const result = await getLessonIdNext(10, "lesson");

    expect(get).toHaveBeenCalledWith("lessons/next-lessonID?id=10&&type=lesson");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-023
  test("getLessonIdPrevious should gọi endpoint previous-lessonID đúng query", async () => {
    const expected = { previousId: 4 };
    get.mockResolvedValue(expected);

    const result = await getLessonIdPrevious(10, "lesson");

    expect(get).toHaveBeenCalledWith(
      "lessons/previous-lessonID?id=10&&type=lesson"
    );
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-024
  test("getMiniTestSummary should gọi tests/miniTest/summary/{id}", async () => {
    const expected = { score: 80 };
    get.mockResolvedValue(expected);

    const result = await getMiniTestSummary(31);

    expect(get).toHaveBeenCalledWith("tests/miniTest/summary/31");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-025
  test("getMiniTestStar should ghép studentId từ token vào endpoint", async () => {
    const expected = { star: 3 };
    get.mockResolvedValue(expected);

    const result = await getMiniTestStar(50);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("tests/50/student/888/completedStar");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-026
  test("getHistoryMiniTest should ghép studentId từ token vào endpoint history", async () => {
    const expected = [{ id: 1 }];
    get.mockResolvedValue(expected);

    const result = await getHistoryMiniTest(50);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("tests/50/student/888/testAttempts");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-027
  test("getIteractiveExercises should ghép studentId từ token vào endpoint interactive", async () => {
    const expected = [{ id: 3 }];
    get.mockResolvedValue(expected);

    const result = await getIteractiveExercises(77);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("exercises/interactive/77/student/888");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-028
  test("saveProcessLesson should gọi post lesson-progress và trả về Promise từ request", async () => {
    const payload = { lessonId: 1, progress: 75 };
    const expected = { saved: true };
    post.mockResolvedValue(expected);

    const result = await saveProcessLesson(payload);

    expect(post).toHaveBeenCalledWith("lesson-progress", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-COURSE-029
  test("deleteLessonOfModule should gọi del lessons/{id}", async () => {
    const expected = { deleted: true };
    del.mockResolvedValue(expected);

    const result = await deleteLessonOfModule(45);

    expect(del).toHaveBeenCalledWith("lessons/45");
    expect(result).toEqual(expected);
  });
});