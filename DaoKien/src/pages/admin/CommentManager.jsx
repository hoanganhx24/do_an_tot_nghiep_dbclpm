// import { useEffect, useState, useMemo } from "react";
// import {
//     MessageSquare,
//     Trash2,
//     Search,
//     Reply,
//     Flag,
//     ChevronLeft,
//     ChevronRight,
//     Clock,
//     User,
//     FileText,
//     AlertCircle,
//     Check,
//     X,
// } from "lucide-react";
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_API_URL;
// const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

// export default function AdminComments() {
//     const [comments, setComments] = useState([]);
//     const [exams, setExams] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedExamId, setSelectedExamId] = useState("");
//     const [statusFilter, setStatusFilter] = useState("all");
//     const [openDetail, setOpenDetail] = useState({});
//     const [commentsPerPage, setCommentsPerPage] = useState(15);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [selectedComments, setSelectedComments] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [deleteConfirm, setDeleteConfirm] = useState({ 
//         show: false, 
//         type: 'single', 
//         id: null, 
//         count: 0 
//     });

//     // Fetch comments
//     const fetchAllComments = async () => {
//         setLoading(true);
//         try {
//             const res = await axios.get(`${BASE_URL}/comments`, {
//                 headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
//             });
//             setComments(res.data?.data || []);
//         } catch (err) {
//             console.error("Error loading comments:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch exams
//     const fetchExams = async () => {
//         try {
//             const res = await axios.get(`${BASE_URL}/exams`, {
//                 headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
//             });
//             setExams(res.data?.data || []);
//         } catch (err) {
//             console.error("Error loading exams:", err);
//         }
//     };

//     useEffect(() => {
//         fetchAllComments();
//         fetchExams();
//     }, []);

//     // Get exam title by ID
//     const getExamTitle = (examId) => {
//         const exam = exams.find((e) => e.ID === examId);
//         return exam ? exam.Title : `Exam #${examId}`;
//     };

//     // Get exams that have comments
//     const examsWithComments = useMemo(() => {
//         const examIds = [...new Set(comments.map((c) => c.ExamID))];
//         return exams.filter((e) => examIds.includes(e.ID));
//     }, [comments, exams]);

//     // Filter and search
//     const filteredComments = useMemo(() => {
//         let filtered = comments;

//         if (searchTerm) {
//             filtered = filtered.filter(
//                 (c) =>
//                     c.Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                     c.Author?.FullName.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         if (selectedExamId) {
//             filtered = filtered.filter((c) => c.ExamID.toString() === selectedExamId);
//         }

//         if (statusFilter === "replies") {
//             filtered = filtered.filter((c) => c.ParentId !== 0);
//         } else if (statusFilter === "main") {
//             filtered = filtered.filter((c) => c.ParentId === 0);
//         }

//         return filtered.sort((a, b) => new Date(b.CreateAt) - new Date(a.CreateAt));
//     }, [searchTerm, selectedExamId, statusFilter, comments]);

//     // Pagination
//     const paginatedComments = useMemo(() => {
//         const start = (currentPage - 1) * commentsPerPage;
//         return filteredComments.slice(start, start + commentsPerPage);
//     }, [filteredComments, currentPage, commentsPerPage]);

//     const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [searchTerm, selectedExamId, statusFilter]);

//     // Delete comment
//     const handleDelete = async (id) => {
//         setDeleteConfirm({ show: true, type: 'single', id, count: 1 });
//     };

//     const confirmDelete = async () => {
//         const { type, id } = deleteConfirm;

//         try {
//             if (type === 'single') {
//                 await axios.delete(`${BASE_URL}/comments/${id}`, {
//                     headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
//                 });
//                 setSelectedComments(selectedComments.filter((cid) => cid !== id));
//             } else if (type === 'bulk') {
//                 for (const commentId of selectedComments) {
//                     try {
//                         await axios.delete(`${BASE_URL}/comments/${commentId}`, {
//                             headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
//                         });
//                     } catch (err) {
//                         console.error(`Error deleting comment ${commentId}:`, err);
//                     }
//                 }
//                 setSelectedComments([]);
//             }
//             fetchAllComments();
//         } catch (err) {
//             console.error("Delete error:", err);
//             alert("Không thể xóa bình luận");
//         } finally {
//             setDeleteConfirm({ show: false, type: 'single', id: null, count: 0 });
//         }
//     };

//     const cancelDelete = () => {
//         setDeleteConfirm({ show: false, type: 'single', id: null, count: 0 });
//     };

//     // Bulk delete
//     const handleBulkDelete = async () => {
//         if (selectedComments.length === 0) return;
//         setDeleteConfirm({ show: true, type: 'bulk', id: null, count: selectedComments.length });
//     };

//     // Toggle selection
//     const toggleSelect = (id) => {
//         setSelectedComments((prev) =>
//             prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
//         );
//     };

//     // Select all
//     const toggleSelectAll = () => {
//         if (selectedComments.length === paginatedComments.length) {
//             setSelectedComments([]);
//         } else {
//             setSelectedComments(paginatedComments.map((c) => c.ID));
//         }
//     };

//     // Get parent comment
//     const getParentComment = (parentId) => {
//         return comments.find((c) => c.ID === parentId);
//     };

//     // Stats
//     const stats = useMemo(() => {
//         return {
//             total: comments.length,
//             mainComments: comments.filter((c) => c.ParentId === 0).length,
//             replies: comments.filter((c) => c.ParentId !== 0).length,
//         };
//     }, [comments]);

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Delete Confirmation Modal */}
//             {deleteConfirm.show && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
//                         <div className="flex items-center gap-3 mb-4">
//                             <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
//                                 <AlertCircle size={24} className="text-red-600" />
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900">
//                                     Xác nhận xóa
//                                 </h3>
//                                 <p className="text-sm text-gray-500">
//                                     Hành động này không thể hoàn tác
//                                 </p>
//                             </div>
//                         </div>
                        
//                         <div className="mb-6">
//                             <p className="text-gray-700">
//                                 {deleteConfirm.type === 'single' 
//                                     ? "Bạn có chắc chắn muốn xóa bình luận này không?"
//                                     : `Bạn có chắc chắn muốn xóa ${deleteConfirm.count} bình luận đã chọn không?`
//                                 }
//                             </p>
//                             <p className="text-sm text-gray-500 mt-2">
//                                 Bình luận sẽ bị xóa vĩnh viễn khỏi hệ thống.
//                             </p>
//                         </div>

//                         <div className="flex gap-3">
//                             <button
//                                 onClick={cancelDelete}
//                                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//                             >
//                                 Hủy
//                             </button>
//                             <button
//                                 onClick={confirmDelete}
//                                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
//                             >
//                                 <Trash2 size={16} />
//                                 Xóa
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Header */}
//             <div className="bg-white border-b sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-6 py-4">
//                     <div className="flex items-center justify-between mb-4">
//                         <div>
//                             <h1 className="text-2xl font-bold text-gray-900">Quản lý bình luận</h1>
//                             <p className="text-sm text-gray-500 mt-1">
//                                 Theo dõi và kiểm duyệt bình luận từ người dùng
//                             </p>
//                         </div>
//                         {selectedComments.length > 0 && (
//                             <button
//                                 onClick={handleBulkDelete}
//                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
//                             >
//                                 <Trash2 size={16} />
//                                 Xóa {selectedComments.length} mục
//                             </button>
//                         )}
//                     </div>

//                     {/* Stats */}
//                     <div className="grid grid-cols-3 gap-4">
//                         <div className="bg-blue-50 p-3 rounded-lg">
//                             <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
//                             <div className="text-xs text-blue-600">Tổng bình luận</div>
//                         </div>
//                         <div className="bg-green-50 p-3 rounded-lg">
//                             <div className="text-2xl font-bold text-green-600">
//                                 {stats.mainComments}
//                             </div>
//                             <div className="text-xs text-green-600">Bình luận chính</div>
//                         </div>
//                         <div className="bg-purple-50 p-3 rounded-lg">
//                             <div className="text-2xl font-bold text-purple-600">{stats.replies}</div>
//                             <div className="text-xs text-purple-600">Phản hồi</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Filters */}
//             <div className="max-w-7xl mx-auto px-6 py-4">
//                 <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
//                     <div className="grid grid-cols-4 gap-4">
//                         <div className="col-span-2">
//                             <label className="text-sm font-medium text-gray-700 mb-2 block">
//                                 Tìm kiếm
//                             </label>
//                             <div className="relative">
//                                 <Search
//                                     size={18}
//                                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                                 />
//                                 <input
//                                     type="text"
//                                     placeholder="Tìm theo nội dung hoặc tên người dùng..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-2 block">
//                                 Đề thi
//                             </label>
//                             <select
//                                 value={selectedExamId}
//                                 onChange={(e) => setSelectedExamId(e.target.value)}
//                                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                                 <option value="">Tất cả đề thi</option>
//                                 {examsWithComments.map((exam) => (
//                                     <option key={exam.ID} value={exam.ID}>
//                                         {exam.Title}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-2 block">
//                                 Loại bình luận
//                             </label>
//                             <select
//                                 value={statusFilter}
//                                 onChange={(e) => setStatusFilter(e.target.value)}
//                                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                                 <option value="all">Tất cả</option>
//                                 <option value="main">Bình luận chính</option>
//                                 <option value="replies">Phản hồi</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Comments Table */}
//                 <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//                     {loading ? (
//                         <div className="p-12 text-center text-gray-500">
//                             <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//                             Đang tải...
//                         </div>
//                     ) : paginatedComments.length === 0 ? (
//                         <div className="p-12 text-center text-gray-500">
//                             <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
//                             <p>Không tìm thấy bình luận nào</p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead className="bg-gray-50 border-b">
//                                         <tr>
//                                             <th className="px-4 py-3 text-left">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={
//                                                         selectedComments.length ===
//                                                         paginatedComments.length &&
//                                                         paginatedComments.length > 0
//                                                     }
//                                                     onChange={toggleSelectAll}
//                                                     className="rounded"
//                                                 />
//                                             </th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                                                 Người dùng
//                                             </th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                                                 Nội dung
//                                             </th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                                                 Đề thi
//                                             </th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                                                 Thời gian
//                                             </th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                                                 Phản hồi
//                                             </th>
//                                             <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
//                                                 Thao tác
//                                             </th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y">
//                                         {paginatedComments.map((c) => {
//                                             const parent = getParentComment(c.ParentId);
//                                             const isExpanded = openDetail[c.ID];

//                                             return (
//                                                 <tr
//                                                     key={c.ID}
//                                                     className={`hover:bg-gray-50 transition-colors ${
//                                                         selectedComments.includes(c.ID)
//                                                             ? "bg-blue-50"
//                                                             : ""
//                                                     }`}
//                                                 >
//                                                     <td className="px-4 py-3">
//                                                         <input
//                                                             type="checkbox"
//                                                             checked={selectedComments.includes(c.ID)}
//                                                             onChange={() => toggleSelect(c.ID)}
//                                                             className="rounded"
//                                                         />
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="flex items-center gap-2">
//                                                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
//                                                                 {c.Author?.FullName?.[0] || "?"}
//                                                             </div>
//                                                             <div>
//                                                                 <div className="font-medium text-sm">
//                                                                     {c.Author?.FullName || "Unknown"}
//                                                                 </div>
//                                                                 <div className="text-xs text-gray-500">
//                                                                     ID: {c.Author?.ID}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-4 py-3 max-w-md">
//                                                         <div>
//                                                             <p
//                                                                 className={`text-sm text-gray-700 ${
//                                                                     isExpanded
//                                                                         ? ""
//                                                                         : "line-clamp-2"
//                                                                 }`}
//                                                             >
//                                                                 {c.Content}
//                                                             </p>
//                                                             {c.Content.length > 100 && (
//                                                                 <button
//                                                                     onClick={() =>
//                                                                         setOpenDetail((prev) => ({
//                                                                             ...prev,
//                                                                             [c.ID]: !prev[c.ID],
//                                                                         }))
//                                                                     }
//                                                                     className="text-xs text-blue-600 hover:underline mt-1"
//                                                                 >
//                                                                     {isExpanded
//                                                                         ? "Thu gọn"
//                                                                         : "Xem thêm"}
//                                                                 </button>
//                                                             )}
//                                                             {parent && (
//                                                                 <div className="mt-2 flex items-start gap-1 text-xs text-purple-600 bg-purple-50 p-2 rounded">
//                                                                     <Reply size={12} className="mt-0.5" />
//                                                                     <span>
//                                                                         Phản hồi:{" "}
//                                                                         <span className="font-medium">
//                                                                             {parent.Author?.FullName}
//                                                                         </span>{" "}
//                                                                         - "{parent.Content.slice(0, 40)}
//                                                                         ..."
//                                                                     </span>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                                                             {getExamTitle(c.ExamID)}
//                                                         </span>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="text-xs text-gray-500">
//                                                             {new Date(c.CreateAt).toLocaleDateString(
//                                                                 "vi-VN"
//                                                             )}
//                                                         </div>
//                                                         <div className="text-xs text-gray-400">
//                                                             {new Date(c.CreateAt).toLocaleTimeString(
//                                                                 "vi-VN"
//                                                             )}
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         {c.ReplyCount > 0 && (
//                                                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
//                                                                 {c.ReplyCount} phản hồi
//                                                             </span>
//                                                         )}
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="flex justify-end gap-2">
//                                                             <button
//                                                                 onClick={() => handleDelete(c.ID)}
//                                                                 className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
//                                                                 title="Xóa"
//                                                             >
//                                                                 <Trash2 size={16} />
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Pagination */}
//                             <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
//                                 <div className="flex items-center gap-4">
//                                     <span className="text-sm text-gray-600">
//                                         Hiển thị {(currentPage - 1) * commentsPerPage + 1} -{" "}
//                                         {Math.min(
//                                             currentPage * commentsPerPage,
//                                             filteredComments.length
//                                         )}{" "}
//                                         / {filteredComments.length} kết quả
//                                     </span>
//                                     <select
//                                         value={commentsPerPage}
//                                         onChange={(e) =>
//                                             setCommentsPerPage(Number(e.target.value))
//                                         }
//                                         className="px-3 py-1 border rounded text-sm"
//                                     >
//                                         <option value={10}>10 / trang</option>
//                                         <option value={15}>15 / trang</option>
//                                         <option value={25}>25 / trang</option>
//                                         <option value={50}>50 / trang</option>
//                                     </select>
//                                 </div>

//                                 {totalPages > 1 && (
//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             onClick={() => setCurrentPage(currentPage - 1)}
//                                             disabled={currentPage === 1}
//                                             className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//                                         >
//                                             <ChevronLeft size={18} />
//                                         </button>

//                                         <div className="flex items-center gap-1">
//                                             {Array.from({ length: totalPages }, (_, i) => i + 1)
//                                                 .filter(
//                                                     (page) =>
//                                                         page === 1 ||
//                                                         page === totalPages ||
//                                                         Math.abs(page - currentPage) <= 1
//                                                 )
//                                                 .map((page, idx, arr) => (
//                                                     <div key={page} className="flex items-center">
//                                                         {idx > 0 && arr[idx - 1] !== page - 1 && (
//                                                             <span className="px-2 text-gray-400">
//                                                                 ...
//                                                             </span>
//                                                         )}
//                                                         <button
//                                                             onClick={() => setCurrentPage(page)}
//                                                             className={`px-3 py-1 rounded ${
//                                                                 currentPage === page
//                                                                     ? "bg-blue-600 text-white"
//                                                                     : "hover:bg-gray-100"
//                                                             }`}
//                                                         >
//                                                             {page}
//                                                         </button>
//                                                     </div>
//                                                 ))}
//                                         </div>

//                                         <button
//                                             onClick={() => setCurrentPage(currentPage + 1)}
//                                             disabled={currentPage === totalPages}
//                                             className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//                                         >
//                                             <ChevronRight size={18} />
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

import { useEffect, useState, useMemo } from "react";
import {
    MessageSquare,
    Trash2,
    Search,
    Reply,
    Flag,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    FileText,
    AlertCircle,
    Check,
    X,
} from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
// const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;
const ADMIN_TOKEN = localStorage.getItem("accessToken") || "";

export default function AdminComments() {
    const [comments, setComments] = useState([]);
    const [exams, setExams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [openDetail, setOpenDetail] = useState({});
    const [commentsPerPage, setCommentsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedComments, setSelectedComments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch comments
    const fetchAllComments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/comments`, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            });
            setComments(res.data?.data || []);
        } catch (err) {
            console.error("Error loading comments:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch exams
    const fetchExams = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/exams`, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            });
            setExams(res.data?.data || []);
        } catch (err) {
            console.error("Error loading exams:", err);
        }
    };

    useEffect(() => {
        fetchAllComments();
        fetchExams();
    }, []);

    // Get exam title by ID
    const getExamTitle = (examId) => {
        const exam = exams.find((e) => e.ID === examId);
        return exam ? exam.Title : `Exam #${examId}`;
    };

    // Get exams that have comments
    const examsWithComments = useMemo(() => {
        const examIds = [...new Set(comments.map((c) => c.ExamID))];
        return exams.filter((e) => examIds.includes(e.ID));
    }, [comments, exams]);

    // Filter and search
    const filteredComments = useMemo(() => {
        let filtered = comments;

        if (searchTerm) {
            filtered = filtered.filter(
                (c) =>
                    c.Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.Author?.FullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedExamId) {
            filtered = filtered.filter((c) => c.ExamID.toString() === selectedExamId);
        }

        if (statusFilter === "replies") {
            filtered = filtered.filter((c) => c.ParentId !== 0);
        } else if (statusFilter === "main") {
            filtered = filtered.filter((c) => c.ParentId === 0);
        }

        return filtered.sort((a, b) => new Date(b.CreateAt) - new Date(a.CreateAt));
    }, [searchTerm, selectedExamId, statusFilter, comments]);

    // Pagination
    const paginatedComments = useMemo(() => {
        const start = (currentPage - 1) * commentsPerPage;
        return filteredComments.slice(start, start + commentsPerPage);
    }, [filteredComments, currentPage, commentsPerPage]);

    const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedExamId, statusFilter]);

    // Delete comment
    const handleDelete = async (id) => {
        if (!confirm("Xác nhận xóa bình luận này?")) return;

        try {
            await axios.delete(`${BASE_URL}/comments/${id}`, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            });
            fetchAllComments();
            setSelectedComments(selectedComments.filter((cid) => cid !== id));
        } catch (err) {
            console.error("Delete error:", err);
            alert("Không thể xóa bình luận");
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedComments.length === 0) return;
        if (!confirm(`Xác nhận xóa ${selectedComments.length} bình luận?`)) return;

        for (const id of selectedComments) {
            try {
                await axios.delete(`${BASE_URL}/comments/${id}`, {
                    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
                });
            } catch (err) {
                console.error(`Error deleting comment ${id}:`, err);
            }
        }

        setSelectedComments([]);
        fetchAllComments();
    };

    // Toggle selection
    const toggleSelect = (id) => {
        setSelectedComments((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    // Select all
    const toggleSelectAll = () => {
        if (selectedComments.length === paginatedComments.length) {
            setSelectedComments([]);
        } else {
            setSelectedComments(paginatedComments.map((c) => c.ID));
        }
    };

    // Get parent comment
    const getParentComment = (parentId) => {
        return comments.find((c) => c.ID === parentId);
    };

    // Stats
    const stats = useMemo(() => {
        return {
            total: comments.length,
            mainComments: comments.filter((c) => c.ParentId === 0).length,
            replies: comments.filter((c) => c.ParentId !== 0).length,
        };
    }, [comments]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý bình luận</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Theo dõi và kiểm duyệt bình luận từ người dùng
                            </p>
                        </div>
                        {selectedComments.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Xóa {selectedComments.length} mục
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-xs text-blue-600">Tổng bình luận</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {stats.mainComments}
                            </div>
                            <div className="text-xs text-green-600">Bình luận chính</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stats.replies}</div>
                            <div className="text-xs text-purple-600">Phản hồi</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Tìm theo nội dung hoặc tên người dùng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Đề thi
                            </label>
                            <select
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tất cả đề thi</option>
                                {examsWithComments.map((exam) => (
                                    <option key={exam.ID} value={exam.ID}>
                                        {exam.Title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Loại bình luận
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả</option>
                                <option value="main">Bình luận chính</option>
                                <option value="replies">Phản hồi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Comments Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            Đang tải...
                        </div>
                    ) : paginatedComments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>Không tìm thấy bình luận nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedComments.length ===
                                                        paginatedComments.length
                                                    }
                                                    onChange={toggleSelectAll}
                                                    className="rounded"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Người dùng
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Nội dung
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Đề thi
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Thời gian
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Phản hồi
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {paginatedComments.map((c) => {
                                            const parent = getParentComment(c.ParentId);
                                            const isExpanded = openDetail[c.ID];

                                            return (
                                                <tr
                                                    key={c.ID}
                                                    className={`hover:bg-gray-50 transition-colors ${
                                                        selectedComments.includes(c.ID)
                                                            ? "bg-blue-50"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedComments.includes(c.ID)}
                                                            onChange={() => toggleSelect(c.ID)}
                                                            className="rounded"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                                                {c.Author?.FullName?.[0] || "?"}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm">
                                                                    {c.Author?.FullName || "Unknown"}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    ID: {c.Author?.ID}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-md">
                                                        <div>
                                                            <p
                                                                className={`text-sm text-gray-700 ${
                                                                    isExpanded
                                                                        ? ""
                                                                        : "line-clamp-2"
                                                                }`}
                                                            >
                                                                {c.Content}
                                                            </p>
                                                            {c.Content.length > 100 && (
                                                                <button
                                                                    onClick={() =>
                                                                        setOpenDetail((prev) => ({
                                                                            ...prev,
                                                                            [c.ID]: !prev[c.ID],
                                                                        }))
                                                                    }
                                                                    className="text-xs text-blue-600 hover:underline mt-1"
                                                                >
                                                                    {isExpanded
                                                                        ? "Thu gọn"
                                                                        : "Xem thêm"}
                                                                </button>
                                                            )}
                                                            {parent && (
                                                                <div className="mt-2 flex items-start gap-1 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                                                                    <Reply size={12} className="mt-0.5" />
                                                                    <span>
                                                                        Phản hồi:{" "}
                                                                        <span className="font-medium">
                                                                            {parent.Author?.FullName}
                                                                        </span>{" "}
                                                                        - "{parent.Content.slice(0, 40)}
                                                                        ..."
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            {getExamTitle(c.ExamID)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(c.CreateAt).toLocaleDateString(
                                                                "vi-VN"
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(c.CreateAt).toLocaleTimeString(
                                                                "vi-VN"
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {c.ReplyCount > 0 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                {c.ReplyCount} phản hồi
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleDelete(c.ID)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                        Hiển thị {(currentPage - 1) * commentsPerPage + 1} -{" "}
                                        {Math.min(
                                            currentPage * commentsPerPage,
                                            filteredComments.length
                                        )}{" "}
                                        / {filteredComments.length} kết quả
                                    </span>
                                    <select
                                        value={commentsPerPage}
                                        onChange={(e) =>
                                            setCommentsPerPage(Number(e.target.value))
                                        }
                                        className="px-3 py-1 border rounded text-sm"
                                    >
                                        <option value={10}>10 / trang</option>
                                        <option value={15}>15 / trang</option>
                                        <option value={25}>25 / trang</option>
                                        <option value={50}>50 / trang</option>
                                    </select>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(
                                                    (page) =>
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - currentPage) <= 1
                                                )
                                                .map((page, idx, arr) => (
                                                    <div key={page} className="flex items-center">
                                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                            <span className="px-2 text-gray-400">
                                                                ...
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-1 rounded ${
                                                                currentPage === page
                                                                    ? "bg-blue-600 text-white"
                                                                    : "hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}