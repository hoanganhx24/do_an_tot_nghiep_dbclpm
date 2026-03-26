// authService.js - Tách riêng tất cả logic authentication

// API Configuration
export const API_DOMAIN = "http://localhost:8081/";
// export const API_DOMAIN = "http://10.237.245.202:8081/"; // Production

// ==================== TOKEN MANAGEMENT ====================
export const TokenManager = {
    setAccessToken: (token) => {
        localStorage.setItem("accessToken", token);
    },

    getAccessToken: () => {
        return localStorage.getItem("accessToken");
    },

    setRefreshToken: (token) => {
        localStorage.setItem("refreshToken", token);
    },

    getRefreshToken: () => {
        return localStorage.getItem("refreshToken");
    },

    setRole: (role) => {
        localStorage.setItem("role", role);
    },

    getRole: () => {
        return localStorage.getItem("role");
    },

    parseJwt: (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error parsing JWT:", error);
            return null;
        }
    },

    clearAll: () => {
        localStorage.clear();
    }
};

// ==================== AUTH SERVICE ====================
export const AuthService = {
    // Đăng nhập
    login: async (email, password) => {
        try {
            const response = await fetch(API_DOMAIN + "auth/login", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Login error:", error);
            return { code: 500, message: "Lỗi kết nối đến server" };
        }
    },

    // Kiểm tra email (dùng cho đăng ký)
    checkEmail: async (email) => {
        try {
            const response = await fetch(API_DOMAIN + "users/check-email", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Check email error:", error);
            return { code: 500, message: "Lỗi kết nối đến server" };
        }
    },

    // Đăng ký tài khoản
    register: async (email, fullName, otp) => {
        try {
            const response = await fetch(API_DOMAIN + "studentprofiles/create", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, fullName, otp }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Register error:", error);
            return { code: 500, message: "Lỗi kết nối đến server" };
        }
    },

    // Quên mật khẩu
    forgotPassword: async (email) => {
        try {
            const response = await fetch(API_DOMAIN + `users/forgotPassword/${email}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Forgot password error:", error);
            return { code: 500, message: "Lỗi kết nối đến server" };
        }
    },

    // Refresh token
    refreshToken: async () => {
        try {
            const refreshToken = TokenManager.getRefreshToken();
            const response = await fetch(API_DOMAIN + "auth/refresh-token", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Refresh token error:", error);
            return { code: 500, message: "Lỗi kết nối đến server" };
        }
    }
};

// ==================== HELPER FUNCTIONS ====================

// Đăng xuất
export const logout = () => {
    TokenManager.clearAll();
    window.location.href = "/";
};

// Chuyển hướng theo role
export const redirectByRole = (role) => {
    setTimeout(() => {
        if (role === "ADMIN") {
            window.location.href = "/admin";
        } else if (role === "TEACHER") {
            window.location.href = "/teacher/courses";
        } else if (role === "STUDENT") {
            window.location.href = "/user";
        } else {
            window.location.href = "/";
        }
    }, 1500);
};

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticated = () => {
    const token = TokenManager.getAccessToken();
    if (!token) return false;
    
    const userPayload = TokenManager.parseJwt(token);
    return userPayload !== null;
};

// Lấy thông tin user từ token
export const getCurrentUser = () => {
    const token = TokenManager.getAccessToken();
    if (!token) return null;
    
    const userPayload = TokenManager.parseJwt(token);
    if (!userPayload) return null;
    
    return {
        id: userPayload.id,
        email: userPayload.sub,
        role: userPayload.role
    };
};

// Lưu token sau khi login thành công
export const saveAuthTokens = (accessToken, refreshToken, role) => {
    TokenManager.setAccessToken(accessToken.trim());
    TokenManager.setRefreshToken(refreshToken.trim());
    TokenManager.setRole(role);
};

// ==================== API REQUEST HELPERS ====================

// GET request với authentication
export const authGet = async (path) => {
    const token = TokenManager.getAccessToken();
    
    try {
        const response = await fetch(API_DOMAIN + path, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("API GET error:", error);
        return { code: 500, message: "Lỗi kết nối đến server" };
    }
};

// POST request với authentication
export const authPost = async (path, data) => {
    const token = TokenManager.getAccessToken();
    
    try {
        const response = await fetch(API_DOMAIN + path, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("API POST error:", error);
        return { code: 500, message: "Lỗi kết nối đến server" };
    }
};

// PUT request với authentication
export const authPut = async (path, data) => {
    const token = TokenManager.getAccessToken();
    
    try {
        const response = await fetch(API_DOMAIN + path, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("API PUT error:", error);
        return { code: 500, message: "Lỗi kết nối đến server" };
    }
};

// DELETE request với authentication
export const authDelete = async (path) => {
    const token = TokenManager.getAccessToken();
    
    try {
        const response = await fetch(API_DOMAIN + path, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("API DELETE error:", error);
        return { code: 500, message: "Lỗi kết nối đến server" };
    }
};