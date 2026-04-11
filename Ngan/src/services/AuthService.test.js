import {
  checkCode,
  checkCodeTeacher,
  checkEmail,
  forgetPassword,
  getUser,
  loginUser,
  refreshToken,
  saveToken,
  updatePassword,
  updateUser,
} from "./AuthService";
import { parseJwt } from "../components/function";
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../components/token";
import { check, get, get2, login, put2, refresh } from "../utils/request";

jest.mock("../components/function", () => ({
  parseJwt: jest.fn(),
}));

jest.mock("../components/token", () => ({
  getRefreshToken: jest.fn(),
  setAccessToken: jest.fn(),
  setRefreshToken: jest.fn(),
}));

jest.mock("../utils/request", () => ({
  check: jest.fn(),
  get: jest.fn(),
  get2: jest.fn(),
  login: jest.fn(),
  put2: jest.fn(),
  refresh: jest.fn(),
}));

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case ID: TC-NGAN-AUTH-001
  test("loginUser should call login API with auth/login endpoint and return API response", async () => {
    const input = { email: "user@example.com", password: "123456" };
    const expected = { accessToken: "token-1" };
    login.mockResolvedValue(expected);

    const result = await loginUser(input);

    expect(login).toHaveBeenCalledWith("auth/login", input);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-002
  test("refreshToken should read refresh token then call refresh API and return API response", async () => {
    getRefreshToken.mockReturnValue("refresh-token-value");
    const expected = { accessToken: "new-token" };
    refresh.mockResolvedValue(expected);

    const result = await refreshToken();

    expect(getRefreshToken).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith(
      "auth/refresh-token",
      "refresh-token-value"
    );
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-003
  test("saveToken should persist both access token and refresh token", () => {
    saveToken("access-1", "refresh-1");

    expect(setAccessToken).toHaveBeenCalledWith("access-1");
    expect(setRefreshToken).toHaveBeenCalledWith("refresh-1");
  });

  // Test Case ID: TC-NGAN-AUTH-004
  test("checkEmail should call check endpoint users/check-email with input payload", async () => {
    const input = { email: "check@example.com" };
    const expected = { exists: false };
    check.mockResolvedValue(expected);

    const result = await checkEmail(input);

    expect(check).toHaveBeenCalledWith("users/check-email", input);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-005
  test("checkCode should call check endpoint studentprofiles/create with input payload", async () => {
    const input = { code: "ABC123" };
    const expected = { valid: true };
    check.mockResolvedValue(expected);

    const result = await checkCode(input);

    expect(check).toHaveBeenCalledWith("studentprofiles/create", input);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-006
  test("checkCodeTeacher should call check endpoint verify/otp with input payload", async () => {
    const input = { otp: "123456" };
    const expected = { verified: true };
    check.mockResolvedValue(expected);

    const result = await checkCodeTeacher(input);

    expect(check).toHaveBeenCalledWith("verify/otp", input);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-007
  test("getUser should decode refresh token email and call users/{email} endpoint", async () => {
    getRefreshToken.mockReturnValue("refresh-token");
    parseJwt.mockReturnValue({ sub: "student@example.com" });
    const expected = { id: 1, email: "student@example.com" };
    get.mockResolvedValue(expected);

    const result = await getUser();

    expect(parseJwt).toHaveBeenCalledWith("refresh-token");
    expect(get).toHaveBeenCalledWith("users/student@example.com");
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-008
  test("updateUser should call put2 users endpoint with input payload", async () => {
    const input = { fullName: "Updated Name" };
    const expected = { updated: true };
    put2.mockResolvedValue(expected);

    const result = await updateUser(input);

    expect(put2).toHaveBeenCalledWith("users", input);
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-009
  test("updatePassword should merge decoded email into payload and call users/password endpoint", async () => {
    const input = { oldPassword: "old-pass", newPassword: "new-pass" };
    getRefreshToken.mockReturnValue("refresh-token");
    parseJwt.mockReturnValue({ sub: "student@example.com" });
    const expected = { updated: true };
    put2.mockResolvedValue(expected);

    const result = await updatePassword(input);

    expect(put2).toHaveBeenCalledWith("users/password", {
      oldPassword: "old-pass",
      newPassword: "new-pass",
      email: "student@example.com",
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-AUTH-010
  test("forgetPassword should call get2 users/forgotPassword/{email} endpoint", async () => {
    const email = "student@example.com";
    const expected = { sent: true };
    get2.mockResolvedValue(expected);

    const result = await forgetPassword(email);

    expect(get2).toHaveBeenCalledWith("users/forgotPassword/student@example.com");
    expect(result).toEqual(expected);
  });
});