// CommentSection.jsx
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import EditCommentModal from "./EditCommentModal";

const BASE_URL = "http://localhost:3001/api/exam";

export default function CommentSection({ examId }) {
    const [flatComments, setFlatComments] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [studentProfileId, setStudentProfileId] = useState(null);

    const token = localStorage.getItem("accessToken");

    // ✅ Decode token để lấy studentProfileId
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded token:", decoded);

                // ✅ Lấy id từ token (theo cấu trúc JWT của bạn)
                const userId = decoded.id; // id = 2 trong token của bạn

                setStudentProfileId(Number(userId));
                localStorage.setItem("studentProfileID", userId.toString());

                console.log("Student Profile ID:", userId);
            } catch (err) {
                console.error("Error decoding token:", err);
            }
        }
    }, [token]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/comments/exams/${examId}/comments`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFlatComments(res.data?.data || []);
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [examId]);

    const nestedComments = useMemo(() => {
        const map = {};
        const roots = [];

        flatComments.forEach((c) => {
            map[c.ID] = {
                ...c,
                UserName: c.Author?.FullName || "Ẩn danh",
                replies: [],
            };
        });

        flatComments.forEach((c) => {
            if (c.ParentId && c.ParentId !== 0 && map[c.ParentId]) {
                map[c.ParentId].replies.push(map[c.ID]);
            } else {
                roots.push(map[c.ID]);
            }
        });

        return roots;
    }, [flatComments]);

    const addComment = async (text, parentId = 0) => {
        try {
            await axios.post(
                `${BASE_URL}/comments`,
                {
                    Content: text,
                    ExamID: examId,
                    ParentId: parentId,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchComments();
        } catch (err) {
            console.error("Error creating comment:", err);
        }
    };

    const updateComment = async (id, newContent) => {
        try {
            await axios.put(
                `${BASE_URL}/comments/${id}`,
                { Content: newContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEditingComment(null);
            fetchComments();
        } catch (err) {
            console.error("Update comment error:", err);
        }
    };

    const deleteComment = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

        if (!studentProfileId) {
            alert("Không xác định được người dùng. Vui lòng đăng nhập lại!");
            return;
        }

        try {
            console.log("Deleting comment:", {
                commentId: id,
                studentProfileId
            });

            // ✅ Gửi qua query params
            await axios.delete(
                `${BASE_URL}/comments/${id}?studentProfileId=${studentProfileId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert("Xóa bình luận thành công!");
            fetchComments();
        } catch (err) {
            console.error("Delete comment error:", err);
            console.error("Error response:", err.response?.data);

            const errorMsg = err.response?.data?.message || err.message;

            if (errorMsg.includes("only delete your own")) {
                alert("Bạn chỉ có thể xóa bình luận của chính mình!");
            } else if (errorMsg.includes("not found")) {
                alert("Không tìm thấy bình luận!");
            } else {
                alert(`Lỗi: ${errorMsg}`);
            }
        }
    };

    return (
        <div className="mt-12 border rounded-2xl bg-white p-6">
            <CommentInput onSubmit={addComment} />

            <div className="space-y-4 mt-6">
                {nestedComments.map((c) => (
                    <CommentItem
                        key={c.ID}
                        comment={c}
                        onReply={addComment}
                        onEdit={(commentObj) => setEditingComment(commentObj)}
                        onDelete={() => deleteComment(c.ID)}
                        currentUserId={studentProfileId}
                    />
                ))}
            </div>

            {editingComment && (
                <EditCommentModal
                    comment={editingComment}
                    onClose={() => setEditingComment(null)}
                    onSave={(newContent) =>
                        updateComment(editingComment.ID, newContent)
                    }
                />
            )}
        </div>
    );
}