import {
  createTeacher,
  deleteTeacher,
  getListTeachers,
  getListTeachersActive,
  getTeacherDetail,
  updateTeacher,
} from "./TeacherService";
import { get, patch, post, put, put2 } from "../utils/request";

jest.mock("../utils/request", () => ({
  get: jest.fn(),
  patch: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  put2: jest.fn(),
}));

describe("TeacherService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case ID: TC-NGAN-TEACHER-001
  test("getListTeachers should gọi endpoint teacherprofiles", async () => {
    const expected = [{ id: 1 }];
    get.mockResolvedValue(expected);

    const result = await getListTeachers();

    expect(get).toHaveBeenCalledWith("teacherprofiles");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-002
  test("getListTeachersActive should gọi endpoint teacherprofiles/active", async () => {
    const expected = [{ id: 2 }];
    get.mockResolvedValue(expected);

    const result = await getListTeachersActive();

    expect(get).toHaveBeenCalledWith("teacherprofiles/active");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-003
  test("getTeacherDetail should gọi endpoint teachers/{id} với id số", async () => {
    const expected = { id: 3 };
    get.mockResolvedValue(expected);

    const result = await getTeacherDetail(3);

    expect(get).toHaveBeenCalledWith("teachers/3");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-004
  test("getTeacherDetail should hỗ trợ id dạng chuỗi", async () => {
    const expected = { id: "abc" };
    get.mockResolvedValue(expected);

    const result = await getTeacherDetail("abc");

    expect(get).toHaveBeenCalledWith("teachers/abc");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-005
  test("createTeacher should gọi post teacherprofiles/create", async () => {
    const payload = { fullName: "Nguyen Van A" };
    const expected = { created: true };
    post.mockResolvedValue(expected);

    const result = await createTeacher(payload);

    expect(post).toHaveBeenCalledWith("teacherprofiles/create", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-006
  test("updateTeacher should gọi put2 teacherprofiles", async () => {
    const payload = { id: 1, fullName: "Le Thi B" };
    const expected = { updated: true };
    put2.mockResolvedValue(expected);

    const result = await updateTeacher(payload);

    expect(put2).toHaveBeenCalledWith("teacherprofiles", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-007
  test("deleteTeacher should gọi put teacherprofiles/{id}/terminate", async () => {
    const expected = { terminated: true };
    put.mockResolvedValue(expected);

    const result = await deleteTeacher(10);

    expect(put).toHaveBeenCalledWith("teacherprofiles/10/terminate");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-008
  test("createTeacher should throw khi backend reject", async () => {
    const payload = { fullName: "" };
    post.mockRejectedValue(new Error("Validation failed"));

    await expect(createTeacher(payload)).rejects.toThrow("Validation failed");
  });

  // Test Case ID: TC-NGAN-TEACHER-009
  test("updateTeacher should xử lý payload rỗng", async () => {
    const payload = {};
    const expected = { updated: false };
    put2.mockResolvedValue(expected);

    const result = await updateTeacher(payload);

    expect(put2).toHaveBeenCalledWith("teacherprofiles", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-TEACHER-010
  test("deleteTeacher should hỗ trợ id bằng 0", async () => {
    const expected = { terminated: false };
    put.mockResolvedValue(expected);

    const result = await deleteTeacher(0);

    expect(put).toHaveBeenCalledWith("teacherprofiles/0/terminate");
    expect(result).toEqual(expected);
  });
});