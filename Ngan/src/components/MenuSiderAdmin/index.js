import { Menu } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

function MenuSiderAdmin({ collapsed }) {
  const location = useLocation();

  const handleGoExam = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ No accessToken");
      return;
    }

    const examWindow = window.open("http://localhost:5173/admin", "_self");

    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:5173") return;

      // 👈 đúng với bên 5173: type === "ready"
      if (event.data?.type === "ready") {
        console.log("📥 5173 ready → send token");

        examWindow.postMessage(
          {
            type: "auth", // 👈 đúng type
            accessToken: token,
          },
          "http://localhost:5173"
        );

        // cleanup
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);
  };

  const items = [
    {
      key: "/admin/teachers",
      icon: <UserOutlined />,
      label: <Link to="/admin/teachers">Quản lý giáo viên</Link>,
    },
    {
      key: "/admin/students",
      icon: <TeamOutlined />,
      label: <Link to="/admin/students">Quản lý học viên</Link>,
    },
    {
      key: "/admin/courses",
      icon: <BookOutlined />,
      label: <Link to="/admin/courses">Quản lý khóa học</Link>,
    },
    {
      key: "/admin/tests",
      icon: <FileTextOutlined />,
      label: <Link to="/admin/tests">Quản lý bài test</Link>,
    },
    {
      key: "/admin/account",
      icon: <SettingOutlined />,
      label: <Link to="/admin/account">Thông tin tài khoản</Link>,
    },
    {
      icon: <BookOutlined />,
      label: <span onClick={handleGoExam}>Quản lý đề thi Toeic</span>,
    },
  ];

  return (
    <Menu
      mode="inline"
      inlineCollapsed={collapsed} // 🔥 CHỈ ICON KHI COLLAPSE
      items={items}
      selectedKeys={[location.pathname]}
    />
  );
}

export default MenuSiderAdmin;
