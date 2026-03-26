import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Search, Clock, BookOpen, AlertCircle, Settings } from "lucide-react";
import AddExamModal from "./AddExamModal";
import EditExamModal from "./EditExamModal";
import ExamTypeManager from "./ExamTypeManager";

export default function ExamManager() {
    const [exams, setExams] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [mediaQuestions, setMediaQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [showExamTypeManager, setShowExamTypeManager] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";
    const ADMIN_TOKEN = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [typesResponse, mediaResponse, examsResponse] = await Promise.all([
                fetch(`${API_URL}/exam-types`, {
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_URL}/media-groups`, {
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_URL}/exams`, {
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (!typesResponse.ok) throw new Error('Failed to fetch exam types');
            const typesResult = await typesResponse.json();
            if (typesResult.success) setExamTypes(typesResult.data || []);

            if (mediaResponse.ok) {
                const mediaResult = await mediaResponse.json();
                if (mediaResult.success) setMediaQuestions(mediaResult.data || []);
            }

            if (examsResponse.ok) {
                const examsResult = await examsResponse.json();
                if (examsResult.success) setExams(examsResult.data || []);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa đề thi này?")) return;

        try {
            const response = await fetch(`${API_URL}/exams/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to delete exam');

            await fetchData();
            alert('✅ Xóa đề thi thành công!');
        } catch (err) {
            alert(`❌ Lỗi: ${err.message}`);
            console.error('Error deleting exam:', err);
        }
    };

    const getExamTypeName = (id) => {
        return examTypes.find((t) => t.ID === id)?.Description || "N/A";
    };

    const getExamTypeCode = (id) => {
        return examTypes.find((t) => t.ID === id)?.Code || "N/A";
    };

    const filteredExams = exams.filter(exam => {
        const matchSearch = exam.Title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = !selectedType || exam.ExamTypeID === parseInt(selectedType);
        return matchSearch && matchType;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h3 className="text-red-800 font-semibold mb-2">Lỗi tải dữ liệu</h3>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (showExamTypeManager) {
        return (
            <ExamTypeManager 
                onBack={() => {
                    setShowExamTypeManager(false);
                    fetchData();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                            Quản lý đề thi
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Hiển thị {filteredExams.length} / {exams.length} đề thi
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                            onClick={() => setShowExamTypeManager(true)}
                        >
                            <Settings className="w-5 h-5" />
                            Quản lý loại đề thi
                        </button>
                        
                        <button
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="w-5 h-5" />
                            Thêm đề thi
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex flex-col md:flex-row gap-3">
                    <div className="flex items-center gap-2 flex-1">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề đề thi..."
                            className="p-3 border-2 border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select
                        className="p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 md:w-64 transition-all"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="">-- Tất cả loại đề --</option>
                        {examTypes.map(type => (
                            <option key={type.ID} value={type.ID}>
                                {type.Description}
                            </option>
                        ))}
                    </select>

                    {(searchTerm || selectedType) && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedType("");
                            }}
                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors whitespace-nowrap"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Tổng đề thi</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{exams.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <BookOpen className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {examTypes.map(type => {
                        const count = exams.filter(e => e.ExamTypeID === type.ID).length;
                        return (
                            <div key={type.ID} className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">{type.Description}</p>
                                        <p className="text-3xl font-bold text-indigo-600 mt-1">{count}</p>
                                    </div>
                                    <div className="bg-indigo-100 p-3 rounded-xl">
                                        <Clock className="w-8 h-8 text-indigo-600" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden ring-1 ring-gray-200">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                            <tr>
                                <th className="p-4 border-b text-center font-semibold text-gray-700">STT</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Tiêu đề</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Loại đề</th>
                                <th className="p-4 border-b text-center font-semibold text-gray-700">
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Thời gian
                                    </div>
                                </th>
                                <th className="p-4 border-b text-center font-semibold text-gray-700">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredExams.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        {searchTerm || selectedType 
                                            ? "Không tìm thấy kết quả phù hợp"
                                            : "Chưa có đề thi nào"
                                        }
                                    </td>
                                </tr>
                            ) : (
                                filteredExams.map((exam, index) => (
                                    <tr
                                        key={exam.ID}
                                        className="border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-200"
                                    >
                                        <td className="p-4 text-center font-semibold text-gray-800">
                                            {index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{exam.Title}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Code: {getExamTypeCode(exam.ExamTypeID)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                exam.ExamTypeID === 1 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {getExamTypeName(exam.ExamTypeID)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-semibold text-gray-800">
                                                {exam.TimeExam} phút
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => setEditingExam(exam)}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Sửa
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(exam.ID)}
                                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {showAddModal && (
                    <AddExamModal
                        examTypes={examTypes}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={fetchData}
                    />
                )}

                {editingExam && (
                    <EditExamModal
                        exam={editingExam}
                        examTypes={examTypes}
                        mediaQuestions={mediaQuestions}
                        onClose={() => setEditingExam(null)}
                        onSuccess={fetchData}
                    />
                )}
            </div>
        </div>
    );
}