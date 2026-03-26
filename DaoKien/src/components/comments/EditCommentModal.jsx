import { useState } from "react";
import { X } from "lucide-react";

export default function EditCommentModal({ comment, onSave, onClose }) {
    const [content, setContent] = useState(comment.Content);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
            <div className="bg-white p-5 rounded-lg w-[450px] shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 text-gray-500 hover:text-black"
                >
                    <X size={20} />
                </button>

                <h2 className="text-lg font-semibold mb-4">Chỉnh sửa bình luận</h2>

                <textarea
                    className="w-full border p-3 rounded text-sm"
                    rows="4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>

                <div className="flex justify-end mt-4 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded text-gray-600"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onSave(content)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}
