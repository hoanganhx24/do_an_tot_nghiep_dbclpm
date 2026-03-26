import { Layout, Button, Modal } from "antd";
import "./layout.scss";
import "../components/index.scss";
import {CloseOutlined,RetweetOutlined } from "@ant-design/icons";
import { useState } from "react";
import ExcerciseDetail from "../pages/student/MyCourses/ExcerciseDetail";
import { useNavigate } from "react-router-dom";
const { Header, Content} = Layout;
function LayoutExcercise() {
  const [isDone, setIsDone]=useState(false);
  const setDone = () => {
    setIsDone(true);
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    if(!isDone) setIsModalOpen(true);
    else{
      handleCancel();
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
      <Layout style={{ minHeight: "100vh" }}>
        <Header className="header">
          <Button style={{backgroundColor:"#ddd"}} onClick={showModal}><CloseOutlined /><h4>Thoát</h4></Button>
          <div className="font500">Bài tập</div>
          <div/>
          {/* {isDone ? (<Button type="primary"><RetweetOutlined /><h4>Làm lại bài</h4></Button>) : (<div/>)} */}
        </Header>
        <div style={{ display: "flex", flex: 1, marginTop: "60px" }}>
          <Layout>
            <Content className="layout__content2">
              <ExcerciseDetail setDone={setDone}/>
            </Content>
          </Layout>
        </div>
      </Layout>
      <Modal
        title="Bạn chưa hoàn thành bài"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        maskClosable={false}
        footer={[
          <Button onClick={handleCancel}>
            Thoát
          </Button>,
          <Button type="primary" onClick={handleOk}>
            Tiếp tục làm bài
          </Button>,
        ]}
      >
        {!isDone && <p>Nếu thoát, bạn sẽ mất toàn bộ bài làm</p>}
      </Modal>
    </>
  );
}
export default LayoutExcercise;
