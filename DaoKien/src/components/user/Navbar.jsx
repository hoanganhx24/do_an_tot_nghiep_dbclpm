import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onToggleSidebar }) {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [userInitial, setUserInitial] = useState("U");
    const [userEmail, setUserEmail] = useState("");
    const menuRef = useRef(null);

    // Lấy thông tin user từ token
    useEffect(() => {
        const parseJwt = (token) => {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join(''));
                return JSON.parse(jsonPayload);
            } catch (e) {
                return null;
            }
        };

        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            const decoded = parseJwt(refreshToken);
            if (decoded && decoded.sub) {
                const email = decoded.sub;
                setUserEmail(email);
                // Lấy chữ cái đầu tiên của email (trước @)
                const initial = email.charAt(0).toUpperCase();
                setUserInitial(initial);
            }
        }
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
    };

    return (
        <nav className="bg-white text-black shadow fixed top-0 left-0 w-full z-50">
            <div className="w-full px-6 py-3 flex justify-between items-center">

                {/* Left: Menu + Logo */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onToggleSidebar}
                        className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>

                    <Link to="/user">
                        <h1 className="text-2xl font-bold text-slate-900 cursor-pointer">
                            <span className="text-blue-600">TOEIC</span>EDU
                        </h1>
                    </Link>
                </div>

                {/* Right: Avatar */}
                <div className="flex items-center space-x-4">
                    {/* Avatar + Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <div
                            onClick={() => setOpenMenu(!openMenu)}
                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center rounded-full font-bold cursor-pointer hover:ring-2 ring-blue-400 transition shadow-md hover:shadow-lg"
                            title={userEmail}
                        >
                            {userInitial}
                        </div>

                        {openMenu && (
                            <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-lg border border-gray-100 py-2 animate-fade-in z-50">
                                {/* User Info Header */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {userEmail || "Người dùng"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Tài khoản của bạn
                                    </p>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <Link
                                        to="/user/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-gray-700"
                                        onClick={() => setOpenMenu(false)}
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        <span className="text-sm font-medium">Trang cá nhân</span>
                                    </Link>

                                    <Link
                                        to="/user/changepassword"
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-gray-700"
                                        onClick={() => setOpenMenu(false)}
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                        <span className="text-sm font-medium">Đổi mật khẩu</span>
                                    </Link>
                                </div>

                                {/* Logout */}
                                <div className="border-t border-gray-100 pt-1">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-red-600 text-left"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                        </svg>
                                        <span className="text-sm font-medium">Đăng xuất</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </nav>
    );
}