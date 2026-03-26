import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";

export default function ProtectedRoute({ children, requiredRole = "user" }) {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const toastShownRef = useRef(false); // Ngăn toast hiển thị nhiều lần

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setIsAuthenticated(false);
                setIsChecking(false);
                return;
            }

            setIsAuthenticated(true);
            setIsChecking(false);
        };

        checkAuth();
    }, []);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang kiểm tra xác thực...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Chỉ hiển thị toast 1 lần duy nhất
        if (!toastShownRef.current) {
            toastShownRef.current = true;
            toast.error("Vui lòng đăng nhập để tiếp tục!", {
                position: "top-center",
                autoClose: 3000,
                toastId: "login-required", // Đảm bảo toast không bị duplicate
            });
        }

        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}