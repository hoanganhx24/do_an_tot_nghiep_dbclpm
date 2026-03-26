import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute"; // Import component này

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Home from "./pages/user/Home";
import Tests from "./pages/user/Test";
import TestDetail from "./pages/user/TestDetail";
import Result from "./pages/user/Result";
import Statistic from "./pages/user/Statistics";
import Profile from "./pages/user/Profile";
import DoTest from "./pages/user/DoTest";
import ChangePassword from "./pages/user/ChangePassword "

import Dashboard from "./pages/admin/Dashboard";
import AdminQuestionManager from "./pages/admin/QuestionManager";
import ExamManager from "./pages/admin/ExamManager";
import CommentManager from "./pages/admin/CommentManager";

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Routes main - Không cần bảo vệ */}
        <Route path="/*" element={<MainLayout />} />

        {/* Routes user - BẢO VỆ */}
        <Route path="/user/*" element={
          <ProtectedRoute>
            <UserLayout>
              <Routes>
                <Route index element={<Home />} />
                <Route path="tests" element={<Tests />} />
                <Route path="tests/:id" element={<TestDetail />} />
                <Route path="dotests/:id" element={<DoTest />} />
                <Route path="result/:attemptID" element={<Result />} />
                <Route path="statistics" element={<Statistic />} />
                <Route path="profile" element={<Profile />} />
                <Route path="changepassword" element={<ChangePassword />} />
              </Routes>
            </UserLayout>
          </ProtectedRoute>
        } />

        {/* Routes auth - Không cần bảo vệ */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Routes admin - BẢO VỆ */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="questionsmanager" element={<AdminQuestionManager />} />
                <Route path="exammanager" element={<ExamManager />} />
                <Route path="commentmanager" element={<CommentManager />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
