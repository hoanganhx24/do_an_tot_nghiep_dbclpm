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
  deleteLessonOfModule,
  deleteModuleOfCourse,
  getOrderIndexOfLesson,
  updateModuleOfCourse,
} from "../../../services/CourseService";
function ListItemTeacher(props) {
  const module = props.module;
  const role = localStorage.getItem("role");
  const status = props.status;
  const track = props.track;
  const navigation = useNavigate();
  const [ac, setAc] = useState();
  const [acL, setAcL] = useState();
  const [sessionId, setSessionId] = useState();
  const [api, contextHolder] = notification.useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [orderIndex, setOrdeIndex] = useState();

  const fetchApiOrderIndex = async () => {
    const response = await getOrderIndexOfLesson(module.id);
    console.log("số:" + response.data);
    if (response.code === 200) {
      setOrdeIndex(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    }
  };
  const showModal = (ac) => {
    setAc(ac);
    if (ac === "Create") fetchApiOrderIndex();
    setIsModalOpen(true);
  };

  const deleteSession = async() => {
    const response = await deleteLessonOfModule(sessionId);
    if (response.code === 200) {
      openNotification(api, "bottomRight", "Thông báo", "Xóa bài giảng thành công");
      setTimeout(()=>handleCancel(),1000);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    }else{
      openNotification(api, "bottomRight", "Lỗi", response.message || "Xóa bài giảng thất bại")
    }
  };

  const handleOk = () => {
    setConfirmLoading(true);
    if (ac === "View") {
    } else if (ac === "Update") {
    } else if (ac === "Delete") {
      deleteSession();
    } else if (ac === "Create") {
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

  const handleClickExcercises = (lesson) => {
    if (role === "TEACHER") {
      navigation("/teacher/list-excercises", {
        state: { lesson, status, track },
      });
    } else {
      navigation("/admin/list-excercises", {
        state: { lesson,status },
      });
    }
  };

  const action = (lesson) => [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            showModal("View");
            setSessionId(lesson.id);
          }}
        >
          Xem bài giảng
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => {
            showModal("Update");
            setSessionId(lesson.id);
          }}
        >
          Sửa bài giảng
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          onClick={() => {
            showModal("Delete");
            setSessionId(lesson.id);
          }}
        >
          Xóa bài giảng
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div onClick={() => handleClickExcercises(lesson)}>
          Xem danh sách bài tập
        </div>
      ),
    },
  ];

  const actionAdmin = (lesson) => [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            showModal("View");
            setSessionId(lesson.id);
          }}
        >
          Xem bài giảng
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div onClick={() => handleClickExcercises(lesson)}>
          Xem danh sách bài tập
        </div>
      ),
    },
  ];

  const actionL = [
    {
      key: "1",
      label: <div onClick={() => showModal("Create")}>Thêm bài giảng</div>,
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

  const item = [
    {
      key: String(module.id),
      label: (
        <>
          <div className="item__header">
            <div className="item__header--stt">{module.orderIndex}</div>
            <div className="item__header--des">
              <div className="item__header--des--title">{module.title}</div>
              <div className="item__header--des--session">
                <div className="item__header--des--session--quantity">
                  {module?.lessons?.length} Sessions
                </div>
              </div>
            </div>
            {role === "TEACHER" && (
              <div className="item__header--cup">
                {role === "TEACHER" && status!== "PUBLISHED" && (
                  <Dropdown menu={{ items: actionL }} placement="bottom">
                    <Button type="primary">Hành động</Button>
                  </Dropdown>
                )}
              </div>
            )}
          </div>
        </>
      ),
      children: (
        <>
          {module?.lessons?.length > 0 && (
            <>
              {module?.lessons?.map((lesson) => (
                <div className="items__session flex">
                  <div className="item">
                    <PlayCircleTwoTone style={{ paddingTop: "8px" }} />
                    {role === "ADMIN" ? (
                      <div className="item__tittle">
                        <div className="item__tittle--sub">
                          Session {lesson.orderIndex}: {lesson.title}
                        </div>
                      </div>
                    ) : (
                      <div className="item__tittle">
                        <div className="item__tittle--sub">
                          Session {lesson.orderIndex}: {lesson.title}
                        </div>
                      </div>
                    )}
                  </div>
                  {role === "TEACHER" && status!== "PUBLISHED" && (
                    <div>
                      <Dropdown
                        menu={{ items: action(lesson) }}
                        placement="bottom"
                      >
                        <Button type="primary">Hành động</Button>
                      </Dropdown>
                    </div>
                  )}

                  {(role === "ADMIN" ||
                    (role === "TEACHER" && status=== "PUBLISHED")) && (
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
        return "Xóa bài giảng";
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
        maskClosable={false}
        keyboard={!confirmLoading}
        closable={!confirmLoading}
        footer={
          ac === "Delete" && [
            <Button
              key="ok"
              type="primary"
              onClick={handleOk}
              loading={confirmLoading}
            >
              OK
            </Button>,
          ]
        }
      >
        {ac === "Delete" ? (
          <div>Bạn chắc chắn muốn xóa bài giảng này?</div>
        ) : ac === "View" ? (
          <Document lessonId={sessionId} />
        ) : (
          <>
            {role === "TEACHER" && (
              <CreateSession
                ac={ac}
                orderIndex={orderIndex}
                lessonId={sessionId}
                handleCancel={handleCancel}
                moduleId={module.id}
              />
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
          maskClosable={false}
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
export default ListItemTeacher;
