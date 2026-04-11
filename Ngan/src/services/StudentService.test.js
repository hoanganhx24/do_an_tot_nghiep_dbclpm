import { getListStudents } from "./StudentService";
import { get } from "../utils/request";

jest.mock("../utils/request", () => ({
  get: jest.fn(),
}));

describe("StudentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case ID: TC-NGAN-STUDENT-001
  test("getListStudents should gọi đúng endpoint studentprofiles", async () => {
    const expected = [{ id: 1 }];
    get.mockResolvedValue(expected);

    const result = await getListStudents();

    expect(get).toHaveBeenCalledWith("studentprofiles");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDENT-002
  test("getListStudents should trả về mảng kết quả khi API trả mảng", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    get.mockResolvedValue(expected);

    const result = await getListStudents();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  // Test Case ID: TC-NGAN-STUDENT-003
  test("getListStudents should xử lý trường hợp API trả về mảng rỗng", async () => {
    get.mockResolvedValue([]);

    const result = await getListStudents();

    expect(result).toEqual([]);
  });

  // Test Case ID: TC-NGAN-STUDENT-004
  test("getListStudents should trả về object phân trang khi backend trả object", async () => {
    const expected = { content: [{ id: 1 }], totalElements: 1 };
    get.mockResolvedValue(expected);

    const result = await getListStudents();

    expect(result).toEqual(expected);
    expect(result.totalElements).toBe(1);
  });

  // Test Case ID: TC-NGAN-STUDENT-005
  test("getListStudents should throw khi request bị reject", async () => {
    const error = new Error("Network error");
    get.mockRejectedValue(error);

    await expect(getListStudents()).rejects.toThrow("Network error");
  });

  // Test Case ID: TC-NGAN-STUDENT-006
  test("getListStudents should gọi request đúng 1 lần mỗi lần thực thi", async () => {
    get.mockResolvedValue([{ id: 3 }]);

    await getListStudents();

    expect(get).toHaveBeenCalledTimes(1);
  });

  // Test Case ID: TC-NGAN-STUDENT-007
  test("getListStudents should gọi lại endpoint ở lần gọi thứ hai", async () => {
    get.mockResolvedValue([{ id: 4 }]);

    await getListStudents();
    await getListStudents();

    expect(get).toHaveBeenNthCalledWith(1, "studentprofiles");
    expect(get).toHaveBeenNthCalledWith(2, "studentprofiles");
    expect(get).toHaveBeenCalledTimes(2);
  });

  // Test Case ID: TC-NGAN-STUDENT-008
  test("getListStudents should gọi endpoint không kèm query params", async () => {
    get.mockResolvedValue([{ id: 5 }]);

    await getListStudents();

    const [path] = get.mock.calls[0];
    expect(path).toBe("studentprofiles");
    expect(path.includes("?")).toBe(false);
  });

  // Test Case ID: TC-NGAN-STUDENT-009
  test("getListStudents should cho phép backend trả null", async () => {
    get.mockResolvedValue(null);

    const result = await getListStudents();

    expect(result).toBeNull();
  });

  // Test Case ID: TC-NGAN-STUDENT-010
  test("getListStudents should giữ nguyên reference object từ API", async () => {
    const expected = { data: [{ id: 9 }], meta: { page: 1 } };
    get.mockResolvedValue(expected);

    const result = await getListStudents();

    expect(result).toBe(expected);
  });
});