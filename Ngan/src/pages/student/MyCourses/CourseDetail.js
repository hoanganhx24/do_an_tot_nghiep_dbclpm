import HeaderCourse from "../../Course/DetailCourse/HeaderCourse";
import ListLessons from "../../Course/ListLessons/ListLessons";
import GoBack from "../../../components/GoBack";
import "../../teacher/DetailCourse.scss";
import "../../../components/index.scss";
import { TrophyFilled } from "@ant-design/icons";
import { Col, notification, Row } from "antd";
import { useLocation } from "react-router-dom";
import { getDetailCourseStudent } from "../../../services/CourseService";
import { useEffect, useState } from "react";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { getId } from "../../../components/token";
import { logout } from "../../../components/function";
import { openNotification } from "../../../components/Notification";
function CourseDetail() {
  const location = useLocation();
  const id = location.state?.id;
  const type = location.state?.type;
  console.log(type);
  const [course, setCourse] = useState();
  const [api, context] = notification.useNotification();
  const fetchGetCourseStudent = async () => {
    const response = await getDetailCourseStudent(id, getId());
    console.log(response.data);
    if (response.code === 200) {
      setCourse(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getDetailCourseStudent(id, getId());
        if (retryResponse.code === 200) {
          setCourse(retryResponse.data);
        } else {
          openNotification(api, "bottomRight", "Lỗi", retryResponse.message);
        }
      } else {
        openNotification(
          api,
          "bottomRight",
          "Cảnh báo",
          "Phiên đăng nhập của bạn đã hết hạn"
        );
        setTimeout(() => {
          logout();
        }, 1000);
      }
    }
  };

  useEffect(() => {
    fetchGetCourseStudent();
  }, []);
  return (
    <>
      <div className="detail__course">
        <HeaderCourse course={course} />
        <Row gutter={20}>
          <Col
            xs={{ span: 24, order: 2 }} // mobile: xuống dưới
            sm={{ span: 24, order: 2 }}
            md={{ span: 16, order: 1 }} // desktop: bên trái
            lg={{ span: 16, order: 1 }}
            xl={{ span: 16, order: 1 }}
          >
            <ListLessons role="Student" modules={course?.modules} id={id} type={type}/>
          </Col>
          <Col
            xs={{ span: 24, order: 1 }} // mobile: lên trên
            sm={{ span: 24, order: 1 }}
            md={{ span: 8, order: 2 }} // desktop: sang phải
            lg={{ span: 8, order: 2 }}
            xl={{ span: 8, order: 2 }}
          >
            <div className="right">
              <img
                src="https://g-static-assets.prepcdn.com/learning-web-app/v20251101.1244-c422471d/imgs/learning-dashboard/topic/star-badge-not-finish.svg"
                alt="star"
              />
              <div className="font500 right__title">
                Bạn cần thực hiện thêm nhiệm vụ để hoàn thành khoá học này
              </div>
              <div className="flex margin15">
                <div className="font500">Số cúp đã đạt</div>
                <div>
                  <TrophyFilled
                    style={{ marginLeft: "8px", color: "orange" }}
                  />{" "}
                  {course?.completedCup}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}
export default CourseDetail;
