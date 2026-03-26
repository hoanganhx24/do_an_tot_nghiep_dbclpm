import { getAccessToken} from "../components/token";

export const API_DOMAIN = "http://localhost:8081/";

export const get = async (path) => {
    const token = getAccessToken(); 

    const response = await fetch(API_DOMAIN + path, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
        }
    });

    const result = await response.json();
    return result;
};


export const get2 = async (path) => {
    const token = getAccessToken(); 

    const response = await fetch(API_DOMAIN + path, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    });

    const result = await response.json();
    return result;
};

export const post = async (path, options) => {
    const token = getAccessToken(); 
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers:{
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(options), 
    });
    const result = await response.json();
    return result;
}

export const del = async (path) => {
    const token = getAccessToken(); 
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
    const result = await response.json();
    return result;
}

export const patch = async (path, options) => {
    const token = getAccessToken(); 
    const response = await fetch(API_DOMAIN + path, {
        method: "PATCH",
        headers:{
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(options), 
    });
    const result = await response.json();
    return result;
}

export const login = async (path, options) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers:{
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(options), 
    });
    const result = await response.json();
    return result;
}

export const refresh = async (path,data) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        body: {
            refreshToken: data
        },
    });
    const result = await response.json();
    return result;
}

export const put = async (path) => {
    const token = getAccessToken(); 
    const response = await fetch(API_DOMAIN + path, {
        method: "PUT",
        headers:{
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
    });
    const result = await response.json();
    return result;
}

export const put2 = async (path,options) => {
    const token = getAccessToken(); 
    const response = await fetch(API_DOMAIN + path, {
        method: "PUT",
        headers:{
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(options), 
    });
    const result = await response.json();
    return result;
}


export const check = async (path, options) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers:{
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(options), 
    });
    const result = await response.json();
    return result;
}

export const postFormData = async (path, formData) => {
    const token = getAccessToken();

    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, 
        },
        body: formData,
    });

    const result = await response.json();
    return result;
};

export const putFormData = async (path, formData) => {
    const token = getAccessToken();

    const response = await fetch(API_DOMAIN + path, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, 
        },
        body: formData,
    });

    const result = await response.json();
    return result;
};