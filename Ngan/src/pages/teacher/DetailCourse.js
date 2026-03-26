import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Tooltip,
} from "antd";
import HeaderCourse from "../Course/DetailCourse/HeaderCourse";
import ListLessons from "../Course/ListLessons/ListLessons";
import "./DetailCourse.scss";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createModuleOfCourse,
  getDetailCourse,
  getMaxOrderOfCourse,
} from "../../services/CourseService";
import { refreshToken, saveToken } from "../../services/AuthService";
import { openNotification } from "../../components/Notification";
function DetailCourse() {
  const location = useLocation();
  const id = location.state?.id || null;
  const role = localStorage.getItem("role");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [course, setCourse] = useState();
  const [maxOrder, setMaxOrder] = useState();
  const [form] = Form.useForm();
  const [version, setVersion] = useState();
  const fetchApiGetCourse = async (id, version) => {
    console.log(version);
    if (id) {
      setVersion(version);
      var response = await getDetailCourse(id, version);
      console.log(response.data);
      if (response.code === 200) {
        setCourse(response.data);
      } else if (response.code === 401) {
        const refresh = await refreshToken();
        if (refresh.code === 200) {
          saveToken(refresh.data.token, refresh.data.refreshToken);
        }
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", "Lỗi Server");
    }
    fetchApiGetMaxOrder(id);
  };

  const fetchApiGetMaxOrder = async (id) => {
    if (id) {
      const response = await getMaxOrderOfCourse(id);
      console.log(response);
      if (response.code === 200) {
        setMaxOrder(response.data);
      } else if (response.code === 401) {
        const refresh = await refreshToken();
        if (refresh.code === 200) {
          saveToken(refresh.data.token, refresh.data.refreshToken);
        }
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", "Lỗi Server");
    }
  };

  useEffect(() => {
    fetchApiGetCourse(id);
  }, []);

  const showModalLession = () => {
    form.setFieldsValue({
      orderIndex: maxOrder,
    });
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    const values = form.getFieldsValue();
    const payload = { ...values, courseId: id };
    setConfirmLoading(true);
    const response = await createModuleOfCourse(payload);
    console.log(response);
    if (response.code === 200) {
      fetchApiGetCourse(id);
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Tạo Module thành công."
      );
      setTimeout(() => {
        handleCancel();
      }, 1000);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setConfirmLoading(false);
    form.resetFields();
  };
  return (
    <>
      {contextHolder}
      <div className="detail__course">
        <HeaderCourse
          onReload={(courseId, version) => fetchApiGetCourse(courseId, version)}
          course={course}
        />
        <ListLessons
          role="Teacher"
          modules={course?.modules}
          onReload={() => fetchApiGetCourse(id, version)}
          status={course?.status}
          track={course?.trackName}
        />
        {role === "TEACHER" && course?.status !== "PUBLISHED" && (
          <Tooltip placement="bottom" title="Thêm bài học">
            <Button className="button__create" onClick={showModalLession}>
              +
            </Button>
          </Tooltip>
        )}
      </div>
      <Modal
        title="Thêm bài học"
        open={isModalOpen}
        onCancel={!confirmLoading ? handleCancel : undefined}
        maskClosable={false}
        keyboard={!confirmLoading}
        closable={!confirmLoading}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={handleOk}
            loading={confirmLoading}
          >
            OK
          </Button>,
        ]}
        style={{ width: "1000px" }}
      >
        <Form form={form} initialValues={{ orderIndex: maxOrder }}>
          <div className="form__teacher--item">
            <div className="white-space form__teacher--item--label">STT</div>
            <Form.Item
              name="orderIndex"
              className="no--margin--bottom form__teacher--input"
              rules={[{ required: true, message: "Không được để trống" }]}
            >
              <Input
                type="number"
                placeholder="Nhập số thứ tự bài học"
                disabled={confirmLoading}
              />
            </Form.Item>
          </div>
          <div className="form__teacher--item">
            <div className="white-space form__teacher--item--label">
              Tiêu đề
            </div>
            <Form.Item
              name="title"
              className="no--margin--bottom form__teacher--input"
              rules={[{ required: true, message: "Không được để trống" }]}
            >
              <Input
                placeholder="Nhập chủ đề bài học"
                disabled={confirmLoading}
              />
            </Form.Item>
          </div>
          <div className="form__teacher--item">
            <div className="white-space form__teacher--item--label">
              Thể loại
            </div>
            <Form.Item
              name="type"
              className="no--margin--bottom form__teacher--input"
              rules={[{ required: true, message: "Không được để trống" }]}
            >
              <Select
                placeholder="Chọn thể loại"
                style={{ flex: 1 }}
                disabled={confirmLoading}
                options={[
                  { value: "LESSON", label: <span>Bài học</span> },
                  { value: "TEST", label: <span>Bài test</span> },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}
export default DetailCourse;
