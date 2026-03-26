import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Modal,
  Upload,
  notification,
  Select,
} from "antd";
import GoBack from "../../components/GoBack";
import { UploadOutlined } from "@ant-design/icons";
import "./course.scss";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { openNotification } from "../../components/Notification";
import { createCourse } from "../../services/CourseService";
import { refreshToken, saveToken } from "../../services/AuthService";
import { getListTeachersActive } from "../../services/TeacherService";

function CreateCourse() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const type = location.state?.type || null;

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [verify, setVerify] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [trackCode, setTrackCode] = useState();
  const [options, setOptions] = useState([]);

  const fetchAPIGet = async () => {
    const response = await getListTeachersActive();
    if (response.code === 200) {
      var teachers = [];
      response.data.forEach((element) => {
        teachers = [
          ...teachers,
          { value: element.id, label: element.fullName },
        ];
      });
      setOptions(teachers);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    }
  };

  useEffect(() => {
    if (type === "Nền tảng TOEIC") {
      setTrackCode("0-300");
    } else if (type === "TOEIC Trung cấp") {
      setTrackCode("300-600");
    } else {
      setTrackCode("600+");
    }
    fetchAPIGet();
  }, []);

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Chỉ được tải lên file hình ảnh (jpg, png, jpeg...)"
        );
        return Upload.LIST_IGNORE;
      }

      // chỉ cho phép 1 file duy nhất
      if (fileList.length >= 1) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Chỉ được up 1 file duy nhất"
        );
        return Upload.LIST_IGNORE;
      }

      setFileList([...fileList, file]);
      return false; // không upload ngay, chỉ lưu file vào state
    },

    fileList,
  };

  const handleCourse = async (values) => {
    if (!fileList.length) {
      return openNotification(api, "bottomRight", "Lỗi", "Vui lòng chọn ảnh");
    }
    const formData = new FormData();
    var courseData = {};
    if (role === "ADMIN") {
      courseData = {
        trackCode: trackCode,
        title: values.title,
        description: values.description,
        levelTag: 0,
        isPublished: 1,
        teacherId: values.teacher,
        type: "MAIN",
      };
    }else if(role === "TEACHER"){
      courseData = {
        trackCode: trackCode,
        title: values.title,
        description: values.description,
        levelTag: 0,
        isPublished: 1,
        teacherId: values.teacher,
        type: "SUPPORT",
      };
    }

    formData.append("course", JSON.stringify(courseData)); // Postman gửi dạng text JSON
    formData.append("image", fileList[0]); // file image

    setOpen(true);
    setLoading(true);

    const response = await createCourse(formData);
    console.log(response);
    if (response.code === 200) {
      setLoading(false);
      setVerify(true);
    } else {
      handleCancel();
    }
  };

  const handleOk = () => {
    if (verify) {
      navigate("/admin/courses");
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setLoading(false);
    setVerify(false);
    form.resetFields();
    setFileList([]);
  };

  console.log(role);
  return (
    <>
      {contextHolder}
      <h3>Thông tin cơ bản</h3>
      <div className="form__course">
        <Form
          form={form}
          onFinish={handleCourse}
          initialValues={{
            type: type,
          }}
        >
          <Row gutter={[30, 15]}>
            <Col span={24}>
              <div
                className="form__course--item"
                style={{ justifyContent: "flex-start", gap: "20px" }}
              >
                <h4 className="white-space form__course--item--label">
                  Hình minh họa
                </h4>
                <Upload {...props} style={{ display: "flex", gap: "10px" }}>
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </div>
            </Col>
            <Col span={24}>
              <div className="form__course--item">
                <h4 className="white-space form__course--item--label">
                  Tên khóa học
                </h4>
                <Form.Item
                  className="no--margin--bottom form__course--input"
                  name="title"
                  rules={[{ required: true, message: "Vui lòng nhập" }]}
                >
                  <Input style={{ minHeight: "40px" }} />
                </Form.Item>
              </div>
            </Col>
            <Col span={24}>
              <div className="form__course--item">
                <h4 className="white-space form__course--item--label">
                  Thể loại
                </h4>
                <Form.Item
                  className="no--margin--bottom form__course--input"
                  name="type"
                >
                  <Input style={{ minHeight: "40px" }} disabled={type} />
                </Form.Item>
              </div>
            </Col>
            <Col span={24}>
              <div
                className="form__course--item"
                style={{ marginTop: "20px", marginBottom: "15px" }}
              >
                <h4 className="white-space form__course--item--label">Mô tả</h4>
                <Form.Item
                  className="no--margin--bottom"
                  name="description"
                  style={{ flex: "1", marginLeft: "20px" }}
                >
                  <Input.TextArea style={{ minHeight: "80px" }} />
                </Form.Item>
              </div>
            </Col>
            <Col span={24} style={role !== "ADMIN" && { display: "none" }}>
              <div className="form__course--item">
                <h4 className="form__course--item--label">
                  Phân công giáo viên giảng dạy
                </h4>
                <Form.Item
                  className="no--margin--bottom form__course--input"
                  name="teacher"
                  rules={[{ required: true, message: "Vui lòng chọn" }]}
                >
                  <Select
                    placeholder="Chọn giáo viên"
                    style={{ flex: 1 }}
                    options={options}
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>
          <div className="form__course--button">
            <GoBack />
            <Form.Item>
              <Button htmlType="submit">Thêm khóa học</Button>
            </Form.Item>
          </div>
        </Form>
        <Modal
          open={open}
          title="Xác nhận"
          onOk={handleOk}
          closable={false}
          maskClosable={false}
          loading={loading}
          footer={[
            <Button type="primary" onClick={handleOk}>
              Đồng ý
            </Button>,
          ]}
        >
          {!verify ? (
            <>
              <div>Thêm khóa học thất bại!</div>
            </>
          ) : (
            <>
              <div>Thêm khóa học thành công!</div>
            </>
          )}
        </Modal>
      </div>
    </>
  );
}

export default CreateCourse;
