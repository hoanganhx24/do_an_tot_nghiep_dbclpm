import {
  Button,
  Checkbox,
  Form,
  Input,
  notification,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { openNotification } from "../../../components/Notification";

import {
  createQuestionOfExercise,
  updateQuestionOfExercise,
} from "../../../services/ExerciseService";
import { refreshToken, saveToken } from "../../../services/AuthService";

function CreateVideoExcerciseQuestion({ q, acQ, excerciseId, handleCancelQ }) {
  const [form] = Form.useForm();
  const [answer, setAnswer] = useState(null);
  const [options, setOptions] = useState([null, null, null, null]);
  const [confirmLoadingQ, setConfirmLoadingQ] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (acQ === "Update" && q) {
      const optionContents = q.choices.map((c) => c.content);
      setOptions(optionContents);

      // set đáp án đúng (tìm index isCorrect = true)
      const correctIndex = q.choices.findIndex((c) => c.isCorrect);
      setAnswer(correctIndex);

      // set vào form
      form.setFieldsValue({
        question: q.questionText,
        explain: q.explain,
        options: optionContents,
      });
    }
  }, [acQ, q]);

  const createQuestion = async (data) => {
    const formData = new FormData();

    formData.append(
      "requests",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    const response = await createQuestionOfExercise(formData);
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
      openNotification(api, "bottomRight", "Lỗi", response.message);
    }

    setTimeout(() => {
      setAnswer(null);
      form.resetFields();
      setOptions([null, null, null, null]);
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

    const response = await updateQuestionOfExercise(formData);
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
      setConfirmLoadingQ(false);
      handleCancelQ();
    }, 1000);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!values.question) {
        openNotification(api, "bottomRight", "Lỗi", "Bạn chưa nhập câu hỏi");
        return;
      } 
      if (values.options.some((opt) => !opt || opt.trim() === "")) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Một hoặc nhiều lựa chọn chưa được nhập"
        );
        return;
      } 
      if (answer === null) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Bạn chưa chọn đáp án đúng"
        );
        return;
      } else {
        setConfirmLoadingQ(true);
        const result = {
          question: values.question,
          options: values.options,
          answer: values.options[answer],
          exerciseId: excerciseId,
          explain: values.explain,
        };

        console.log(result);
        if (acQ === "Create") {
          createQuestion(result);
        } else if (acQ === "Update") {
          updateQuestion({ ...result, id: q.id });
        }
      }
    });
  };

  return (
    <>
      {contextHolder}
      <Form form={form}>
        <div className="form__teacher--item">
          <div className="white-space form__teacher--item--label">Câu hỏi</div>
          <Form.Item
            name="question"
            className="no--margin--bottom form__teacher--input"
          >
            <Input placeholder="Nhập câu hỏi" disabled={confirmLoadingQ} />
          </Form.Item>
        </div>
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
                      checked={answer === i}
                      disabled={confirmLoadingQ}
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
export default CreateVideoExcerciseQuestion;
