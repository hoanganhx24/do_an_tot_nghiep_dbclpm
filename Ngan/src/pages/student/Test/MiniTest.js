import { useEffect, useState } from "react";
import "./test.scss";
import OnlyChoiceQuestion from "../../Course/Exercise/OnlyChoiceQuestion";
import MultiChoiceQuestion from "../../Course/Exercise/MultiChoiceQuestion";
import TrueFalseQuestion from "../../Course/Exercise/TrueFalseQuestion";
import ListeningPart1Question from "../../Course/Exercise/ListeningPart1Question";
import ListeningPart2Question from "../../Course/Exercise/ListeningPart2Question";
import ListeningPart34Question from "../../Course/Exercise/ListeningPart34Question";
import ReadingPart6Question from "../../Course/Exercise/ReadingPart6Question";
import ReadingPart7Question from "../../Course/Exercise/ReadingPart7Question";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Modal, notification } from "antd";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { openNotification } from "../../../components/Notification";
import {
  getQuestionsHistoryOfFirstTest,
  getQuestionsOfFirstTest,
  getQuestionsOfMiniTest,
} from "../../../services/FirstTestService";
import { getId } from "../../../components/token";
function MiniTest({ onSubmit, testId, completed }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [questions, setQuestions] = useState([]);
  const [submit, setSubmit] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const fetchApiGetFirstTest = async () => {
    var response;
    if (!completed) response = await getQuestionsOfMiniTest(testId);
    else response = await getQuestionsHistoryOfFirstTest(testId);

    console.log(response);
    if (response.code === 200) {
      if (!completed) {
        var filtered = response.data.filter(
          (q) => q.assessmentQuestions && q.assessmentQuestions.length > 0
        );
        setQuestions(filtered);
        setAnswers(createInitialAnswers(filtered));
        setTotal(countTotalQuestions(filtered));
      } else {
        var filtered = response.data.assessmentResponses.filter(
          (q) => q.assessmentQuestions && q.assessmentQuestions.length > 0
        );
        setQuestions(filtered);
        setSubmit(true);
        setTotal(countTotalQuestions(filtered));
        setCorrect(countCorrectAnswers(filtered));
      }
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        response.message || "Lấy bài test thất bại"
      );
    }
  };

  useEffect(() => {
    fetchApiGetFirstTest();
  }, []);

  const buildRequest = (questions) => {
    return {
      testId: questions[0]?.testId,
      studentProfileId: getId(),

      assessmentAttemptRequests: questions.map((q) => {
        const childQuestions = q.assessmentQuestions;

        // Tạo danh sách answerRequests cho câu lớn này
        let answerRequests = [];

        childQuestions.forEach((child) => {
          // ====== MULTI CHOICE ======
          if (Array.isArray(child.answering)) {
            child.answering.forEach((option) => {
              answerRequests.push({
                isCorrect: option.isCorrect,
                assessmentOptionId: option.id,
                assessmentQuestionId: child.id,
              });
            });
          }

          // ====== SINGLE CHOICE, TRUE/FALSE ======
          else if (
            child.answering !== null &&
            typeof child.answering === "object"
          ) {
            answerRequests.push({
              isCorrect: child.answering.isCorrect,
              assessmentOptionId: child.answering.id,
              assessmentQuestionId: child.id,
            });
          }
        });

        return {
          assessmentId: q.id,
          assessmentAnswerRequests: answerRequests,
        };
      }),
    };
  };

  const createInitialAnswers = (questions) => {
    const result = {};

    questions?.forEach((q, qIndex) => {
      // dạng nhiều câu hỏi con
      if (
        q.typeName === "Bài tập Listening Part 1" ||
        q.typeName === "Bài tập Listening Part 2" ||
        q.typeName === "Bài tập Listening Part 3 và 4" ||
        q.typeName === "Bài tập Reading Part 6" ||
        q.typeName === "Bài tập Reading Part 7"
      ) {
        result[qIndex] = q.assessmentQuestions.map(() => null);
      }
      // multi choice
      else if (q.typeName === "Bài tập chọn nhiều đáp án đúng") {
        result[qIndex] = [];
      }
      // các loại 1 đáp án
      else {
        result[qIndex] = null;
      }
    });

    return result;
  };

  const [answers, setAnswers] = useState({});
  //   Listening 3, Reading 6
  const handleAnswer = (qIndex, subIndex, value) => {
    console.log(answers);
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: prev[qIndex]?.map((ans, i) => (i === subIndex ? value : ans)),
    }));

    updateQuestionSub(qIndex, subIndex, value);
  };

  const handleSingleAnswer = (qIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: value,
    }));

    updateQuestionSingle(qIndex, value);
  };

  const handleMultiAnswer = (qIndex, checkedValues) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: checkedValues, // Lưu nguyên mảng
    }));

    updateQuestionMulti(qIndex, checkedValues);
  };

  const updateQuestionSingle = (qIndex, value) => {
    setQuestions((prev) => {
      const newQ = [...prev];
      const child = newQ[qIndex].assessmentQuestions;
      newQ[qIndex] = {
        ...newQ[qIndex],
        assessmentQuestions: child.map((c, i) =>
          i === 0 ? { ...c, answering: value } : c
        ),
      };
      return newQ;
    });
  };

  const updateQuestionMulti = (qIndex, newArr) => {
    setQuestions((prev) => {
      const newQ = [...prev];
      const child = newQ[qIndex].assessmentQuestions;
      newQ[qIndex] = {
        ...newQ[qIndex],
        assessmentQuestions: child.map((c, i) =>
          i === 0 ? { ...c, answering: newArr } : c
        ),
      };
      return newQ;
    });
  };

  const updateQuestionSub = (qIndex, subIndex, value) => {
    setQuestions((prev) => {
      const newQ = [...prev];
      const child = newQ[qIndex].assessmentQuestions;

      newQ[qIndex] = {
        ...newQ[qIndex],
        assessmentQuestions: child.map((c, i) =>
          i === subIndex ? { ...c, answering: value } : c
        ),
      };

      return newQ;
    });
  };

  const countCorrectAnswers = (questions) => {
    let totalCorrect = 0;

    if (!completed) {
      questions.forEach((q) => {
        const childQuestions = q.assessmentQuestions;

        childQuestions.forEach((child) => {
          // ====== MULTI CHOICE ======
          if (Array.isArray(child.answering)) {
            let tong = 0;
            child.answering.forEach((option) => {
              if (option.isCorrect) tong = tong + 1;
            });

            let t = 0;
            child.choices.forEach((option) => {
              if (option.isCorrect) t = t + 1;
            });

            if (tong === t) totalCorrect = totalCorrect + 1;
          }

          // ====== SINGLE CHOICE, TRUE/FALSE ======
          else if (child.answering.isCorrect) {
            totalCorrect = totalCorrect + 1;
          }
        });
      });
    } else {
      questions.forEach((q) => {
        const childQuestions = q.assessmentQuestions;

        childQuestions.forEach((child) => {
          // ====== MULTI CHOICE ======
          if (q?.typeName === "Bài tập chọn nhiều đáp án đúng") {
            let tong = 0;
            let t = 0;
            child.choices.forEach((option) => {
              if (option.isCorrect) tong = tong + 1;
              if (option.selected && option.isCorrect) t = t + 1;
            });

            if (tong === t) totalCorrect = totalCorrect + 1;
          }

          // ====== SINGLE CHOICE, TRUE/FALSE ======
          else {
            child.choices.forEach((option) => {
              if (option.selected && option.isCorrect)
                totalCorrect = totalCorrect + 1;
            });
          }
        });
      });
    }

    return totalCorrect;
  };

  const countTotalQuestions = (questions) => {
    let count = 0;

    questions.forEach((q) => {
      count += q.assessmentQuestions.length;
    });

    return count;
  };

  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(countTotalQuestions(questions));
  const handleSubmit = () => {
    const req = buildRequest(questions);
    setSubmit(true);
    onSubmit && onSubmit(req);
    setCorrect(countCorrectAnswers(questions));
  };

  const [index, setIndex] = useState(0);

  const isAllAnswered = (questions) => {
    if (!questions || questions.length === 0) return false;

    for (const q of questions) {
      const childs = q.assessmentQuestions || [];

      // Các dạng nhiều câu hỏi con: Listening / Reading Part 1,2,3,4,6,7
      if (
        q.typeName === "Bài tập Listening Part 1" ||
        q.typeName === "Bài tập Listening Part 2" ||
        q.typeName === "Bài tập Listening Part 3 và 4" ||
        q.typeName === "Bài tập Reading Part 6" ||
        q.typeName === "Bài tập Reading Part 7"
      ) {
        for (const child of childs) {
          if (!child.answering) {
            return false;
          }
        }
        continue;
      }

      // Dạng chọn nhiều đáp án đúng
      if (q.typeName === "Bài tập chọn nhiều đáp án đúng") {
        const ans = childs[0]?.answering;
        if (!ans || ans.length === 0) return false;
        continue;
      }

      // Các dạng 1 đáp án: Only choice, True/False, Reading Part 5,...
      const ans = childs[0]?.answering;
      if (!ans) {
        return false;
      }
    }

    return true;
  };

  return (
    <>
      {contextHolder}
      <div className="bong2"></div>
      <div className="bong1"></div>
      <div className="test-in hidden-scrollbar">
        {(questions[index]?.typeName === "Bài tập chỉ có một đáp án đúng" ||
          questions[index]?.typeName === "Bài tập Reading Part 5") &&
          (submit === false ? (
            <OnlyChoiceQuestion
              q={questions[index].assessmentQuestions[0]}
              i={index}
              isReadOnly={false}
              onAnswer={handleSingleAnswer}
              submit={submit}
            />
          ) : (
            <OnlyChoiceQuestion
              q={questions[index].assessmentQuestions[0]}
              i={index}
              isReadOnly={false}
              submit={submit}
            />
          ))}

        {questions[index]?.typeName === "Bài tập chọn nhiều đáp án đúng" &&
          (submit === false ? (
            <MultiChoiceQuestion
              q={questions[index].assessmentQuestions[0]}
              i={index}
              isReadOnly={false}
              onAnswer={handleMultiAnswer}
              submit={submit}
            />
          ) : (
            <MultiChoiceQuestion
              q={questions[index].assessmentQuestions[0]}
              i={index}
              isReadOnly={false}
              submit={submit}
            />
          ))}

        {questions[index]?.typeName === "Bài tập dạng Đúng / Sai" &&
          (submit === false ? (
            <TrueFalseQuestion
              q={questions[index].assessmentQuestions[0]}
              i={index}
              isReadOnly={false}
              onAnswer={handleSingleAnswer}
              submit={submit}
            />
          ) : (
            <TrueFalseQuestion
              q={questions[index].assessmentQuestions[0]}
              i={index}
              isReadOnly={false}
              submit={submit}
            />
          ))}

        {questions[index]?.typeName === "Bài tập Listening Part 1" &&
          questions[index].assessmentQuestions.length > 0 && (
            <>
              <audio
                controls
                style={{ width: "100%", margin: "10px 0" }}
                src={`data:audio/mpeg;base64,${questions[index].mediaData}`}
              />
              {
                <div style={{ marginTop: "10px" }}>
                  {questions[index].assessmentQuestions.map((q, i) =>
                    submit === false ? (
                      <ListeningPart1Question
                        q={q}
                        i={i}
                        isReadOnly={false}
                        onAnswer={handleAnswer}
                        submit={submit}
                        index={index}
                      />
                    ) : (
                      <ListeningPart1Question
                        q={q}
                        i={i}
                        isReadOnly={false}
                        submit={submit}
                        index={index}
                      />
                    )
                  )}
                </div>
              }
            </>
          )}

        {questions[index]?.typeName === "Bài tập Listening Part 2" &&
          questions[index].assessmentQuestions.length > 0 && (
            <>
              <audio
                controls
                style={{ width: "100%", margin: "10px 0" }}
                src={`data:audio/mpeg;base64,${questions[index].mediaData}`}
              />
              {questions[index].assessmentQuestions.map((q, i) =>
                submit === false ? (
                  <ListeningPart2Question
                    q={q}
                    i={i}
                    isReadOnly={false}
                    onAnswer={handleAnswer}
                    submit={submit}
                    index={index}
                  />
                ) : (
                  <ListeningPart2Question
                    q={q}
                    i={i}
                    isReadOnly={false}
                    submit={submit}
                    index={index}
                  />
                )
              )}
            </>
          )}

        {questions[index]?.typeName === "Bài tập Listening Part 3 và 4" &&
          questions[index].assessmentQuestions.length > 0 && (
            <>
              <audio
                controls
                style={{ width: "100%", margin: "10px 0" }}
                src={`data:audio/mpeg;base64,${questions[index].mediaData}`}
              />
              {questions[index].imageData && (
                <img
                  src={`data:image/png;base64,${questions[index].imageData}`}
                  style={{ marginTop: "10px", width: "100%" }}
                />
              )}
              {submit === false ? (
                <ListeningPart34Question
                  q={questions[index].assessmentQuestions}
                  isReadOnly={false}
                  onAnswer={handleAnswer}
                  index={index}
                  submit={submit}
                />
              ) : (
                <ListeningPart34Question
                  q={questions[index].assessmentQuestions}
                  isReadOnly={false}
                  submit={submit}
                />
              )}
            </>
          )}

        {questions[index]?.typeName === "Bài tập Reading Part 6" &&
          questions[index].assessmentQuestions.length > 0 &&
          (submit === false ? (
            <ReadingPart6Question
              q={questions[index]}
              i={index}
              isReadOnly={false}
              onAnswer={handleAnswer}
              index={index}
              submit={submit}
            />
          ) : (
            <ReadingPart6Question
              q={questions[index]}
              i={index}
              isReadOnly={false}
              submit={submit}
            />
          ))}

        {questions[index]?.typeName === "Bài tập Reading Part 7" &&
          questions[index].assessmentQuestions.length > 0 &&
          (submit === false ? (
            <ReadingPart7Question
              q={questions[index]}
              i={index}
              isReadOnly={false}
              onAnswer={handleAnswer}
              index={index}
              submit={submit}
            />
          ) : (
            <ReadingPart7Question
              q={questions[index]}
              i={index}
              isReadOnly={false}
              submit={submit}
            />
          ))}
      </div>
      <div
        className="flex"
        style={{
          borderTop: "1px solid #ddd",
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 99,
          width: "100%",
          height: "80px",
          padding: "0 20px",
          backgroundColor: "white",
        }}
      >
        <Button type="link" onClick={showModal}>
          <h3>Danh sách câu hỏi</h3>
        </Button>
        {submit && (
          <h3>
            Tổng số câu đúng {correct}/{total}
          </h3>
        )}
        <div className="flex1">
          <Button
            disabled={index === 0}
            onClick={() => {
              var i = index - 1;
              setIndex(i);
            }}
          >
            Câu trước
          </Button>
          <Button
            disabled={index === questions.length - 1}
            onClick={() => {
              var i = index + 1;
              setIndex(i);
            }}
          >
            Câu sau
          </Button>
          {submit === false && (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={!isAllAnswered(questions)}
            >
              Gửi bài <ArrowRightOutlined />
            </Button>
          )}
        </div>
      </div>
      {!completed && (
        <Modal
          title="Danh sách câu hỏi"
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {questions.map((question, i) => (
              <>
                {question.typeName === "Bài tập Listening Part 3 và 4" ||
                question.typeName === "Bài tập Listening Part 1" ||
                question.typeName === "Bài tập Listening Part 2" ||
                question.typeName === "Bài tập Reading Part 6" ||
                question.typeName === "Bài tập Reading Part 7" ? (
                  <>
                    <div>
                      <div>Câu {i + 1}</div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexDirection: "row",
                        }}
                      >
                        {question.assessmentQuestions.map((q, qIndex) => (
                          <Button
                            onClick={() => {
                              setIndex(i);
                              setIsModalOpen(false);
                            }}
                            style={
                              !submit
                                ? q.answering && {
                                    backgroundColor: "#a5ddf7ff",
                                  }
                                : q.answering.isCorrect === true
                                ? { backgroundColor: "#b9fab3ff" }
                                : { backgroundColor: "#fabeb3ff" }
                            }
                          >
                            {qIndex + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {question.typeName === "Bài tập chọn nhiều đáp án đúng" ? (
                      <>
                        <div>
                          <div>Câu {i + 1}</div>
                          <Button
                            onClick={() => {
                              setIndex(i);
                              setIsModalOpen(false);
                            }}
                            style={
                              !submit
                                ? question.assessmentQuestions[0].answering && {
                                    backgroundColor: "#a5ddf7ff",
                                  }
                                : question.assessmentQuestions[0].answering.filter(
                                    (opt) => opt.isCorrect
                                  ).length ===
                                  question.assessmentQuestions[0].choices.filter(
                                    (opt) => opt.isCorrect
                                  ).length
                                ? { backgroundColor: "#b9fab3ff" }
                                : { backgroundColor: "#fabeb3ff" }
                            }
                          >
                            {i + 1}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div>Câu {i + 1}</div>
                          <Button
                            onClick={() => {
                              setIndex(i);
                              setIsModalOpen(false);
                            }}
                            style={
                              !submit
                                ? question.assessmentQuestions[0].answering && {
                                    backgroundColor: "#a5ddf7ff",
                                  }
                                : question?.assessmentQuestions[0]?.answering
                                    .isCorrect === true
                                ? { backgroundColor: "#b9fab3ff" }
                                : { backgroundColor: "#fabeb3ff" }
                            }
                          >
                            {i + 1}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            ))}
          </div>
        </Modal>
      )}

      {completed && (
        <Modal
          title="Danh sách câu hỏi"
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {questions.map((question, i) => (
              <>
                {question.typeName === "Bài tập Listening Part 3 và 4" ||
                question.typeName === "Bài tập Listening Part 1" ||
                question.typeName === "Bài tập Listening Part 2" ||
                question.typeName === "Bài tập Reading Part 6" ||
                question.typeName === "Bài tập Reading Part 7" ? (
                  <>
                    <div>
                      <div>Câu {i + 1}</div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexDirection: "row",
                        }}
                      >
                        {question.assessmentQuestions.map((q, qIndex) => (
                          <Button
                            onClick={() => {
                              setIndex(i);
                              setIsModalOpen(false);
                            }}
                            style={
                              q.choices.find((c) => c.isCorrect).selected ===
                              true
                                ? { backgroundColor: "#b9fab3ff" }
                                : { backgroundColor: "#fabeb3ff" }
                            }
                          >
                            {qIndex + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {question.typeName === "Bài tập chọn nhiều đáp án đúng" ? (
                      <>
                        <div>
                          <div>Câu {i + 1}</div>
                          <Button
                            onClick={() => {
                              setIndex(i);
                              setIsModalOpen(false);
                            }}
                            style={
                              question.assessmentQuestions[0].choices.filter(
                                (opt) => opt.isCorrect
                              ).length ===
                              question.assessmentQuestions[0].choices.filter(
                                (opt) => (opt.isCorrect && opt.selected)
                              ).length
                                ? { backgroundColor: "#b9fab3ff" }
                                : { backgroundColor: "#fabeb3ff" }
                            }
                          >
                            {i + 1}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div>Câu {i + 1}</div>
                          <Button
                            onClick={() => {
                              setIndex(i);
                              setIsModalOpen(false);
                            }}
                            style={
                              question?.assessmentQuestions[0]?.choices.find(
                                (c) => c.isCorrect
                              ).selected === true
                                ? { backgroundColor: "#b9fab3ff" }
                                : { backgroundColor: "#fabeb3ff" }
                            }
                          >
                            {i + 1}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
export default MiniTest;
