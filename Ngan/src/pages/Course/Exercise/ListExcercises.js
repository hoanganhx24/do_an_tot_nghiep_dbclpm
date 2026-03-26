import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Table,
  TimePicker,
  Tooltip,
  Upload,
} from "antd";
import GoBack from "../../../components/GoBack";
import { DeleteTwoTone, EditTwoTone, EyeTwoTone } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OnlyChoiceQuestion from "./OnlyChoiceQuestion";
import CreateOnlyChoiceQuestion from "./CreateOnlyChoiceQuestion";
import CreateMultiChoiceQuestion from "./CreateMultiChoiceQuestion";
import CreateTrueFalseQuestion from "./CreateTrueFalseQuestion";
import CreateVideoExcerciseQuestion from "./CreateVideoExcerciseQuestion";
import CreateListeningPart1Question from "./CreateListeningPart1Question";
import CreateListeningPart2Question from "./CreateListeningPart2Question";
import CreateListeningPart34Question from "./CreateListeningPart34Question";
import CreateReadingPart5Question from "./CreateReadingPart5Question";
import MultiChoiceQuestion from "./MultiChoiceQuestion";
import TrueFalseQuestion from "./TrueFalseQuestion";
import ListeningPart1Question from "./ListeningPart1Question";
import ListeningPart2Question from "./ListeningPart2Question";
import ListeningPart34Question from "./ListeningPart34Question";
import CreateReadingPart7Question from "./CreatereadingPart7Question";
import CreateReadingPart6Question from "./CreateReadingPart6Question";
import ReadingPart6Question from "./ReadingPart6Question";
import ReadingPart7Question from "./ReadingPart7Question";
import { refreshToken, saveToken } from "../../../services/AuthService";
import {
  createExerciseOfTeacherLesson,
  deleteExerciseOfTeacherLesson,
  deleteQuestionOfExercise,
  getListExercisesOfTeacherLesson,
  getListQuestionOfExercise,
  updateExerciseOfTeacherLesson,
} from "../../../services/ExerciseService";
import { openNotification } from "../../../components/Notification";
import { UploadOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import CreateDienTu from "./CreateDienTu";
import dayjs from "dayjs";
function ListExcercises() {
  const role = localStorage.getItem("role");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [ac, setAc] = useState();
  const location = useLocation();
  const lesson = location.state?.lesson || null;
  const status = location.state?.status;
  const track = location.state?.track;
  const [excercise, setExercise] = useState();
  const [form] = Form.useForm();
  const [selected, setSelected] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [audioList, setAudioList] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [paragraphs, setParagraphs] = useState([]);
  const [paragraphSelect, setParagraphSelect] = useState(null);
  const [content, setContent] = useState();

  useEffect(() => {
    if (ac === "Update") {
      if (exerciseQuestions?.paragraphs) {
        setContent(exerciseQuestions.paragraphs.join(""));
      }
    }
  }, [ac]);
  console.log(content);

  const handleChange = (value) => {
    setParagraphs(Array(value).fill("")); // tạo array paragraph
    setParagraphSelect(value);
  };

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

  const propsAudio = {
    onRemove: (file) => {
      const index = audioList.indexOf(file);
      const newAudioList = audioList.slice();
      newAudioList.splice(index, 1);
      setAudioList(newAudioList);
    },

    beforeUpload: (file) => {
      // kiểm tra file có phải audio
      const isAudio = file.type.startsWith("audio/");
      if (!isAudio) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Chỉ được tải lên file audio (mp3, wav, ogg...)"
        );
        return Upload.LIST_IGNORE;
      }

      // giới hạn 1 file duy nhất
      if (audioList.length >= 1) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Chỉ được tải lên 1 file audio duy nhất"
        );
        return Upload.LIST_IGNORE;
      }

      // lưu file vào state mà không upload ngay
      setAudioList([...audioList, file]);
      return false;
    },

    fileList: audioList,
  };

  const [exerciseQuestions, setExerciseQuestions] = useState();

  const fetchGetQuestionsOfEx = async (id) => {
    const response = await getListQuestionOfExercise(id);
    console.log(response);

    if (response.code === 200) {
      setExerciseQuestions(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.data);
    }
  };

  const showModal = (ac, excercise) => {
    setAc(ac);
    setSelected(null);
    setExercise(excercise);

    if (ac === "Update") {
    }

    setIsModalOpen(true);
  };

  const updateExcerCise = async () => {
    setConfirmLoading(true);
    const formData = new FormData();
    var exerciseRequest;

    if (
      excercise.typeName === "Bài tập Reading Part 6" ||
      excercise.typeName === "Bài tập Reading Part 7"
    ) {
      exerciseRequest = {
        id: excercise.id,
        paragraphs: [content],
      };
    } else {
      exerciseRequest = {
        id: excercise.id,
      };
      formData.append("mediaData", audioList[0]); // file audio
    }

    formData.append("request", JSON.stringify(exerciseRequest)); // Postman gửi dạng text JSON
    

    const response = await updateExerciseOfTeacherLesson(formData);
    console.log(response);

    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Cập nhật thành công bài tập"
      );
      fetchGetListExercises();
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", "Cập nhật bài tập thất bại");
    }

    setTimeout(() => {
      handleCancel();
    }, 500);
  };

  const createExcerCise = async () => {
    
    const formData = new FormData();
    const values = { ...form.getFieldsValue() };
    if(!values.title || !values.type){
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        "Hãy nhập đầy đủ thông tin"
      );
      return;
    }
    setConfirmLoading(true);
    var exerciseRequest;
    if (values.type === "INTERACTIVE") {
      exerciseRequest = {
        type: values.type,
        title: values.title,
        lessonID: lesson.id,
        paragraphs: paragraphs,
        showTime: values.time.format("HH:mm:ss"),
      };
    } else {
      exerciseRequest = {
        type: values.type,
        title: values.title,
        lessonID: lesson.id,
        paragraphs: paragraphs,
      };
    }

    formData.append("request", JSON.stringify(exerciseRequest)); // Postman gửi dạng text JSON
    formData.append("mediaData", audioList[0]); // file audio
    formData.append("imgData", fileList[0]); // file img

    const response = await createExerciseOfTeacherLesson(formData);
    console.log(response);

    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Tạo thành công bài tập"
      );
      fetchGetListExercises();
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", "Tạo bài tập thất bại");
    }

    setTimeout(() => {
      handleCancel();
    }, 500);
  };

  const deleteExercise = async () => {
    setConfirmLoading(true);
    const response = await deleteExerciseOfTeacherLesson(excercise.id);
    console.log(response);
    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Xóa bài tập thành công"
      );
      fetchGetListExercises();
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.data);
    }
    setTimeout(() => {
      handleCancel();
    }, 500);
  };

  const handleOk = () => {
    if (ac === "Create") {
      if (
        selected === "LISTENING_1" ||
        selected === "LISTENING_2" ||
        selected === "LISTENING_3_4"
      ) {
        if (audioList.length === 0) {
          openNotification(
            api,
            "bottomRight",
            "Lỗi",
            "Bạn chưa chọn file nghe"
          );
          return;
        }
      }

      if (selected === "READING_6" || selected === "READING_7") {
        if (!paragraphSelect) {
          openNotification(
            api,
            "bottomRight",
            "Lỗi",
            "Bạn chưa chọn số lượng đoạn văn"
          );
          return;
        } else if (!paragraphs || paragraphs.some((a) => a === "")) {
          openNotification(
            api,
            "bottomRight",
            "Lỗi",
            "Bạn chưa nhập nội dung đoạn văn"
          );
          return;
        }
      }
      if (selected === "INTERACTIVE") {
        var values = form.getFieldsValue();
        if (!values.time) {
          openNotification(
            api,
            "bottomRight",
            "Lỗi",
            "Bạn chưa chọn thời gian hiển thị"
          );
          return;
        }
      }

      createExcerCise();
    }

    if (ac === "Delete") {
      deleteExercise(excercise.id);
    }

    if (ac === "Update") {
      if (
        excercise.typeName === "Bài tập Listening Part 1" ||
        excercise.typeName === "Bài tập Listening Part 2" ||
        excercise.typeName === "Bài tập Listening Part 3 và 4"
      ) {
        if (audioList.length === 0) {
          openNotification(
            api,
            "bottomRight",
            "Lỗi",
            "Bạn chưa chọn file nghe"
          );
          return;
        }
      }

      if (
        excercise.typeName === "Bài tập Reading Part 6" ||
        excercise.typeName === "Bài tập Reading Part 7"
      ) {
        if (content.length === 0 || !content) {
          openNotification(
            api,
            "bottomRight",
            "Lỗi",
            "Bạn chưa nhập đoạn văn"
          );
          return;
        }
      }

      updateExcerCise();
    }
  };
  const handleCancel = () => {
    setExerciseQuestions(null);
    setSelected(null);
    setParagraphSelect(null);
    setParagraphs([]);
    setConfirmLoading(false);
    form.resetFields();
    setFileList([]);
    setAudioList([]);
    setContent();
    if (ac !== "View") {
      setAc(null);
      setExercise(null);
      setIsModalOpen(false);
    }
  };

  const handleCancelView = () => {
    setExerciseQuestions(null);
    setSelected(null);
    setParagraphSelect(null);
    setParagraphs([]);
    setConfirmLoading(false);
    form.resetFields();
    setFileList([]);
    setAudioList([]);
    setAc(null);
    setExercise(null);
    setIsModalOpen(false);
  };

  // --------------Question----------

  const [isModalOpenQ, setIsModalOpenQ] = useState(false);
  const [confirmLoadingQ, setConfirmLoadingQ] = useState(false);
  const [acQ, setAcQ] = useState();
  const [question, setQuestion] = useState();
  const [index, setIndex] = useState();

  const showModalQ = (acQ, i, excercise) => {
    setAcQ(acQ);
    setExercise(excercise);
    if (ac !== "View") {
      setIsModalOpen(false);
      setConfirmLoading(false);
      setAc(null);
    }

    if (acQ === "View") {
      setIndex(i);
      setTimeout(() => {
        setIsModalOpenQ(true);
      }, 500);
    }
    if (acQ === "Update" || acQ === "Delete") {
      setIsModalOpenQ(false);

      setTimeout(() => {
        setIsModalOpenQ(true);
      }, 500);
    }

    if (acQ === "Create") {
      setIsModalOpenQ(false);

      setTimeout(() => {
        setIsModalOpenQ(true);
      }, 500);
    }
  };

  const deleteQuestion = async () => {
    const response = await deleteQuestionOfExercise(question.id);
    console.log(response);
    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Xóa câu hỏi thành công"
      );
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", response.data);
    }
    setTimeout(() => {
      handleCancelQ();
    }, 500);
  };

  const handleOkQ = () => {
    setConfirmLoadingQ(true);
    if (acQ === "Delete") {
      deleteQuestion();
    }
  };
  const handleCancelQ = () => {
    setIsModalOpenQ(false);
    setQuestion(null);
    setConfirmLoadingQ(false);
    setAcQ(null);
    if (ac !== "View") setExercise(null);
    setIndex(null);
    fetchGetQuestionsOfEx(excercise.id);
  };

  const [exercises, setExercises] = useState([]);
  const fetchGetListExercises = async () => {
    var response;
    if (lesson) response = await getListExercisesOfTeacherLesson(lesson.id);
    console.log(response);
    if (response.code === 200) {
      setExercises(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    }
  };

  useEffect(() => {
    fetchGetListExercises();
  }, []);

  const dataSource = [
    ...exercises,
    {
      key: "1",
      title: "Bài 1",
      type: "Only Choice",
    },
    {
      key: "2",
      title: "Bài 2",
      type: "Multi Choice",
    },
    {
      key: "3",
      title: "Bài 3",
      type: "True/False",
    },
    {
      key: "4",
      title: "Bài 4",
      type: "Bài tập tương tác",
    },
    {
      key: "5",
      title: "Bài 5",
      type: "Listening Part 1",
    },
    {
      key: "6",
      title: "Bài 6",
      type: "Listening Part 2",
    },
    {
      key: "7",
      title: "Bài 7",
      type: "Listening Part 3",
    },
    {
      key: "8",
      title: "Bài 8",
      type: "Listening Part 4",
    },
    {
      key: "9",
      title: "Bài 9",
      type: "Reading Part 5",
    },
    {
      key: "10",
      title: "Bài 10",
      type: "Reading Part 6",
    },
    {
      key: "11",
      title: "Bài 9",
      type: "Reading Part 7",
    },
  ];

  const columns = [
    {
      title: "Bài tập",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Thể loại",
      dataIndex: "typeName",
      key: "typeName",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        return (
          <>
            {role === "TEACHER" && (
              <>
                {status !== "PUBLISHED" && (
                  <Tooltip placement="bottom" title="Xóa">
                    <Button
                      onClick={() => showModal("Delete", record)}
                      icon={<DeleteTwoTone twoToneColor="#c41a1aff" />}
                      style={{ marginRight: "10px" }}
                    />
                  </Tooltip>
                )}

                <Tooltip placement="bottom" title="Xem chi tiết">
                  <Button
                    icon={<EyeTwoTone twoToneColor="#c4501aff" />}
                    onClick={() => {
                      fetchGetQuestionsOfEx(record.id);
                      showModal("View", record);
                    }}
                    style={{ marginRight: "10px" }}
                  />
                </Tooltip>

                {(record.typeName === "Bài tập Listening Part 1" ||
                  record.typeName === "Bài tập Listening Part 2" ||
                  record.typeName === "Bài tập Listening Part 3 và 4" ||
                  record.typeName === "Bài tập Reading Part 6" ||
                  record.typeName === "Bài tập Reading Part 7") &&
                  status !== "PUBLISHED" && (
                    <Tooltip placement="bottom" title="Sửa bài tập">
                      <Button
                        icon={<EditTwoTone />}
                        onClick={() => {
                          fetchGetQuestionsOfEx(record.id);
                          setTimeout(() => showModal("Update", record), 1500);
                        }}
                      />
                    </Tooltip>
                  )}
              </>
            )}

            {role === "ADMIN" && (
              <>
                <Tooltip placement="bottom" title="Xem chi tiết">
                  <Button
                    icon={<EyeTwoTone twoToneColor="#c4501aff" />}
                    onClick={() => {
                      fetchGetQuestionsOfEx(record.id);
                      showModal("View", record);
                    }}
                  />
                </Tooltip>
              </>
            )}
          </>
        );
      },
    },
  ];

  const getTitle = () => {
    if (isModalOpen) {
      if (ac === "Create") {
        return `Thêm bài tập`;
      } else if (ac === "Delete") {
        return "Xóa bài tập";
      } else if (ac === "View") {
        return `Xem bài tập dạng ${excercise.typeName}`;
      } else if (ac === "Update") {
        return `Sửa bài tập dạng ${excercise.typeName}`;
      }
    }

    if (isModalOpenQ) {
      if (acQ === "Create") {
        return `Thêm câu hỏi dạng ${excercise.typeName}`;
      } else if (acQ === "Delete") {
        return "Xóa câu hỏi";
      } else if (acQ === "View") {
        return `Xem câu hỏi dạng ${excercise.typeName}`;
      } else if (acQ === "Update") {
        return `Sửa câu hỏi dạng ${excercise.typeName}`;
      }
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex">
        <h3>Danh sách các bài tập của {lesson?.title}</h3>
        <div className="flex1">
          <GoBack />
          {role === "TEACHER" && status !== "PUBLISHED" && (
            <Button type="primary" onClick={() => showModal("Create")}>
              Thêm bài tập
            </Button>
          )}
        </div>
      </div>
      <Table dataSource={exercises} columns={columns} />
      <Modal
        className="modalTest"
        title={getTitle()}
        open={isModalOpen}
        onCancel={
          !confirmLoading
            ? ac !== "View"
              ? handleCancel
              : handleCancelView
            : undefined
        }
        maskClosable={false}
        keyboard={!confirmLoading}
        closable={!confirmLoading}
        footer={
          ac !== "View" && [
            <Button type="primary" onClick={handleOk} loading={confirmLoading}>
              Ok
            </Button>,
          ]
        }
      >
        {ac === "Create" && (
          <>
            {(selected === "LISTENING_1" ||
              selected === "LISTENING_2" ||
              selected === "LISTENING_3_4") && (
              <div
                className="form__course--item"
                style={{ justifyContent: "flex-start", gap: "20px" }}
              >
                <h4 className="white-space form__course--item--label">
                  File nghe
                </h4>
                <Upload
                  {...propsAudio}
                  style={{ display: "flex", gap: "10px" }}
                  disabled={confirmLoading}
                >
                  <Button icon={<UploadOutlined />} disabled={confirmLoading}>
                    Select File
                  </Button>
                </Upload>
              </div>
            )}

            {selected === "LISTENING_3_4" && (
              <div
                className="form__course--item"
                style={{ justifyContent: "flex-start", gap: "20px" }}
              >
                <h4 className="white-space form__course--item--label">
                  Hình minh họa
                </h4>
                <Upload
                  {...props}
                  style={{ display: "flex", gap: "10px" }}
                  disabled={confirmLoading}
                >
                  <Button icon={<UploadOutlined />} disabled={confirmLoading}>
                    Select File
                  </Button>
                </Upload>
              </div>
            )}
            <Form form={form}>
              <div className="form__teacher--item">
                <div className="white-space form__teacher--item--label">
                  Tên bài tập
                </div>
                <Form.Item
                  name="title"
                  className="no--margin--bottom form__teacher--input"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input
                    placeholder="Nhập tên bài tập"
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
                    onChange={(value) => setSelected(value)}
                    options={
                      track === "Khóa học nền tảng TOEIC"
                        ? [
                            {
                              value: "TRUE_FALSE",
                              label: <span>True/False</span>,
                            },
                            {
                              value: "MULTIPLE_CHOICE",
                              label: <span>Nhiều câu trả lời</span>,
                            },
                            {
                              value: "SINGLE_CHOICE",
                              label: <span>1 câu trả lời</span>,
                            },
                            {
                              value: "INTERACTIVE",
                              label: <span>Bài tập tương tác</span>,
                            },
                            {
                              value: "LISTENING_1",
                              label: <span>Listening Part 1</span>,
                            },
                          ]
                        : track === "Khóa học TOEIC trung cấp"
                        ? [
                            {
                              value: "TRUE_FALSE",
                              label: <span>True/False</span>,
                            },
                            {
                              value: "MULTIPLE_CHOICE",
                              label: <span>Nhiều câu trả lời</span>,
                            },
                            {
                              value: "SINGLE_CHOICE",
                              label: <span>1 câu trả lời</span>,
                            },
                            {
                              value: "INTERACTIVE",
                              label: <span>Bài tập tương tác</span>,
                            },
                            {
                              value: "LISTENING_1",
                              label: <span>Listening Part 1</span>,
                            },
                            {
                              value: "LISTENING_2",
                              label: <span>Listening Part 2</span>,
                            },
                            {
                              value: "READING_5",
                              label: <span>Reading Part 5</span>,
                            },
                            {
                              value: "READING_6",
                              label: <span>Reading Part 6</span>,
                            },
                          ]
                        : [
                            {
                              value: "TRUE_FALSE",
                              label: <span>True/False</span>,
                            },
                            {
                              value: "MULTIPLE_CHOICE",
                              label: <span>Nhiều câu trả lời</span>,
                            },
                            {
                              value: "SINGLE_CHOICE",
                              label: <span>1 câu trả lời</span>,
                            },
                            {
                              value: "INTERACTIVE",
                              label: <span>Bài tập tương tác</span>,
                            },
                            {
                              value: "LISTENING_1",
                              label: <span>Listening Part 1</span>,
                            },
                            {
                              value: "LISTENING_2",
                              label: <span>Listening Part 2</span>,
                            },
                            {
                              value: "LISTENING_3_4",
                              label: <span>Listening Part 3/4</span>,
                            },
                            {
                              value: "READING_5",
                              label: <span>Reading Part 5</span>,
                            },
                            {
                              value: "READING_6",
                              label: <span>Reading Part 6</span>,
                            },
                            {
                              value: "READING_7",
                              label: <span>Reading Part 7</span>,
                            },
                          ]
                    }
                  />
                </Form.Item>
              </div>
              {(selected === "READING_6" || selected === "READING_7") && (
                <div className="form__teacher--item">
                  <div className="white-space form__teacher--item--label">
                    Tổng số đoạn văn
                  </div>
                  <Form.Item
                    name="paragraphSelect"
                    className="no--margin--bottom form__teacher--input"
                    rules={[{ required: true, message: "Không được để trống" }]}
                  >
                    <Select
                      placeholder="Chọn số đoạn văn"
                      value={paragraphSelect}
                      style={{ flex: 1 }}
                      disabled={confirmLoading}
                      options={[
                        { value: 1, label: <span>1 đoạn văn</span> },
                        { value: 2, label: <span>2 đoạn văn</span> },
                        { value: 3, label: <span>3 đoạn văn</span> },
                      ]}
                      onChange={(value) => handleChange(value)}
                    />
                  </Form.Item>
                </div>
              )}

              {selected === "INTERACTIVE" && (
                <div className="form__teacher--item">
                  <div className="white-space form__teacher--item--label">
                    Thời gian xuất hiện
                  </div>
                  <Form.Item
                    name="time"
                    className="no--margin--bottom form__teacher--input"
                  >
                    <TimePicker
                      disabled={confirmLoading}
                      defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                    />
                  </Form.Item>
                </div>
              )}
            </Form>

            {paragraphs &&
              paragraphs.map((_, index) => (
                <>
                  <h3>Đoạn văn thứ {index + 1}</h3>
                  <ReactQuill
                    theme="snow"
                    value={paragraphs[index] || ""}
                    onChange={(value) => {
                      const temp = [...paragraphs];
                      temp[index] = value;
                      setParagraphs(temp);
                    }}
                    style={{ height: 150, marginBottom: 50 }}
                    modules={{
                      toolbar: [
                        [{ size: ["small", false, "large", "huge"] }], // ⭐ CỠ CHỮ
                        ["bold", "italic", "underline"], // chữ đậm, nghiêng, gạch chân
                        [{ list: "ordered" }, { list: "bullet" }], // danh sách
                        [{ align: [] }], // ⭐ CĂN TRÁI / GIỮA / PHẢI / ĐỀU
                        ["clean"], // xóa format
                      ],
                    }}
                    formats={[
                      "size",
                      "bold",
                      "italic",
                      "underline",
                      "list",
                      "bullet",
                      "align",
                    ]}
                  />
                </>
              ))}
          </>
        )}

        {ac === "Update" && (
          <>
            {(excercise?.typeName === "Bài tập Listening Part 1" ||
              excercise?.typeName === "Bài tập Listening Part 2" ||
              excercise?.typeName === "Bài tập Listening Part 3 và 4") && (
              <div
                className="form__course--item"
                style={{ justifyContent: "flex-start", gap: "20px" }}
              >
                <h4 className="white-space form__course--item--label">
                  File nghe
                </h4>
                <Upload
                  {...propsAudio}
                  style={{ display: "flex", gap: "10px" }}
                  disabled={confirmLoading}
                >
                  <Button icon={<UploadOutlined />} disabled={confirmLoading}>
                    Select File
                  </Button>
                </Upload>
              </div>
            )}

            {excercise?.typeName === "Bài tập Listening Part 3 và 4" && (
              <div
                className="form__course--item"
                style={{ justifyContent: "flex-start", gap: "20px" }}
              >
                <h4 className="white-space form__course--item--label">
                  Hình minh họa
                </h4>
                <Upload
                  {...props}
                  style={{ display: "flex", gap: "10px" }}
                  disabled={confirmLoading}
                >
                  <Button icon={<UploadOutlined />} disabled={confirmLoading}>
                    Select File
                  </Button>
                </Upload>
              </div>
            )}

            {(excercise.typeName === "Bài tập Reading Part 6" ||
              excercise.typeName === "Bài tập Reading Part 7") && (
              <ReactQuill
                theme="snow"
                style={{ height: 150, marginBottom: 50 }}
                value={content}
                onChange={setContent}
                modules={{
                  toolbar: [
                    [{ size: ["small", false, "large", "huge"] }], // ⭐ CỠ CHỮ
                    ["bold", "italic", "underline"], // chữ đậm, nghiêng, gạch chân
                    [{ list: "ordered" }, { list: "bullet" }], // danh sách
                    [{ align: [] }], // ⭐ CĂN TRÁI / GIỮA / PHẢI / ĐỀU
                    ["clean"], // xóa format
                  ],
                }}
                formats={[
                  "size",
                  "bold",
                  "italic",
                  "underline",
                  "list",
                  "bullet",
                  "align",
                ]}
              />
            )}
          </>
        )}

        {ac === "View" && (
          <>
            {(excercise.typeName === "Bài tập Listening Part 1" ||
              excercise.typeName === "Bài tập Listening Part 2" ||
              excercise.typeName === "Bài tập Listening Part 3 và 4") && (
              <audio
                controls
                style={{ width: "100%", margin: "10px 0" }}
                src={`data:audio/mpeg;base64,${exerciseQuestions?.mediaData}`}
              />
            )}
            {excercise.typeName === "Bài tập Listening Part 3 và 4" &&
              exerciseQuestions?.imageData && (
                <img
                  src={`data:image/png;base64,${exerciseQuestions?.imageData}`}
                  style={{ marginTop: "10px", width: "100%" }}
                />
              )}
            {(excercise.typeName === "Bài tập Reading Part 6" ||
              excercise.typeName === "Bài tập Reading Part 7") &&
              exerciseQuestions?.paragraphs?.map((pa) => (
                <div dangerouslySetInnerHTML={{ __html: pa }} />
              ))}
            <div className="flex">
              <h3>Danh sách các câu hỏi</h3>
              {role === "TEACHER" && status !== "PUBLISHED" && (
                <Button
                  type="primary"
                  onClick={() => showModalQ("Create", null, excercise)}
                >
                  Thêm câu hỏi
                </Button>
              )}
            </div>
            <div className="flex1" style={{ flexWrap: "wrap" }}>
              {exerciseQuestions?.questions.length == 0 ? (
                <div>Không có câu hỏi</div>
              ) : (
                exerciseQuestions?.questions.map((q, index) => (
                  <Button
                    onClick={() => {
                      setQuestion(q);
                      showModalQ("View", 0, excercise);
                    }}
                  >
                    {index + 1}
                  </Button>
                ))
              )}
            </div>
          </>
        )}

        {ac === "Delete" && <h3>Bạn muốn xóa bài tập này?</h3>}
      </Modal>

      <Modal
        className="modalTest"
        destroyOnHidden
        title={getTitle()}
        open={isModalOpenQ}
        onCancel={!confirmLoadingQ ? handleCancelQ : undefined}
        maskClosable={false}
        keyboard={!confirmLoadingQ}
        closable={!confirmLoadingQ}
        footer={
          acQ === "View"
            ? role === "TEACHER" &&
              status !== "PUBLISHED" && (
                <>
                  <Button
                    type="primary"
                    onClick={() => {
                      setQuestion(question);
                      showModalQ("Update", 0, excercise);
                    }}
                    loading={confirmLoadingQ}
                  >
                    Sửa câu hỏi
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setQuestion(question);
                      showModalQ("Delete", 0, excercise);
                    }}
                    loading={confirmLoadingQ}
                  >
                    Xóa câu hỏi
                  </Button>
                </>
              )
            : acQ === "Delete" && (
                <Button
                  type="primary"
                  onClick={handleOkQ}
                  loading={confirmLoadingQ}
                >
                  Xóa câu hỏi
                </Button>
              )
        }
      >
        {acQ === "View" && (
          <>
            {(excercise.typeName === "Bài tập chỉ có một đáp án đúng" ||
              excercise.typeName === "Bài tập tương tác" ||
              excercise.typeName === "Bài tập Reading Part 5" ||
              excercise.typeName === "Bài tập Listening Part 3 và 4" ||
              excercise.typeName === "Bài tập Reading Part 7") && (
              <OnlyChoiceQuestion q={question} i={index} isReadOnly={true} />
            )}

            {excercise.typeName === "Bài tập chọn nhiều đáp án đúng" && (
              <MultiChoiceQuestion q={question} i={index} isReadOnly={true} />
            )}

            {excercise.typeName === "Bài tập dạng Đúng / Sai" && (
              <TrueFalseQuestion q={question} i={index} isReadOnly={true} />
            )}

            {excercise.typeName === "Bài tập Listening Part 1" && (
              <ListeningPart1Question
                q={question}
                i={index}
                isReadOnly={true}
              />
            )}

            {(excercise.typeName === "Bài tập Listening Part 2" ||
              excercise.typeName === "Bài tập Reading Part 6") && (
              <ListeningPart2Question
                q={question}
                i={index}
                isReadOnly={true}
              />
            )}
          </>
        )}

        {acQ === "Delete" && <h3>Bạn muốn xóa câu hỏi này?</h3>}

        {acQ === "Create" && (
          <>
            {excercise.typeName === "Bài tập chỉ có một đáp án đúng" && (
              <CreateOnlyChoiceQuestion
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập chọn nhiều đáp án đúng" && (
              <CreateMultiChoiceQuestion
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập dạng Đúng / Sai" && (
              <CreateTrueFalseQuestion
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập tương tác" && (
              <CreateVideoExcerciseQuestion
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Listening Part 1" && (
              <CreateListeningPart1Question
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Listening Part 2" && (
              <CreateListeningPart2Question
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Listening Part 3 và 4" && (
              <CreateListeningPart34Question
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Reading Part 5" && (
              <CreateReadingPart5Question
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Reading Part 6" && (
              <CreateReadingPart6Question
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Reading Part 7" && (
              <CreateListeningPart34Question
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập điền từ vào chỗ trống" && (
              <CreateDienTu
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}
          </>
        )}

        {acQ === "Update" && (
          <>
            {excercise.typeName === "Bài tập chỉ có một đáp án đúng" && (
              <CreateOnlyChoiceQuestion
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập chọn nhiều đáp án đúng" && (
              <CreateMultiChoiceQuestion
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập dạng Đúng / Sai" && (
              <CreateTrueFalseQuestion
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập tương tác" && (
              <CreateVideoExcerciseQuestion
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Listening Part 1" && (
              <CreateListeningPart1Question
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Listening Part 2" && (
              <CreateListeningPart2Question
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Listening Part 3 và 4" && (
              <CreateListeningPart34Question
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Reading Part 5" && (
              <CreateReadingPart5Question
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Reading Part 6" && (
              <CreateReadingPart6Question
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}

            {excercise.typeName === "Bài tập Reading Part 7" && (
              <CreateListeningPart34Question
                q={question}
                acQ={acQ}
                excerciseId={excercise.id}
                handleCancelQ={handleCancelQ}
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
}
export default ListExcercises;
