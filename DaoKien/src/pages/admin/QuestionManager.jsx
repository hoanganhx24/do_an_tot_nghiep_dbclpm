import { useEffect, useState } from "react";
import EditMediaQuestionModal from "./EditMediaQuestionModal";
import AddMediaQuestionModal from "./AddMediaQuestionModal";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function AdminQuestionManager() {
    const [allMediaQuestions, setAllMediaQuestions] = useState([]); // Toàn bộ data
    const [filteredQuestions, setFilteredQuestions] = useState([]); // Data sau khi filter
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // Search/filter
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");

    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    // const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;
    const ADMIN_TOKEN = localStorage.getItem("accessToken");

    // Fetch ALL data from API (no pagination on API side)
    const fetchAllMediaQuestions = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/media-groups`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setAllMediaQuestions(result.data || []);
                setFilteredQuestions(result.data || []);
            } else {
                throw new Error('API returned success: false');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching media questions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load data lần đầu
    useEffect(() => {
        fetchAllMediaQuestions();
    }, []);

    // Filter data khi search/filter thay đổi
    useEffect(() => {
        let filtered = [...allMediaQuestions];

        // Filter theo search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(media => 
                media.Title?.toLowerCase().includes(term) ||
                media.Description?.toLowerCase().includes(term) ||
                media.PreviewText?.toLowerCase().includes(term)
            );
        }

        // Filter theo section
        if (selectedSection) {
            filtered = filtered.filter(media => media.Section === selectedSection);
        }

        // Filter theo difficulty
        if (selectedDifficulty) {
            filtered = filtered.filter(media => media.Difficulty === selectedDifficulty);
        }

        setFilteredQuestions(filtered);
        setCurrentPage(1); // Reset về trang 1 khi filter
    }, [searchTerm, selectedSection, selectedDifficulty, allMediaQuestions]);

    const handleDelete = async (mediaId) => {
        if (!confirm("Bạn chắc chắn muốn xóa media và toàn bộ câu hỏi của media này?")) return;

        try {
            const response = await fetch(`${API_URL}/media-groups/${mediaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            // Refresh data sau khi xóa
            await fetchAllMediaQuestions();
        } catch (err) {
            alert('Xóa thất bại: ' + err.message);
            console.error('Delete error:', err);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedSection("");
        setSelectedDifficulty("");
    };

    const sections = [
        { value: "1", label: "Part 1 - Photo Description" },
        { value: "2", label: "Part 2 - Question Response" },
        { value: "3", label: "Part 3 - Conversation" },
        { value: "4", label: "Part 4 - Talk" },
        { value: "5", label: "Part 5 - Incomplete Sentence" },
        { value: "6", label: "Part 6 - Text Completion" },
        { value: "7", label: "Part 7 - Reading Comprehension" }
    ];

    const difficulties = [
        { value: "EASY", label: "Dễ" },
        { value: "MEDIUM", label: "Trung bình" },
        { value: "HARD", label: "Khó" }
    ];

    // Phân trang trên client
    const totalPages = Math.ceil(filteredQuestions.length / rowsPerPage);
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentItems = filteredQuestions.slice(indexOfFirst, indexOfLast);

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
                        onClick={fetchAllMediaQuestions}
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
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                            Quản lý câu hỏi
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Hiển thị {currentItems.length} / {filteredQuestions.length} câu hỏi
                            {filteredQuestions.length !== allMediaQuestions.length && 
                                ` (Tổng: ${allMediaQuestions.length})`
                            }
                        </p>
                    </div>

                    <button
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <Plus className="w-5 h-5" />
                        Thêm câu hỏi
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="mb-4 space-y-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex items-center gap-2 flex-1">
                            <Search className="w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tiêu đề, mô tả, nội dung..."
                                className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <select
                            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 md:w-48"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="">-- Tất cả Section --</option>
                            {sections.map(section => (
                                <option key={section.value} value={section.value}>{section.label}</option>
                            ))}
                        </select>

                        <select
                            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 md:w-48"
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                        >
                            <option value="">-- Tất cả độ khó --</option>
                            {difficulties.map(diff => (
                                <option key={diff.value} value={diff.value}>{diff.label}</option>
                            ))}
                        </select>

                        {(searchTerm || selectedSection || selectedDifficulty) && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    {/* Active filters display */}
                    {(searchTerm || selectedSection || selectedDifficulty) && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-600">Đang lọc:</span>
                            {searchTerm && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                                    Từ khóa: "{searchTerm}"
                                </span>
                            )}
                            {selectedSection && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                    {sections.find(s => s.value === selectedSection)?.label}
                                </span>
                            )}
                            {selectedDifficulty && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                    Độ khó: {difficulties.find(d => d.value === selectedDifficulty)?.label}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* TABLE */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden ring-1 ring-gray-200">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                            <tr>
                                <th className="p-4 border-b text-center font-semibold text-gray-700">STT</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Tiêu đề</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Loại</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Section</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Độ khó</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Số câu hỏi</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Media</th>
                                <th className="p-4 border-b font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">
                                        {filteredQuestions.length === 0 && allMediaQuestions.length > 0 
                                            ? "Không tìm thấy kết quả phù hợp"
                                            : "Không có dữ liệu"
                                        }
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((media, index) => (
                                    <tr key={media.MediaQuestionID} className="border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-200">
                                        <td className="p-4 text-center font-semibold text-gray-800">
                                            {indexOfFirst + index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{media.Title}</div>
                                            <div className="text-sm text-gray-500">{media.Description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {media.Type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-800">
                                            Part {media.Section}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                media.Difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                                                media.Difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {media.Difficulty}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-800">
                                            {media.QuestionCount}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-1 justify-center">
                                                {media.HasAudio && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">🔊</span>}
                                                {media.HasImage && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">🖼️</span>}
                                                {media.HasScript && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">📝</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-center">
                                            <div className="flex flex-col md:flex-row items-center justify-center gap-3 h-full">
                                                <button
                                                    onClick={() => { setSelectedMedia(media); setIsEditOpen(true); }}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(media.MediaQuestionID)}
                                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-4 gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition-colors`}
                        >
                            ← Trước
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                return page === 1 || 
                                       page === totalPages || 
                                       Math.abs(page - currentPage) <= 2;
                            })
                            .map((page, idx, arr) => (
                                <span key={page}>
                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                        <span className="px-2 text-gray-500">...</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded-md ${
                                            currentPage === page 
                                                ? "bg-blue-600 text-white" 
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        } transition-colors`}
                                    >
                                        {page}
                                    </button>
                                </span>
                            ))
                        }

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === totalPages 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition-colors`}
                        >
                            Sau →
                        </button>
                    </div>
                )}

                {/* POPUP EDIT */}
                {isEditOpen && (
                    <EditMediaQuestionModal
                        media={selectedMedia}
                        onClose={() => {
                            setIsEditOpen(false);
                            fetchAllMediaQuestions(); // Refresh after edit
                        }}
                    />
                )}

                {/* POPUP ADD */}
                {isAddOpen && (
                    <AddMediaQuestionModal
                        onClose={() => {
                            setIsAddOpen(false);
                            fetchAllMediaQuestions(); // Refresh after add
                        }}
                    />
                )}
            </div>
        </div>
    );
}