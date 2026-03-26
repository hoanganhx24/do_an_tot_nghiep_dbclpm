import { Button, notification } from "antd";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import TrueFalse from "../../Course/Exercise/TrueFalse";
import Multichoice from "../../Course/Exercise/Multichoice";
import DienTu from "../../Course/Exercise/DienTu";
import OnlyChoice from "../../Course/Exercise/OnlyChoice";
import { LeftCircleTwoTone } from "@ant-design/icons";
import { useEffect, useState } from "react";
import ListeningPart1 from "../../Course/Exercise/ListeningPart1";
import ListeningPart2 from "../../Course/Exercise/ListeningPart2";
import ListeningPart34 from "../../Course/Exercise/ListeningPart34";
import ReadingPart6 from "../../Course/Exercise/ReadingPart6";
import ReadingPart7 from "../../Course/Exercise/ReadingPart7";
import { ArrowRightOutlined } from "@ant-design/icons";
import { check } from "../../../utils/request";
import { openNotification } from "../../../components/Notification";
import { useLocation } from "react-router-dom";
import Document from "../../Course/Session/Document";
import {
  getExerciseDetailOfLessonStudent,
  getListExercisesOfLessonStudent,
  saveAnswerEx,
} from "../../../services/ExerciseService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { logout } from "../../../components/function";
import { getId } from "../../../components/token";

function ExcerciseDetail({ setDone }) {
  const location = useLocation();
  const lessonId = location.state.lessonId || null;

  const [exercises, setExercises] = useState([]);
  const [stt, setStt] = useState(0);
  const [showTL, setShowTL] = useState(false);

  const fetchGetExercises = async () => {
    const response = await getListExercisesOfLessonStudent(lessonId);
    console.log(response.data);
    if (response.code === 200) {
      setExercises(response.data);
      setAnswers(createInitialAnswers(response.data[0].questions));
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getListExercisesOfLessonStudent(lessonId);
        if (retryResponse.code === 200) {
          setExercises(retryResponse.data);
          setAnswers(createInitialAnswers(retryResponse.data[0].questions));
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
    }
  };

  useEffect(() => {
    fetchGetExercises();
  }, []);

  const renderExercise = (ex, idx) => {
    console.log(ex);
    switch (ex?.typeCode) {
      case "TRUE_FALSE":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <TrueFalse ex={ex} onAnswer={handleSingleAnswer} />
            ) : (
              <TrueFalse ex={ex} submit={true} />
            )}
          </>
        );

      case "MULTIPLE_CHOICE":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Chọn các đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <Multichoice ex={ex} onAnswer={handleMultiAnswer} />
            ) : (
              <Multichoice ex={ex} submit={true} />
            )}
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

      case "SINGLE_CHOICE":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <OnlyChoice ex={ex} onAnswer={handleSingleAnswer} />
            ) : (
              <OnlyChoice ex={ex} submit={true} />
            )}
          </>
        );

      case "LISTENING_1":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Nghe và chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <ListeningPart1 ex={ex} onAnswer={handleSingleAnswer} type="ex" />
            ) : (
              <ListeningPart1 ex={ex} submit={true} type="ex" />
            )}
          </>
        );

      case "LISTENING_2":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Nghe và chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <ListeningPart2 ex={ex} onAnswer={handleSingleAnswer} type="ex" />
            ) : (
              <ListeningPart2 ex={ex} submit={true} type="ex" />
            )}
          </>
        );

      case "LISTENING_3_4":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Nghe và chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <ListeningPart34 ex={ex} onAnswer={handleSingleAnswer} />
            ) : (
              <ListeningPart34 ex={ex} submit={true} />
            )}
          </>
        );

      case "READING_5":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <OnlyChoice ex={ex} onAnswer={handleSingleAnswer} />
            ) : (
              <OnlyChoice ex={ex} submit={true} />
            )}
          </>
        );

      case "READING_6":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Đọc và chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <ReadingPart6 ex={ex} onAnswer={handleSingleAnswer} />
            ) : (
              <ReadingPart6 ex={ex} submit={true} />
            )}
          </>
        );

      case "READING_7":
        return (
          <>
            <div style={{ fontWeight: "500", paddingBottom: "10px" }}>
              Excercise {idx + 1}: Đọc và chọn đáp án đúng
            </div>
            {ex.isCompleted === false ? (
              <ReadingPart7 ex={ex} onAnswer={handleSingleAnswer} />
            ) : (
              <ReadingPart7 ex={ex} submit={true} />
            )}
          </>
        );
    }
  };

  const handleShowTL = () => setShowTL(true);
  const handleHiddenTL = () => setShowTL(false);
  const [api, contextHolder] = notification.useNotification();
  const showExcercise = (i) => {
    if (exercises[stt].isCompleted === false) {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        "Bạn không thể chuyển sang bài khác vì bài làm hiện tại chưa hoàn thành hoặc chưa gửi bài!"
      );
    } else {
      setStt(i);
    }
  };

  const createInitialAnswers = (questions) => {
    const result = {};

    questions?.forEach((q, qIndex) => {
      // dạng nhiều câu hỏi con
      if (q.questions && Array.isArray(q.questions)) {
        result[qIndex] = q.questions.map(() => null);
      }
      // multi choice
      else if (Array.isArray(q.answer)) {
        result[qIndex] = [];
      }
      // các loại 1 đáp án
      else {
        result[qIndex] = null;
      }
    });

    return result;
  };

  const isAllAnswered = (answers) => {
    if (exercises[stt]?.isCompleted === true) {
      return true;
    }
    if (answers) {
      return Object.values(answers).every((ans) => {
        // trường hợp nhiều câu hỏi con
        if (Array.isArray(ans)) {
          // multi-choice hoặc sub-questions đều là array
          return ans.length > 0 && ans.every((item) => item !== null);
        }
        // trường hợp một đáp án
        return ans !== null;
      });
    }
  };

  const [answers, setAnswers] = useState();

  const [checkAn, setCheckAn] = useState(false);

  useEffect(() => {
    setCheckAn(isAllAnswered(answers));
  }, [answers]);

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
    setExercises((prev) => {
      const newQ = [...prev];
      newQ[stt].questions[qIndex] = {
        ...newQ[stt].questions[qIndex],
        answering: value,
      };
      return newQ;
    });
  };

  const updateQuestionMulti = (qIndex, newArr) => {
    setExercises((prev) => {
      const newQ = [...prev];
      newQ[stt].questions[qIndex] = {
        ...newQ[stt].questions[qIndex],
        answering: newArr,
      };
      return newQ;
    });
  };

  const checkAllExercise = (exercises) => {
    var cnt = 0;
    exercises.map((ex) => {
      if (ex.isCompleted === false) {
        cnt = cnt + 1;
      }
    });
    if (cnt === 0) setDone();
  };

  useEffect(() => {
    checkAllExercise(exercises);
  }, [exercises]);

  useEffect(() => {
    setAnswers(createInitialAnswers(exercises[stt]?.questions));
  }, [stt]);

  const saveAnswerOfEx = async (data) => {
    const response = await saveAnswerEx(data);
    console.log(response.data);
    if (response.code === 200) {
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await saveAnswerEx(data);
        if (retryResponse.code === 200) {
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
    }
  };

  const handleSubmit = () => {
    setExercises((prev) => {
      const newList = [...prev];

      // Lấy bài hiện tại
      const ex = newList[stt];

      // Ghi đè lại bài hiện tại
      newList[stt] = {
        ...ex,
        isCompleted: true,
      };

      return newList;
    });

    var answer = [];

    if (exercises[stt].typeCode === "MULTIPLE_CHOICE") {
      exercises[stt].questions.forEach(q => {
        q.answering.forEach(a => {
          answer.push({
            questionId: q.id,
            choiceId: a.id,
          })
        })
      })
    } else {
      answer = exercises[stt].questions.map((q) => {
        return {
          questionId: q.id,
          choiceId: q.answering.id,
        };
      });
    }
    var data = {
      studentProfileId: getId(),
      exerciseId: exercises[stt].id,
      attemptanswerRequests: answer,
    };
    console.log(data);
    saveAnswerOfEx(data);
  };

  return (
    <>
      {contextHolder}
      <div className="flex2" style={{ height: "calc(100% - 95px)" }}>
        {showTL ? (
          <div style={{ width: "50%" }} className="hidden-scrollbar" id="idTL">
            <div className="flex">
              <h3>Tài liệu học tập</h3>
              <Button
                type="link"
                icon={<LeftCircleTwoTone />}
                onClick={handleHiddenTL}
              >
                Thu gọn
              </Button>
            </div>
            <Document lessonId={lessonId} />
          </div>
        ) : (
          <Button type="primary" id="idButtonTL" onClick={handleShowTL}>
            Tài liệu học tập
          </Button>
        )}
        <div
          style={{
            width: "50%",
            margin: "10px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
          className="hidden-scrollbar"
        >
          <div style={{ padding: "20px" }}>
            {<div key={stt}>{renderExercise(exercises[stt], stt)}</div>}
          </div>
        </div>
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
        <div>
          <h3 style={{ marginBottom: "10px", marginTop: 0 }}>
            Danh sách bài học
          </h3>
          <div className="flex1">
            {exercises?.map((exercise, i) =>
              stt === i ? (
                <Button onClick={() => showExcercise(i)} type="primary">
                  {i + 1}
                </Button>
              ) : (
                <Button onClick={() => showExcercise(i)}>{i + 1}</Button>
              )
            )}
          </div>
        </div>
        {stt !== exercises.length - 1 ? (
          <>
            {exercises[stt]?.isCompleted === false ? (
              <Button type="primary" onClick={handleSubmit} disabled={!checkAn}>
                Gửi bài <ArrowRightOutlined />
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  setStt(stt + 1);
                }}
                disabled={!checkAn}
              >
                Bài tiếp
                <ArrowRightOutlined />
              </Button>
            )}
          </>
        ) : (
          <>
            {exercises[stt].isCompleted === false ? (
              <>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  disabled={!checkAn}
                >
                  Gửi bài <ArrowRightOutlined />
                </Button>
              </>
            ) : (
              <div />
            )}
          </>
        )}
      </div>
    </>
  );
}
export default ExcerciseDetail;
