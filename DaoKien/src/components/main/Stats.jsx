"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

export default function Stats() {
    const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true })
    const [stats, setStats] = useState([0, 0, 0, 0])

    useEffect(() => {
        if (!inView) return

        const targets = [10000, 5000, 1000, 500]
        const intervals = targets.map((target, index) => {
            let current = 0
            return setInterval(() => {
                current += target / 50
                if (current >= target) current = target
                setStats((prev) => {
                    const updated = [...prev]
                    updated[index] = current
                    return updated
                })
            }, 30)
        })

        return () => intervals.forEach((int) => clearInterval(int))
    }, [inView])

    const statItems = [
        { label: "Học viên đã học", value: "10000+" },
        { label: "Bài giảng & tài liệu", value: "5000+" },
        { label: "Đề luyện thi TOEIC", value: "1000+" },
        { label: "Học viên đạt mục tiêu", value: "500+" },
    ]

    return (
        <section ref={ref} className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {statItems.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center text-white"
                        >
                            <h3 className="text-4xl font-bold mb-2">
                                {stats[i].toFixed(0)}+
                            </h3>
                            <p className="text-blue-100">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
