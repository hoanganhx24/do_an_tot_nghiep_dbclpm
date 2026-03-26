// ReplyInput.jsx
import { useState } from "react";

export default function ReplyInput({ onSubmit, onCancel }) {
    const [text, setText] = useState("");

    return (
        <div className="mt-3">
            <textarea
                className="w-full border rounded p-2 text-sm"
                rows="2"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-end mt-2 gap-2">
                <button onClick={onCancel} className="text-sm text-gray-500">
                    Hủy
                </button>
                <button
                    onClick={() => onSubmit(text)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
}
