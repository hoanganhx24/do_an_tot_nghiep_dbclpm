// CommentInput.jsx
import { useState } from "react";

export default function CommentInput({ onSubmit }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!value.trim()) return setError("Bình luận không được để trống");
        setError("");

        onSubmit(value.trim());
        setValue("");
    };

    return (
        <div>
            <textarea
                className="w-full border rounded-lg p-3 text-sm"
                rows="3"
                placeholder="Viết bình luận..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end mt-2">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-5 py-2 rounded text-sm"
                >
                    Gửi bình luận
                </button>
            </div>
        </div>
    );
}
