import {
  getListSuggest,
  getSearchInDictionary,
  getStudentDictionary,
  saveStudentDictionary,
} from "./VocaService";
import { getId } from "../components/token";
import { get, post } from "../utils/request";

jest.mock("../components/token", () => ({
  getId: jest.fn(),
}));

jest.mock("../utils/request", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("VocaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getId.mockReturnValue(202);
  });

  // Test Case ID: TC-NGAN-VOCA-001
  test("getListSuggest should gọi dictionary/suggestion với từ khóa", async () => {
    const expected = ["apple", "apply"];
    get.mockResolvedValue(expected);

    const result = await getListSuggest("app");

    expect(get).toHaveBeenCalledWith("dictionary/suggestion?word=app");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-002
  test("getListSuggest should giữ nguyên chuỗi có khoảng trắng", async () => {
    const expected = ["take off"];
    get.mockResolvedValue(expected);

    const result = await getListSuggest("take off");

    expect(get).toHaveBeenCalledWith("dictionary/suggestion?word=take off");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-003
  test("getListSuggest should hoạt động khi từ khóa rỗng", async () => {
    const expected = [];
    get.mockResolvedValue(expected);

    const result = await getListSuggest("");

    expect(get).toHaveBeenCalledWith("dictionary/suggestion?word=");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-004
  test("getSearchInDictionary should gọi endpoint có word và studentId", async () => {
    const expected = { word: "bank" };
    get.mockResolvedValue(expected);

    const result = await getSearchInDictionary("bank");

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("dictionary?word=bank&&studentId=202");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-005
  test("getSearchInDictionary should hỗ trợ từ có ký tự đặc biệt", async () => {
    const expected = { word: "can't" };
    get.mockResolvedValue(expected);

    const result = await getSearchInDictionary("can't");

    expect(get).toHaveBeenCalledWith("dictionary?word=can't&&studentId=202");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-006
  test("saveStudentDictionary should gọi post student-dictionarys với object payload", async () => {
    const payload = { word: "focus" };
    const expected = { saved: true };
    post.mockResolvedValue(expected);

    const result = await saveStudentDictionary(payload);

    expect(post).toHaveBeenCalledWith("student-dictionarys", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-007
  test("saveStudentDictionary should gọi post student-dictionarys với string payload", async () => {
    const payload = "achieve";
    const expected = { saved: true };
    post.mockResolvedValue(expected);

    const result = await saveStudentDictionary(payload);

    expect(post).toHaveBeenCalledWith("student-dictionarys", payload);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-008
  test("getStudentDictionary should lấy studentId từ token", async () => {
    const expected = [{ id: 1 }];
    get.mockResolvedValue(expected);

    const result = await getStudentDictionary();

    expect(getId).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("student-dictionarys/student/202");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-009
  test("getStudentDictionary should thay đổi endpoint khi studentId thay đổi", async () => {
    getId.mockReturnValue(999);
    const expected = [{ id: 2 }];
    get.mockResolvedValue(expected);

    const result = await getStudentDictionary();

    expect(get).toHaveBeenCalledWith("student-dictionarys/student/999");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-VOCA-010
  test("getSearchInDictionary should throw khi API reject", async () => {
    get.mockRejectedValue(new Error("Dictionary service down"));

    await expect(getSearchInDictionary("hello")).rejects.toThrow(
      "Dictionary service down"
    );
  });
});