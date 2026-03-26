import { Collapse, notification } from "antd";
import {
  CaretRightOutlined,
  PlayCircleTwoTone,
  StarFilled,
  TrophyFilled,
} from "@ant-design/icons";
import "./ListItem.scss";
import { useNavigate } from "react-router-dom";
import { openNotification } from "../../../components/Notification";
function ListItemStudent({ module, index, courseId, type }) {
  const [api, content] = notification.useNotification();
  const navigate = useNavigate();
  console.log(type);
  const handleClick = (lesson) => {
    if (lesson.status === "UNLOCK") {
      navigate("/study/detail-session", {
        state: { lessonId: lesson.id, courseId: courseId, type: type },
      });
    } else {
      openNotification(
        api,
        "bottomRight",
        "Thông báo",
        "Bạn chưa được phép học bài này. Hãy hoàn thành bài học trước đó."
      );
    }
  };
  const item = [
    {
      key: "1",
      label: (
        <>
          <div className="item__header">
            <div className="item__header--stt">{index + 1}</div>
            <div className="item__header--des">
              <div className="item__header--des--title">{module.title}</div>
              <div className="item__header--des--session">
                <div className="item__header--des--session--quantity">
                  {module.completedLessons}/{module.lessons.length} Sessions
                </div>
                <div className="item__header--des--session--star">
                  <StarFilled
                    style={{ marginRight: "8px", color: "#f6b464ff" }}
                  />
                  {module.completedStars}/{module.totalStar}
                </div>
              </div>
            </div>
            <div className="item__header--cup">
              <div className="item__header--cup">
                <TrophyFilled
                  style={{
                    marginRight: "8px",
                    color: module.completeCups >= 1 ? "#f6b464ff" : "#ddd",
                  }}
                />
                <TrophyFilled
                  style={{
                    marginRight: "8px",
                    color: module.completeCups >= 2 ? "#f6b464ff" : "#ddd",
                  }}
                />
                <TrophyFilled
                  style={{
                    marginRight: "8px",
                    color: module.completeCups >= 3 ? "#f6b464ff" : "#ddd",
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ),
      children: (
        <>
          <div className="items__session">
            {module?.lessons?.map((lesson, i) => (
              <div className="flex">
                <div className="item" onClick={() => handleClick(lesson)}>
                  <PlayCircleTwoTone style={{ paddingTop: "8px" }} />
                  <div className="item__tittle">
                    <div className="item__tittle--sub">
                      Session {i + 1}: {lesson.title} - {lesson.summary}
                    </div>
                    <div>
                      <StarFilled
                        style={{
                          marginRight: "8px",
                          color:
                            lesson.completedStar >= 1 ? "#f6b464ff" : "#ddd",
                        }}
                      />
                      <StarFilled
                        style={{
                          marginRight: "8px",
                          color:
                            lesson.completedStar >= 2 ? "#f6b464ff" : "#ddd",
                        }}
                      />
                      <StarFilled
                        style={{
                          color:
                            lesson.completedStar >= 3 ? "#f6b464ff" : "#ddd",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    color: lesson.status === "UNLOCK" ? "green" : "red",
                  }}
                >
                  {lesson.status}
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
  ];
  return (
    <>
      {content}
      <div style={{ margin: "15px 0" }}>
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          style={{
            background: "#fff",
            border: "1px solid #92dcf8ff",
            borderRadius: "10px",
          }}
          items={item}
        />
      </div>
    </>
  );
}
export default ListItemStudent;
