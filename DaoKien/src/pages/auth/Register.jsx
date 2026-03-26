import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// API Configuration
// const API_DOMAIN = "http://10.237.245.202:8081/";
export const API_DOMAIN = "http://localhost:8081/";

// API Service
const AuthService = {
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
    }
};

// Register Component
const RegisterComponent = () => {
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleRegister = async () => {
        if (!formData.email || !formData.fullName) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email không hợp lệ');
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

        if (formData.otp.length !== 6) {
            setError('Mã OTP phải có 6 số');
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
                setSuccess('Đăng ký thành công! Tài khoản đã được gửi về email của bạn');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setError('Xác thực không thành công. Vui lòng kiểm tra lại mã OTP');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            if (!showOtpModal) {
                handleRegister();
            } else {
                handleVerifyOtp();
            }
        }
    };

    const handleCloseModal = () => {
        setShowOtpModal(false);
        setFormData(prev => ({ ...prev, otp: '' }));
        setError('');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-5">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
                        <span className="text-4xl">📝</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Đăng ký tài khoản</h1>
                <p className="text-center text-gray-600 mb-8">Web Học Tiếng Anh</p>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="example@email.com"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    )}

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : (
                            '→ Đăng ký'
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Bạn đã có tài khoản?</span>
                    <Link to="/login"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-200"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                                <span className="text-3xl">🔐</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Xác thực OTP</h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Mã xác thực đã được gửi về email <strong>{formData.email}</strong>
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                                Nhập mã OTP (6 số)
                            </label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                                maxLength={6}
                                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 text-center text-2xl tracking-widest font-mono font-bold"
                                placeholder="• • • • • •"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">{success}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={loading}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </span>
                                ) : (
                                    'Xác nhận'
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Không nhận được mã? <button className="text-blue-600 hover:underline font-medium">Gửi lại</button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterComponent;