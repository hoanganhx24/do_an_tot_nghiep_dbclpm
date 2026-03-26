import { parseJwt } from "./function";

let accessToken = null;
let idUser = null;

export const setAccessToken = (token) => {
    accessToken=token;
    localStorage.setItem("accessToken",token);
}

export const getAccessToken = () => {
    accessToken=localStorage.getItem("accessToken");
    return accessToken;
};

let refreshToken = null;

export const setRefreshToken = (token) => {
    refreshToken=token;
    localStorage.setItem("refreshToken",token);
}

export const getRefreshToken = () => {
    refreshToken = localStorage.getItem("refreshToken");
    return refreshToken;
};

export const setId = (id) => {
    const obj = parseJwt(getAccessToken());
    idUser=obj.id;
}

export const getId = () => {
    const obj = parseJwt(getAccessToken());
    idUser = obj.id;
    return idUser;
};