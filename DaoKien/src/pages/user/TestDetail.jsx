"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ExamInfo from "../../components/test-detail/ExamInfo";
import TimeSetting from "../../components/test-detail/TimeSetting";
import PartList from "../../components/test-detail/PartList";
import StartTestButton from "../../components/test-detail/StartTestButton";
import CommentSection from "../../components/comments/CommentSection";

export default function TestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [customTime, setCustomTime] = useState(30);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);

                const baseUrl = import.meta.env.VITE_API_URL;
                const token = localStorage.getItem("accessToken");

                const res = await fetch(`${baseUrl}/exams/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();

                if (!json.success) {
                    setError("Không tải được dữ liệu đề thi");
                    return;
                }

                setExam(json.data);
            } catch (err) {
                setError("Lỗi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [id]);

    if (loading) return <p>Đang tải...</p>;
    if (!exam) return <p>Lỗi tải dữ liệu</p>;

    const parts = [...new Set(exam.Questions.map((q) => q.Media?.Section))];

    const handleStartTest = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem("accessToken");

            if (customTime < 5 || customTime > exam.TimeExam) {
                setError(`Thời gian phải từ 5 đến ${exam.TimeExam} phút`);
                return;
            }

            // 🟦 Tạo attempt - Map Type sang backend format
            // FULL_TEST → FULL_TEST
            // Các loại khác (PART_4_PRACTICE, etc.) → PRACTICE_BY_PART
            const attemptType = exam.Type === "FULL_TEST" ? "FULL_TEST" : "PRACTICE_BY_PART";

            const payload = {
                ExamID: exam.ID,
                Type: attemptType,
                // Nếu là PRACTICE_BY_PART, backend yêu cầu Parts array
                ...(attemptType === "PRACTICE_BY_PART" && {
                    Parts: parts.map(p => Number(p))
                })
            };

            console.log("Starting attempt with payload:", payload);
            console.log("Parts available:", parts);

            const res = await fetch(`${baseUrl}/attempts/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            console.log("Response:", json);

            if (!json.success) {
                setError(`Không thể bắt đầu bài thi: ${json.message || 'Unknown error'}`);
                return;
            }

            const attemptId = json.data.attemptId;

            // 🟦 Điều hướng đến trang làm bài
            navigate(`/user/dotests/${exam.ID}?time=${customTime}`, {
                state: { attemptId },
            });

        } catch (err) {
            setError("Lỗi khởi tạo bài thi");
        }
    };


    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-8">{exam.Title}</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-center font-medium">{error}</p>
                </div>
            )}

            <ExamInfo exam={exam} parts={parts} />
            <TimeSetting
                customTime={customTime}
                setCustomTime={setCustomTime}
                maxTime={exam.TimeExam}
            />
            <PartList exam={exam} parts={parts} />
            <StartTestButton onStart={handleStartTest} />

            <CommentSection examId={exam.ID} />
        </div>
    );
}

