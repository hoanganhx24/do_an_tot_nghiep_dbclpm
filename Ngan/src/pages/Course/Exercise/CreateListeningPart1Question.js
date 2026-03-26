import {
  Button,
  Checkbox,
  Form,
  Input,
  notification,
  TimePicker,
  Tooltip,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { openNotification } from "../../../components/Notification";
import dayjs from "dayjs";
import { refreshToken, saveToken } from "../../../services/AuthService";
import {
  createQuestionOfExercise,
  createQuestionOfExerciseTest,
  updateQuestionOfExercise,
  updateQuestionOfExerciseTest,
} from "../../../services/ExerciseService";

function CreateListeningPart1Question({
  q,
  acQ,
  excerciseId,
  handleCancelQ,
  type,
}) {
  const [form] = Form.useForm();
  const [answer, setAnswer] = useState(null);
  const [options, setOptions] = useState([null, null, null, null]);
  const [confirmLoadingQ, setConfirmLoadingQ] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (acQ === "Update" && q) {
      const optionData = q.choices.map((c) => ({
        id: c.id,
        content: c.content,
      }));
      setOptions(optionData);
      const correctIndex = q.choices.findIndex((c) => c.isCorrect);
      setAnswer(correctIndex);

      form.setFieldsValue({
        explain: q.explain,
        options: optionData.map((o) => o.content),
      });
    }
  }, [acQ, q]);

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

  const createQuestion = async (data) => {
    const formData = new FormData();

    formData.append(
      "requests",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    formData.append("file", fileList[0]); // file image

    var response;

    if (!type) response = await createQuestionOfExercise(formData);
    else response = await createQuestionOfExerciseTest(formData);
    console.log(response);

    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Tạo thành công câu hỏi"
      );
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", "Tạo câu hỏi thất bại");
    }

    setTimeout(() => {
      setAnswer(null);
      form.resetFields();
      setOptions([null, null, null, null]);
      setFileList([]);
      setConfirmLoadingQ(false);
      handleCancelQ();
    }, 1000);
  };

  const updateQuestion = async (data) => {
    const formData = new FormData();

    formData.append(
      "requests",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    formData.append("file", fileList[0]); // file image

    var response;
    if (!type) response = await updateQuestionOfExercise(formData);
    else response = await updateQuestionOfExerciseTest(formData);
    console.log(response);

    if (response.code === 200) {
      openNotification(
        api,
        "bottomRight",
        "Thành công",
        "Cập nhật thành công câu hỏi"
      );
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(api, "bottomRight", "Lỗi", "Cập nhật câu hỏi thất bại");
    }

    setTimeout(() => {
      setAnswer(null);
      form.resetFields();
      setOptions([null, null, null, null]);
      setFileList([]);
      setConfirmLoadingQ(false);
      handleCancelQ();
    }, 1000);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (fileList.length === 0 && acQ === "Create") {
        openNotification(api, "bottomRight", "Lỗi", "Bạn chưa chọn ảnh");
      } else if (values.options.some((opt) => !opt || opt.trim() === "")) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Một hoặc nhiều lựa chọn chưa được nhập"
        );
      } else if (answer === null) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Bạn chưa chọn đáp án đúng"
        );
      } else {
        setConfirmLoadingQ(true);
        var result;
        if (acQ === "Create") {
          result = {
            options: values.options,
            answer: values.options[answer],
            explain: values.explain,
          };
        } else if (acQ === "Update") {
          result = {
            options: values.options,
            choices: options.map((opt, idx) => ({
              id: opt.id ?? null, // id cũ hoặc null nếu thêm mới
              content: values.options[idx],
            })),
            answer: values.options[answer],
            explain: values.explain,
          };
        }

        console.log(result);

        if (acQ === "Create") {
          if (!type) createQuestion({ ...result, exerciseId: excerciseId });
          else createQuestion({ ...result, assessmentId: excerciseId });
        } else if (acQ === "Update") {
          if (!type)
            updateQuestion({ ...result, exerciseId: excerciseId, id: q.id });
          else
            updateQuestion({ ...result, assessmentId: excerciseId, id: q.id });
        }
      }
    });
  };

  return (
    <>
      {contextHolder}
      <div
        className="form__course--item"
        style={{ justifyContent: "flex-start", gap: "20px" }}
      >
        <h4 className="white-space form__course--item--label">Hình minh họa</h4>
        <Upload
          {...props}
          style={{ display: "flex", gap: "10px" }}
          disabled={confirmLoadingQ}
        >
          <Button icon={<UploadOutlined />} disabled={confirmLoadingQ}>
            Select File
          </Button>
        </Upload>
      </div>
      <Form form={form}>
        {options.map((_, i) => (
          <div className="form__teacher--item">
            <div className="white-space form__teacher--item--label">
              Lựa chọn {i + 1}
            </div>
            <Form.Item
              name={["options", i]}
              className="no--margin--bottom form__teacher--input"
            >
              <Input
                placeholder="Nhập lựa chọn"
                disabled={confirmLoadingQ}
                suffix={
                  <Tooltip placement="bottom" title="Chọn đáp án">
                    <Checkbox
                      disabled={confirmLoadingQ}
                      checked={answer === i}
                      onChange={() => {
                        setAnswer(i);
                      }}
                    />
                  </Tooltip>
                }
              />
            </Form.Item>
          </div>
        ))}
        <div>
          <div className="white-space form__teacher--item--label">
            Giải thích
          </div>
          <Form.Item name="explain" className="no--margin--bottom">
            <Input.TextArea
              placeholder="Nhập giải thích"
              disabled={confirmLoadingQ}
            />
          </Form.Item>
        </div>
        <Form.Item>
          <div style={{ marginTop: "20px", justifySelf: "center" }}>
            <Button
              htmlType="submit"
              type="primary"
              onClick={handleSubmit}
              loading={confirmLoadingQ}
            >
              {acQ === "Create" ? "Thêm câu hỏi" : "Sửa câu hỏi"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
}
export default CreateListeningPart1Question;
