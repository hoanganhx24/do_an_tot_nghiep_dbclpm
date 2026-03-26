"use client"

import { motion } from "framer-motion"

export default function Features() {
    const features = [
        {
            icon: "🎧",
            title: "Luyện Nghe TOEIC",
            description:
                "Kho bài nghe chuẩn quốc tế, giọng đọc đa dạng giúp bạn cải thiện phản xạ và kỹ năng Listening toàn diện.",
            link: "Xem chi tiết",
        },
        {
            icon: "📖",
            title: "Luyện Đọc Hiệu Quả",
            description:
                "Hệ thống câu hỏi Reading được phân loại theo chủ đề và độ khó, kèm giải thích chi tiết cho từng đáp án.",
            link: "Xem chi tiết",
        },
        {
            icon: "📊",
            title: "Phân Tích Kết Quả",
            description:
                "Theo dõi tiến độ học tập, phân tích điểm mạnh – điểm yếu và gợi ý lộ trình phù hợp cho từng mục tiêu.",
            link: "Xem thêm",
        },
    ]

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    }

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 mb-4">{feature.description}</p>
                            <a
                                href="#"
                                className="text-blue-600 font-semibold hover:text-blue-700"
                            >
                                {feature.link}
                            </a>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
