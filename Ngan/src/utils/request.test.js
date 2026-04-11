import {
  API_DOMAIN,
  check,
  del,
  get,
  get2,
  login,
  patch,
  post,
  postFormData,
  put,
  put2,
  putFormData,
  refresh,
} from "./request";
import { getAccessToken } from "../components/token";

jest.mock("../components/token", () => ({
  getAccessToken: jest.fn(),
}));

const mockFetchPayload = (payload) => {
  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(payload),
  });
};

describe("request utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAccessToken.mockReturnValue("mock-access-token");
  });

  // Test Case ID: TC-NGAN-REQ-001
  test("should expose API_DOMAIN as localhost backend URL", () => {
    expect(API_DOMAIN).toBe("http://localhost:8081/");
  });

  // Test Case ID: TC-NGAN-REQ-002
  test("get should call fetch with GET + Authorization header and return parsed JSON", async () => {
    const expected = { success: true, data: [1, 2, 3] };
    mockFetchPayload(expected);

    const result = await get("courses");

    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/courses", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock-access-token",
      },
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-003
  test("get2 should call fetch with GET without Authorization header and return parsed JSON", async () => {
    const expected = { success: true };
    mockFetchPayload(expected);

    const result = await get2("users/public");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/users/public", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-004
  test("post should call fetch with POST + JSON body + Authorization and return parsed JSON", async () => {
    const payload = { name: "Toeic" };
    const expected = { id: 10, ...payload };
    mockFetchPayload(expected);

    const result = await post("courses", payload);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/courses", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock-access-token",
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-005
  test("del should call fetch with DELETE + Authorization and return parsed JSON", async () => {
    const expected = { deleted: true };
    mockFetchPayload(expected);

    const result = await del("courses/15");

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/courses/15", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer mock-access-token",
      },
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-006
  test("patch should call fetch with PATCH + JSON body + Authorization and return parsed JSON", async () => {
    const payload = { published: true };
    const expected = { updated: true };
    mockFetchPayload(expected);

    const result = await patch("courses/15", payload);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/courses/15", {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock-access-token",
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-007
  test("login should call fetch with POST + JSON body and no Authorization header", async () => {
    const payload = { email: "user@example.com", password: "123456" };
    const expected = { token: "abc" };
    mockFetchPayload(expected);

    const result = await login("auth/login", payload);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-008
  test("refresh should call fetch with POST and raw refreshToken body object then return parsed JSON", async () => {
    const expected = { token: "new-access-token" };
    mockFetchPayload(expected);

    const result = await refresh("auth/refresh-token", "refresh-token-value");

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/auth/refresh-token", {
      method: "POST",
      body: {
        refreshToken: "refresh-token-value",
      },
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-009
  test("put should call fetch with PUT + Authorization and return parsed JSON", async () => {
    const expected = { status: "ok" };
    mockFetchPayload(expected);

    const result = await put("courses/publish/1");

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/courses/publish/1", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock-access-token",
      },
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-010
  test("put2 should call fetch with PUT + JSON body + Authorization and return parsed JSON", async () => {
    const payload = { title: "New title" };
    const expected = { updated: true };
    mockFetchPayload(expected);

    const result = await put2("courses", payload);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/courses", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock-access-token",
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-011
  test("check should call fetch with POST + JSON body and return parsed JSON", async () => {
    const payload = { email: "check@example.com" };
    const expected = { exists: false };
    mockFetchPayload(expected);

    const result = await check("users/check-email", payload);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/users/check-email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-012
  test("postFormData should call fetch with POST + FormData + Authorization and return parsed JSON", async () => {
    const formData = new FormData();
    formData.append("file", "demo-content");
    const expected = { uploaded: true };
    mockFetchPayload(expected);

    const result = await postFormData("uploads", formData);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/uploads", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer mock-access-token",
      },
      body: formData,
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-013
  test("putFormData should call fetch with PUT + FormData + Authorization and return parsed JSON", async () => {
    const formData = new FormData();
    formData.append("name", "lesson");
    const expected = { updated: true };
    mockFetchPayload(expected);

    const result = await putFormData("lessons", formData);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8081/lessons", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer mock-access-token",
      },
      body: formData,
    });
    expect(result).toEqual(expected);
  });

  // Test Case ID: TC-NGAN-REQ-014
  test("postFormData and putFormData should not manually set Content-Type header", async () => {
    const expected = { done: true };
    mockFetchPayload(expected);
    const formData = new FormData();

    await postFormData("form-data-1", formData);
    await putFormData("form-data-2", formData);

    const postCallOptions = fetch.mock.calls[0][1];
    const putCallOptions = fetch.mock.calls[1][1];
    expect(postCallOptions.headers["Content-Type"]).toBeUndefined();
    expect(putCallOptions.headers["Content-Type"]).toBeUndefined();
  });
});