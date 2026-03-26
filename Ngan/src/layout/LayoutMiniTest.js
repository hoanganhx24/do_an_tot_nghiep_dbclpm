import { Layout, Button, Modal, notification } from "antd";
import "./layout.scss";
import "../components/index.scss";
import { CloseOutlined, FieldTimeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MiniTest from "../pages/student/Test/MiniTest";
import { saveResultMiniTest, unlock } from "../services/FirstTestService";
import { openNotification } from "../components/Notification";
import { refreshToken, saveToken } from "../services/AuthService";
import { getId } from "../components/token";
const { Header, Content } = Layout;
function LayoutMiniTest() {
  const location = useLocation();
  const testId = location.state.testId;
  const completed = location?.state?.completed || null;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [api,contextHolder] = notification.useNotification();

  const handleSubmitFromChild = async (data) => {
    setIsSubmitted(true);

    console.log(data);
    const response = await saveResultMiniTest(data);
    
    if (response.code === 200) {
      console.log("Lưu thành công");
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    if (isSubmitted || completed) {
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
    navigate(-1);
  };

  return (
    <>
      {contextHolder}
      <Layout style={{ minHeight: "100vh" }}>
        <Header className="header">
          <Button style={{ backgroundColor: "#ddd" }} onClick={showModal}>
            <CloseOutlined />
            <h4>Thoát</h4>
          </Button>
          <div className="font500">Test 1</div>
          <div />
        </Header>
        <div style={{ display: "flex", flex: 1, marginTop: "60px" }}>
          <Layout>
            <Content className="layout__content2 backgroundStudy">
              <MiniTest onSubmit={handleSubmitFromChild} testId={testId} completed={completed}/>
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
    </>
  );
}
export default LayoutMiniTest;
