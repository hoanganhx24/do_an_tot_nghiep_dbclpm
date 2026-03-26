// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/exam';

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;
const STUDENT_TOKEN = import.meta.env.VITE_STUDENT_TOKEN;

if (!localStorage.getItem("token")) {
    localStorage.setItem("token", STUDENT_TOKEN); 
}

// Tạo axios instance với config mặc định
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response và error
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ==================== EXAM ENDPOINTS ====================
export const examAPI = {
    // Lấy tất cả exams
    getAllExams: () => apiClient.get('/exams'),

    // Lấy exam theo ID
    getExamById: (id) => apiClient.get(`/exams/${id}`),

    // Tạo exam mới
    createExam: (data) => apiClient.post('/exams', data),

    // Cập nhật exam
    updateExam: (id, data) => apiClient.put(`/exams/${id}`, data),

    // Xóa exam
    deleteExam: (id) => apiClient.delete(`/exams/${id}`),

    // Tìm kiếm exams
    searchExams: (query) => apiClient.get('/exams/search', { params: { q: query } }),

    // Lấy thống kê exam
    getExamStatistics: (id) => apiClient.get(`/exams/${id}/statistics`),

    // Duplicate exam
    duplicateExam: (id) => apiClient.post(`/exams/${id}/duplicate`),

    // Thêm questions vào exam
    addQuestionsToExam: (id, questions) =>
        apiClient.post(`/exams/${id}/questions`, { questions }),

    // Xóa questions khỏi exam
    removeQuestionsFromExam: (id, questionIds) =>
        apiClient.delete(`/exams/${id}/questions`, { data: { questionIds } }),
};

// ==================== ATTEMPT ENDPOINTS ====================
export const attemptAPI = {
    // Bắt đầu một attempt mới
    startAttempt: (examId, type = 'FULL_TEST') =>
        apiClient.post('/attempts/start', { ExamID: examId, Type: type }),

    // Nộp bài
    submitAttempt: (attemptId, answers) =>
        apiClient.post('/attempts/submit', { AttemptID: attemptId, answers }),

    // Lấy kết quả attempt
    getAttemptResults: (attemptId) =>
        apiClient.get(`/attempts/${attemptId}/results`),

    // Lấy active attempt
    getActiveAttempt: () =>
        apiClient.get('/attempts/active'),

    // Lấy lịch sử attempts
    getAttemptHistory: (submittedOnly = true) =>
        apiClient.get('/attempts/history', { params: { submittedOnly } }),

    // Lấy tiến trình học tập
    getStudentProgress: () =>
        apiClient.get('/attempts/progress'),

    // Lấy điểm cao nhất
    getBestScore: (examId) =>
        apiClient.get(`/attempts/best-score/${examId}`),

    // Xóa attempt
    deleteAttempt: (attemptId) =>
        apiClient.delete(`/attempts/${attemptId}`),
};

// ==================== QUESTION ENDPOINTS ====================
export const questionAPI = {
    // Tìm kiếm questions
    searchQuestions: (params) =>
        apiClient.get('/questions', { params }),

    // Tạo question (Reading)
    createQuestion: (data) =>
        apiClient.post('/questions', data),

    // Lấy question theo ID
    getQuestionById: (id) =>
        apiClient.get(`/questions/${id}`),

    // Cập nhật question
    updateQuestion: (id, data) =>
        apiClient.put(`/questions/${id}`, data),

    // Xóa question
    deleteQuestion: (id) =>
        apiClient.delete(`/questions/${id}`),

    // Lấy thống kê question
    getQuestionStatistics: (id) =>
        apiClient.get(`/questions/${id}/statistics`),

    // Lấy questions theo section
    getQuestionsBySection: (sections, limit = 30) =>
        apiClient.get('/questions/by-section', {
            params: { sections: sections.join(','), limit }
        }),

    // Bulk delete questions
    bulkDeleteQuestions: (questionIds) =>
        apiClient.post('/questions/bulk', {
            QuestionIDs: questionIds,
            Operation: 'DELETE'
        }),
};

// ==================== COMMENT ENDPOINTS ====================
export const commentAPI = {
    // Tạo comment
    createComment: (content, examId, parentId = 0) =>
        apiClient.post('/comments', { Content: content, ExamID: examId, ParentId: parentId }),

    // Lấy comments của exam
    getExamComments: (examId, parentId = 0, page = 1, limit = 20) =>
        apiClient.get(`/comments/exams/${examId}/comments`, {
            params: { parentId, page, limit }
        }),

    // Lấy comment thread
    getCommentThread: (commentId) =>
        apiClient.get(`/comments/${commentId}/thread`),

    // Cập nhật comment
    updateComment: (commentId, content) =>
        apiClient.put(`/comments/${commentId}`, { Content: content }),

    // Xóa comment
    deleteComment: (commentId) =>
        apiClient.delete(`/comments/${commentId}`),

    // Moderate comment (Admin only)
    moderateComment: (commentId, status) =>
        apiClient.patch(`/comments/${commentId}/moderate`, { Status: status }),

    // Tìm kiếm comments
    searchComments: (query) =>
        apiClient.get('/comments/search', { params: { q: query } }),

    // Lấy flagged comments
    getFlaggedComments: () =>
        apiClient.get('/comments/flagged'),

    // Lấy số lượng comments của exam
    getCommentCount: (examId) =>
        apiClient.get(`/comments/exams/${examId}/comment-count`),
};

// ==================== AUTH ENDPOINTS (cần thêm vào backend) ====================
export const authAPI = {
    login: (email, password) =>
        apiClient.post('/auth/login', { email, password }),

    register: (userData) =>
        apiClient.post('/auth/register', userData),

    logout: () =>
        apiClient.post('/auth/logout'),

    getCurrentUser: () =>
        apiClient.get('/auth/me'),

    updateProfile: (data) =>
        apiClient.put('/auth/profile', data),
};

export default apiClient;