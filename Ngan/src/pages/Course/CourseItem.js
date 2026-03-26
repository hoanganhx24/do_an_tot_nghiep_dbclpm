import { Badge, Button } from "antd";
import { useNavigate } from "react-router-dom";
function CourseItem(props) {
  const course = props.course;
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const handleDetail = (id) => {
    if (role === "ADMIN")
      navigate("/admin/detail-course", {
        state: { id: id },
      });
    else {
      navigate("/teacher/detail-course", {
        state: { id: id },
      });
    }
  };
  return (
    <>
      {course && (
        <Badge.Ribbon text={course.status === "OLD" ? "PUBLISHED" : course.status} color={course.status === "NEW" ? "RED" : "GREEN"}>
          <div className="course">
            <img
              src={`data:image/png;base64,${course.imgData}`}
              className="course__image"
            />

            <div className="course__title">
              <div className="course__title--main">{course.title}</div>
              <div className="course__title--sub">{course.teacherName}</div>
            </div>
            <Button
              className="course__button"
              onClick={() => handleDetail(course.id)}
            >
              Xem chi tiết
            </Button>
          </div>
        </Badge.Ribbon>
      )}
    </>
  );
}
export default CourseItem;
