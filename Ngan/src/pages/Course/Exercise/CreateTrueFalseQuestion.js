import { Button, Form, Input, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { openNotification } from "../../../components/Notification";
import {
  createQuestionOfExercise,
  createQuestionOfExerciseTest,
  updateQuestionOfExercise,
  updateQuestionOfExerciseTest,
} from "../../../services/ExerciseService";
import { refreshToken, saveToken } from "../../../services/AuthService";
function CreateTrueFalseQuestion({ q, acQ, excerciseId, handleCancelQ, type }) {
  const [form] = Form.useForm();
  const [confirmLoadingQ, setConfirmLoadingQ] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (acQ === "Update" && q) {
      const optionData = q.choices.map((c) => ({
        id: c.id,
        content: c.content,
      }));
      setOptions(optionData);
      // Tìm đáp án đúng
      const correctChoice = q.choices.find((c) => c.isCorrect === true);

      form.setFieldsValue({
        question: q.questionText,
        explain: q.explain,
        answer: correctChoice?.content, // "True" hoặc "False"
      });
    }
  }, [acQ, q]);

  const createQuestion = async (data) => {
    const formData = new FormData();

    formData.append(
      "requests",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

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
      form.resetFields();
      setConfirmLoadingQ(false);
      handleCancelQ();
    }, 1000);
  };

  const updateQuestion = async (data) => {
    console.log(data);
    const formData = new FormData();

    formData.append(
      "requests",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

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
      form.resetFields();
      setConfirmLoadingQ(false);
      handleCancelQ();
    }, 1000);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!values.question) {
        openNotification(api, "bottomRight", "Lỗi", "Bạn chưa nhập câu hỏi");
      } else if (!values.answer) {
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
            question: values.question,
            answer: values.answer,
            explain: values.explain,
          };
        } else if (acQ === "Update") {
          result = {
            question: values.question,
            answer: values.answer,
            explain: values.explain,
            choices: options.map((opt, idx) => opt),
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
        <div className="form__teacher--item">
          <div className="white-space form__teacher--item--label">
            Câu trả lời
          </div>
          <Form.Item
            name="answer"
            className="no--margin--bottom form__teacher--input"
          >
            <Select
              placeholder="Chọn đáp án"
              style={{ flex: 1 }}
              disabled={confirmLoadingQ}
              options={[
                { value: "True", label: <span>True</span> },
                {
                  value: "False",
                  label: <span>False</span>,
                },
              ]}
            />
          </Form.Item>
        </div>
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
export default CreateTrueFalseQuestion;
