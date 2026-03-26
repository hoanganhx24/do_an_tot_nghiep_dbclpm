"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 bg-white shadow-md"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-shrink-0"
                    >
                        <h1 className="text-2xl font-bold text-slate-900">
                            <span className="text-blue-600">TOEIC</span>EDU
                        </h1>
                    </motion.div>

                    <nav className="hidden md:flex space-x-8">
                        {["Trang chủ", "Về chúng tôi", "Khoá học", "Liên hệ"].map((item, i) => (
                            <motion.a
                                key={item}
                                href="#"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                whileHover={{ color: "#2563eb" }}
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                {item}
                            </motion.a>
                        ))}
                    </nav>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                        <Link to="/login">Login</Link>
                    </motion.button>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
                        ☰
                    </button>
                </div>

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden pb-4 space-y-2"
                    >
                        {["Home", "About", "Courses", "Contact"].map((item) => (
                            <a key={item} href="#" className="block text-gray-700 hover:text-blue-600">
                                {item}
                            </a>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.header>
    )
}
