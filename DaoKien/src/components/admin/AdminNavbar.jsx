import { useState, useRef, useEffect } from "react";
import { Menu, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { logout } from "../../pages/auth/Login";

export default function AdminNavbar({ onToggleSidebar }) {
    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef(null);

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

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md flex items-center justify-between px-6 z-50">

            {/* Left: Menu + Title */}
            <div className="flex items-center">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 mr-4 rounded-md hover:bg-gray-100 transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
            </div>

            {/* Right: Avatar + Dropdown */}
            <div className="relative" ref={menuRef}>
                <div
                    onClick={() => setOpenMenu(!openMenu)}
                    className="w-10 h-10 bg-purple-200 text-purple-700 flex items-center justify-center rounded-full font-semibold cursor-pointer hover:ring-2 ring-purple-400 transition"
                >
                    A
                </div>

                {openMenu && (
                    <div className="absolute right-0 mt-3 w-40 bg-white shadow-xl rounded-lg border border-gray-100 py-2 animate-fade">
                        <button
                            onClick={() => {
                                logout();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition text-left"
                        >
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
