import {
  checkExitPlanStudy,
  createPlan,
  getInformationAboutStudyplan,
  getMinDayForStudy,
  getStudyPlanDetail,
  getStudyPlanOverview,
  verifyInformation,
} from "./StudyPlanService";
import { getId } from "../components/token";
import { get, post } from "../utils/request";

jest.mock("../components/token", () => ({
  getId: jest.fn(),
}));

jest.mock("../utils/request", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("StudyPlanService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getId.mockReturnValue(321);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-001
  test("getStudyPlanOverview should lấy studentId từ token", async () => {
    const expected = { overview: true };
    get.mockResolvedValue(expected);

    const result = await getStudyPlanOverview();

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("study-plans/overview/student/321");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-002
  test("getMinDayForStudy should ghép id kế hoạch và studentId", async () => {
    const expected = { minDay: 3 };
    get.mockResolvedValue(expected);

    const result = await getMinDayForStudy(12);

    expect(get).toHaveBeenCalledWith("study-plans/min-day-for-study/12/student/321");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-003
  test("verifyInformation should gọi post verify-information với payload", async () => {
    const payload = { targetScore: 700 };
    const expected = { valid: true };
    post.mockResolvedValue(expected);

    const result = await verifyInformation(payload);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("study-plans/verify-information", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-004
  test("createPlan should gọi post study-plans với payload", async () => {
    const payload = { weeks: 8 };
    const expected = { id: 99 };
    post.mockResolvedValue(expected);

    const result = await createPlan(payload);

    expect(getId).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("study-plans", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-005
  test("checkExitPlanStudy should gọi checkExist theo studentId", async () => {
    const expected = { exists: true };
    get.mockResolvedValue(expected);

    const result = await checkExitPlanStudy();

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("study-plans/checkExist?studentId=321");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-006
  test("getStudyPlanDetail should gọi study-plans/{id}", async () => {
    const expected = { id: 44 };
    get.mockResolvedValue(expected);

    const result = await getStudyPlanDetail(44);

    expect(get).toHaveBeenCalledWith("study-plans/44");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-007
  test("getInformationAboutStudyplan should gọi endpoint information-about-studyplan", async () => {
    const expected = { modules: [] };
    get.mockResolvedValue(expected);

    const result = await getInformationAboutStudyplan(45);

    expect(get).toHaveBeenCalledWith("study-plans/45/information-about-studyplan");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-008
  test("getStudyPlanOverview should cập nhật endpoint khi studentId thay đổi", async () => {
    getId.mockReturnValue(654);
    const expected = { overview: "new-user" };
    get.mockResolvedValue(expected);

    const result = await getStudyPlanOverview();

    expect(get).toHaveBeenCalledWith("study-plans/overview/student/654");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-009
  test("getMinDayForStudy should hỗ trợ id dạng chuỗi", async () => {
    const expected = { minDay: 10 };
    get.mockResolvedValue(expected);

    const result = await getMinDayForStudy("plan-alpha");

    expect(get).toHaveBeenCalledWith(
      "study-plans/min-day-for-study/plan-alpha/student/321"
    );
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-STUDYPLAN-010
  test("verifyInformation should throw khi API reject", async () => {
    const payload = { targetScore: 800 };
    post.mockRejectedValue(new Error("Invalid profile"));

    await expect(verifyInformation(payload)).rejects.toThrow("Invalid profile");
  });
});