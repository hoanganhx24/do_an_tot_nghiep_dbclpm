import { Form, Input, Button, Modal, notification } from "antd";
import "./index.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgetPassword } from "../../services/AuthService";
import { openNotification } from "../../components/Notification";
function ForgetPass({ onSuccess }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const handle = async (values) => {
    setLoading(true);
    const email = values.email;
    const response = await forgetPassword(email);
    if (response.code === 200) {
      onSuccess(); // đóng modal ForgetPass
      setOpen(true); // mở modal thông báo
      setLoading(false);
    } else {
      openNotification(
        api,
        "bottomRight",
        "Thất bại",
        response.message || "Không tìm thấy email"
      );
      setTimeout(()=> handleCancel(),1000);
    }
  };
  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <Form form={form} name="register" onFinish={handle}>
        <div className="form__login--item">
          <h4 className="form__login--item--title">Email</h4>
          <Form.Item name="email" className="form__login--input" rules={[{ required: true, message: "Không được để trống" }]}>
            <Input disabled={loading} />
          </Form.Item>
        </div>
        <div className="button">
          <Form.Item>
            <Button htmlType="submit" loading={loading} disabled={loading}>
              {" "}
              Lấy lại mật khẩu
            </Button>
          </Form.Item>
        </div>
      </Form>
      <Modal
        open={open}
        title="Thông báo"
        onOk={handleCancel}
        onCancel={handleCancel}
        maskClosable={false}
        footer={[
          <Button type="primary" onClick={handleCancel}>
            Đồng ý
          </Button>,
        ]}
      >
        <div>Mật khẩu mới đã được gửi về email của bạn.</div>
      </Modal>
    </>
  );
}
export default ForgetPass;
