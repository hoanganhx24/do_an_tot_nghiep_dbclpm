"use client"

import { motion } from "framer-motion"

export default function Instructors() {
    const instructors = [
        { name: "Thầy A", role: "Giảng viên TOEIC 900+", emoji: "👨‍🏫" },
        { name: "Cô B", role: "Chuyên gia Reading – Listening", emoji: "👩‍🏫" },
        { name: "Thầy C", role: "Chuyên viên phân tích đề thi", emoji: "📘" },
        { name: "Cô D", role: "Biên soạn giáo trình TOEIC", emoji: "📝" },
    ]

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-blue-600 text-sm font-semibold">
                        ĐỘI NGŨ GIẢNG VIÊN
                    </span>
                    <h2 className="text-4xl font-bold text-gray-900 mt-2">
                        Giảng Viên Đồng Hành Cùng Bạn
                    </h2>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Học cùng đội ngũ giảng viên kinh nghiệm, sở hữu chứng chỉ TOEIC từ 900+ trở lên, 
                        giúp bạn nắm chắc chiến lược làm bài và tăng điểm nhanh chóng.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {instructors.map((instructor, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition text-center p-6"
                        >
                            <div className="text-6xl mb-4">{instructor.emoji}</div>
                            <h3 className="text-xl font-bold text-gray-900">{instructor.name}</h3>
                            <p className="text-blue-600 font-semibold mt-2">{instructor.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
