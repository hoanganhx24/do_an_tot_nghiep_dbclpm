// CommentItem.jsx
import { useState } from "react";
import { Reply, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import ReplyInput from "./ReplyInput";

export default function CommentItem({ comment, onReply, onEdit, onDelete, currentUserId }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // ✅ Sử dụng currentUserId từ props thay vì localStorage
    const commentAuthorID = comment.Author?.ID || comment.StudentProfileID;
    const isOwner = commentAuthorID === currentUserId;

    return (
        <div className="p-4 border rounded-lg bg-white">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                    {(comment.UserName || "U").charAt(0)}
                </div>

                <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                        {comment.UserName}
                    </p>

                    <p className="text-xs text-gray-500 mb-1">
                        {new Date(comment.CreateAt).toLocaleDateString("vi-VN")}
                    </p>

                    <p className="text-gray-800 text-sm mb-2">{comment.Content}</p>

                    <div className="flex items-center gap-4 text-sm">
                        <button
                            onClick={() => setShowReplyBox(!showReplyBox)}
                            className="flex items-center gap-1 text-gray-600 hover:text-blue-500"
                        >
                            <Reply className="w-4 h-4" /> Trả lời
                        </button>

                        {isOwner && (
                            <>
                                <button
                                    onClick={() => onEdit(comment)}
                                    className="flex items-center gap-1 text-gray-600 hover:text-orange-500"
                                >
                                    <Pencil className="w-4 h-4" /> Sửa
                                </button>

                                {/* <button
                                    onClick={() => onDelete(comment.ID)}
                                    className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                                >
                                    🗑 Xóa
                                </button> */}
                            </>
                        )}

                        {comment.replies?.length > 0 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                            >
                                {expanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                                {comment.replies.length} phản hồi
                            </button>
                        )}
                    </div>

                    {showReplyBox && (
                        <ReplyInput
                            onSubmit={(text) => {
                                onReply(text, comment.ID);
                                setShowReplyBox(false);
                            }}
                            onCancel={() => setShowReplyBox(false)}
                        />
                    )}

                    {expanded &&
                        comment.replies?.map((r) => (
                            <div key={r.ID} className="ml-8 mt-3">
                                <CommentItem
                                    comment={r}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}