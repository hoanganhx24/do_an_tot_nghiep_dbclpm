import { Button } from "antd";
import {
  PlusCircleTwoTone,
  UploadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
function CreateExcercise() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState(null);
  const [exerciseTitle, setExerciseTitle] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const { Option } = Select;

  const handleCreateExercise = () => {
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    if (exerciseType === "true_false") {
      setQuestions([...questions, { question: "", answer: "", explain: "" }]);
    }
    if (exerciseType === "multichoice") {
      setQuestions([
        ...questions,
        { question: "", answer: "", options: ["", ""], explain: "" },
      ]);
    }
    if (exerciseType === "dien_tu") {
      setQuestions([...questions, { question: "", answer: [], explain: "" }]);
    }
    if (exerciseType === "onlychoice") {
      setQuestions([
        ...questions,
        { question: "", options: ["", "", "", ""], answer: "", explain: "" },
      ]);
    }
    if (exerciseType === "video_excercise") {
      setQuestions([
        ...questions,
        {
          time: "",
          question: "",
          options: ["", "", "", ""],
          answer: "",
          explain: "",
        },
      ]);
    }
  };

  const handleRemoveQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleOk = () => {
    if (!exerciseType) return;

    // Lưu bài tập vào danh sách chính
    const newExercise = {
      type: exerciseType,
      title: exerciseTitle,
      questions: questions.filter((q) => q.question.trim() !== ""),
    };
    setExercises([...exercises, newExercise]);
    setIsModalOpen(false);
    setExerciseType(null);
    setExerciseTitle(null);
    setQuestions([]);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setExerciseType(null);
    setExerciseTitle(null);
    setQuestions([]);
  };

  const handleChangeQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleCreateOption = (indexQ) => {
    const updated = [...questions];
    updated[indexQ].options = [...updated[indexQ].options, ""];
    setQuestions(updated);
  };

  const handleChangeOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length <= 2) {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        "Số lựa chọn không được phép nhỏ hơn 2"
      );
    } else {
      updated[questionIndex].options.splice(optionIndex, 1);
    }
    setQuestions(updated);
  };

  const renderExercise = (ex, idx) => {
    switch (ex.type) {
      case "true_false":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: {ex.title}
            </div>
            <TrueFalse ex={ex} />
          </>
        );

      case "multichoice":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: {ex.title}
            </div>
            <Multichoice ex={ex} />
          </>
        );

      case "dien_tu":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: {ex.title}
            </div>
            <DienTu ex={ex} />
          </>
        );

      case "onlychoice":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: {ex.title}
            </div>
            <OnlyChoice ex={ex} />
          </>
        );

      case "video_excercise":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: {ex.title}
            </div>
            <div>Thời gian hiển thị câu hỏi: {ex.time}</div>
            <OnlyChoice ex={ex} />
          </>
        );
    }
  };

  const handleCreateOTrong = (index) => {
    const textarea = document.getElementById(`question-${index}`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const newValue = value.substring(0, start) + "____" + value.substring(end);

    handleChangeQuestion(index, "question", newValue);

    // Sau khi thêm, đưa con trỏ ra sau chuỗi vừa chèn
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }, 0);

    const updated = [...questions];
    updated[index].answer = [...updated[index].answer, ""];
    setQuestions(updated);
  };

  const handleChangeOTrong = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].answer[optionIndex] = value;
    setQuestions(updated);
  };

  const handleDeleteOTrong = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].answer.splice(optionIndex, 1);

    const question = updated[questionIndex].question;
    let count = -1;
    const newQuestion = question.replace(/____/g, (match) => {
      count++;
      return count === optionIndex ? "" : match;
    });
    updated[questionIndex].question = newQuestion;

    setQuestions(updated);
  };

  const handleChangeAnswer = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].answer[optionIndex] = value;
    setQuestions(updated);
  };

  return (
    <>
      <Button
        style={{ border: "none" }}
        icon={<PlusCircleTwoTone />}
        onClick={handleCreateExercise}
      >
        Thêm bài tập
      </Button>

      {/* ================= HIỂN THỊ DANH SÁCH BÀI TẬP ================= */}
      <div className="session">
        <h3 style={{ marginRight: "10px" }}>Danh sách bài tập:</h3>
      </div>
      <div>
        {exercises.map((ex, idx) => (
          <div key={idx}>{renderExercise(ex, idx)}</div>
        ))}
      </div>
      <Modal
        title="Tạo bài tập mới"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Thêm bài tập"
        cancelText="Hủy"
        width={600}
      >
        <div className="session" style={{ marginBottom: "10px" }}>
          <div>Chọn loại bài tập</div>
          <Select
            placeholder="Chọn loại bài tập"
            onChange={(value) => setExerciseType(value)}
            value={exerciseType}
            disabled={!!exerciseType}
          >
            <Option value="true_false">True / False</Option>
            <Option value="multichoice">Nhiều đáp án</Option>
            <Option value="dien_tu">Điền từ</Option>
            <Option value="onlychoice">1 đán án</Option>
            <Option value="video_excercise">Bài tập tương tác</Option>
          </Select>
        </div>
        <div className="session" style={{ marginBottom: "10px" }}>
          <div style={{ whiteSpace: "nowrap" }}>Đề bài</div>
          <Input
            placeholder="Nhập đề bài"
            onChange={(e) => setExerciseTitle(e.target.value)}
            value={exerciseTitle}
          />
        </div>

        {exerciseType === "true_false" && (
          <>
            <Button
              onClick={handleAddQuestion}
              style={{ marginBottom: "10px" }}
            >
              + Thêm câu hỏi
            </Button>

            {questions.map((q, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: "10px" }}
                title={`Câu hỏi ${index + 1}`}
                extra={
                  <MinusCircleOutlined
                    style={{ color: "red" }}
                    onClick={() => handleRemoveQuestion(index)}
                  />
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập tên câu hỏi"
                    value={q.question}
                    onChange={(e) =>
                      handleChangeQuestion(index, "question", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Nhập câu trả lời"
                    value={q.answer}
                    onChange={(e) =>
                      handleChangeQuestion(index, "answer", e.target.value)
                    }
                  />
                  <Input.TextArea
                    placeholder="Giải thích đáp án"
                    value={q.explain}
                    onChange={(e) =>
                      handleChangeQuestion(index, "explain", e.target.value)
                    }
                  />
                </Space>
              </Card>
            ))}
          </>
        )}

        {exerciseType === "dien_tu" && (
          <>
            <Button
              onClick={handleAddQuestion}
              style={{ marginBottom: "10px" }}
            >
              + Thêm câu hỏi
            </Button>

            <div>
              Cách nhập: Giả sử câu hỏi là I go ____ school thì bạn hãy nhập câu
              hỏi là I go, chọn thêm ô trống thì giao diện sẽ tự động hiển thị
              câu hỏi là I go ____.
            </div>

            {questions.map((q, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: "10px" }}
                title={`Câu hỏi ${index + 1}`}
                extra={
                  <MinusCircleOutlined
                    style={{ color: "red" }}
                    onClick={() => handleRemoveQuestion(index)}
                  />
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="session">
                    <Input.TextArea
                      id={`question-${index}`}
                      placeholder="Nhập tên câu hỏi"
                      value={q.question}
                      onChange={(e) =>
                        handleChangeQuestion(index, "question", e.target.value)
                      }
                    />
                    <Button
                      icon={<PlusCircleTwoTone />}
                      onClick={() => handleCreateOTrong(index)}
                    >
                      Thêm ô trống
                    </Button>
                  </div>

                  {q.answer &&
                    q.answer.map((op, ind) => (
                      <>
                        <div className="session">
                          <Input
                            placeholder="Nhập từ cần điền"
                            value={q.answer[ind]}
                            onChange={(e) =>
                              handleChangeOTrong(index, ind, e.target.value)
                            }
                          />
                          <Button
                            icon={
                              <MinusCircleOutlined
                                onClick={() => handleDeleteOTrong(index, ind)}
                              />
                            }
                          />
                        </div>
                      </>
                    ))}

                  <Input.TextArea
                    placeholder="Giải thích đáp án"
                    value={q.explain}
                    onChange={(e) =>
                      handleChangeQuestion(index, "explain", e.target.value)
                    }
                  />
                </Space>
              </Card>
            ))}
          </>
        )}

        {exerciseType === "onlychoice" && (
          <>
            <Button
              onClick={handleAddQuestion}
              style={{ marginBottom: "10px" }}
            >
              + Thêm câu hỏi
            </Button>

            {questions.map((q, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: "10px" }}
                title={`Câu hỏi ${index + 1}`}
                extra={
                  <MinusCircleOutlined
                    style={{ color: "red" }}
                    onClick={() => handleRemoveQuestion(index)}
                  />
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="session">
                    <Input.TextArea
                      id={`question-${index}`}
                      placeholder="Nhập tên câu hỏi"
                      value={q.question}
                      onChange={(e) =>
                        handleChangeQuestion(index, "question", e.target.value)
                      }
                    />
                  </div>

                  {q.options &&
                    q.options.map((op, ind) => (
                      <>
                        <div className="session">
                          <Input
                            placeholder="Nhập lựa chọn"
                            value={q.answer[ind]}
                            onChange={(e) =>
                              handleChangeOption(index, ind, e.target.value)
                            }
                          />
                        </div>
                      </>
                    ))}

                  <Input
                    placeholder="Nhập câu trả lời"
                    value={q.answer}
                    onChange={(e) =>
                      handleChangeQuestion(index, "answer", e.target.value)
                    }
                  />

                  <Input.TextArea
                    placeholder="Giải thích đáp án"
                    value={q.explain}
                    onChange={(e) =>
                      handleChangeQuestion(index, "explain", e.target.value)
                    }
                  />
                </Space>
              </Card>
            ))}
          </>
        )}

        {exerciseType === "video_excercise" && (
          <>
            <Button
              onClick={handleAddQuestion}
              style={{ marginBottom: "10px" }}
            >
              + Thêm câu hỏi
            </Button>

            {questions.map((q, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: "10px" }}
                title={`Câu hỏi ${index + 1}`}
                extra={
                  <MinusCircleOutlined
                    style={{ color: "red" }}
                    onClick={() => handleRemoveQuestion(index)}
                  />
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="session">
                    Thời gian hiển thị câu hỏi:
                    <TimePicker
                      defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                      onChange={(time, timeString) =>
                        handleChangeQuestion(index, "time", timeString)
                      }
                    />
                  </div>

                  <Input.TextArea
                    id={`question-${index}`}
                    placeholder="Nhập tên câu hỏi"
                    value={q.question}
                    onChange={(e) =>
                      handleChangeQuestion(index, "question", e.target.value)
                    }
                  />

                  {q.options &&
                    q.options.map((op, ind) => (
                      <>
                        <div className="session">
                          <Input
                            placeholder="Nhập lựa chọn"
                            value={q.answer[ind]}
                            onChange={(e) =>
                              handleChangeOption(index, ind, e.target.value)
                            }
                          />
                        </div>
                      </>
                    ))}

                  <Input
                    placeholder="Nhập câu trả lời"
                    value={q.answer}
                    onChange={(e) =>
                      handleChangeQuestion(index, "answer", e.target.value)
                    }
                  />

                  <Input.TextArea
                    placeholder="Giải thích đáp án"
                    value={q.explain}
                    onChange={(e) =>
                      handleChangeQuestion(index, "explain", e.target.value)
                    }
                  />
                </Space>
              </Card>
            ))}
          </>
        )}

        {exerciseType === "multichoice" && (
          <>
            <Button
              onClick={handleAddQuestion}
              style={{ marginBottom: "10px" }}
            >
              + Thêm câu hỏi
            </Button>

            {questions.map((q, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: "10px" }}
                title={`Câu hỏi ${index + 1}`}
                extra={
                  <MinusCircleOutlined
                    style={{ color: "red" }}
                    onClick={() => handleRemoveQuestion(index)}
                  />
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập tên câu hỏi"
                    value={q.question}
                    onChange={(e) =>
                      handleChangeQuestion(index, "question", e.target.value)
                    }
                  />

                  {q.options.map((op, ind) => (
                    <>
                      <div className="session">
                        <Input
                          placeholder="Nhập lựa chọn"
                          value={q.options[ind]}
                          onChange={(e) =>
                            handleChangeOption(index, ind, e.target.value)
                          }
                        />
                        <Button
                          icon={<PlusCircleTwoTone />}
                          onClick={() => handleCreateOption(index)}
                        />
                        <Button
                          icon={
                            <MinusCircleOutlined
                              onClick={() => handleDeleteOption(index, ind)}
                            />
                          }
                        />
                      </div>
                    </>
                  ))}

                  <Input
                    placeholder="Nhập câu trả lời"
                    value={q.answer}
                    onChange={(e) =>
                      handleChangeQuestion(index, "answer", e.target.value)
                    }
                  />
                  <Input.TextArea
                    placeholder="Giải thích đáp án"
                    value={q.explain}
                    onChange={(e) =>
                      handleChangeQuestion(index, "explain", e.target.value)
                    }
                  />
                </Space>
              </Card>
            ))}
          </>
        )}
      </Modal>
    </>
  );
}
export default CreateExcercise;
