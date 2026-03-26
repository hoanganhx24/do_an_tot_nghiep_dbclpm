"use client"

import { motion } from "framer-motion"

export default function Testimonials() {
    const testimonials = [
        {
            name: "Ngọc Anh",
            role: "Học viên TOEIC 650+",
            emoji: "👩",
            text: "Nhờ học trên nền tảng này, mình đã tăng từ 350 lên 650 chỉ trong 2 tháng. Bài học dễ hiểu và có lộ trình rõ ràng!",
            rating: 5,
        },
        {
            name: "Minh Tuấn",
            role: "Sinh viên",
            emoji: "👨",
            text: "Mình rất thích phần luyện đề mô phỏng TOEIC. Giao diện đẹp, âm thanh rõ và giống hệt thi thật!",
            rating: 5,
        },
        {
            name: "Quỳnh Như",
            role: "Nhân viên văn phòng",
            emoji: "👩‍💼",
            text: "Giáo viên giải thích cực kỳ dễ hiểu, đặc biệt là các mẹo làm bài Listening. Rất đáng để đầu tư!",
            rating: 5,
        },
    ]

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-blue-600 text-sm font-semibold">CẢM NHẬN HỌC VIÊN</span>
                    <h2 className="text-4xl font-bold text-gray-900 mt-2">Học viên nói gì về ToeicEdu?</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition"
                        >
                            <div className="text-4xl mb-4">{testimonial.emoji}</div>
                            <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                            <p className="text-blue-600 text-sm mb-4">{testimonial.role}</p>
                            <p className="text-gray-600 mb-4">{testimonial.text}</p>
                            <div className="flex gap-1">
                                {[...Array(testimonial.rating)].map((_, j) => (
                                    <span key={j} className="text-yellow-400">
                                        ⭐
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
