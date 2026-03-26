import { useState } from 'react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // const API_DOMAIN = "http://10.185.176.202:8081/";
    const API_DOMAIN = "http://localhost:8081/";

    const forgetPassword = async (email) => {
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
        } catch (err) {
            console.error("Forgot password error:", err);
            return { code: 500, message: "Lỗi kết nối đến server" };
        }
    };

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleSubmit = async () => {
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await forgetPassword(email);

            if (response.code === 200) {
                setShowSuccessModal(true);
            } else {
                setError(response.message || 'Không tìm thấy email trong hệ thống');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSubmit();
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-5">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-100">
                        <span className="text-4xl">🔑</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Quên mật khẩu</h1>
                <p className="text-center text-gray-600 mb-8">
                    Nhập email của bạn để nhận mật khẩu mới
                </p>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="example@email.com"
                            autoFocus
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

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang gửi...
                            </span>
                        ) : (
                            '→ Lấy lại mật khẩu'
                        )}
                    </button>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Lưu ý:</p>
                                <p>Mật khẩu mới sẽ được gửi về email của bạn. Vui lòng kiểm tra hộp thư đến và cả thư spam.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Nhớ mật khẩu?</span>
                    <a
                        href="/"
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 transition duration-200"
                    >
                        Đăng nhập
                    </a>
                </div>
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Thành công!</h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Mật khẩu mới đã được gửi về email <strong>{email}</strong>
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold">Vui lòng kiểm tra:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Hộp thư đến</li>
                                        <li>Thư spam/rác</li>
                                        <li>Có thể mất vài phút để nhận email</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCloseSuccessModal}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                        >
                            Đồng ý, về trang đăng nhập
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordPage;