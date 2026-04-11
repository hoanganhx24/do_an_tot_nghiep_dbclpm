import {
  createFirstTest,
  getFirstTests,
  getFlow,
  getQuestionsHistoryOfFirstTest,
  getQuestionsOfFirstTest,
  getQuestionsOfMiniTest,
  saveResultFirstTest,
  saveResultMiniTest,
  unlock,
} from "./FirstTestService";
import { getId } from "../components/token";
import { get, post } from "../utils/request";

jest.mock("../components/token", () => ({
  getId: jest.fn(),
}));

jest.mock("../utils/request", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("FirstTestService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getId.mockReturnValue(555);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-001
  test("getFirstTests should gọi endpoint tests/firstTests/summary", async () => {
    const expected = [{ id: 1 }];
    get.mockResolvedValue(expected);

    const result = await getFirstTests({ ignored: true });

    expect(get).toHaveBeenCalledWith("tests/firstTests/summary");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-002
  test("getFirstTests should trả về mảng rỗng khi API trả về rỗng", async () => {
    get.mockResolvedValue([]);

    const result = await getFirstTests();

    expect(get).toHaveBeenCalledWith("tests/firstTests/summary");
    expect(result).toEqual([]);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-003
  test("createFirstTest should gọi post tests/firstTest với payload", async () => {
    const payload = { level: "A2" };
    const expected = { id: 2 };
    post.mockResolvedValue(expected);

    const result = await createFirstTest(payload);

    expect(post).toHaveBeenCalledWith("tests/firstTest", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-004
  test("getQuestionsOfFirstTest should gọi assessments/firsttest", async () => {
    const expected = [{ id: 3 }];
    get.mockResolvedValue(expected);

    const result = await getQuestionsOfFirstTest();

    expect(get).toHaveBeenCalledWith("assessments/firsttest");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-005
  test("getQuestionsOfMiniTest should gọi assessments/mini-test/{id}", async () => {
    const expected = [{ id: 4 }];
    get.mockResolvedValue(expected);

    const result = await getQuestionsOfMiniTest(10);

    expect(get).toHaveBeenCalledWith("assessments/mini-test/10");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-006
  test("getQuestionsOfMiniTest should xử lý id dạng chuỗi", async () => {
    const expected = [{ id: 5 }];
    get.mockResolvedValue(expected);

    const result = await getQuestionsOfMiniTest("mini-01");

    expect(get).toHaveBeenCalledWith("assessments/mini-test/mini-01");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-007
  test("getQuestionsHistoryOfFirstTest should gọi testattempt/{id}/testAttemptDetail", async () => {
    const expected = { details: [] };
    get.mockResolvedValue(expected);

    const result = await getQuestionsHistoryOfFirstTest(11);

    expect(get).toHaveBeenCalledWith("testattempt/11/testAttemptDetail");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-008
  test("saveResultFirstTest should gọi post testattempt", async () => {
    const payload = { score: 650 };
    const expected = { saved: true };
    post.mockResolvedValue(expected);

    const result = await saveResultFirstTest(payload);

    expect(post).toHaveBeenCalledWith("testattempt", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-009
  test("saveResultMiniTest should gọi post testattempt/mini-test", async () => {
    const payload = { score: 90 };
    const expected = { saved: true };
    post.mockResolvedValue(expected);

    const result = await saveResultMiniTest(payload);

    expect(post).toHaveBeenCalledWith("testattempt/mini-test", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-010
  test("getFlow should lấy studentId từ token và gọi enrollments/studyFolow/{id}", async () => {
    const expected = { flow: [] };
    get.mockResolvedValue(expected);

    const result = await getFlow();

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("enrollments/studyFolow/555");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-FIRSTTEST-011
  test("unlock should gọi post testprogress với payload", async () => {
    const payload = { lessonId: 1, unlocked: true };
    const expected = { ok: true };
    post.mockResolvedValue(expected);

    const result = await unlock(payload);

    expect(post).toHaveBeenCalledWith("testprogress", payload);
    expect(result).toEqual(expected);
  });
});