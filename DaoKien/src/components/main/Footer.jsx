"use client"

import { motion } from "framer-motion"

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 text-white py-12"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            <span className="text-blue-400">TOEIC</span>EDU
                        </h3>
                        <p className="text-gray-400">
                            Nền tảng học và luyện thi TOEIC hiện đại – hiệu quả – sát đề thi thật.
                        </p>
                    </div>

                    {/* Links */}
                    {[
                        {
                            title: "Nền tảng học",
                            links: ["Giới thiệu", "Lộ trình học", "Khóa học TOEIC", "Đội ngũ giảng viên"],
                        },
                        {
                            title: "Hỗ trợ",
                            links: ["Liên hệ", "Câu hỏi thường gặp", "Hướng dẫn sử dụng", "Điều khoản & Chính sách"],
                        },
                        {
                            title: "Bản tin",
                            links: ["Đăng ký để nhận thông báo về khóa học và đề thi mới nhất"],
                        },
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="font-semibold mb-4">{col.title}</h4>
                            <ul className="space-y-2">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="text-gray-400 hover:text-white transition">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500">2025 TOEICEDU</p>

                    <div className="flex gap-4 mt-4 md:mt-0">
                        {["Facebook", "Twitter", "LinkedIn", "Instagram"].map((social, i) => (
                            <a key={i} href="#" className="text-gray-400 hover:text-blue-400 transition">
                                {social}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </motion.footer>
    )
}
