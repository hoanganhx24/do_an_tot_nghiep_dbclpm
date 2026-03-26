import { LayoutDashboard, Users, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
        { name: "Questions", icon: <FileText size={20} />, path: "/admin/questionsmanager" },
        { name: "Exams", icon: <FileText size={20} />, path: "/admin/exammanager" },
        { name: "Comments", icon: <FileText size={20} />, path: "/admin/commentmanager" },
        // { name: "Users", icon: <Users size={20} />, path: "/admin/users" },
    ];

    return (
        <div className="w-48 h-screen bg-blue-50 shadow-lg flex flex-col sticky top-0">
            {/* Logo / header */}
            <div className="flex justify-center items-center h-16 border-b border-blue-200">
                <span className="font-bold text-lg text-blue-800">Admin Panel</span>
            </div>

            {/* Menu */}
            <ul className="mt-6 space-y-2 px-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li key={item.name}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 p-3 rounded-md text-blue-900 hover:bg-blue-200 transition-colors ${isActive ? "bg-blue-200 font-semibold" : ""
                                    }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
