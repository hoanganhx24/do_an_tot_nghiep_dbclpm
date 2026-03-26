import { Form, Input, Button } from "antd";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../../services/AuthService";
import { parseJwt } from "../../components/function";
import {
  getAccessToken,
  getId,
  setAccessToken,
  setId,
  setRefreshToken,
} from "../../components/token";
import { Modal } from "antd";
import ForgetPass from "./ForgetPass";
function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [openForget, setOpenForget] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    setDisabled(true);
    const response = await loginUser(values);
    console.log(response);
    if (response.code === 200) {
      localStorage.setItem("firstLogin",response.data.firstLogin);
      setAccessToken(response.data.token.trim());
      console.log(getAccessToken());
      setRefreshToken(response.data.refreshToken.trim());
      const obj = parseJwt(response.data.token);
      setId(obj.id);
      localStorage.setItem("role", obj.role);
      if (obj.role === "ADMIN") {
        navigate("/admin/teachers");
      } else if (obj.role === "TEACHER") {
        navigate("/teacher/courses");
      } else if (obj.role === "STUDENT") {
        if (response.data.firstLogin === false) navigate("/student/my_courses");
        else navigate("/home/test-in");
      }
    } else if (response.code === 1015) {
      setLoading(false);
      setDisabled(false);
      setMessage("Tài khoản đã bị vô hiệu hóa");
      form.resetFields();
    } else {
      setLoading(false);
      setDisabled(false);
      setMessage("Tài khoản hoặc mật khẩu không đúng!");
      form.resetFields();
    }
  };

  const handleClickRegister = () => {
    navigate("/client/register");
  };
  return (
    <>
      <div className="form__login">
        <div className="form__login--title">Đăng nhập</div>
        <div style={{ margin: "10px 30px" }}>
          <Form form={form} name="login" onFinish={handleLogin}>
            <div className="form__login--item">
              <h4 className="form__login--item--title">Tài khoản</h4>
              <Form.Item name="email" className="form__login--input" rules={[{ required: true, message: "Không được để trống" }]}>
                <Input disabled={disabled} />
              </Form.Item>
            </div>
            <div className="form__login--item">
              <h4 className="form__login--item--title">Mật khẩu</h4>
              <Form.Item name="password" className="form__login--input" rules={[{ required: true, message: "Không được để trống" }]}>
                <Input.Password disabled={disabled} />
              </Form.Item>
            </div>
            {message && <div className="errorMessage">{message}</div>}
            <div className="button">
              <Form.Item>
                <Button htmlType="submit" loading={loading} disabled={disabled}>
                  {" "}
                  Đăng nhập
                </Button>
              </Form.Item>
            </div>
            <div className="button" style={{ marginTop: "10px" }}>
              <Button type="link" onClick={() => setOpenForget(true)}>
                Quên mật khẩu?
              </Button>
              <Button type="link" onClick={handleClickRegister}>
                Tạo tài khoản mới?
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <Modal
        title="Quên mật khẩu"
        open={openForget}
        footer={null}
        maskClosable={false}
        onCancel={() => setOpenForget(false)}
      >
        <ForgetPass onSuccess={() => setOpenForget(false)} />
      </Modal>
    </>
  );
}
export default Login;
