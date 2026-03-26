import { useState } from "react";
import Navbar from "../components/user/Navbar";
import Sidebar from "../components/user/Sidebar";
import Footer from "../components/user/Footer";

export default function UserLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-white text-black transition-all duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"
                    }`}
            >
                <Navbar onToggleSidebar={toggleSidebar} />

                <main className="flex-grow container mx-auto px-4 py-6 pt-20">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}
