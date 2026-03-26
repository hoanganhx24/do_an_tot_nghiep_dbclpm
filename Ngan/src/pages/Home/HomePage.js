import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Button,
  Steps,
  Progress,
  Input,
} from "antd";
import {
  PlayCircleOutlined,
  BookOutlined,
  VideoCameraOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import "./home.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const client = location.pathname === "/client/main";
  return (
    <>
      <section className="hero-section">
        <div className="container hero-content">
          <h1 className="hero-title">
            Chinh phục TOEIC với{" "}
            <span className="highlight">lộ trình cá nhân hóa</span>
          </h1>

          <p className="hero-description">
            Xây dựng trình độ Toeic phù hợp với trình độ của bạn
          </p>

          <div className="hero-actions">
            <Button type="primary" size="large" onClick={() => {client ? navigate("/client/login") : navigate("/student/study_plan")}}>
              Bắt đầu ngay
            </Button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Học viên</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">95%</div>
              <div className="stat-label">Đạt mục tiêu</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">5K+</div>
              <div className="stat-label">Bài tập</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4.9/5</div>
              <div className="stat-label">Đánh giá</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section1">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tính năng nổi bật</h2>
            <p className="section-description">
              Mọi thứ bạn cần để chinh phục Toeic
            </p>
          </div>

          <div className="features-grid">
            <Card hoverable className="feature-card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Học linh hoạt</h3>
              <p className="feature-description">Học mọi lúc mọi nơi</p>
            </Card>

            <Card hoverable className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Bài tập phong phú</h3>
              <p className="feature-description">Kho đề thi đa dạng</p>
            </Card>

            <Card hoverable className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Lộ trình rõ ràng</h3>
              <p className="feature-description">Kế hoạch chi tiết</p>
            </Card>

            <Card hoverable className="feature-card">
              <div className="feature-icon">📖</div>
              <h3 className="feature-title">Tra từ điển nhanh chóng</h3>
              <p className="feature-description">Từ điển tích hợp</p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
