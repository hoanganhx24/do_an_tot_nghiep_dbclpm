import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  notification,
  Row,
  Tabs,
} from "antd";
import { useEffect, useState } from "react";
import {
  getUser,
  updatePassword,
  updateUser,
} from "../../services/AuthService";
import { openNotification } from "../../components/Notification";
import { Grid } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useLocation } from "react-router-dom";
dayjs.extend(customParseFormat);
function Account() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [disable, setDisable] = useState(true);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [loadingPass, setLoadingPass] = useState(false);
  const location = useLocation();
  const isAdminAccount =
    location.pathname.includes("/admin/account") ||
    location.pathname.includes("/teacher/account");

  const cancel = () => {
    setLoading(true);
    form.setFieldsValue();
  };

  const [api, content] = notification.useNotification();

  const getInfo = async () => {
    const res = await getUser();
    console.log(res);
    if (res.code === 200) {
      form.setFieldsValue({
        email: res.data.email,
        phone: res.data?.phone || "",
        fullName: res.data?.fullName || "",
        birthday: res.data?.birthday ? dayjs(res.data?.birthday) : null,
        address: res.data?.address || "",
      });
    } else {
      openNotification(api, "bottomRight", "Lỗi", res.message);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    var value = form.getFieldsValue();
    const data = {
      ...value,
      birthday: value.birthday?.format("YYYY-MM-DD"),
    };
    const res = await updateUser(data);
    console.log(res);
    if (res.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thông báo",
        "Lưu thông tin thành công"
      );
      getInfo();
      setTimeout(() => {
        setLoading(true);
        setDisable(true);
      }, 1000);
    } else {
      openNotification(api, "bottomRight", "Lỗi", res.message);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleUpdatePass = async () => {
    setLoadingPass(true);
    var value = form1.getFieldsValue();
    console.log(value);
    const res = await updatePassword(value);
    console.log(res);
    if (res.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thông báo",
        "Lưu mật khẩu thành công"
      );
    } else {
      openNotification(api, "bottomRight", "Lỗi", res.message);
    }
    setTimeout(() => {
      setLoadingPass(false);
    }, 1000);
    form1.resetFields();
  };

  const items = [
    {
      key: "1",
      label: "Tài khoản",
      children: (
        <div
          style={{
            padding: screens.md ? "0 80px" : "0 16px",
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="fullName"
                  label="Họ tên"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input disabled={loading} size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input disabled={true} size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="birthday"
                  label="Ngày sinh"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <DatePicker
                    disabled={loading}
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Không được để trống" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message:
                        "Phải nhập đủ 10 số, không có chữ hoặc ký tự đặc biệt",
                    },
                  ]}
                >
                  <Input maxLength={10} disabled={loading} size="large" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input disabled={loading} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ justifySelf: "center" }}>
              {disable ? (
                <Button
                  type="primary"
                  onClick={() => {
                    setDisable(false);
                    setLoading(false);
                  }}
                >
                  Sửa thông tin
                </Button>
              ) : (
                <div className="flex1">
                  <Button onClick={() => cancel()} disabled={loading}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu thông tin
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "2",
      label: "Thay đổi mật khẩu",
      children: (
        <div
          style={{
            padding: screens.md ? "0 80px" : "0 16px",
          }}
        >
          <Form form={form1} layout="vertical" onFinish={handleUpdatePass}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="password"
                  label="Mật khẩu cũ"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input.Password disabled={loadingPass} size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input.Password disabled={loadingPass} size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="confirmNewPassword"
                  label="Xác nhận mật khẩu"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input.Password disabled={loadingPass} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ justifySelf: "center" }}>
              <Button type="primary" htmlType="submit" loading={loadingPass}>
                Lưu mật khẩu
              </Button>
            </div>
          </Form>
        </div>
      ),
    },
  ];
  return (
    <>
      {content}
      {isAdminAccount && <h1 className="page-title">Thông tin tài khoản</h1>}
      <Tabs
        defaultActiveKey="1"
        items={items}
        className="marginTop50 border"
        style={{
          marginTop: isAdminAccount && "0px",
          boxShadow: isAdminAccount && "0 8px 24px rgba(0, 0, 0, 0.06)",
        }}
      />
    </>
  );
}
export default Account;
