import { X, BookOpen, ClipboardList } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    const menuItems = [
        { name: "TOEIC Study", icon: <BookOpen size={20} />, path: "http://localhost:3000" },
        { name: "TOEIC Practice", icon: <ClipboardList size={20} />, path: "/user/tests" },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r transform
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                transition-transform duration-300 z-40 flex flex-col`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-700"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Nội dung chính */}
            <nav className="flex flex-col mt-4 space-y-2 px-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all
                        ${location.pathname === item.path
                                ? "bg-blue-100 text-blue-600 font-medium"
                                : "text-gray-800 hover:bg-gray-100 hover:text-blue-600"
                            }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            {/* <div className="mt-auto border-t p-3 text-center text-sm text-gray-500">
                © 2025 TOEIC App
            </div> */}
        </div>
    );
}
