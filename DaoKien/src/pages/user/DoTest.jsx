"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TOEICTestInterface from "../../components/do-test/ToeicTestInterface";
import axios from "axios";

export default function DoTest() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;
    const TOKEN = localStorage.getItem("accessToken");

    const attemptIdRaw = location.state?.attemptId;
    const attemptId = attemptIdRaw ? Number(attemptIdRaw) : null;
    const timeFromDetail = new URLSearchParams(location.search).get("time");

    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [examInfo, setExamInfo] = useState(null);
    const [currentPart, setCurrentPart] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    
    // Flag để ngăn confirm 2 lần
    const isNavigatingRef = useRef(false);

    // 1. Lấy đề thi
    useEffect(() => {
        if (!id) return;

        fetch(`${API_URL}/exams/${id}`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
        })
            .then(res => res.json())
            .then(res => {
                const exam = res.data;
                setExamInfo(exam);

                const parts = [...new Set(exam.Questions.map(q => q.Media?.Section))].filter(Boolean).sort((a, b) => Number(a) - Number(b));
                if (parts.length > 0) setCurrentPart(parts[0]);

                const seconds = timeFromDetail
                    ? Number(timeFromDetail) * 60
                    : exam.TimeExam * 60;
                setTimeRemaining(seconds);
            })
            .catch(err => console.error("Fetch exam error:", err));
    }, [id, API_URL, TOKEN, timeFromDetail]);

    // 2. Timer với auto-submit khi hết giờ
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitTest(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [examInfo, selectedAnswers, attemptId]);

    // 3. Chọn câu trả lời
    const handleAnswerSelect = (questionId, choiceId) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: Number(choiceId) }));
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // 4. Submit bài thi
    const handleSubmitTest = async (isAutoSubmit = false) => {
        if (isSubmitting || isNavigatingRef.current) return;
        
        if (!attemptId) {
            alert("Không có AttemptID!");
            return;
        }

        if (!examInfo || !examInfo.Questions) {
            alert("Exam data chưa load!");
            return;
        }

        // Bỏ window.confirm vì đã có toast confirm trong RightSidebar
        setIsSubmitting(true);
        isNavigatingRef.current = true;

        const answersPayload = examInfo.Questions.map(q => {
            const choiceId = selectedAnswers[q.ID];
            return {
                QuestionID: q.ID,
                ChoiceID: choiceId != null ? Number(choiceId) : null
            };
        });

        console.log("Submitting payload:", { 
            AttemptID: attemptId, 
            answers: answersPayload,
            totalQuestions: answersPayload.length,
            answeredQuestions: answersPayload.filter(a => a.ChoiceID !== null).length
        });

        try {
            const res = await axios.post(
                `${API_URL}/attempts/submit`,
                { AttemptID: attemptId, answers: answersPayload },
                { headers: { Authorization: `Bearer ${TOKEN}` } }
            );

            if (res.data.success) {
                // Hiển thị popup thành công
                const SuccessPopup = () => (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
                            <div className="text-center">
                                {/* Icon thành công */}
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                
                                {/* Tiêu đề */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {isAutoSubmit ? "Hết giờ!" : "Nộp bài thành công!"}
                                </h3>
                                
                                {/* Thông báo */}
                                <p className="text-gray-600 mb-6">
                                    {isAutoSubmit 
                                        ? "Bài thi đã được nộp tự động. Đang chuyển đến trang kết quả..."
                                        : "Bài thi của bạn đã được lưu. Đang chuyển đến trang kết quả..."}
                                </p>
                                
                                {/* Loading spinner */}
                                <div className="flex justify-center">
                                    <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                );

                // Tạo div container cho popup
                const popupContainer = document.createElement('div');
                popupContainer.id = 'success-popup';
                document.body.appendChild(popupContainer);
                
                // Render popup
                const root = document.createElement('div');
                popupContainer.appendChild(root);
                root.innerHTML = `
                    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="animation: fadeIn 0.3s ease-out">
                        <div class="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4" style="animation: scaleIn 0.3s ease-out">
                            <div class="text-center">
                                <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                                    ${isAutoSubmit ? "Hết giờ!" : "Nộp bài thành công!"}
                                </h3>
                                <p class="text-gray-600 mb-6">
                                    ${isAutoSubmit 
                                        ? "Bài thi đã được nộp tự động. Đang chuyển đến trang kết quả..."
                                        : "Bài thi của bạn đã được lưu. Đang chuyển đến trang kết quả..."}
                                </p>
                                <div class="flex justify-center">
                                    <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Thêm styles cho animations
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0.9); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);

                // Chuyển hướng sau 1 giây
                setTimeout(() => {
                    popupContainer.remove();
                    navigate(`/user/result/${attemptId}`, { 
                        state: { result: res.data.data },
                        replace: true
                    });
                }, 1000);
            } else {
                alert("Nộp bài thất bại: " + res.data.message);
                setIsSubmitting(false);
                isNavigatingRef.current = false;
            }
        } catch (err) {
            console.error("Submit error:", err.response?.data || err);
            const errorMsg = err.response?.data?.message || "Lỗi khi nộp bài!";
            alert(errorMsg);
            setIsSubmitting(false);
            isNavigatingRef.current = false;
        }
    };

    // 5. Xử lý thoát và xóa attempt
    const handleExit = async () => {
        if (isNavigatingRef.current) return;
        
        // Bỏ window.confirm vì đã có toast confirm trong RightSidebar
        setIsExiting(true);
        isNavigatingRef.current = true;

        try {
            if (attemptId) {
                await axios.delete(
                    `${API_URL}/attempts/${attemptId}`,
                    { headers: { Authorization: `Bearer ${TOKEN}` } }
                );
                console.log("Attempt deleted successfully");
            }
            
            // Hiển thị popup thoát thành công
            const ExitPopup = () => {
                const popupContainer = document.createElement('div');
                popupContainer.id = 'exit-popup';
                document.body.appendChild(popupContainer);
                
                const root = document.createElement('div');
                popupContainer.appendChild(root);
                root.innerHTML = `
                    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="animation: fadeIn 0.3s ease-out">
                        <div class="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4" style="animation: scaleIn 0.3s ease-out">
                            <div class="text-center">
                                <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                                    <svg class="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                                    Đã thoát bài thi
                                </h3>
                                <p class="text-gray-600 mb-6">
                                    Bài làm của bạn đã được xóa. Đang quay về trang trước...
                                </p>
                                <div class="flex justify-center">
                                    <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Thêm styles cho animations nếu chưa có
                if (!document.getElementById('popup-animations')) {
                    const style = document.createElement('style');
                    style.id = 'popup-animations';
                    style.textContent = `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes scaleIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }

                // Chuyển hướng sau 1 giây
                setTimeout(() => {
                    popupContainer.remove();
                    navigate(-1, { replace: true });
                }, 1000);
            };

            ExitPopup();
        } catch (err) {
            console.error("Delete attempt error:", err.response?.data || err);
            
            // Hiển thị popup lỗi nhưng vẫn chuyển hướng
            const ErrorPopup = () => {
                const popupContainer = document.createElement('div');
                popupContainer.id = 'error-popup';
                document.body.appendChild(popupContainer);
                
                const root = document.createElement('div');
                popupContainer.appendChild(root);
                root.innerHTML = `
                    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="animation: fadeIn 0.3s ease-out">
                        <div class="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4" style="animation: scaleIn 0.3s ease-out">
                            <div class="text-center">
                                <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                                    <svg class="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                                    Có lỗi xảy ra
                                </h3>
                                <p class="text-gray-600 mb-6">
                                    Không thể xóa dữ liệu, nhưng bạn sẽ được chuyển về trang trước...
                                </p>
                                <div class="flex justify-center">
                                    <svg class="animate-spin h-8 w-8 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                if (!document.getElementById('popup-animations')) {
                    const style = document.createElement('style');
                    style.id = 'popup-animations';
                    style.textContent = `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes scaleIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }

                setTimeout(() => {
                    popupContainer.remove();
                    navigate(-1, { replace: true });
                }, 1000);
            };

            ErrorPopup();
        } finally {
            setIsExiting(false);
        }
    };

    // Ngăn beforeunload khi đang navigate
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isNavigatingRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    if (!examInfo || !currentPart) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải đề thi...</p>
                </div>
            </div>
        );
    }

    const filteredTestData = {
        parts: [...new Set(examInfo.Questions.map(q => q.Media?.Section))].filter(Boolean).sort((a, b) => Number(a) - Number(b)),
        questions: examInfo.Questions,
        mediaQuestions: examInfo.MediaQuestions || [],
    };

    return (
        <TOEICTestInterface
            testName={examInfo.Title}
            currentPart={currentPart}
            onPartChange={setCurrentPart}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={handleAnswerSelect}
            timeRemaining={formatTime(timeRemaining)}
            testData={filteredTestData}
            attemptId={attemptId}
            onSubmitTest={() => handleSubmitTest(false)}
            onExit={handleExit}
            isSubmitting={isSubmitting}
            isExiting={isExiting}
        />
    );
}