import { Menu } from "antd";
import {
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

function MenuSiderStudent(props) {
  const { isStudyPlan, collapsed } = props;
  const location = useLocation();

  const items = [
    {
      key: "/student/study_plan",
      icon: <CalendarOutlined />,
      label: <Link to="/student/study_plan">Study Plan</Link>,
    },
    {
      key: "/student/my_courses",
      icon: <BookOutlined style={{ color: isStudyPlan ? "white" : undefined }}/>,
      label: (
        <Link
          to="/student/my_courses"
          style={{ color: isStudyPlan ? "white" : undefined }}
        >
          My Courses
        </Link>
      ),
    },
    // {
    //   key: "/student/profile",
    //   icon: <UserOutlined />,
    //   label: (
    //     <Link
    //       to="/student/profile"
    //       style={{ color: isStudyPlan ? "white" : undefined }}
    //     >
    //       Profile
    //     </Link>
    //   ),
    // },
  ];

  return (
    <Menu
      mode="inline"                   // 🔥 bắt buộc để collapse
      inlineCollapsed={collapsed}     // 🔥 thu = chỉ icon
      items={items}
      selectedKeys={[location.pathname]}
      style={{
        backgroundColor: isStudyPlan ? "#007bff" : "white",
        height: "100%",
        borderRight: "none",
      }}
    />
  );
}

export default MenuSiderStudent;
