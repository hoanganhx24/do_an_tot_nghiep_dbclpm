import {
  Button,
  Checkbox,
  Form,
  Input,
  notification,
  Select,
  Tooltip,
} from "antd";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import { openNotification } from "../../../components/Notification";
import ReactQuill from "react-quill";

function CreateReadingPart7Question({ q, acQ }) {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form4] = Form.useForm();
  const [form5] = Form.useForm();

  const forms = [form1, form2, form3, form4, form5];

  const [answer, setAnswer] = useState();
  const [options, setOptions] = useState([null, null, null, null]);
  const [confirmLoadingQ, setConfirmLoadingQ] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [paragraphs, setParagraphs] = useState([]);

  const Size = ReactQuill.Quill.import("formats/size");
  Size.whitelist = ["small", false, "large", "huge"];
  ReactQuill.Quill.register(Size, true);

  useEffect(() => {
    if (acQ === "Update") {
      setParagraphSelect(q.paragraphs.length);
      setParagraphs(q.paragraphs);
      setAnSl(q.questions.length);
      var ans = Array(anSl).fill(null);
      q.questions.map((qu, i) => {
        forms[i].setFieldsValue(qu);
        ans[i] = qu.options.indexOf(qu.answer);
      });
      setAnswer(ans);
    }
  }, []);

  const checkForm = async (form, i) => {
    try {
      const values = await form.validateFields();
      if (!values.question) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          `Bạn chưa nhập câu hỏi ${i}`
        );
        return false;
      } else if (
        !values.options ||
        values.options.some((opt) => !opt || opt.trim() === "")
      ) {
        openNotification(
          api,
          "bottomRight",
          "Lỗi",
          `Một hoặc nhiều lựa chọn của câu hỏi ${i} chưa được nhập`
        );
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!paragraphs || paragraphs.some((a) => a === "")) {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        "Bạn chưa nhập nội dung đoạn văn"
      );
      return;
    }

    if (!answer || answer.some((a) => a === null)) {
      openNotification(api, "bottomRight", "Lỗi", "Bạn chưa chọn đủ đáp án");
      return;
    }

    // 2. Validate số lượng form câu hỏi dựa vào answer.length
    for (let i = 0; i < answer.length; i++) {
      const isValid = await checkForm(forms[i], i + 1);
      if (!isValid) return;
    }

    // 3. Build danh sách câu hỏi
    const questions = answer.map((ans, idx) => {
      const v = forms[idx].getFieldsValue();
      return {
        question: v.question,
        options: v.options,
        answer: v.options[ans],
        explain: v.explain,
      };
    });

    // 4. Gom tất cả vào object cuối cùng
    const finalResult = {
      paragraphs,
      questions,
    };

    setConfirmLoadingQ(true);

    setTimeout(() => {
      setAnswer([]);
      setParagraphs([]);
      setAnSl(null);
      setParagraphSelect(null);
      forms.forEach((f) => f.resetFields());
      setConfirmLoadingQ(false);
    }, 500);

    console.log(finalResult);
  };

  const handleChange = (value) => {
    setParagraphs(Array(value).fill("")); // tạo array paragraph
    setParagraphSelect(value);
  };

  const handleChangeAnswer = (value) => {
    setAnswer(Array(value).fill(null));
    setAnSl(value);
  };

  const [paragraphSelect, setParagraphSelect] = useState(null);
  const [anSl, setAnSl] = useState(null);

  return (
    <>
      {contextHolder}
      <div
        className="form__course--item"
        style={{ justifyContent: "flex-start", gap: "20px" }}
      >
        <h4 className="white-space form__course--item--label">
          Tổng số đoạn văn
        </h4>
        <Select
          placeholder="Chọn số đoạn văn"
          value={paragraphSelect}
          style={{ flex: 1 }}
          disabled={confirmLoadingQ}
          options={[
            { value: 1, label: <span>1 đoạn văn</span> },
            { value: 2, label: <span>2 đoạn văn</span> },
            { value: 3, label: <span>3 đoạn văn</span> },
          ]}
          onChange={(value) => handleChange(value)}
        />
      </div>

      <div
        className="form__course--item"
        style={{ justifyContent: "flex-start", gap: "20px" }}
      >
        <h4 className="white-space form__course--item--label">
          Tổng số câu hỏi
        </h4>
        <Select
          value={anSl}
          placeholder="Chọn số câu hỏi"
          style={{ flex: 1 }}
          disabled={confirmLoadingQ}
          options={[
            { value: 1, label: <span>1 câu hỏi</span> },
            { value: 2, label: <span>2 câu hỏi</span> },
            { value: 3, label: <span>3 câu hỏi</span> },
            { value: 4, label: <span>4 câu hỏi</span> },
            { value: 5, label: <span>5 câu hỏi</span> },
          ]}
          onChange={(value) => handleChangeAnswer(value)}
        />
      </div>

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

      {answer &&
        answer.map((_, index) => (
          <>
            <h3>Câu hỏi {index + 1}</h3>
            <div
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <Form form={forms[index]}>
                <div className="form__teacher--item">
                  <div className="white-space form__teacher--item--label">
                    Câu hỏi
                  </div>
                  <Form.Item
                    name="question"
                    className="no--margin--bottom form__teacher--input"
                  >
                    <Input
                      placeholder="Nhập câu hỏi"
                      disabled={confirmLoadingQ}
                    />
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
                              checked={answer[index] === i}
                              onChange={() => {
                                var arr = [...answer];
                                arr[index] = i;
                                setAnswer(arr);
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
              </Form>
            </div>
          </>
        ))}

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
    </>
  );
}
export default CreateReadingPart7Question;
