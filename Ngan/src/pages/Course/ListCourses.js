import { Col, Row, Tabs } from "antd";
import "./course.scss";
import CourseItem from "./CourseItem";
import { useEffect, useState } from "react";
import { getListCoursesOfAdmin } from "../../services/CourseService";
import { PlusCircleTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
function ListCourses() {
  const [activeKey, setActiveKey] = useState("mainCourses");
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();
  const handleCreateCourse = (type) => {
    if (type === 0) {
      navigate("/admin/create-course", {
        state: { type: "Nền tảng TOEIC" },
      });
    } else if (type === 1) {
      navigate("/admin/create-course", {
        state: { type: "TOEIC Trung cấp" },
      });
    } else if (type === 2) {
      navigate("/admin/create-course", {
        state: { type: "TOEIC Chuyên sâu" },
      });
    }
  };

  const fetchCourses = async (key) => {
    if (key === "mainCourses") {
      const res = await getListCoursesOfAdmin("Main");
      console.log(res);
      if (res.code === 200) setCourses(res.data);
    }

    if (key === "subCourses") {
      const res = await getListCoursesOfAdmin("Support");
      console.log(res);
      if (res.code === 200) setCourses(res.data);
    }
  };

  useEffect(() => {
    fetchCourses(activeKey);
  }, []);

  return (
    <>
      <h1 className="page-title">Danh sách các khóa học</h1>
      <h3>
        Nền tảng TOEIC{" "}
        <PlusCircleTwoTone
          style={{ cursor: "pointer" }}
          onClick={() => handleCreateCourse(0)}
        />
      </h3>
      <Row gutter={[20, 20]}>
        {courses?.[0]?.courses.length > 0 ? (
          courses[0].courses.map((course) => (
            <Col
              xs={24} // mobile
              sm={24} // tablet nhỏ
              md={8} // tablet lớn
              lg={8} // desktop
              xl={6}
            >
              <CourseItem course={course} />
            </Col>
          ))
        ) : (
          <div>Không có khóa học</div>
        )}
      </Row>
      <h3>
        TOEIC Trung cấp{" "}
        <PlusCircleTwoTone
          style={{ cursor: "pointer" }}
          onClick={() => handleCreateCourse(1)}
        />
      </h3>
      <Row gutter={[20, 20]}>
        {courses?.[1]?.courses.length > 0 ? (
          courses[1].courses.map((course) => (
            <Col
              xs={24} // mobile
              sm={24} // tablet nhỏ
              md={8} // tablet lớn
              lg={8} // desktop
              xl={6}
            >
              <CourseItem course={course} />
            </Col>
          ))
        ) : (
          <div>Không có khóa học</div>
        )}
      </Row>
      <h3>
        TOEIC Chuyên sâu{" "}
        <PlusCircleTwoTone
          style={{ cursor: "pointer" }}
          onClick={() => handleCreateCourse(2)}
        />
      </h3>
      <Row gutter={[20, 20]}>
        {courses?.[2]?.courses.length > 0 ? (
          courses[2].courses.map((course) => (
            <Col
              xs={24} // mobile
              sm={24} // tablet nhỏ
              md={8} // tablet lớn
              lg={8} // desktop
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
export default ListCourses;
