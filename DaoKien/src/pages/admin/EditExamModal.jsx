import { useState, useEffect } from "react";
import { X, Save, Search, AlertCircle, Clock, BookOpen, CheckCircle } from "lucide-react";

export default function EditExamModal({ exam, examTypes, mediaQuestions, onClose, onSuccess }) {
    const [title, setTitle] = useState(exam.Title);
    const [timeExam, setTimeExam] = useState(exam.TimeExam);
    const [examTypeID, setExamTypeID] = useState(exam.ExamTypeID);
    
    const [examDetail, setExamDetail] = useState(null);
    const [selectedMediaIds, setSelectedMediaIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSkill, setFilterSkill] = useState("");
    const [filterSection, setFilterSection] = useState("");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncingMedia, setSyncingMedia] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";
    const ADMIN_TOKEN = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchExamDetail();
    }, []);

    const fetchExamDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/exams/${exam.ID}`, {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch exam detail');
            }

            const result = await response.json();
            
            if (result.success) {
                setExamDetail(result.data);
                
                const mediaIds = new Set();
                result.data.Questions?.forEach(q => {
                    if (q.Media) {
                        mediaIds.add(q.Media.ID);
                    }
                });
                
                setSelectedMediaIds(mediaIds);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching exam detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBasicInfo = async () => {
        if (!title.trim()) {
            alert("Vui lòng nhập tiêu đề đề thi");
            return;
        }

        try {
            setSaving(true);
            
            const examType = examTypes.find(t => t.ID === parseInt(examTypeID));
            
            const payload = {
                Title: title.trim(),
                TimeExam: parseInt(timeExam),
                ExamTypeID: parseInt(examTypeID),
                Type: examType?.Code || exam.Type
            };

            const response = await fetch(`${API_URL}/exams/${exam.ID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update exam');
            }

            const result = await response.json();
            
            if (result.success) {
                alert('✅ Cập nhật thông tin đề thi thành công!');
                onSuccess();
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (err) {
            alert(`❌ Lỗi: ${err.message}`);
            console.error('Error updating exam:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleMedia = async (mediaId, isCurrentlySelected) => {
        setSyncingMedia(true);
        
        try {
            if (isCurrentlySelected) {
                const response = await fetch(`${API_URL}/exams/${exam.ID}/media-groups/${mediaId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    setSelectedMediaIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(mediaId);
                        return newSet;
                    });
                }
            } else {
                const maxOrderIndex = selectedMediaIds.size;
                
                const payload = {
                    mediaGroupId: mediaId,
                    orderIndex: maxOrderIndex + 1
                };

                const response = await fetch(`${API_URL}/exams/${exam.ID}/media-groups`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    setSelectedMediaIds(prev => new Set([...prev, mediaId]));
                }
            }
        } catch (err) {
            console.error('Error toggling media:', err);
        } finally {
            setSyncingMedia(false);
        }
    };

    const filteredMedia = mediaQuestions.filter(media => {
        const matchSearch = !searchTerm || 
            media.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            media.PreviewText?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSkill = !filterSkill || media.Skill === filterSkill;
        const matchSection = !filterSection || media.Section === filterSection;
        
        return matchSearch && matchSkill && matchSection;
    });

    const skills = [...new Set(mediaQuestions.map(m => m.Skill))].filter(Boolean);
    const sections = [...new Set(mediaQuestions.map(m => m.Section))].filter(Boolean).sort();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-center">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-red-800 text-center mb-2">Lỗi</h3>
                    <p className="text-red-600 text-center mb-4">{error}</p>
                    <button 
                        onClick={onClose}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-6xl my-8 rounded-2xl shadow-2xl relative ring-1 ring-gray-200">
                
                <div className="sticky top-0 bg-white z-10 p-6 border-b relative rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                        Chỉnh sửa đề thi #{exam.ID}
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
                    >
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                    
                    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-inner mb-8 ring-1 ring-blue-200">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                            Thông tin cơ bản
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Tiêu đề đề thi
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Loại đề thi
                                    </label>
                                    <select
                                        value={examTypeID}
                                        onChange={(e) => setExamTypeID(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
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
                                        Thời gian (phút)
                                    </label>
                                    <input
                                        type="number"
                                        value={timeExam}
                                        onChange={(e) => setTimeExam(e.target.value)}
                                        min="1"
                                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleUpdateBasicInfo}
                                disabled={saving}
                                className={`px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 ${
                                    saving
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Cập nhật thông tin
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-inner ring-1 ring-green-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold flex items-center gap-3 text-gray-800">
                                <Clock className="w-6 h-6 text-green-600" />
                                Quản lý Media trong đề thi
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600">Đã chọn:</span>
                                <span className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold">
                                    {selectedMediaIds.size}
                                </span>
                                <span className="text-gray-600">/ {mediaQuestions.length}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border-2 border-blue-200 p-4 mb-4">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Tổng số câu hỏi theo Part
                            </h4>
                            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7].map(section => {
                                    const selectedMedia = mediaQuestions.filter(m => 
                                        selectedMediaIds.has(m.MediaQuestionID) && m.Section === section.toString()
                                    );
                                    const totalQuestions = selectedMedia.reduce((sum, m) => sum + (m.QuestionCount || 0), 0);
                                    
                                    return (
                                        <div key={section} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center border border-blue-200">
                                            <div className="text-xs font-medium text-gray-600 mb-1">Part {section}</div>
                                            <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                                            <div className="text-xs text-gray-500 mt-1">câu</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Tổng cộng:</span>
                                <span className="text-xl font-bold text-green-600">
                                    {mediaQuestions
                                        .filter(m => selectedMediaIds.has(m.MediaQuestionID))
                                        .reduce((sum, m) => sum + (m.QuestionCount || 0), 0)} câu
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-1 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                    />
                                </div>
                                
                                <select
                                    value={filterSkill}
                                    onChange={(e) => setFilterSkill(e.target.value)}
                                    className="p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                >
                                    <option value="">Tất cả Skill</option>
                                    {skills.map(skill => (
                                        <option key={skill} value={skill}>{skill}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterSection}
                                    onChange={(e) => setFilterSection(e.target.value)}
                                    className="p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                >
                                    <option value="">Tất cả Section</option>
                                    {sections.map(section => (
                                        <option key={section} value={section}>Section {section}</option>
                                    ))}
                                </select>
                            </div>

                            {(searchTerm || filterSkill || filterSection) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterSkill("");
                                        setFilterSection("");
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {syncingMedia && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-blue-700 text-sm">Đang đồng bộ...</span>
                            </div>
                        )}

                        <div className="bg-white rounded-lg border-2 border-gray-200 max-h-[400px] overflow-y-auto">
                            {filteredMedia.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    Không tìm thấy media phù hợp
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredMedia.map((media) => {
                                        const isSelected = selectedMediaIds.has(media.MediaQuestionID);
                                        
                                        return (
                                            <label
                                                key={media.MediaQuestionID}
                                                className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                    isSelected ? 'bg-green-50' : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleMedia(media.MediaQuestionID, isSelected)}
                                                    className="mt-1 w-5 h-5 accent-green-600 cursor-pointer"
                                                />
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                                                            #{media.MediaQuestionID}
                                                        </span>
                                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                                                            {media.Type}
                                                        </span>
                                                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                                                            Section {media.Section}
                                                        </span>
                                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold">
                                                            {media.Skill}
                                                        </span>
                                                        {media.QuestionCount && (
                                                            <span className="text-gray-600 text-xs">
                                                                ({media.QuestionCount} câu)
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <h4 className="font-semibold text-gray-800 mb-1">
                                                        {media.Title}
                                                    </h4>
                                                    
                                                    {media.PreviewText && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {media.PreviewText}
                                                        </p>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}