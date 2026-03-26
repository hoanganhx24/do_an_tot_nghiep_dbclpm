import { Button, notification, Select } from "antd";
import {logout} from "../../../components/function";
import GoBack from "../../../components/GoBack";
import "./HeaderCourse.scss";
import { publicCourse } from "../../../services/CourseService";
import { useNavigate } from "react-router-dom";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { openNotification } from "../../../components/Notification";
import { version } from "react";
const { Option } = Select;
function HeaderCourse(props) {
  const role = localStorage.getItem("role");
  const course = props.course;
  const [api, contextHolder] = notification.useNotification();
  const navigator = useNavigate();
  const publicC = async () => {
    const response = await publicCourse(course?.id);
    console.log(response.data);
    if (response.code === 200) {
      navigator("/teacher/courses");
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await publicCourse(course?.id);
        if (retryResponse.code === 200) {
          navigator("/teacher/courses");
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
    } else {
      openNotification(api, "bottomRight", response.message);
    }
  };

  const onChangeSelect = (value) => {
    console.log(value);
    if (value === "NEW") props.onReload(course?.id);
    else props.onReload(course?.id, value);
  };
  return (
    <>
      {contextHolder}
      <div className="header__lesson">
        <div className="flex">
          <div className="header__lesson--title">{course?.title}</div>
          <div className="flex1">
            <GoBack />
            {role !== "STUDENT" && (
              <Select
                style={{ width: "100px" }}
                placeholder={
                  course?.status!== "PUBLISHED"
                    ? "NEW"
                    : `Version ${course?.version}`
                }
                onChange={(value) => onChangeSelect(value)}
              >
                <Option value="NEW">New</Option>
                {course?.versions?.map((version) => (
                  <Option value={version}>Version {version}</Option>
                ))}
              </Select>
            )}

            {course?.status!== "PUBLISHED" && role === "TEACHER" && (
              <Button type="primary" onClick={() => publicC()}>
                Public khóa học
              </Button>
            )}
          </div>
        </div>
        <div className="header__lesson--description">{course?.description}</div>
      </div>
    </>
  );
}
export default HeaderCourse;
