"use client"

import Header from "../components/main/Header"
import Hero from "../components/main/Hero"
import Features from "../components/main/Features"
import Stats from "../components/main/Stats"
import About from "../components/main/About"
import Instructors from "../components/main/Instructors"
import Testimonials from "../components/main/Testimonials"
import Footer from "../components/main/Footer"

export default function LandingPage() {
    return (
        <main className="bg-white">
            <Header />
            <Hero />
            <Features />
            <Stats />
            <About />
            <Instructors />
            <Testimonials />
            <Footer />
        </main>
    )
}


// import React from "react";
// import { Link } from "react-router-dom";
// import { ChevronRight, Star, LogIn } from "lucide-react";
// import { motion } from "framer-motion";

// export default function LandingPage() {
//     // Animation variants for reusable effects
//     const fadeInUp = {
//         initial: { opacity: 0, y: 50 },
//         animate: { opacity: 1, y: 0 },
//         transition: { duration: 0.6 }
//     };

//     const staggerContainer = {
//         animate: {
//             transition: {
//                 staggerChildren: 0.2
//             }
//         }
//     };

//     const staggerItem = {
//         initial: { opacity: 0, y: 50 },
//         animate: { opacity: 1, y: 0 },
//         transition: { duration: 0.6 }
//     };

//     return (
//         <div className="bg-white">
//             {/* Navigation */}
//             <motion.nav
//                 className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 shadow-md sticky top-0 z-50"
//                 initial={{ y: -100 }}
//                 animate={{ y: 0 }}
//                 transition={{ duration: 0.5 }}
//             >
//                 <div className="max-w-6xl mx-auto flex justify-between items-center">
//                     <Link to="/" className="text-2xl font-bold">
//                         LearningPro
//                     </Link>

//                     <div className="flex items-center gap-8 font-medium">
//                         <Link to="/" className="hover:text-blue-200 transition">Trang chủ</Link>
//                         <Link to="/courses" className="hover:text-blue-200 transition">Khóa học</Link>
//                         <Link to="/contact" className="hover:text-blue-200 transition">Liên hệ</Link>

//                         {/* Login button */}
//                         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                             <Link
//                                 to="/login"
//                                 className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow hover:bg-blue-50 transition"
//                             >
//                                 <LogIn size={18} /> Đăng nhập
//                             </Link>
//                         </motion.div>
//                     </div>
//                 </div>
//             </motion.nav>

//             {/* Hero */}
//             <motion.section
//                 className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-24 px-6"
//                 {...fadeInUp}
//             >
//                 <div className="max-w-5xl mx-auto text-center">
//                     <motion.h1
//                         className="text-5xl font-bold leading-tight mb-4"
//                         initial={{ opacity: 0, scale: 0.8 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.8, delay: 0.2 }}
//                     >
//                         Nền tảng học & luyện thi thông minh
//                     </motion.h1>
//                     <motion.p
//                         className="text-blue-100 mb-8 text-xl"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ duration: 0.8, delay: 0.4 }}
//                     >
//                         Công nghệ AI giúp bạn học nhanh hơn – hiểu sâu hơn – đạt điểm cao hơn
//                     </motion.p>

//                     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                         <Link
//                             to="/register"
//                             className="bg-white text-blue-700 px-10 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg inline-block"
//                         >
//                             Bắt đầu miễn phí
//                         </Link>
//                     </motion.div>
//                 </div>
//             </motion.section>

//             {/* Description */}
//             <motion.section
//                 className="bg-white py-14 px-6"
//                 {...fadeInUp}
//             >
//                 <div className="max-w-4xl mx-auto text-center">
//                     <h2 className="text-3xl font-bold text-gray-800 mb-4">
//                         Học tập hiệu quả với công nghệ hiện đại
//                     </h2>
//                     <p className="text-gray-600 text-lg">
//                         Chúng tôi cung cấp video bài giảng, bài kiểm tra, AI hỗ trợ và hệ thống theo dõi tiến độ học tập.
//                     </p>
//                 </div>
//             </motion.section>

//             {/* Feature Cards */}
//             <motion.section
//                 className="bg-gray-50 py-16 px-6"
//                 variants={staggerContainer}
//                 initial="initial"
//                 whileInView="animate"
//                 viewport={{ once: true }}
//             >
//                 <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
//                     {[
//                         { title: "Bài kiểm tra", desc: "Hàng ngàn bài tập chất lượng cao", color: "from-blue-600 to-blue-700" },
//                         { title: "Học trực tuyến", desc: "Giáo viên giỏi mọi lúc", color: "from-blue-500 to-blue-600" },
//                         { title: "Theo dõi tiến độ", desc: "Báo cáo kết quả chi tiết", color: "from-green-500 to-green-600" },
//                         { title: "Chứng chỉ", desc: "Nhận chứng chỉ sau khi hoàn thành", color: "from-yellow-400 to-yellow-500" },
//                     ].map((item, index) => (
//                         <motion.div
//                             key={index}
//                             className={`bg-gradient-to-br ${item.color} text-white p-8 rounded-2xl shadow-lg`}
//                             variants={staggerItem}
//                             whileHover={{ scale: 1.05, rotateY: 5 }}
//                             transition={{ type: "spring", stiffness: 300 }}
//                         >
//                             <h3 className="text-xl font-bold mb-3">{item.title}</h3>
//                             <p className="opacity-90">{item.desc}</p>
//                         </motion.div>
//                     ))}
//                 </div>
//             </motion.section>

//             {/* Steps */}
//             <motion.section
//                 className="bg-white py-16 px-6"
//                 variants={staggerContainer}
//                 initial="initial"
//                 whileInView="animate"
//                 viewport={{ once: true }}
//             >
//                 <div className="max-w-4xl mx-auto">
//                     <h2 className="text-3xl font-bold text-center mb-14 text-gray-800">
//                         Học tập đơn giản chỉ với 3 bước
//                     </h2>

//                     {[
//                         { step: 1, icon: "📱", text: "Đăng ký tài khoản và chọn khóa học phù hợp", reverse: false },
//                         { step: 2, icon: "📚", text: "Học video bài giảng & tài liệu chi tiết", reverse: true },
//                         { step: 3, icon: "✅", text: "Làm bài kiểm tra và nhận phản hồi ngay", reverse: false },
//                     ].map((item, index) => (
//                         <motion.div
//                             key={index}
//                             className={`mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl flex items-center gap-8 ${item.reverse ? "flex-row-reverse" : ""}`}
//                             variants={staggerItem}
//                             whileHover={{ scale: 1.02 }}
//                         >
//                             <div className="flex-1">
//                                 <h3 className="text-2xl font-bold mb-2">Bước {item.step}</h3>
//                                 <p>{item.text}</p>
//                             </div>
//                             <motion.div
//                                 className="w-40 h-40 bg-blue-500 rounded-xl flex items-center justify-center text-5xl"
//                                 whileHover={{ rotate: 10, scale: 1.1 }}
//                                 transition={{ type: "spring" }}
//                             >
//                                 {item.icon}
//                             </motion.div>
//                         </motion.div>
//                     ))}
//                 </div>
//             </motion.section>

//             {/* Testimonials */}
//             <motion.section
//                 className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 px-6"
//                 variants={staggerContainer}
//                 initial="initial"
//                 whileInView="animate"
//                 viewport={{ once: true }}
//             >
//                 <div className="max-w-4xl mx-auto text-center">
//                     <h2 className="text-3xl font-bold mb-12">Đánh giá từ học viên</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                         {[1, 2, 3, 4].map((i) => (
//                             <motion.div
//                                 key={i}
//                                 className="bg-blue-500 p-6 rounded-xl"
//                                 variants={staggerItem}
//                                 whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
//                             >
//                                 <div className="flex gap-1 mb-3">
//                                     {[...Array(5)].map((_, j) => (
//                                         <Star key={j} size={18} fill="white" className="text-yellow-300" />
//                                     ))}
//                                 </div>
//                                 <p className="mb-4">Chất lượng bài giảng tuyệt vời, hỗ trợ rất nhanh!</p>
//                                 <p className="font-semibold">Nguyễn Văn A</p>
//                             </motion.div>
//                         ))}
//                     </div>
//                 </div>
//             </motion.section>

//             {/* CTA */}
//             <motion.section
//                 className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 px-6"
//                 {...fadeInUp}
//             >
//                 <div className="max-w-4xl mx-auto text-center">
//                     <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
//                     <p className="text-blue-100 mb-8">Tham gia ngay hôm nay và trải nghiệm miễn phí</p>

//                     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                         <Link
//                             to="/register"
//                             className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center gap-2"
//                         >
//                             Bắt đầu học ngay <ChevronRight size={20} />
//                         </Link>
//                     </motion.div>
//                 </div>
//             </motion.section>

//             {/* Footer */}
//             <footer className="bg-gray-900 text-gray-300 py-16 px-6">
//                 <div className="max-w-6xl mx-auto text-center">
//                     <p className="text-gray-400">© 2025 LearningPro. All rights reserved.</p>
//                 </div>
//             </footer>
//         </div>
//     );
// }

