import { TrophyFilled } from "@ant-design/icons";
import { Badge, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { openNotification } from "../../../components/Notification";

function CourseItem({ course }) {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const handleClick = () => {
    if (course?.lock !== "LOCK")
      navigate("/student/course-detail", { state: { id: course.id, type: course?.lock || null } });
    else {
      openNotification(
        api,
        "bottomRight",
        "Thông báo",
        "Bạn chưa có quyền học khóa này. Bạn phải hoàn thành các khóa học trước đó."
      );
    }
  };

  const handleText = (lock) => {
    if(lock === "DONE") return "Vượt qua";
    else if(lock === "UNLOCK") return "Mở khóa";
    else if(lock === "LOCK") return "Khóa";
  }
  return (
    <>
      {contextHolder}
      <Badge.Ribbon text={handleText(course?.lock)}>
        <div className="course__item" onClick={handleClick}>
          <div className="course__item--boxi">
            <img
              src={`data:image/png;base64,${course?.imgData}`}
              className="course__item--boxi--image"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="course__item--title">{course?.title}</div>
            <div className="course__item--status">
              <div>Đã hoàn thành</div>
              <div>
                <TrophyFilled style={{ marginLeft: "8px", color: "orange" }} />{" "}
                {course?.completedCup}
              </div>
            </div>
          </div>
        </div>
      </Badge.Ribbon>
    </>
  );
}
export default CourseItem;
