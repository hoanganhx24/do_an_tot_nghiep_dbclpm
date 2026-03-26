import { Menu } from "antd";
import {
  BookOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

function MenuSiderTeacher({ collapsed }) {
  const location = useLocation();

  const items = [
    {
      key: "/teacher/courses",
      icon: <BookOutlined />,
      label: <Link to="/teacher/courses">Quản lý khóa học</Link>,
    },
    {
      key: "/teacher/account",
      icon: <SettingOutlined />,
      label: <Link to="/teacher/account">Thông tin tài khoản</Link>,
    },
  ];

  return (
    <Menu
      mode="inline"                 // 🔥 cần cho collapse
      inlineCollapsed={collapsed}   // 🔥 thu = chỉ icon
      items={items}
      selectedKeys={[location.pathname]}
      style={{
        height: "100%",
        borderRight: "none",
      }}
    />
  );
}

export default MenuSiderTeacher;
