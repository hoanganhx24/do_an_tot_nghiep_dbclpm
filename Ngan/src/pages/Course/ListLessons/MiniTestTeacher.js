import {
  Button,
  Collapse,
  Dropdown,
  Form,
  Input,
  Modal,
  notification,
  Select,
} from "antd";
import { CaretRightOutlined, PlayCircleTwoTone } from "@ant-design/icons";
import "./ListItem.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Document from "../Session/Document";
import CreateSession from "../Session/CreateSession";
import { openNotification } from "../../../components/Notification";
import { refreshToken, saveToken } from "../../../services/AuthService";
import {
  createLessionOfModule,
  createTestOfModule,
  deleteModuleOfCourse,
  deleteTestOfModule,
  getOrderIndexOfLesson,
  updateModuleOfCourse,
} from "../../../services/CourseService";
function MiniTestTeacher(props) {
  const module = props.module;
  const status = props.status;
  const role = localStorage.getItem("role");
  const navigation = useNavigate();
  const [ac, setAc] = useState();
  const [acL, setAcL] = useState();
  const [sessionId, setSessionId] = useState();
  const [api, contextHolder] = notification.useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleClickViewTest = (test) => {
    if (role === "ADMIN") {
      if (test) {
        navigation("/admin/list-miniTest", {
          state: { test: test, status },
        });
      }
    }
    if (role === "TEACHER") {
      if (test) {
        navigation("/teacher/list-miniTest", {
          state: { test: test, status },
        });
      }
    }
  };

  const showModal = (ac) => {
    setAc(ac);
    setIsModalOpen(true);
  };

  const deleteSession = () => {};

  const createTest = async () => {
    var data = form1.getFieldsValue();
    const response = await createTestOfModule({ ...data, moduleId: module.id });
    console.log(response);
    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Thêm bài test thành công"
      );
      setTimeout(() => {
        if (props.onReload) props.onReload();
      }, 1000);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.message);
    }
    handleCancel();
  };

  const deleteTest = async () => {
    const response = await deleteTestOfModule(sessionId);
    console.log(response);
    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Xóa bài test thành công"
      );
      setTimeout(() => {
        if (props.onReload) props.onReload();
      }, 1000);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.message);
    }
    handleCancel();
  };

  const handleOk = () => {
    setConfirmLoading(true);
    if (ac === "View") {
    } else if (ac === "Update") {
    } else if (ac === "Delete") {
      deleteTest();
    } else if (ac === "Create") {
      createTest();
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setAc(null);
    setSessionId(null);
    setConfirmLoading(false);
    setTimeout(() => {
      if (props.onReload) props.onReload();
    }, 1000);
  };

  // ----------------------------------------

  const [isModalOpenL, setIsModalOpenL] = useState(false);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [confirmLoadingL, setConfirmLoadingL] = useState(false);
  const [moduleId, setModuleId] = useState();
  const showModalL = (acL) => {
    setAcL(acL);
    form.setFieldsValue(module);
    setIsModalOpenL(true);
  };

  const updateLesson = async (data) => {
    const payload = {
      id: module.id,
      orderIndex: data.orderIndex,
      title: data.title,
    };
    console.log(payload);
    const response = await updateModuleOfCourse(payload);
    console.log(response);
    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Sửa bài học thành công"
      );
      setTimeout(() => {
        if (props.onReload) props.onReload();
      }, 1000);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.message);
    }
    handleCancelL();
  };

  const deleteLesson = async () => {
    const response = await deleteModuleOfCourse(module.id);
    console.log(response);
    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Xóa bài học thành công"
      );
      setTimeout(() => {
        if (props.onReload) props.onReload();
      }, 500);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.message);
    }
    handleCancelL();
  };

  const handleOkL = () => {
    setConfirmLoadingL(true);
    if (acL === "UpdateLesson") {
      const values = form.getFieldsValue(true);
      updateLesson(values);
    } else if (acL === "DeleteLesson") {
      deleteLesson();
    }
  };
  const handleCancelL = () => {
    setIsModalOpenL(false);
    setAcL(null);
    setConfirmLoadingL(false);
  };

  const action = (test) => [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            handleClickViewTest(test);
            setSessionId(test.id);
          }}
        >
          Xem bài test
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          onClick={() => {
            showModal("Delete");
            setSessionId(test.id);
          }}
        >
          Xóa bài test
        </div>
      ),
    },
  ];

  const actionAdmin = (test) => [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            handleClickViewTest(test);
            setSessionId(test.id);
          }}
        >
          Xem bài test
        </div>
      ),
    },
  ];

  const actionL = [
    {
      key: "1",
      label: <div onClick={() => showModal("Create")}>Thêm bài test</div>,
    },
    {
      key: "2",
      label: <div onClick={() => showModalL("UpdateLesson")}>Sửa bài học</div>,
    },
    {
      key: "3",
      label: <div onClick={() => showModalL("DeleteLesson")}>Xóa bài học</div>,
    },
  ];

  const actionL1 = [
    {
      key: "2",
      label: <div onClick={() => showModalL("UpdateLesson")}>Sửa bài học</div>,
    },
    {
      key: "3",
      label: <div onClick={() => showModalL("DeleteLesson")}>Xóa bài học</div>,
    },
  ];

  const item = [
    {
      key: String(module.id),
      label: (
        <>
          <div className="item__header">
            <div className="item__header--stt">{module.orderIndex}</div>
            <div className="item__header--des">
              <div className="item__header--des--title">{module.title}</div>
            </div>
            {status !== "PUBLISHED" && (
              <>
                {role === "TEACHER" && module.tests === undefined && (
                  <div className="item__header--cup">
                    <Dropdown menu={{ items: actionL }} placement="bottom">
                      <Button type="primary">Hành động</Button>
                    </Dropdown>
                  </div>
                )}
                {role === "TEACHER" && module.tests !== undefined && (
                  <div className="item__header--cup">
                    <Dropdown menu={{ items: actionL1 }} placement="bottom">
                      <Button type="primary">Hành động</Button>
                    </Dropdown>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ),
      children: (
        <>
          {module.tests !== undefined && (
            <>
              {module.tests.map((lesson) => (
                <div className="items__session flex">
                  <div className="item">
                    <div className="item__tittle">
                      <div className="item__tittle--sub">
                        Test {lesson.name}
                      </div>
                    </div>
                  </div>
                  {(role === "TEACHER" && status!=="PUBLISHED")&& (
                    <div>
                      <Dropdown
                        menu={{ items: action(lesson) }}
                        placement="bottom"
                      >
                        <Button type="primary">Hành động</Button>
                      </Dropdown>
                    </div>
                  )}

                  {(role === "ADMIN" || (role === "TEACHER" && status==="PUBLISHED"))&& (
                    <div>
                      <Dropdown
                        menu={{ items: actionAdmin(lesson) }}
                        placement="bottom"
                      >
                        <Button type="primary">Hành động</Button>
                      </Dropdown>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </>
      ),
    },
  ];

  const getTitle = () => {
    if (role === "ADMIN") {
      return "Xem bài giảng";
    } else if (role === "TEACHER") {
      if (ac === "Create") {
        return "Thêm bài giảng";
      } else if (ac === "Update") {
        return "Sửa bài giảng";
      } else if (ac === "Delete") {
        return "Xóa bài test";
      } else if (ac === "View") {
        return "Xem bài giảng";
      }
      if (acL === "UpdateLesson") {
        return "Sửa bài học";
      } else if (acL === "DeleteLesson") {
        return "Xóa bài học";
      }
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ margin: "15px 0" }}>
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          style={{
            background: "#fff",
            border: "1px solid #aee1f4ff",
            borderRadius: "10px",
          }}
          items={item}
        />
      </div>
      <Modal
        destroyOnHidden
        className="modalTest"
        title={getTitle()}
        open={isModalOpen}
        onCancel={!confirmLoading ? handleCancel : undefined}
        maskClosable={!confirmLoading}
        keyboard={!confirmLoading}
        closable={!confirmLoading}
        footer={
          <Button
            key="ok"
            type="primary"
            onClick={handleOk}
            loading={confirmLoading}
          >
            OK
          </Button>
        }
      >
        {ac === "Delete" ? (
          <div>Bạn chắc chắn muốn xóa bài test này?</div>
        ) : (
          <>
            {role === "TEACHER" && (
              <Form form={form1} name="module">
                <div className="form__teacher--item">
                  <div className="white-space form__teacher--item--label">
                    Tên bài test
                  </div>
                  <Form.Item
                    name="name"
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
                  >
                    <Select
                      placeholder="Chọn thể loại"
                      style={{ flex: 1 }}
                      disabled={confirmLoading}
                      options={[
                        { value: "VOCABULARY", label: <span>Vocabulary</span> },
                        { value: "GRAMMAR", label: <span>Grammar</span> },
                        { value: "READING", label: <span>Reading</span> },
                        { value: "LISTENING", label: <span>Listening</span> },
                      ]}
                    />
                  </Form.Item>
                </div>
              </Form>
            )}
          </>
        )}
      </Modal>

      {role === "TEACHER" && (
        <Modal
          className="modalTest"
          title={getTitle()}
          open={isModalOpenL}
          onCancel={!confirmLoadingL ? handleCancelL : undefined}
          maskClosable={!confirmLoadingL}
          keyboard={!confirmLoadingL}
          closable={!confirmLoadingL}
          footer={[
            <Button
              key="ok"
              type="primary"
              onClick={handleOkL}
              loading={confirmLoadingL}
            >
              OK
            </Button>,
          ]}
        >
          {acL === "DeleteLesson" ? (
            <div>Bạn chắc chắn muốn xóa bài học này?</div>
          ) : (
            <Form form={form} name="module">
              <div className="form__teacher--item">
                <div className="white-space form__teacher--item--label">
                  STT
                </div>
                <Form.Item
                  name="orderIndex"
                  className="no--margin--bottom form__teacher--input"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input
                    type="number"
                    placeholder="Nhập số thứ tự bài học"
                    disabled={confirmLoadingL}
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
                    disabled={confirmLoadingL}
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
                >
                  <Select
                    placeholder="Chọn thể loại"
                    style={{ flex: 1 }}
                    disabled={true}
                    options={[
                      { value: "LESSON", label: <span>Bài học</span> },
                      { value: "TEST", label: <span>Bài test</span> },
                    ]}
                  />
                </Form.Item>
              </div>
            </Form>
          )}
        </Modal>
      )}
    </>
  );
}
export default MiniTestTeacher;
