import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, Flag, X } from "lucide-react";

export default function Result() {
    const { attemptID } = useParams();
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;
    // const TOKEN = import.meta.env.VITE_STUDENT_TOKEN;
    const TOKEN = localStorage.getItem("accessToken");

    useEffect(() => {
        fetch(`${API_URL}/attempts/${attemptID}/results`, {
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Sửa lại logic xử lý IsCorrect
                    const detailed = data.data.DetailedAnswers.map(d => {
                        // Kiểm tra nhiều trường hợp
                        let isCorrect = false;
                        
                        if (typeof d.IsCorrect === 'boolean') {
                            isCorrect = d.IsCorrect;
                        } else if (d.IsCorrect?.data) {
                            isCorrect = Boolean(d.IsCorrect.data[0]);
                        } else if (typeof d.IsCorrect === 'number') {
                            isCorrect = d.IsCorrect === 1;
                        } else {
                            // Fallback: so sánh ID của StudentChoice và CorrectChoice
                            isCorrect = d.StudentChoice?.ID === d.CorrectChoice?.ID;
                        }
                        
                        return {
                            ...d,
                            IsCorrect: isCorrect,
                        };
                    });
                    
                    setSelectedAttempt({
                        ...data.data,
                        DetailedAnswers: detailed
                    });
                } else {
                    setSelectedAttempt(null);
                }
            })
            .catch(err => console.error(err));
    }, [attemptID]);

    if (!selectedAttempt)
        return (
            <p className="text-center mt-10 text-red-600 font-medium">
                Không tìm thấy kết quả bài làm.
            </p>
        );

    const attemptDetails = selectedAttempt.DetailedAnswers;

    const totalQuestions = attemptDetails.length;
    const correct = attemptDetails.filter(a => a.IsCorrect).length;
    const wrong = totalQuestions - correct;
    const skipped = 0;

    // Nhóm theo Part
    const parts = {};
    attemptDetails.forEach(a => {
        const partID = a.Section || "0";
        if (!parts[partID]) parts[partID] = [];
        parts[partID].push(a);
    });

    const handleViewDetail = (question) => setSelectedQuestion(question);
    const closeModal = () => setSelectedQuestion(null);

    function ExplanationSection({ correctChoice }) {
        const [showExplanation, setShowExplanation] = useState(false);
        return (
            <div className="mt-5 border-t pt-4">
                <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                >
                    {showExplanation ? "Ẩn giải thích ▲" : "Xem giải thích ▼"}
                </button>

                {showExplanation && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-gray-700 whitespace-pre-line">
                        Giải thích: Đáp án đúng là <strong>{correctChoice?.Attribute}</strong> - {correctChoice?.Content}
                    </div>
                )}
            </div>
        );
    }

    let questionCounter = 1;

    return (
        <div className="w-full min-h-screen bg-gray-100 pt-2 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 px-6 lg:px-12 overflow-visible">

                {/* LEFT */}
                <div className="lg:col-span-10 bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-lg font-bold mb-4">{selectedAttempt.ExamTitle}</h2>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <CheckCircle2 className="mx-auto text-green-600 w-6 h-6" />
                            <p className="text-green-600 font-medium">Đúng</p>
                            <p className="font-semibold mt-1 text-green-700">{correct}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 text-center">
                            <XCircle className="mx-auto text-red-600 w-6 h-6" />
                            <p className="text-red-600 font-medium">Sai</p>
                            <p className="font-semibold mt-1 text-red-700">{wrong}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <MinusCircle className="mx-auto text-gray-500 w-6 h-6" />
                            <p className="text-gray-600 font-medium">Bỏ qua</p>
                            <p className="font-semibold mt-1 text-gray-600">{skipped}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <Flag className="mx-auto text-blue-500 w-6 h-6" />
                            <p className="text-blue-700 font-medium">Điểm</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{selectedAttempt.Scores.TotalScore}</p>
                        </div>
                    </div>

                    {/* PHÂN TÍCH CHI TIẾT */}
                    <h2 className="text-lg font-bold mt-6 mb-4">Phân tích chi tiết</h2>

                    {Object.keys(parts).sort((a, b) => a - b).map(partID => (
                        <div key={partID} className="mb-8">
                            <h3 className="text-base font-semibold mb-4">Part {partID}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parts[partID].map((d) => {
                                    const correctChoice = d.CorrectChoice;
                                    const studentChoice = d.StudentChoice;

                                    // Tạo nội dung hiển thị dựa trên đúng/sai
                                    let displayText = "";
                                    if (d.IsCorrect) {
                                        displayText = studentChoice.Attribute; // Chỉ hiển thị đáp án đã chọn
                                    } else {
                                        displayText = `${studentChoice.Attribute} : ${correctChoice.Attribute}`;
                                    }

                                    return (
                                        <div key={d.QuestionID} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-700 font-semibold flex items-center justify-center rounded-full">
                                                    {questionCounter++}
                                                </div>
                                                <div className={`text-sm font-medium ${d.IsCorrect ? "text-green-600" : "text-red-600"}`}>
                                                    {displayText}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewDetail(d)}
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                [Chi tiết]
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                </div>

                {/* MODAL */}
                {selectedQuestion && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white w-full max-w-2xl p-6 rounded-2xl relative max-h-[90vh] overflow-hidden">
                            <button className="absolute top-3 right-3" onClick={closeModal}><X /></button>
                            <div className="overflow-y-auto max-h-[80vh] pr-2">

                                {/* MEDIA */}
                                {selectedQuestion.Media?.ImageUrl && (
                                    <img src={selectedQuestion.Media.ImageUrl} alt="Question" className="w-full rounded-lg border mb-2" />
                                )}
                                {selectedQuestion.Media?.AudioUrl && (
                                    <audio controls className="w-full mb-2">
                                        <source src={selectedQuestion.Media.AudioUrl} type="audio/mpeg" />
                                    </audio>
                                )}
                                {selectedQuestion.Media?.Script && (
                                    <p className="bg-gray-50 p-3 rounded-lg text-sm border mb-2">{selectedQuestion.Media.Script}</p>
                                )}

                                <p className="mb-4 font-medium">{selectedQuestion.QuestionText}</p>

                                <ul className="space-y-2">
                                    {selectedQuestion.IsCorrect ? (
                                        // Nếu đúng, chỉ hiển thị câu đúng với background xanh
                                        <li className="bg-green-100 p-3 border border-green-300 rounded-lg">
                                            <strong>{selectedQuestion.CorrectChoice.Attribute}.</strong> {selectedQuestion.CorrectChoice.Content}
                                        </li>
                                    ) : (
                                        // Nếu sai, hiển thị câu sai (đỏ) và câu đúng (xanh)
                                        <>
                                            <li className="bg-red-100 p-3 border border-red-300 rounded-lg">
                                                <strong>{selectedQuestion.StudentChoice.Attribute}.</strong> {selectedQuestion.StudentChoice.Content}
                                                <span className="text-red-600 text-xs ml-2">(Bạn chọn)</span>
                                            </li>
                                            <li className="bg-green-100 p-3 border border-green-300 rounded-lg">
                                                <strong>{selectedQuestion.CorrectChoice.Attribute}.</strong> {selectedQuestion.CorrectChoice.Content}
                                                <span className="text-green-600 text-xs ml-2">(Đáp án đúng)</span>
                                            </li>
                                        </>
                                    )}
                                </ul>

                                <ExplanationSection correctChoice={selectedQuestion.CorrectChoice} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}