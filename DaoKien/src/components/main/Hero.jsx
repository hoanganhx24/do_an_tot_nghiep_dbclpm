"use client"

import { motion } from "framer-motion"

export default function Hero() {
    const floatingDots = [
        { top: "10%", left: "20%", delay: 0 },
        { top: "30%", left: "80%", delay: 0.2 },
        { top: "50%", left: "15%", delay: 0.4 },
        { top: "70%", left: "85%", delay: 0.6 },
        { top: "60%", left: "50%", delay: 0.3 },
    ]

    const floatingVariants = {
        animate: {
            y: [0, -20, 0],
            transition: { duration: 4, repeat: Number.POSITIVE_INFINITY },
        },
    }

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden pt-20">

            {/* Floating Dots */}
            {floatingDots.map((dot, i) => (
                <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-blue-500 rounded-full"
                    style={{ top: dot.top, left: dot.left }}
                    variants={floatingVariants}
                    animate="animate"
                    transition={{ delay: dot.delay }}
                />
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <span className="text-blue-600 text-sm font-semibold">Chào mừng đến với ToeicEdu!</span>

                        <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mt-4 mb-6">
                            Bắt đầu hành trình <span className="text-blue-600">chinh phục TOEIC</span> ngay hôm nay
                        </h2>

                        <p className="text-gray-600 text-lg mb-8">
                            Nền tảng học và luyện thi TOEIC hiện đại với hệ thống bài tập, đề thi mô phỏng chuẩn quốc tế,
                            giúp bạn nâng cao Listening & Reading nhanh chóng và hiệu quả.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                        >
                            Bắt đầu ngay
                        </motion.button>

                        {/* Discount Badge */}
                        {/* <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 mt-12"
                        >
                            <img src="/student-studying.png" alt="Student" className="w-16 h-16 rounded-lg" />
                            <div>
                                <p className="font-bold text-gray-900">20%</p>
                                <p className="text-gray-600 text-sm">Ưu đãi cho học viên mới</p>
                            </div>
                        </motion.div> */}
                    </motion.div>

                    {/* Right Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative flex justify-center"
                    >
                        <div className="relative w-72 h-72">

                            {/* Outer Circle */}
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full"></div>

                            {/* Inner Circle with Image */}
                            <div className="absolute inset-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full 
                                            flex items-center justify-center overflow-hidden">
                                <img 
                                    src="/images/student.jpg" 
                                    alt="Hero Student" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
