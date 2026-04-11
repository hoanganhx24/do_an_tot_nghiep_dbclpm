import {
  createExerciseOfTeacherLesson,
  createExerciseOfTest,
  createQuestionOfExercise,
  createQuestionOfExerciseTest,
  deleteExerciseOfTeacherLesson,
  deleteExerciseOfTest,
  deleteQuestionOfExercise,
  deleteQuestionOfExerciseTest,
  getExerciseDetailOfLessonStudent,
  getListExercisesOfLessonStudent,
  getListExercisesOfTeacherLesson,
  getListExercisesOfTest,
  getListQuestionOfExercise,
  getListQuestionOfExerciseTest,
  saveAnswerEx,
  updateExerciseOfTeacherLesson,
  updateExerciseOfTest,
  updateQuestionOfExercise,
  updateQuestionOfExerciseTest,
} from "./ExerciseService";
import { getId } from "../components/token";
import { del, get, post, postFormData, put2, putFormData } from "../utils/request";

jest.mock("../components/token", () => ({
  getId: jest.fn(),
}));

jest.mock("../utils/request", () => ({
  del: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  postFormData: jest.fn(),
  put2: jest.fn(),
  putFormData: jest.fn(),
}));

describe("ExerciseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getId.mockReturnValue(777);
  });

  // Test Case ID: TC-NGAN-EXERCISE-001
  test("getListExercisesOfTeacherLesson should gọi endpoint summary của lesson", async () => {
    const expected = [{ id: 1 }];
    get.mockResolvedValue(expected);

    const result = await getListExercisesOfTeacherLesson(9);

    expect(get).toHaveBeenCalledWith("exercises/lesson/9/summary");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-002
  test("createExerciseOfTeacherLesson should gọi postFormData exercises", async () => {
    const payload = new FormData();
    const expected = { created: true };
    postFormData.mockResolvedValue(expected);

    const result = await createExerciseOfTeacherLesson(payload);

    expect(postFormData).toHaveBeenCalledWith("exercises", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-003
  test("updateExerciseOfTeacherLesson should gọi putFormData exercises", async () => {
    const payload = new FormData();
    const expected = { updated: true };
    putFormData.mockResolvedValue(expected);

    const result = await updateExerciseOfTeacherLesson(payload);

    expect(putFormData).toHaveBeenCalledWith("exercises", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-004
  test("createQuestionOfExercise should gọi postFormData questions", async () => {
    const payload = new FormData();
    const expected = { id: 10 };
    postFormData.mockResolvedValue(expected);

    const result = await createQuestionOfExercise(payload);

    expect(postFormData).toHaveBeenCalledWith("questions", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-005
  test("updateQuestionOfExercise should gọi putFormData questions", async () => {
    const payload = new FormData();
    const expected = { ok: true };
    putFormData.mockResolvedValue(expected);

    const result = await updateQuestionOfExercise(payload);

    expect(putFormData).toHaveBeenCalledWith("questions", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-006
  test("getListQuestionOfExercise should gọi endpoint exercises/{id}", async () => {
    const expected = { questions: [] };
    get.mockResolvedValue(expected);

    const result = await getListQuestionOfExercise(22);

    expect(get).toHaveBeenCalledWith("exercises/22");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-007
  test("deleteQuestionOfExercise should gọi del questions/{id}", async () => {
    const expected = { deleted: true };
    del.mockResolvedValue(expected);

    const result = await deleteQuestionOfExercise(23);

    expect(del).toHaveBeenCalledWith("questions/23");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-008
  test("deleteExerciseOfTeacherLesson should gọi del exercises/{id}", async () => {
    const expected = { deleted: true };
    del.mockResolvedValue(expected);

    const result = await deleteExerciseOfTeacherLesson(24);

    expect(del).toHaveBeenCalledWith("exercises/24");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-009
  test("getListExercisesOfTest should gọi assessments/test/{id}/summary", async () => {
    const expected = [{ id: 25 }];
    get.mockResolvedValue(expected);

    const result = await getListExercisesOfTest(25);

    expect(get).toHaveBeenCalledWith("assessments/test/25/summary");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-010
  test("createExerciseOfTest should gọi postFormData assessments", async () => {
    const payload = new FormData();
    const expected = { id: 26 };
    postFormData.mockResolvedValue(expected);

    const result = await createExerciseOfTest(payload);

    expect(postFormData).toHaveBeenCalledWith("assessments", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-011
  test("updateExerciseOfTest should gọi putFormData assessments", async () => {
    const payload = new FormData();
    const expected = { updated: true };
    putFormData.mockResolvedValue(expected);

    const result = await updateExerciseOfTest(payload);

    expect(putFormData).toHaveBeenCalledWith("assessments", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-012
  test("deleteExerciseOfTest should gọi del assessments/{id}", async () => {
    const expected = { deleted: true };
    del.mockResolvedValue(expected);

    const result = await deleteExerciseOfTest(27);

    expect(del).toHaveBeenCalledWith("assessments/27");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-013
  test("getListQuestionOfExerciseTest should gọi assessments/{id}", async () => {
    const expected = { questions: [1, 2] };
    get.mockResolvedValue(expected);

    const result = await getListQuestionOfExerciseTest(28);

    expect(get).toHaveBeenCalledWith("assessments/28");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-014
  test("createQuestionOfExerciseTest should gọi postFormData assessmentquesstions", async () => {
    const payload = new FormData();
    const expected = { created: true };
    postFormData.mockResolvedValue(expected);

    const result = await createQuestionOfExerciseTest(payload);

    expect(postFormData).toHaveBeenCalledWith("assessmentquesstions", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-015
  test("updateQuestionOfExerciseTest should gọi putFormData assessmentquesstions", async () => {
    const payload = new FormData();
    const expected = { updated: true };
    putFormData.mockResolvedValue(expected);

    const result = await updateQuestionOfExerciseTest(payload);

    expect(putFormData).toHaveBeenCalledWith("assessmentquesstions", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-016
  test("deleteQuestionOfExerciseTest should gọi del assessmentquesstions/{id}", async () => {
    const expected = { deleted: true };
    del.mockResolvedValue(expected);

    const result = await deleteQuestionOfExerciseTest(29);

    expect(del).toHaveBeenCalledWith("assessmentquesstions/29");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-017
  test("getListExercisesOfLessonStudent should ghép studentId từ token", async () => {
    const expected = [{ id: 30 }];
    get.mockResolvedValue(expected);

    const result = await getListExercisesOfLessonStudent(30);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("exercises/lesson/30/student/777");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-018
  test("getExerciseDetailOfLessonStudent should ghép query studentProfileId", async () => {
    const expected = { id: 31 };
    get.mockResolvedValue(expected);

    const result = await getExerciseDetailOfLessonStudent(31);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("exercises/student?id=31&&studentProfileId=777");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-EXERCISE-019
  test("saveAnswerEx should gọi put2 attempts", async () => {
    const payload = { attemptId: 100, answer: "A" };
    const expected = { saved: true };
    put2.mockResolvedValue(expected);

    const result = await saveAnswerEx(payload);

    expect(put2).toHaveBeenCalledWith("attempts", payload);
    expect(result).toEqual(expected);
  });
});