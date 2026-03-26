import { parseJwt } from "../components/function";
import { getRefreshToken, setAccessToken, setRefreshToken } from "../components/token";
import { check, get, get2, login, put2, refresh } from "../utils/request";

export const loginUser = async(options) => {
    const result = await login("auth/login",options);
    return result;
}

export const refreshToken = async() => {
    const refreshToken = getRefreshToken();
    const result = await refresh (`auth/refresh-token`,refreshToken);
    return result;
}

export const saveToken = (token, refresh) => {
    setAccessToken(token);
    setRefreshToken(refresh);
}

export const checkEmail = async(option) => {
    const result = await check("users/check-email",option);
    return result;
}

export const checkCode = async(option) => {
    const result = await check("studentprofiles/create",option);
    return result;
}

export const checkCodeTeacher = async(option) => {
    const result = await check("verify/otp",option);
    return result;
}

export const getUser = async() => {
    const refreshToken = getRefreshToken();
    const obj = parseJwt(refreshToken);
    const email=obj.sub;
    const result = await get (`users/${email}`);
    return result;
}

export const updateUser = async(data) => {
    const result = await put2(`users`,data);
    return result;
}

export const updatePassword = async(data) => {
    const refreshToken = getRefreshToken();
    const obj = parseJwt(refreshToken);
    const email=obj.sub;
    const value={...data,email};
    const result = await put2(`users/password`,value);
    return result;
}

export const forgetPassword = async(email) => {
    const result = await get2(`users/forgotPassword/${email}`);
    return result;
}