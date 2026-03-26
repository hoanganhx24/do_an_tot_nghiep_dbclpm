import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, AlertCircle, Tag, FileText } from "lucide-react";

export default function ExamTypeManager({ onBack }) {
    const [examTypes, setExamTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingType, setEditingType] = useState(null);
    
    const [formData, setFormData] = useState({
        Code: "",
        Description: ""
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";
    const ADMIN_TOKEN = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchExamTypes();
    }, []);

    const fetchExamTypes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/exam-types`, {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch exam types');
            
            const result = await response.json();
            if (result.success) {
                setExamTypes(result.data || []);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching exam types:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.Code.trim() || !formData.Description.trim()) {
            alert('❌ Vui lòng điền đầy đủ thông tin!');
            return;
        }

        try {
            const url = editingType 
                ? `${API_URL}/exam-types/${editingType.ID}`
                : `${API_URL}/exam-types`;
            
            const method = editingType ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error(`Failed to ${editingType ? 'update' : 'create'} exam type`);

            alert(`✅ ${editingType ? 'Cập nhật' : 'Thêm'} loại đề thi thành công!`);
            
            setFormData({ Code: "", Description: "" });
            setShowAddForm(false);
            setEditingType(null);
            fetchExamTypes();
        } catch (err) {
            alert(`❌ Lỗi: ${err.message}`);
            console.error('Error submitting exam type:', err);
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({
            Code: type.Code,
            Description: type.Description
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa loại đề thi này?")) return;

        try {
            const response = await fetch(`${API_URL}/exam-types/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to delete exam type');

            alert('✅ Xóa loại đề thi thành công!');
            fetchExamTypes();
        } catch (err) {
            alert(`❌ Lỗi: ${err.message}`);
            console.error('Error deleting exam type:', err);
        }
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingType(null);
        setFormData({ Code: "", Description: "" });
    };

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
                        onClick={fetchExamTypes}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-700">
                                Quản lý loại đề thi
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Tổng số: {examTypes.length} loại
                            </p>
                        </div>
                    </div>

                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm loại đề thi
                        </button>
                    )}
                </div>

                {showAddForm && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingType ? 'Chỉnh sửa loại đề thi' : 'Thêm loại đề thi mới'}
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Tag className="w-4 h-4 inline mr-2" />
                                    Mã loại đề (Code) *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: PRACTICE-PART-1"
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                                    value={formData.Code}
                                    onChange={(e) => setFormData({ ...formData, Code: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Mô tả (Description) *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Luyện tập part 1 đề thi Toeic"
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                                    value={formData.Description}
                                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                                >
                                    {editingType ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                                
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden ring-1 ring-gray-200">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                            <tr>
                                <th className="p-4 border-b text-center font-semibold text-gray-700">STT</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Mã Code</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Mô tả</th>
                                <th className="p-4 border-b text-center font-semibold text-gray-700">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {examTypes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        Chưa có loại đề thi nào
                                    </td>
                                </tr>
                            ) : (
                                examTypes.map((type, index) => (
                                    <tr
                                        key={type.ID}
                                        className="border-b hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors duration-200"
                                    >
                                        <td className="p-4 text-center font-semibold text-gray-800">
                                            {index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-purple-600" />
                                                <span className="font-mono font-medium text-gray-800">
                                                    {type.Code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-700">{type.Description}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(type)}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Sửa
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(type.ID)}
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
            </div>
        </div>
    );
}