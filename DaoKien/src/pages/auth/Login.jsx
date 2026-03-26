import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// API Configuration
// const API_DOMAIN = "http://10.237.245.202:8081/";
export const API_DOMAIN = "http://localhost:8081/";

// Export logout function để sử dụng ở component khác
export const logout = () => {
    localStorage.clear();
    window.location.href = "/";
};

// Token Management
const TokenManager = {
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

    logout: () => {
        localStorage.clear();
        window.location.reload();
    }
};

// API Service
const AuthService = {
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
    }
};

// Login Component
const LoginComponent = () => {
    const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [redirecting, setRedirecting] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    // Hàm chuyển hướng dựa vào role
    const redirectByRole = (role) => {
        setRedirecting(true);
        setTimeout(() => {
            if (role === "ADMIN") {
                window.location.href = "/admin";
            } else if (role === "TEACHER") {
                window.location.href = "/teacher/courses";
            } else if (role === "STUDENT") {
                window.location.href = "/user";
            }
        }, 1500);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.login(formData.email, formData.password);

            if (response.code === 200) {
                TokenManager.setAccessToken(response.data.token.trim());
                TokenManager.setRefreshToken(response.data.refreshToken.trim());

                const userPayload = TokenManager.parseJwt(response.data.token);

                if (userPayload) {
                    TokenManager.setRole(userPayload.role);
                    setUserInfo({
                        id: userPayload.id,
                        email: userPayload.sub,
                        role: userPayload.role
                    });
                    setIsLoggedIn(true);

                    // Chuyển hướng dựa vào role
                    redirectByRole(userPayload.role);
                }
            } else if (response.code === 1015) {
                setError('Tài khoản đã bị vô hiệu hóa');
                setLoading(false);
            } else {
                setError('Tài khoản hoặc mật khẩu không đúng!');
                setLoading(false);
            }
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại');
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            if (view === 'login') {
                handleLogin();
            } else if (view === 'register') {
                handleRegister();
            } else if (view === 'forgot') {
                handleForgotPassword();
            }
        }
    };

    const handleRegister = async () => {
        if (!formData.email || !formData.fullName) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.checkEmail(formData.email);

            if (response.code === 200) {
                setShowOtpModal(true);
                setLoading(false);
            } else {
                setError(response.message || 'Không tìm thấy email');
                setLoading(false);
            }
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại');
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp) {
            setError('Vui lòng nhập mã OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.register(
                formData.email,
                formData.fullName,
                formData.otp
            );

            if (response.code === 200) {
                setSuccess('Tài khoản đã được gửi về email của bạn');
                setTimeout(() => {
                    setShowOtpModal(false);
                    setView('login');
                    setFormData({ email: '', password: '', fullName: '', otp: '' });
                    setSuccess('');
                }, 2000);
            } else {
                setError('Xác thực không thành công');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            setError('Vui lòng nhập email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.forgotPassword(formData.email);

            if (response.code === 200) {
                setSuccess('Mật khẩu mới đã được gửi về email của bạn');
                setTimeout(() => {
                    setView('login');
                    setFormData({ email: '', password: '', fullName: '', otp: '' });
                    setSuccess('');
                }, 2000);
            } else {
                setError(response.message || 'Không tìm thấy email');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        TokenManager.logout();
        setIsLoggedIn(false);
        setUserInfo(null);
        setFormData({ email: '', password: '' });
    };

    // Kiểm tra token khi component mount
    useEffect(() => {
        const token = TokenManager.getAccessToken();
        if (token) {
            const userPayload = TokenManager.parseJwt(token);
            if (userPayload) {
                setUserInfo({
                    id: userPayload.id,
                    email: userPayload.sub,
                    role: userPayload.role
                });
                setIsLoggedIn(true);
            }
        }
    }, []);

    if (redirecting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang chuyển hướng...</h2>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (isLoggedIn && userInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
                <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-green-600">Đăng nhập thành công!</h2>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-sm font-semibold text-gray-600">Email:</span>
                            <span className="text-sm font-medium text-gray-900">{userInfo.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-sm font-semibold text-gray-600">Vai trò:</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                {userInfo.role}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-sm font-semibold text-gray-600">ID:</span>
                            <span className="text-sm font-medium text-gray-900">{userInfo.id}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Đăng xuất
                    </button>

                    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Access Token:</p>
                        <div className="text-xs text-gray-500 font-mono break-all bg-white p-2 rounded">
                            {TokenManager.getAccessToken()?.substring(0, 50)}...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100">
                        <span className="text-4xl">🎓</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Đăng nhập</h1>
                <p className="text-center text-gray-600 mb-8">Web Học Tiếng Anh</p>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tài khoản (Email)
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Nhập email của bạn"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Nhập mật khẩu"
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang đăng nhập...
                            </span>
                        ) : (
                            '→ Đăng nhập'
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition duration-200">
                        Quên mật khẩu?
                    </Link>

                    <Link to="/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition duration-200">
                        Tạo tài khoản mới
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginComponent;