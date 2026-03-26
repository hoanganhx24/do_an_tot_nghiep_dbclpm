import {
  Form,
  Input,
  Row,
  Col,
  Button,
  DatePicker,
  Modal,
  Radio,
  notification,
} from "antd";
import GoBack from "../../../components/GoBack";
import "./teacher.scss";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ListCourses from "../../../components/ListCourses/ListCourses";
import { createTeacher, updateTeacher } from "../../../services/TeacherService";
import {
  checkCodeTeacher,
  checkEmail,
  refreshToken,
  saveToken,
} from "../../../services/AuthService";
import { openNotification } from "../../../components/Notification";
import dayjs from "dayjs";
import { getListCoursesOfTeacher } from "../../../services/CourseService";
import { logout } from "../../../components/function";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
function CreateTeacher() {
  const [form] = Form.useForm();
  const [teacher, setTeacher] = useState();
  const [disable, setDisable] = useState(false);
  const [message, setMessage] = useState();
  const [code, setCode] = useState();
  const [courses, setCourses] = useState();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const location = useLocation();

  const mode = location.state?.mode || "create";
  console.log(mode);
  const record = location.state?.record || null;

  const fetchApiCourse = async (type, id) => {
    const response = await getListCoursesOfTeacher(type, id);
    console.log(response);
    if (response.code === 200) {
      setCourses(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getListCoursesOfTeacher(type, id);
        if (retryResponse.code === 200) {
          setCourses(retryResponse.data);
        } else {
          openNotification(api, "bottomRight", "Lỗi", retryResponse.message);
        }
      } else {
        openNotification(
          api,
          "bottomRight",
          "Cảnh báo",
          "Phiên đăng nhập của bạn đã hết hạn"
        );
        setTimeout(() => {
          logout();
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (mode === "edit" && record) {
      setDisable(true);
      setTeacher(record);
      form.setFieldsValue({
        ...record,
        birthday: record.birthday
          ? dayjs(record.birthday, "DD/MM/YYYY", true)
          : null,
        graduationYear: record.graduationYear
          ? dayjs(record.graduationYear.toString())
          : null,
      });
      fetchApiCourse("Main", record.id);
    }
  }, [mode, form, record]);

  console.log(teacher, disable);

  const handleCreateAccount = async (values) => {
    var payload = {
      ...values,
      birthday: values.birthday.format("YYYY-MM-DD"),
      graduationYear: parseInt(values.graduationYear.format("YYYY")),
      role: "TEACHER",
    };
    if (mode === "create") {
      setTeacher(payload);
      setLoading(true);
      const response = await createTeacher(payload);
      setTimeout(() => setOpen(true), 1000);
      console.log(response);
      if (response.code === 200) {
        setLoading(false);
        setCode(200);
        setMessage(`Tài khoản của giáo viên đã gửi về email: ${payload.email}`);
        setOpen(true);
      } else if (response.code === 401) {
        setLoading(false);
        const refresh = await refreshToken();
        if (refresh.code === 200) {
          saveToken(refresh.data.token, refresh.data.refreshToken);

          const retryResponse = await createTeacher(payload);
          if (retryResponse.code === 200) {
            setLoading(false);
            setCode(200);
            setMessage(
              `Tài khoản của giáo viên đã gửi về email: ${payload.email}`
            );
            setOpen(true);
          } else {
            openNotification(api, "bottomRight", "Lỗi", retryResponse.message);
          }
        }
      } else if (response.code === 1007) {
        setLoading(false);
        setMessage("Email không đúng.");
        setCode(1007);
        setOpen(true);
      } else if (response.code === 1014) {
        setLoading(false);
        setCode(1014);
        setMessage("Email đã tồn tại.");
        setOpen(true);
      } else {
        openNotification(
          api,
          "bottomRight",
          "Cảnh báo",
          "Phiên đăng nhập của bạn đã hết hạn"
        );
        setTimeout(() => {
          logout();
        }, 1000);
      }
    } else {
      payload = { ...payload, teacherid: teacher.id };
      console.log(payload);
      const response = await updateTeacher(payload);
      console.log(response);
      if (response.code === 200) {
        openNotification(
          api,
          "bottomRight",
          "Thành công",
          "Sửa thông tin thành công"
        );
        setTimeout(() => {
          navigate("/admin/teachers");
        }, 500);
      } else {
        openNotification(
          api,
          "bottomRight",
          "Thất bại",
          "Sửa thông tin thất bại"
        );
      }
    }
  };

  const navigate = useNavigate();
  const handleOk = () => {
    if (code === 200) {
      navigate("/admin/teachers");
    } else {
      setOpen(false);
    }
    setTeacher(null);
    setCode(null);
    setMessage(null);
  };

  const [loadingButtonVerify, setLoadingButtonVerify] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [mail, setMail] = useState();
  const handleCode = async () => {
    setLoadingModal(true);
    const email = form.getFieldValue("email");
    const payload = { email: email, otp: codeMail };
    const response = await checkCodeTeacher(payload);

    if (response.code === 200) {
      setCheck(true);
      setMail(email);
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Email đã được xác thực"
      );
    } else if (response.code === 2000 || response.code === 2001) {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        "OTP không chính xác, vui lòng xác thực lại"
      );
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await checkCodeTeacher(payload);
        if (retryResponse.code === 200) {
          setCheck(true);
          setMail(email);
          openNotification(
            api,
            "bottomRight",
            "Thành công",
            "Email đã được xác thực"
          );
        } else {
          openNotification(api, "bottomRight", "Lỗi", retryResponse.message);
        }
      } else {
        openNotification(
          api,
          "bottomRight",
          "Cảnh báo",
          "Phiên đăng nhập của bạn đã hết hạn"
        );
        setTimeout(() => {
          logout();
        }, 1000);
      }
    } else {
      openNotification(
        api,
        "bottomRight",
        "Thất bại",
        "Xác thực không thành công"
      );
    }

    setTimeout(() => {
      setLoadingModal(false);
      setVerify(false);
      setOpen(false);
      setCodeMail(null);
    }, 500);
  };

  const onChangeEmail = (e) => {
    if (e !== mail) {
      setCheck(false);
    } else {
      setCheck(true);
    }
  };

  const [verify, setVerify] = useState(false);
  const [codeMail, setCodeMail] = useState();
  const [check, setCheck] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const handleVerify = async () => {
    const email = form.getFieldValue("email");
    const payload = { email: email };
    console.log(payload);
    setLoadingButtonVerify(true);
    const response = await checkEmail(payload);
    console.log(response);
    if (response.code === 200) {
      setOpen(true);
      setVerify(true);
      setLoadingButtonVerify(false);
    } else if (response.code === 1007) {
      setVerify(false);
      setMessage("Email không đúng.");
      setOpen(true);
      setCode(1007);
      setLoadingButtonVerify(false);
    } else if (response.code === 1014) {
      setVerify(false);
      setCode(1014);
      setMessage("Email đã tồn tại.");
      setOpen(true);
      setLoadingButtonVerify(false);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await checkEmail(payload);
        if (retryResponse.code === 200) {
          setOpen(true);
          setVerify(true);
          setLoadingButtonVerify(false);
        } else if (response.code === 1007) {
          setVerify(false);
          setMessage("Email không đúng.");
          setOpen(true);
          setCode(1007);
          setLoadingButtonVerify(false);
        } else if (response.code === 1014) {
          setVerify(false);
          setCode(1014);
          setMessage("Email đã tồn tại.");
          setOpen(true);
          setLoadingButtonVerify(false);
        } else {
          openNotification(api, "bottomRight", "Lỗi", retryResponse.message);
        }
      } else {
        openNotification(
          api,
          "bottomRight",
          "Cảnh báo",
          "Phiên đăng nhập của bạn đã hết hạn"
        );
        setTimeout(() => {
          logout();
        }, 1000);
      }
    }
  };

  const onChange = (text) => {
    // console.log("onChange:", text);
    setCodeMail(text);
  };
  const onInput = (value) => {
    // console.log("onInput:", value);
  };
  const sharedProps = {
    onChange,
    onInput,
  };

  const optionsSex = [
    { label: "Nam", value: "Nam", className: "label-1" },
    { label: "Nữ", value: "Nữ", className: "label-2" },
  ];

  return (
    <>
      {contextHolder}
      <h3>Thông tin cơ bản</h3>
      <div className="form__teacher">
        <Form form={form} name="create-teacher" onFinish={handleCreateAccount}>
          <Row gutter={[30, 15]}>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Họ và tên
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="fullName"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div
                className="form__teacher--item"
                style={{ justifyContent: "flex-start", gap: "10px" }}
              >
                <h4 className="white-space form__teacher--item--label">
                  Giới tính
                </h4>
                <Form.Item
                  className="no--margin--bottom"
                  name="sex"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính" },
                  ]}
                >
                  <Radio.Group
                    options={optionsSex}
                    disabled={disable}
                    optionType="button"
                  />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Ngày sinh
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="birthday"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        if (value.isAfter(dayjs())) {
                          return Promise.reject(
                            new Error("Ngày sinh phải nhỏ hơn ngày hiện tại")
                          );
                        }

                        const minDate = dayjs().subtract(20, "year");

                        if (value.isAfter(minDate)) {
                          return Promise.reject(
                            new Error("Tuổi phải từ 20 trở lên")
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Căn cước công dân
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="cccd"
                  rules={[
                    { required: true, message: "Vui lòng nhập số" },
                    {
                      pattern: /^[0-9]{12}$/,
                      message:
                        "Phải nhập đủ 12 số, không có chữ hoặc ký tự đặc biệt",
                    },
                  ]}
                >
                  <Input maxLength={12} disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Số điện thoại
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message:
                        "Phải nhập đủ 10 số, không có chữ hoặc ký tự đặc biệt",
                    },
                  ]}
                >
                  <Input maxLength={10} disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12} style={{ alignContent: "center" }}>
              <Form.Item
                label="Email liên lạc"
                required={false} // ❌ bỏ dấu *
                colon={false} // ❌ bỏ dấu : sau label
                className="email-wrapper"
                validateStatus={
                  form.getFieldError("email").length ? "error" : ""
                }
                help={form.getFieldError("email")[0]}
              >
                <div className="input-row">
                  <Form.Item
                    name="email"
                    noStyle
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();

                          // validate email chuẩn RFC 5322
                          const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

                          if (!emailRegex.test(value)) {
                            return Promise.reject("Email không đúng định dạng");
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      disabled={
                        (mode === "edit" || loadingButtonVerify) && true
                      }
                      placeholder="Nhập email"
                      className="email-input"
                      onChange={(e) => onChangeEmail(e.target.value)}
                    />
                  </Form.Item>

                  <Button
                    type="button"
                    className="verify-btn"
                    onClick={handleVerify}
                    loading={loadingButtonVerify}
                    style={mode === "edit" && { display: "none" }}
                  >
                    Verify Email
                  </Button>
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Địa chỉ
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="address"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Tốt nghiệp trường
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="university"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Chuyên ngành
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="major"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Năm tốt nghiệp
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="graduationYear"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <DatePicker
                    picker="year"
                    style={{ width: "100%" }}
                    disabled={loading}
                  />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Bằng cấp
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="degree"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="form__teacher--item">
                <h4 className="white-space form__teacher--item--label">
                  Chứng chỉ tiếng anh
                </h4>
                <Form.Item
                  className="no--margin--bottom form__teacher--input"
                  name="englishCertificate"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input disabled={loading} />
                </Form.Item>
              </div>
            </Col>
            <Col span={24}>
              <div className="form__teacher--item" style={{ margin: "12px 0" }}>
                <h4 className="white-space form__teacher--item--label">
                  Kinh nghiệm giảng dạy
                </h4>
                <Form.Item
                  className="no--margin--bottom"
                  style={{ width: "85.5%" }}
                  name="teachingExperience"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input.TextArea disabled={loading} />
                </Form.Item>
              </div>
            </Col>
          </Row>
          {disable ? (
            <div style={{ marginTop: "20px" }}>
              <h3>Danh sách các khóa học đang giảng dạy</h3>
              <ListCourses courses={courses} />
            </div>
          ) : (
            <></>
          )}

          <div className="form__teacher--button">
            <GoBack />
            <Form.Item>
              <Button
                htmlType="submit"
                loading={loading}
                disabled={!check}
                style={disable ? { display: "none" } : {}}
              >
                Thêm giáo viên
              </Button>
              <Button
                htmlType="submit"
                loading={loading}
                style={
                  !disable || teacher.status !== "ACTIVE"
                    ? { display: "none" }
                    : {}
                }
              >
                Sửa thông tin
              </Button>
            </Form.Item>
          </div>
        </Form>

        <Modal
          open={open}
          title={verify ? "Xác nhận email" : "Tạo tài khoản"}
          onOk={verify ? handleCode : handleOk}
          onCancel={handleOk}
          loading={loadingModal}
          maskClosable={false}
          footer={[
            <Button type="primary" onClick={verify ? handleCode : handleOk}>
              Đồng ý
            </Button>,
          ]}
        >
          {verify ? (
            <>
              <div>
                Mã xác thực đã được gửi về email của bạn. Vui lòng nhập mã!
              </div>
              <Input.OTP
                separator={(i) => (
                  <span style={{ color: i & 1 ? "red" : "blue" }}>—</span>
                )}
                {...sharedProps}
              />
            </>
          ) : (
            <>
              <div className="errorMessage">{message}</div>
            </>
          )}
        </Modal>
      </div>
    </>
  );
}

export default CreateTeacher;
