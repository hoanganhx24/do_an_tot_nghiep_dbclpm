import { StarFilled, TrophyFilled } from "@ant-design/icons";
import "./ListItem.scss";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { openNotification } from "../../../components/Notification";
function MiniTestStudent({ module, index, courseId, type }) {
  const navigate = useNavigate();
  const [api, context] = notification.useNotification();
  const handleClick = () => {
    if (module?.tests[0]?.id) {
      if (module?.tests[0].status === "UNLOCK") {
        navigate("/study/mini-test", {
          state: { testId: module.tests[0].id, courseId, type },
        });
      }else{
        openNotification(api, "bottomRight", "Thông báo", "Bạn chưa được phép học bài này. Hãy hoàn thành bài học trước đó.")
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", "Không có dữ liệu bài test");
    }
  };
  return (
    <>
      {context}
      <div
        className="item__header miniTestStudent"
        onClick={handleClick}
        style={{ marginBottom: "15px" }}
      >
        <div className="item__header--stt">{index + 1}</div>
        <div className="item__header--des">
          <div className="item__header--des--title">{module.title}</div>
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
  );
}
export default MiniTestStudent;
