import { Form, Input, Button, Modal, notification } from "antd";
import "./index.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkCode, checkEmail } from "../../services/AuthService";
import { openNotification } from "../../components/Notification";
function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState();
  const [codeMail, setCodeMail] = useState();
  const [api, contextHolder] = notification.useNotification();
  const handleRegister = async (values) => {
    setStudent(values);
    setLoading(true);
    const payload = { email: values.email };
    const response = await checkEmail(payload);
    if (response.code === 200) {
      setOpen(true);
    } else {
      setLoading(false);
      form.resetFields();
      openNotification(api, "bottomRight", "Thất bại", response.message || "Không tìm thấy email");
    }
  };
  const handleOk = async () => {
    const payload = { ...student, otp: codeMail };
    const response = await checkCode(payload);

    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Tài khoản đã được gửi về email của bạn"
      );
      setTimeout(() => {
        navigate("/client/login");
      }, 500);
    } else {
      openNotification(
        api,
        "bottomRight",
        "Thất bại",
        "Xác thực không thành công"
      );
      setTimeout(() => {
        handleCancel();
      }, 500);
    }
  };
  const handleCancel = () => {
    setStudent(null);
    setOpen(false);
    form.resetFields();
    setCodeMail(null);
    setLoading(false);
  };
  const onChange = (text) => {
    //console.log("onChange:", text);
    setCodeMail(text);
  };
  const onInput = (value) => {
    //console.log("onInput:", value);
  };
  const handClickLogin = () => {
    navigate("/client/login");
  }
  const sharedProps = {
    onChange,
    onInput,
  };
  return (
    <>
      {contextHolder}
      <div className="form__login" style={{ width: "30%" }}>
        <div className="form__login--title">Đăng ký tài khoản</div>
        <div style={{ margin: "10px 30px" }}>
          <Form form={form} name="register" onFinish={handleRegister}>
            <div className="form__login--item">
              <h4 className="form__login--item--title">Email</h4>
              <Form.Item name="email" className="form__login--input" rules={[{ required: true, message: "Không được để trống" }]}>
                <Input disabled={loading} />
              </Form.Item>
            </div>
            <div className="form__login--item">
              <h4 className="form__login--item--title">Họ và tên</h4>
              <Form.Item name="fullName" className="form__login--input" rules={[{ required: true, message: "Không được để trống" }]}>
                <Input disabled={loading} />
              </Form.Item>
            </div>
            <div className="button">
              <Form.Item>
                <Button htmlType="submit" loading={loading} disabled={loading}>
                  {" "}
                  Đăng ký
                </Button>
              </Form.Item>
            </div>
            <div className="button" style={{ marginTop: "10px" }}>
              <span style={{alignContent:"center"}}>Bạn đã có tài khoản?</span><Button type="link" onClick={handClickLogin}>Đăng nhập</Button>
            </div>
          </Form>
        </div>
      </div>
      <Modal
        open={open}
        title="Xác thực"
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
        footer={[
          <Button type="primary" onClick={handleOk}>
            Đồng ý
          </Button>,
        ]}
      >
        <div>Mã xác thực đã được gửi về email của bạn. Vui lòng nhập mã!</div>
        <Input.OTP
          separator={(i) => (
            <span style={{ color: i & 1 ? "red" : "blue" }}>—</span>
          )}
          {...sharedProps}
        />
      </Modal>
    </>
  );
}
export default Register;
