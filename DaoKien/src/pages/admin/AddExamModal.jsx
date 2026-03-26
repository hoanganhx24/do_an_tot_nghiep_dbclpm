import { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export default function AddExamModal({ examTypes, onClose, onSuccess }) {
    const [title, setTitle] = useState("");
    const [timeExam, setTimeExam] = useState(120);
    const [examTypeID, setExamTypeID] = useState(examTypes[0]?.ID || 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";
    const ADMIN_TOKEN = localStorage.getItem("accessToken");

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError("Vui lòng nhập tiêu đề đề thi");
            return;
        }

        if (timeExam < 1) {
            setError("Thời gian phải lớn hơn 0");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const examType = examTypes.find(t => t.ID === parseInt(examTypeID));
            
            const payload = {
                Title: title.trim(),
                TimeExam: parseInt(timeExam),
                ExamTypeID: parseInt(examTypeID),
                Type: examType?.Code || "FULL_TEST"
            };

            const response = await fetch(`${API_URL}/exams`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create exam');
            }

            const result = await response.json();
            
            if (result.success) {
                alert('✅ Thêm đề thi thành công!');
                onSuccess();
                onClose();
            } else {
                throw new Error(result.message || 'Failed to create exam');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error creating exam:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative ring-1 ring-gray-200">
                
                <div className="p-6 border-b relative">
                    <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">
                        Thêm đề thi mới
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
                    >
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">
                                Tiêu đề đề thi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề đề thi..."
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">
                                Loại đề thi <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={examTypeID}
                                onChange={(e) => setExamTypeID(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                            >
                                {examTypes.map(type => (
                                    <option key={type.ID} value={type.ID}>
                                        {type.Description} ({type.Code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">
                                Thời gian làm bài (phút) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={timeExam}
                                onChange={(e) => setTimeExam(e.target.value)}
                                min="1"
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                                loading
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Tạo đề thi
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}