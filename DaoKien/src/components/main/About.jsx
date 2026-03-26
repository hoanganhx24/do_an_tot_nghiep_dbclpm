"use client"

import { motion } from "framer-motion"

export default function About() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative w-full h-96">
                            <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-200 rounded-full"></div>

                            <img
                                src="/images/team-collaborating.jpg"
                                alt="Team"
                                className="rounded-lg shadow-lg relative z-10"
                            />

                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                                className="absolute -bottom-12 -right-16
                                        bg-gradient-to-br from-blue-300 to-blue-600
                                        text-white rounded-full
                                        w-40 h-40 flex items-center justify-center 
                                        text-center font-bold text-lg z-20"
                            >
                                Hơn 5 năm kinh nghiệm
                            </motion.div>

                        </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="pl-8"   // phần này giúp lùi nội dung sang phải
                    >
                        <span className="text-blue-600 text-sm font-semibold">VỀ CHÚNG TÔI</span>

                        <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">
                            Nền tảng học và luyện thi TOEIC hiệu quả hàng đầu.
                        </h2>

                        <p className="text-gray-600 mb-4">
                            Chúng tôi mang đến hệ thống luyện thi TOEIC hiện đại, được thiết kế dựa trên cấu trúc
                            đề thi thực tế. Học viên có thể luyện tập theo từng Part, làm đề Full Test và theo dõi tiến trình học chi tiết.
                        </p>

                        <p className="text-gray-600 mb-8">
                            Với kho bài tập phong phú, giao diện thân thiện và hệ thống chấm điểm tự động,
                            nền tảng giúp bạn cải thiện Listening – Reading nhanh chóng và hiệu quả.
                            Mục tiêu của chúng tôi là giúp bạn đạt được số điểm TOEIC mong muốn trong thời gian ngắn nhất.
                        </p>

                        <div className="flex justify-center mt-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold"
                            >
                                Tìm hiểu thêm
                            </motion.button>
                        </div>

                    </motion.div>

                </div>
            </div>
        </section>
    )
}
