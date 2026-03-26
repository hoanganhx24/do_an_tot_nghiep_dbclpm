
import { setAccessToken, setRefreshToken } from "./token";

export function parseJwt(token) {
  // JWT có dạng: header.payload.signature
  const base64Url = token.split(".")[1]; // Lấy phần payload
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export const logout = () => {
  setAccessToken(null);
  setRefreshToken(null);
  localStorage.clear();
  window.location.href = "/client/login";
};
