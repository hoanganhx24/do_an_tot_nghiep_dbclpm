import { useState } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar luôn hiển thị, width 48 */}
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-screen">
                {/* Navbar */}
                <AdminNavbar />

                {/* Main content */}
                <main className="flex-1 mt-16 p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}