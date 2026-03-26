import { Button, Checkbox, Form, Input, notification, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { MinusCircleOutlined, PlusCircleTwoTone } from "@ant-design/icons";
import { openNotification } from "../../../components/Notification";
import {
  createQuestionOfExercise,
  createQuestionOfExerciseTest,
  updateQuestionOfExercise,
  updateQuestionOfExerciseTest,
} from "../../../services/ExerciseService";
import { refreshToken, saveToken } from "../../../services/AuthService";
function CreateMultiChoiceQuestion({
  q,
  acQ,
  excerciseId,
  handleCancelQ,
  type,
}) {
  const [form] = Form.useForm();
  const [answer, setAnswer] = useState([]);
  const [options, setOptions] = useState([null, null]);
  const [confirmLoadingQ, setConfirmLoadingQ] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (acQ === "Update" && q) {
      // 1. Lấy danh sách nội dung lựa chọn
      const optionData = q.choices.map((c) => ({
        id: c.id,
        content: c.content,
      }));
      setOptions(optionData);

      // 3. Lấy danh sách đáp án đúng (index)
      const correctIndexes = q.choices
        .map((c, i) => (c.isCorrect ? i : null))
        .filter((i) => i !== null);

      setAnswer(correctIndexes);

      // 4. Gán vào form
      form.setFieldsValue({
        question: q.questionText,
        explain: q.explain,
        options: optionData.map((o) => o.content),
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
      setAnswer([]);
      form.resetFields();
      setOptions(["", ""]);
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
      setAnswer([]);
      form.resetFields();
      setOptions(["", ""]);
      setConfirmLoadingQ(false);
      handleCancelQ();
    }, 1000);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!values.question) {
        openNotification(api, "bottomRight", "Lỗi", "Bạn chưa nhập câu hỏi");
      } else if (values.options.some((opt) => !opt || opt.trim() === "")) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Một hoặc nhiều lựa chọn chưa được nhập"
        );
      } else if (answer.length === 0) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Bạn chưa chọn đáp án đúng"
        );
      } else {
        setConfirmLoadingQ(true);
        var ans = [];
        answer.forEach((i) => {
          ans = [...ans, values.options[i]];
        });

        var result;
        if (acQ === "Create") {
          result = {
            question: values.question,
            options: values.options,
            answer: ans,
            explain: values.explain,
          };
        } else if (acQ === "Update") {
          result = {
            question: values.question,
            options: values.options,
            choices: options.map((opt, idx) => ({
              id: opt.id ?? null, // id cũ hoặc null nếu thêm mới
              content: values.options[idx],
            })),
            answer: ans,
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

  const createOptions = (i) => {
    if (answer > i) {
      setAnswer(answer + 1);
    }

    // luôn đảm bảo valueOptions là array
    let valueOptions = form.getFieldValue("options");
    if (!Array.isArray(valueOptions)) {
      // tạo mảng cùng length với state options
      valueOptions = Array(options.length).fill("");
    }

    const bien = [...options];

    valueOptions.splice(i + 1, 0, ""); // thêm option mới vào form
    bien.splice(i + 1, 0, ""); // thêm slot mới vào state options

    setOptions(bien);
    form.setFieldValue("options", valueOptions);
  };

  const deleteOptions = (i) => {
    if (answer > i) {
      setAnswer(answer - 1);
    } else if (answer === i) {
      setAnswer(null);
    }

    const bien = options.filter((_, index) => i !== index);

    let valueOptions = form.getFieldValue("options");
    if (!Array.isArray(valueOptions)) {
      valueOptions = Array(options.length).fill("");
    }

    valueOptions.splice(i, 1);

    form.setFieldValue("options", valueOptions);
    setOptions(bien);
  };

  return (
    <>
      {contextHolder}
      <Form form={form}>
        <div className="form__teacher--item">
          <div className="flex" style={{ width: "620px" }}>
            <div className="white-space form__teacher--item--label">
              Câu hỏi
            </div>
            <Form.Item
              name="question"
              className="no--margin--bottom form__teacher--input"
            >
              <Input placeholder="Nhập câu hỏi" disabled={confirmLoadingQ} />
            </Form.Item>
          </div>
        </div>
        {options.map((_, i) => (
          <div className="form__teacher--item">
            <div className="flex" style={{ width: "620px" }}>
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
                        checked={answer?.includes(i)}
                        disabled={confirmLoadingQ}
                        onChange={() => {
                          const newAnswer = [...answer];

                          if (newAnswer.includes(i)) {
                            // Nếu đã có thì bỏ chọn
                            setAnswer(newAnswer.filter((item) => item !== i));
                          } else {
                            // Nếu chưa có thì thêm vào
                            setAnswer([...newAnswer, i]);
                          }
                        }}
                      />
                    </Tooltip>
                  }
                />
              </Form.Item>
            </div>
            {options.length === 1 ? (
              <Tooltip placement="bottom" title="Thêm lựa chọn">
                <Button
                  icon={<PlusCircleTwoTone />}
                  onClick={() => createOptions(i)}
                  disabled={confirmLoadingQ}
                />
              </Tooltip>
            ) : (
              <>
                <Tooltip placement="bottom" title="Xóa lựa chọn">
                  <Button
                    icon={<MinusCircleOutlined />}
                    onClick={() => deleteOptions(i)}
                    disabled={confirmLoadingQ}
                  />
                </Tooltip>
                <Tooltip placement="bottom" title="Thêm lựa chọn">
                  <Button
                    icon={<PlusCircleTwoTone />}
                    onClick={() => createOptions(i)}
                    disabled={confirmLoadingQ}
                  />
                </Tooltip>
              </>
            )}
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
export default CreateMultiChoiceQuestion;
