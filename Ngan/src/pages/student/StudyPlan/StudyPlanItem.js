import { Collapse, notification } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { openNotification } from "../../../components/Notification";
function StudyPlanItem({ plan, index }) {
  const navigate = useNavigate();
  const [api, content] = notification.useNotification();
  const handleClick = (lesson) => {
    if (lesson.type === "LESSON") {
      if (lesson.status !== "LOCK") {
        navigate("/study/detail-session", {
          state: { lessonId: lesson.id },
        });
      } else {
        openNotification(
          api,
          "bottomRight",
          "Thông báo",
          "Bạn chưa được phép học bài này. Hãy hoàn thành các bài trước đó."
        );
      }
    } else {
      if (lesson.status !== "LOCK") {
        navigate("/study/mini-test", {
          state: { testId: lesson.id },
        });
      } else {
        openNotification(
          api,
          "bottomRight",
          "Thông báo",
          "Bạn chưa được phép học bài này. Hãy hoàn thành các bài trước đó."
        );
      }
    }
  };
  const itemS = [
    {
      key: "1",
      label: (
        <>
          <div className="item__header">
            <div className="item__header--stt">{index + 1}</div>
            <div className="item__header--des">
              <div className="item__header--des--title">Buổi {index + 1}</div>
            </div>
          </div>
        </>
      ),
      children: (
        <>
          <div className="items__session">
            {plan.plans?.map((lesson) => (
              <div
                className="item"
                onClick={() => handleClick(lesson)}
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="item__tittle">
                  {lesson.type === "LESSON" ? (
                    <div className="item__tittle--sub">
                      Lesson: {lesson.title}
                    </div>
                  ) : (
                    <div className="item__tittle--sub">
                      Test: {lesson.title}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    color: lesson.status === "UNLOCK" ? "green" : "red",
                  }}
                >
                  {lesson.status}
                </div>
                {plan.completedStar > 0 && (
                  <div className="plan__title">Đã hoàn thành</div>
                )}
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
          s
          style={{
            background: "#fff",
            border: "1px solid #92dcf8ff",
            borderRadius: "10px",
          }}
          items={itemS}
        />
      </div>
    </>
  );
}
export default StudyPlanItem;
