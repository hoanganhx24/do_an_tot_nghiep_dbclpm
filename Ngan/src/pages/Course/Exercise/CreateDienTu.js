import { Button, Checkbox, Form, Input, notification, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { MinusCircleOutlined, PlusCircleTwoTone } from "@ant-design/icons";
import { openNotification } from "../../../components/Notification";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { logout } from "../../../components/function";
import {
  createQuestionOfExercise,
  createQuestionOfExerciseTest,
  updateQuestionOfExercise,
  updateQuestionOfExerciseTest,
} from "../../../services/ExerciseService";

function CreateDienTu({ q, acQ, excerciseId, handleCancelQ, type }) {
  const [form] = Form.useForm();
  const [options, setOptions] = useState([]);
  const [confirmLoadingQ, setConfirmLoadingQ] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (acQ === "Update" && q) {
      const optionContents = q.choices.map((c) => c.content);
      setOptions(optionContents);

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
        var retryResponse;
        if (!type) retryResponse = await createQuestionOfExercise(formData);
        else retryResponse = await createQuestionOfExerciseTest(formData);
        if (retryResponse.code === 200) {
          openNotification(
            api,
            "bottomRight",
            "Thành công",
            "Tạo thành công câu hỏi"
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
      openNotification(api, "bottomRight", "Lỗi", "Tạo câu hỏi thất bại");
    }

    setTimeout(() => {
      form.resetFields();
      setOptions([]);
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
        var retryResponse;
        if (!type) retryResponse = await updateQuestionOfExercise(formData);
        else retryResponse = await updateQuestionOfExerciseTest(formData);
        if (retryResponse.code === 200) {
          openNotification(
            api,
            "bottomRight",
            "Thành công",
            "Tạo thành công câu hỏi"
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
      openNotification(api, "bottomRight", "Lỗi", "Cập nhật câu hỏi thất bại");
    }

    setTimeout(() => {
      form.resetFields();
      setOptions([]);
      setConfirmLoadingQ(false);
      handleCancelQ();
    }, 1000);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!values.question) {
        return openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Bạn chưa nhập câu hỏi"
        );
      }
      if (values.options.some((opt) => !opt || opt.trim() === "")) {
        return openNotification(
          api,
          "bottomRight",
          "Lỗi",
          "Một hoặc nhiều lựa chọn chưa được nhập"
        );
      }

      setConfirmLoadingQ(true);

      const result = {
        question: values.question,
        options: values.options,
        explain: values.explain,
      };

      console.log(result);

      if (acQ === "Create") {
        if (!type) createQuestion({ ...result, exerciseId: excerciseId });
        else createQuestion({ ...result, assessmentId: excerciseId });
      } else if (acQ === "Update") {
        if (!type)
          updateQuestion({ ...result, exerciseId: excerciseId, id: q.id });
        else updateQuestion({ ...result, assessmentId: excerciseId, id: q.id });
      }
    });
  };

  const deleteOptions = (i) => {
    const newOptions = options.filter((_, index) => index !== i);

    let valueOptions =
      form.getFieldValue("options") || Array(options.length).fill("");
    valueOptions.splice(i, 1);

    setOptions(newOptions);
    form.setFieldValue("options", valueOptions);

    const question = form.getFieldValue("question") || "";

    // Regex tìm "(n)_______"
    const blankRegex = /\((\d+)\)_______/g;

    let replaced = question.replace(blankRegex, (_, num) => {
      num = Number(num);

      if (num === i + 1) {
        // Xóa ô trống tương ứng với option bị xoá
        return "";
      }

      // Giảm chỉ số ô trống phía sau
      if (num > i + 1) {
        return `(${num - 1})_______`;
      }

      return `(${num})_______`;
    });

    // Xóa khoảng dư: "  " hoặc " , , "
    replaced = replaced.replace(/  +/g, " ").trim();

    form.setFieldValue("question", replaced);
    setIndex(index - 1);
  };
  const questionRef = useRef(null);
  const [index, setIndex] = useState(1);
  const createOTrong = () => {
    const input = questionRef.current?.input;
    if (!input) return;

    let question = form.getFieldValue("question") || "";

    const cursorPos = input.selectionStart;
    const blank = `(${index})_______`;

    // chèn vào vị trí con trỏ
    const newText =
      question.slice(0, cursorPos) + blank + question.slice(cursorPos);

    // cập nhật vào form
    form.setFieldValue("question", newText);

    // tăng index cho ô trống tiếp theo
    setIndex((prev) => prev + 1);
    setOptions([...options, ""]);

    // đặt lại vị trí con trỏ
    setTimeout(() => {
      const newCursorPos = cursorPos + blank.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();
    }, 0);
  };

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: "10px" }}>
        Cách nhập: Giả sử câu hỏi là I go ____ school thì bạn hãy nhập câu hỏi
        là I go, chọn thêm ô trống thì giao diện sẽ tự động hiển thị câu hỏi là
        I go ____.
      </div>
      <Form form={form}>
        <div className="form__teacher--item">
          <div className="white-space form__teacher--item--label">Câu hỏi</div>
          <Form.Item
            name="question"
            className="no--margin--bottom form__teacher--input"
            normalize={(value, prevValue) => {
              if (/([^a-zA-Z0-9])\1+/.test(value)) {
                return prevValue; // giữ lại giá trị cũ, không cho nhập
              }

              // Reset khi rỗng
              if (value.trim() === "") {
                setIndex(1);
                setOptions([]);
              }

              return value;
            }}
          >
            <Input
              ref={questionRef}
              placeholder="Nhập câu hỏi"
              disabled={confirmLoadingQ}
              suffix={
                <Tooltip placement="bottom" title="Thêm ô trống">
                  <Button
                    icon={<PlusCircleTwoTone />}
                    onClick={() => createOTrong()}
                    disabled={confirmLoadingQ}
                  />
                </Tooltip>
              }
            />
          </Form.Item>
        </div>

        {options.map((_, i) => (
          <div className="form__teacher--item" key={i}>
            <div className="flex" style={{ width: "620px" }}>
              <div className="white-space form__teacher--item--label">
                Đáp án {i + 1}
              </div>
              <Form.Item
                name={["options", i]}
                className="no--margin--bottom form__teacher--input"
              >
                <Input placeholder="Nhập đán án" disabled={confirmLoadingQ} />
              </Form.Item>
            </div>

            <div>
              {/* nút xóa */}
              <Tooltip placement="bottom" title="Xóa lựa chọn">
                <Button
                  icon={<MinusCircleOutlined />}
                  onClick={() => deleteOptions(i)}
                  disabled={confirmLoadingQ}
                />
              </Tooltip>
            </div>
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

export default CreateDienTu;
