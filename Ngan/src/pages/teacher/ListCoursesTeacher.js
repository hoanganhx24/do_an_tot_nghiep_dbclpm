import { Col, Row, Tabs } from "antd";
import "../Course/course.scss";
import CourseItem from "../Course/CourseItem";
import { PlusCircleTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getListCoursesOfTeacher } from "../../services/CourseService";
import { getAccessToken } from "../../components/token";
import { parseJwt } from "../../components/function";
import { refreshToken, saveToken } from "../../services/AuthService";
function ListCoursesTeacher() {
  const token = getAccessToken();
  const obj = parseJwt(token);
  const [activeKey, setActiveKey] = useState("mainCourses");
  const [courses, setCourses] = useState([]);
  const fetchApi = async (key) => {
    if (key === "mainCourses") {
      const response = await getListCoursesOfTeacher("Main", obj.id);
      console.log(response);
      if (response.code === 200) {
        setCourses(response.data);
      } else if (response.code === 401) {
        const refresh = await refreshToken();
        if (refresh.code === 200) {
          saveToken(refresh.data.token, refresh.data.refreshToken);
        }
      }
    }

    if (key === "subCourses") {
      const response = await getListCoursesOfTeacher("Support", obj.id);
      console.log(response);
      if (response.code === 200) {
        setCourses(response.data);
      } else if (response.code === 401) {
        const refresh = await refreshToken();
        if (refresh.code === 200) {
          saveToken(refresh.data.token, refresh.data.refreshToken);
        }
      }
    }
  };

  useEffect(() => {
    fetchApi(activeKey);
  }, []);

  const handleTabChange = (key) => {
    setActiveKey(key);
    fetchApi(key);
  };

  const navigate = useNavigate();
  const handleCreateCourse = () => {
    navigate("/teacher/create-course");
  };

  return (
    <>
      <h2>Danh sách các khóa học</h2>
      <h3>Nền tảng TOEIC</h3>
      <Row gutter={[20, 20]}>
        {courses?.[0]?.courses.length > 0 ? (
          courses[0].courses.map((course) => (
            <Col
              key={course.id}
              xs={24} // mobile: 1 cột
              sm={12} // tablet nhỏ: 2 cột
              md={8} // tablet lớn: 3 cột
              lg={6} // desktop: 4 cột
              xl={6}
            >
              <CourseItem course={course} />
            </Col>
          ))
        ) : (
          <div>Không có khóa học</div>
        )}
      </Row>
      <h3>TOEIC Trung cấp</h3>
      <Row gutter={[20, 20]}>
        {courses?.[1]?.courses.length > 0 ? (
          courses[1].courses.map((course) => (
            <Col
              key={course.id}
              xs={24} // mobile: 1 cột
              sm={12} // tablet nhỏ: 2 cột
              md={8} // tablet lớn: 3 cột
              lg={6} // desktop: 4 cột
              xl={6}
            >
              <CourseItem course={course} />
            </Col>
          ))
        ) : (
          <div>Không có khóa học</div>
        )}
      </Row>
      <h3>TOEIC Chuyên sâu</h3>
      <Row gutter={[20, 20]}>
        {courses?.[2]?.courses.length > 0 ? (
          courses[2].courses.map((course) => (
            <Col
              key={course.id}
              xs={24} // mobile: 1 cột
              sm={12} // tablet nhỏ: 2 cột
              md={8} // tablet lớn: 3 cột
              lg={6} // desktop: 4 cột
              xl={6}
            >
              <CourseItem course={course} />
            </Col>
          ))
        ) : (
          <div>Không có khóa học</div>
        )}
      </Row>
    </>
  );
}
export default ListCoursesTeacher;
