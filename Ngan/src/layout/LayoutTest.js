import { Layout, Button, Modal, notification } from "antd";
import "./layout.scss";
import "../components/index.scss";
import { CloseOutlined, FieldTimeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Test from "../pages/student/Test/test";
import { getFlow, saveResultFirstTest } from "../services/FirstTestService";
import { refreshToken, saveToken } from "../services/AuthService";
import { openNotification } from "../components/Notification";
const { Header, Content } = Layout;
function LayoutTest() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [result, setResult] = useState();
  const fetchLoTrinh = async () => {
    const response = await getFlow();
    console.log(response);
    if (response.code === 200) {
      setResult(response.data);
      setTimeout(() => {
        setIsModalOpenFlow(true);
      }, 1000);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        response.message || "Lấy lộ trình thất bại"
      );
    }
  };

  const handleSubmitFromChild = async (data) => {
    setIsSubmitted(true);

    console.log(data);
    const response = await saveResultFirstTest(data);
    console.log(response);
    if (response.code === 200) {
      fetchLoTrinh();
      localStorage.setItem("firstLogin",false);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        response.message || "Lưu kết quả bài test thất bại"
      );
    }
  };
  const [isModalOpenFlow, setIsModalOpenFlow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    if (isSubmitted) {
      navigate(-1);
    } else {
      setIsModalOpen(true);
    }
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const navigate = useNavigate();
  const handleCancel = () => {
    navigate("/home/main");
  };
  const [checkTime, setCheckTime] = useState(false);
  const [time, setTime] = useState(15 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    if (time === 0) {
      setCheckTime(true);
    }

    return () => clearInterval(interval);
  }, []);

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };
  return (
    <>
      {contextHolder}
      <Layout style={{ minHeight: "100vh" }}>
        <Header className="header">
          <div className="flex1">
            {!isSubmitted ? (
              <Button style={{ backgroundColor: "#ddd" }} onClick={showModal}>
                <CloseOutlined />
                <h4>Thoát</h4>
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => navigate("/student/my_courses")}
              >
                Lộ trình học
              </Button>
            )}
          </div>
          <div className="font500">Test 1</div>
          {!isSubmitted && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#fdecec",
                padding: "6px 12px",
                borderRadius: "12px",
                color: "#d80000",
                fontWeight: "600",
                fontSize: "16px",
                height: "40px",
              }}
            >
              <FieldTimeOutlined style={{ color: "#d80000" }} />
              {formatTime(time)}
            </div>
          )}
        </Header>
        <div style={{ display: "flex", flex: 1, marginTop: "60px" }}>
          <Layout>
            <Content className="layout__content2 backgroundStudy">
              <Test onSubmit={handleSubmitFromChild} checkTime={checkTime} />
            </Content>
          </Layout>
        </div>
      </Layout>
      <Modal
        title="Bạn chưa hoàn thành bài"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        maskClosable={false}
        footer={[
          <Button onClick={handleCancel}>Thoát</Button>,
          <Button type="primary" onClick={handleOk}>
            Tiếp tục làm bài
          </Button>,
        ]}
      >
        <p>Nếu thoát, bạn sẽ mất toàn bộ bài làm</p>
      </Modal>

      <Modal
        title="Lộ trình học"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpenFlow}
        onOk={() => setIsModalOpenFlow(false)}
        onCancel={() => setIsModalOpenFlow(false)}
        footer={[
          <Button type="primary" onClick={() => setIsModalOpenFlow(false)}>
            OK
          </Button>,
        ]}
      >
        {result
          ?.filter((item) => item.status === 1)
          .map((item) => (
            <>
              <h3>
                Bạn đang ở trình độ có số điểm tương đương{" "}
                <span style={{ color: "red" }}>
                  {item.trackResponse.code} Toeic
                </span>
              </h3>
            </>
          ))}
        {result?.filter((item) => item.status === 2).length > 0 && (
          <>
            <h3>Bạn đã vượt qua khóa học:</h3>
            {result
              ?.filter((item) => item.status === 2)
              .map((item) => (
                <div className="flex borderTest first-item" key={item.id}>
                  <div>Khóa học {item.trackResponse.code} Toeic</div>
                  <div style={{color:"green"}}>Đã vượt qua</div>
                </div>
              ))}
          </>
        )}

        {result?.filter((item) => item.status !== 2).length > 0 && (
          <>
            <h3>
              Chúng tôi đề xuất cho bạn lộ trình học bao gồm các khóa học:
            </h3>
            {result
              ?.filter((item) => item.status !== 2)
              .map((item, index) => (
                <div
                  className={`flex borderTest ${index === 0 ? "first-item" : ""}`}
                  key={item.id}
                >
                  <div>Khóa học {item.trackResponse.code} Toeic</div>
                  {item.status === 1 && <div style={{color:"green"}}>Mở khóa</div>}
                  {item.status === 0 && <div style={{color:"red"}}>Khóa</div>}
                </div>
              ))}
          </>
        )}
      </Modal>
    </>
  );
}
export default LayoutTest;
