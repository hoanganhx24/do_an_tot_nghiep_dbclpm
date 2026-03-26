import { Link } from "react-router-dom";
import { FaHeadphones, FaBookOpen, FaChartLine, FaLaptopCode, FaUserGraduate, FaStar } from "react-icons/fa";

export default function Home() {
    return (
        <div className="bg-white text-gray-800">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm"></div>
                <div className="relative max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
                        Luyện thi TOEIC dễ dàng hơn bao giờ hết!
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed animate-fade-in">
                        Nền tảng luyện thi TOEIC trực tuyến giúp bạn rèn luyện kỹ năng nghe – đọc,
                        tiếp cận đề thi chuẩn quốc tế và nâng cao điểm số nhanh chóng.
                    </p>
                    <Link
                        to="/user/tests"
                        className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-md hover:bg-gray-100 transition shadow-lg"
                    >
                        Bắt đầu luyện thi ngay
                    </Link>
                </div>
            </section>

            {/* Why TOEIC */}
            <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-blue-700">Chứng chỉ TOEIC là gì?</h2>
                    <p className="leading-relaxed">
                        <strong>TOEIC</strong> (Test of English for International Communication)
                        là bài thi đánh giá khả năng sử dụng tiếng Anh trong môi trường làm việc quốc tế,
                        được tổ chức bởi <strong>ETS</strong> – tổ chức khảo thí hàng đầu thế giới.
                    </p>
                    <p className="leading-relaxed">
                        Chứng chỉ TOEIC được công nhận tại hơn <strong>150 quốc gia</strong>, là tiêu chí quan trọng
                        trong tuyển dụng, thăng tiến và du học.
                    </p>
                    <p className="leading-relaxed">
                        Bài thi TOEIC gồm 2 phần chính: <strong>Listening</strong> và <strong>Reading</strong>,
                        giúp đánh giá toàn diện khả năng hiểu và sử dụng tiếng Anh.
                    </p>
                </div>
                <div className="flex justify-center">
                    <img
                        src="/assets/toeic-intro.jpg"
                        alt="TOEIC"
                        className="rounded-xl shadow-xl w-full max-w-md hover:scale-105 transition-transform"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-blue-700 mb-4">
                        Vì sao nên chọn chúng tôi?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-10">
                        Trang web được xây dựng để giúp bạn luyện thi TOEIC hiệu quả, linh hoạt và chính xác nhất.
                    </p>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FaLaptopCode className="text-blue-600 text-3xl mb-3 mx-auto" />,
                                title: "Giao diện thân thiện",
                                desc: "Thiết kế tối giản, dễ dùng, tương thích mọi thiết bị.",
                            },
                            {
                                icon: <FaBookOpen className="text-blue-600 text-3xl mb-3 mx-auto" />,
                                title: "Đề thi chuẩn TOEIC",
                                desc: "Cập nhật thường xuyên, sát cấu trúc ETS.",
                            },
                            {
                                icon: <FaChartLine className="text-blue-600 text-3xl mb-3 mx-auto" />,
                                title: "Chấm điểm tự động",
                                desc: "Hệ thống chấm nhanh – hiển thị kết quả chi tiết từng phần.",
                            },
                            {
                                icon: <FaHeadphones className="text-blue-600 text-3xl mb-3 mx-auto" />,
                                title: "Nghe trực tuyến",
                                desc: "Hỗ trợ âm thanh rõ nét giúp luyện nghe hiệu quả.",
                            },
                            {
                                icon: <FaUserGraduate className="text-blue-600 text-3xl mb-3 mx-auto" />,
                                title: "Theo dõi tiến trình",
                                desc: "Xem lại lịch sử, thống kê điểm số và tiến bộ của bạn.",
                            },
                            {
                                icon: <FaStar className="text-blue-600 text-3xl mb-3 mx-auto" />,
                                title: "Lộ trình học cá nhân",
                                desc: "Tùy chỉnh kế hoạch học phù hợp mục tiêu điểm số.",
                            },
                        ].map((f, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300 text-center"
                            >
                                {f.icon}
                                <h3 className="text-lg font-semibold text-blue-700 mb-2">{f.title}</h3>
                                <p className="text-gray-600 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-blue-600 text-white text-center py-20">
                <h2 className="text-3xl font-bold mb-4">Sẵn sàng chinh phục TOEIC?</h2>
                <p className="mb-8 text-blue-100 max-w-xl mx-auto">
                    Bắt đầu hành trình luyện thi của bạn ngay hôm nay và đạt được điểm số mơ ước!
                </p>
                <Link
                    to="user/tests"
                    className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition shadow-md"
                >
                    Vào luyện thi ngay
                </Link>
            </section>
        </div>
    );
}