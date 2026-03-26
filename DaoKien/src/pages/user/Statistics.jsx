import { useState, useEffect } from "react";
import {
    BookOpen,
    Clock,
    Calendar,
    Target,
    TrendingUp,
    TrendingDown,
    Minus,
    Award,
    BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

export default function Statistics() {
    const [activeTab, setActiveTab] = useState("listening");
    const [selectedDays, setSelectedDays] = useState("30");
    const [selectedExamType, setSelectedExamType] = useState("");
    const [results, setResults] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [progress, setProgress] = useState(null);
    const [bestScore, setBestScore] = useState(null);
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchExamTypes();
    }, []);

    useEffect(() => {
        if (examTypes.length > 0) {
            // Set default exam type nếu chưa có
            if (!selectedExamType && examTypes.length > 0) {
                setSelectedExamType(examTypes[0].Code);
            }
            fetchAllData();
        }
    }, [selectedDays, selectedExamType, examTypes]);

    const fetchExamTypes = async () => {
        try {
            const response = await fetch(`${baseUrl}/exam-types`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Không thể tải loại đề thi");

            const data = await response.json();
            if (data.success && data.data) {
                setExamTypes(data.data);
                // Set default exam type là type đầu tiên
                if (data.data.length > 0) {
                    setSelectedExamType(data.data[0].Code);
                }
            }
        } catch (err) {
            console.error("Lỗi khi tải loại đề thi:", err);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchAttemptHistory(),
                fetchProgress(),
                fetchBestScoreByType(),
            ]);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttemptHistory = async () => {
        try {
            const response = await fetch(
                `${baseUrl}/attempts/history?submittedOnly=true`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) throw new Error("Không thể tải lịch sử thi");

            const data = await response.json();

            if (data.success && data.data) {
                const formattedResults = data.data.map((attempt) => {
                    const totalScore =
                        (attempt.ScoreReading || 0) + (attempt.ScoreListening || 0);
                    const startTime = new Date(attempt.StartedAt);
                    const endTime = new Date(attempt.SubmittedAt);
                    const timeTest = Math.round((endTime - startTime) / 60000);

                    return {
                        ID: attempt.ID,
                        ExamId: attempt.ExamID,
                        title: attempt.exam?.Title || "Bài thi không có tiêu đề",
                        totalScore,
                        ScoreReading: attempt.ScoreReading || 0,
                        ScoreListening: attempt.ScoreListening || 0,
                        ScorePercent: attempt.ScorePercent || 0,
                        StartedAt: attempt.StartedAt,
                        SubmittedAt: attempt.SubmittedAt,
                        startAt: new Date(attempt.StartedAt).toLocaleString("vi-VN"),
                        finishAt: new Date(attempt.SubmittedAt).toLocaleString("vi-VN"),
                        timeTest,
                        Type: attempt.Type,
                        // examType: attempt.exam?.examType?.Code || "Không rõ",
                        examType: attempt.exam?.examType.Description || "Không rõ",
                        examTypeCode: attempt.exam?.examType?.Code || "UNKNOWN",
                        examTypeId: attempt.exam?.examType?.ID,
                    };
                });

                setResults(formattedResults);
            }
        } catch (err) {
            console.error("Lỗi khi tải lịch sử thi:", err);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await fetch(`${baseUrl}/attempts/progress`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Không thể tải tiến độ");

            const data = await response.json();
            if (data.success) {
                setProgress(data.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải tiến độ:", err);
        }
    };

    const fetchBestScoreByType = async () => {
        try {
            // Lấy tất cả các ExamID duy nhất từ results đã lọc theo loại
            const filteredByType = getFilteredResults();
            const uniqueExamIds = [...new Set(filteredByType.map(r => r.ExamId))];
            
            if (uniqueExamIds.length === 0) {
                setBestScore(null);
                return;
            }

            // Gọi API cho từng examId và tìm điểm cao nhất
            const bestScorePromises = uniqueExamIds.map(async (examId) => {
                const response = await fetch(`${baseUrl}/attempts/best-score/${examId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) return null;

                const data = await response.json();
                return data.success ? data.data : null;
            });

            const allBestScores = await Promise.all(bestScorePromises);
            const validScores = allBestScores.filter(score => score !== null);

            if (validScores.length > 0) {
                // Tìm điểm cao nhất trong tất cả các đề
                const highest = validScores.reduce((max, current) => {
                    const currentTotal = (current.scoreListening || 0) + (current.scoreReading || 0);
                    const maxTotal = (max.scoreListening || 0) + (max.scoreReading || 0);
                    return currentTotal > maxTotal ? current : max;
                });
                setBestScore(highest);
            } else {
                setBestScore(null);
            }
        } catch (err) {
            console.error("Lỗi khi tải điểm cao nhất:", err);
            setBestScore(null);
        }
    };

    // Lọc kết quả theo loại đề thi (dùng Code)
    const getFilteredResults = () => {
        if (!selectedExamType) {
            return results;
        }
        return results.filter(r => r.examTypeCode === selectedExamType);
    };

    // Tính toán thống kê theo Listening/Reading
    const calculateTabStats = (type) => {
        const filteredResults = getFilteredResults();
        
        if (filteredResults.length === 0) {
            return {
                testsDone: 0,
                accuracy: "0%",
                avgTime: "0 phút",
                avgScore: "0/495",
                bestScore: "0/495",
            };
        }

        const scores =
            type === "listening"
                ? filteredResults.map((r) => r.ScoreListening)
                : filteredResults.map((r) => r.ScoreReading);

        const avgScore = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
        );
        const maxScore = Math.max(...scores);
        const avgTime = Math.round(
            filteredResults.reduce((sum, r) => sum + r.timeTest, 0) / filteredResults.length
        );

        return {
            testsDone: filteredResults.length,
            accuracy: `${Math.round((avgScore / 495) * 100)}%`,
            avgTime: `${avgTime} phút`,
            avgScore: `${avgScore}/495`,
            bestScore: `${maxScore}/495`,
        };
    };

    const statsData = {
        listening: calculateTabStats("listening"),
        reading: calculateTabStats("reading"),
    };

    // Dữ liệu cho biểu đồ xu hướng điểm
    const filteredResults = getFilteredResults();
    const chartData = filteredResults
        .slice()
        .reverse()
        .map((r, index) => ({
            name: `Lần ${index + 1}`,
            Listening: r.ScoreListening,
            Reading: r.ScoreReading,
            Tổng: r.totalScore,
            date: new Date(r.SubmittedAt).toLocaleDateString("vi-VN"),
        }));

    // Tính điểm trung bình cho biểu đồ tròn
    const calculateAverageScores = () => {
        const filtered = getFilteredResults();
        if (filtered.length === 0) {
            return { avgListening: 0, avgReading: 0 };
        }

        const avgListening = Math.round(
            filtered.reduce((sum, r) => sum + r.ScoreListening, 0) / filtered.length
        );
        const avgReading = Math.round(
            filtered.reduce((sum, r) => sum + r.ScoreReading, 0) / filtered.length
        );

        return { avgListening, avgReading };
    };

    const { avgListening, avgReading } = calculateAverageScores();

    // Dữ liệu cho biểu đồ tròn
    const pieData = [
        {
            name: "Listening",
            value: avgListening,
            color: "#3b82f6",
        },
        {
            name: "Reading",
            value: avgReading,
            color: "#10b981",
        },
    ];

    const getTrendIcon = (trend) => {
        if (trend === "IMPROVING") return <TrendingUp className="text-green-500" />;
        if (trend === "DECLINING") return <TrendingDown className="text-red-500" />;
        return <Minus className="text-gray-500" />;
    };

    const StatCard = ({ icon: Icon, label, value, unit, highlight = false, trend }) => (
        <div className="flex flex-col items-center justify-center p-6 text-center border rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow">
            <Icon className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <div className="flex items-center gap-2">
                <p
                    className={`${
                        highlight
                            ? "text-2xl font-bold text-blue-600"
                            : "text-2xl font-bold text-gray-800"
                    }`}
                >
                    {value}
                </p>
                {trend && getTrendIcon(trend)}
            </div>
            {unit && <p className="text-xs text-gray-500 mt-1">{unit}</p>}
        </div>
    );

    const renderWeakAreas = () => {
        if (!progress?.weakAreas) return null;

        if (Array.isArray(progress.weakAreas)) {
            return progress.weakAreas.map((area, index) => {
                if (typeof area === 'object' && area !== null) {
                    return (
                        <li key={index} className="text-gray-700">
                            • {area.type || 'N/A'}: {area.accuracy ? `${area.accuracy}%` : 'N/A'}
                        </li>
                    );
                }
                return (
                    <li key={index} className="text-gray-700">
                        • {String(area)}
                    </li>
                );
            });
        }

        if (typeof progress.weakAreas === 'object') {
            return Object.entries(progress.weakAreas).map(([key, value], index) => (
                <li key={index} className="text-gray-700">
                    • {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </li>
            ));
        }

        return <li className="text-gray-700">• {String(progress.weakAreas)}</li>;
    };

    // Tìm tên loại đề đang được chọn
    const getSelectedExamTypeName = () => {
        const examType = examTypes.find(type => type.Code === selectedExamType);
        return examType ? examType.Description : "Loại đề";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10">
            <div className="w-full max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-blue-700 mb-2 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8" />
                        Thống kê kết quả học tập
                    </h2>
                    <p className="text-gray-600">
                        Theo dõi tiến độ và phân tích kết quả luyện thi TOEIC của bạn
                    </p>
                </div>

                {/* Bộ lọc */}
                <div className="mb-8 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        📅 Lọc kết quả:
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={selectedExamType}
                            onChange={(e) => setSelectedExamType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {examTypes.map((type) => (
                                <option key={type.ID} value={type.Code}>
                                    {type.Code}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedDays}
                            onChange={(e) => setSelectedDays(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="7">7 ngày gần đây</option>
                            <option value="30">30 ngày gần đây</option>
                            <option value="90">90 ngày gần đây</option>
                            <option value="365">1 năm gần đây</option>
                            <option value="all">Tất cả</option>
                        </select>
                        
                        <button
                            onClick={fetchAllData}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            Áp dụng
                        </button>
                    </div>
                    {selectedExamType && (
                        <p className="text-sm text-gray-600 mt-3">
                            Đang hiển thị: <strong className="text-blue-700">{getSelectedExamTypeName()}</strong>
                        </p>
                    )}
                </div>

                {/* Thông tin tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        icon={BookOpen}
                        label="Số đề đã làm"
                        value={filteredResults.length}
                        unit="đề thi"
                    />
                    <StatCard
                        icon={Target}
                        label="Điểm trung bình"
                        value={filteredResults.length > 0 
                            ? Math.round(filteredResults.reduce((sum, r) => sum + r.totalScore, 0) / filteredResults.length)
                            : 0
                        }
                        unit="điểm"
                        trend={progress?.trend}
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Listening TB"
                        value={avgListening}
                        unit="/495"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Reading TB"
                        value={avgReading}
                        unit="/495"
                    />
                    <StatCard
                        icon={Award}
                        label="Điểm cao nhất"
                        value={bestScore ? (bestScore.scoreListening || 0) + (bestScore.scoreReading || 0) : 0}
                        highlight
                        unit="điểm"
                    />
                </div>

                {/* Biểu đồ xu hướng điểm */}
                {chartData.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                            📈 Xu hướng điểm số qua các lần thi
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="Listening"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Reading"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Tổng"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Biểu đồ so sánh Listening vs Reading */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Biểu đồ cột */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4">
                            📊 So sánh Listening & Reading
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData.slice(-5)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Listening" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Reading" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Biểu đồ tròn */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4">
                            🎯 Tỷ lệ điểm trung bình
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabs Listening / Reading */}
                <div className="flex gap-6 mb-6 border-b-2 border-gray-200 bg-white rounded-t-xl px-6">
                    <button
                        onClick={() => setActiveTab("listening")}
                        className={`pb-4 pt-4 px-4 font-semibold transition-all ${
                            activeTab === "listening"
                                ? "text-blue-600 border-b-4 border-blue-600 -mb-0.5"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        🎧 Listening
                    </button>
                    <button
                        onClick={() => setActiveTab("reading")}
                        className={`pb-4 pt-4 px-4 font-semibold transition-all ${
                            activeTab === "reading"
                                ? "text-blue-600 border-b-4 border-blue-600 -mb-0.5"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        📖 Reading
                    </button>
                </div>

                {/* Dữ liệu chi tiết theo tab */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 bg-white border border-gray-200 rounded-b-xl p-6 shadow-sm">
                    <StatCard
                        icon={BookOpen}
                        label="Số đề đã làm"
                        value={statsData[activeTab].testsDone}
                        unit="đề"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Độ chính xác"
                        value={statsData[activeTab].accuracy}
                    />
                    <StatCard
                        icon={Clock}
                        label="Thời gian TB"
                        value={statsData[activeTab].avgTime}
                    />
                    <StatCard
                        icon={Target}
                        label="Điểm trung bình"
                        value={statsData[activeTab].avgScore}
                    />
                    <StatCard
                        icon={Award}
                        label="Điểm cao nhất"
                        value={statsData[activeTab].bestScore}
                        highlight
                    />
                </div>

                {/* Lịch sử luyện thi */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                        🕓 Lịch sử các bài luyện thi
                    </h3>

                    {filteredResults.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredResults.map((r) => (
                                <li
                                    key={r.ID}
                                    className="py-4 px-4 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                                        <div>
                                            <p className="font-semibold text-blue-700 text-lg">
                                                {r.title} (#{r.ExamId})
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {r.examType}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                📅 {r.startAt} → {r.finishAt}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2 md:mt-0">
                                            <span className="text-xl font-bold text-green-600">
                                                🏆 {r.totalScore} điểm
                                            </span>
                                            <Link
                                                to={`/user/result/${r.ID}`}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 text-gray-600 text-sm mt-3 bg-gray-50 p-3 rounded-lg">
                                        <span className="flex items-center gap-1">
                                            🎧 Listening: <strong>{r.ScoreListening}</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📖 Reading: <strong>{r.ScoreReading}</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            🎯 Tỷ lệ: <strong>{r.ScorePercent}%</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            ⏱ Thời gian: <strong>{r.timeTest} phút</strong>
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 italic text-lg">
                                Chưa có lịch sử làm bài cho loại đề này.
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Hãy bắt đầu làm bài thi để xem thống kê của bạn!
                            </p>
                        </div>
                    )}
                </div>

                {/* Điểm yếu cần cải thiện */}
                {/* {progress?.weakAreas && (
                    <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6 mt-6">
                        <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                            ⚠️ Điểm yếu cần cải thiện
                        </h3>
                        <ul className="space-y-2">
                            {renderWeakAreas()}
                        </ul>
                    </div>
                )} */}
            </div>
        </main>
    );
}