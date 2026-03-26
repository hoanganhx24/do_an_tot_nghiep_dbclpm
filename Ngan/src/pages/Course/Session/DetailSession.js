import { useEffect, useRef, useState } from "react";
import { Button, Modal, notification, Radio } from "antd";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import {
  getIteractiveExercises,
  getLesson,
  getLessonPath,
} from "../../../services/CourseService";
import { API_DOMAIN } from "../../../utils/request";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../../components/function";
import { openNotification } from "../../../components/Notification";
import OnlyChoice from "../Exercise/OnlyChoice";
import { getId } from "../../../components/token";
import { saveAnswerEx } from "../../../services/ExerciseService";

function timeToSeconds(timeStr) {
  const parts = timeStr.split(":").map(Number);
  const [h, m, s] =
    parts.length === 3 ? parts : [0, parts[0] || 0, parts[1] || 0];
  return h * 3600 + m * 60 + s;
}

function DetailSession({ lessonId, setPercent, oldId, setLessonId }) {
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/exercise", {
      state: { lessonId: lessonId },
    });
  };

  const [exercises, setExercises] = useState(null);
  const fetchGetInteractiveEx = async () => {
    const response = await getIteractiveExercises(lessonId);
    console.log(response);
    if (response.code === 200) {
      setExercises(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getIteractiveExercises(lessonId);
        if (retryResponse.code === 200) {
          setExercises(retryResponse.data);
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

  const [videoUrl, setVideoUrl] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const videoRef = useRef(null);
  const currentVideoPath = useRef(null);
  const [maxWatchTime, setMaxWatchTime] = useState(0);
  const maxWatchTimeRef = useRef(0);
  useEffect(() => {
    maxWatchTimeRef.current = maxWatchTime;
  }, [maxWatchTime]);

  // ========================
  // GỌI RANGE CHUNK GIỐNG CODE BẠN GỬI
  // ========================
  const fetchNextRangeChunk = () => {
    if (!currentVideoPath.current) return;

    const VIDEO_URL =
      API_DOMAIN + "videos/stream?pathFile=" + currentVideoPath.current;

    // Ví dụ: Request từ 2MB trở đi
    fetch(VIDEO_URL, {
      method: "GET",
      headers: {
        Range: "bytes=2000000-",
      },
    })
      .then((res) => {
        console.log(
          "📦 Received partial content:",
          res.status,
          res.headers.get("Content-Range")
        );
        return res.arrayBuffer();
      })
      .then((data) => {
        console.log("📦 Received chunk size:", data.byteLength, "bytes");
      })
      .catch((err) => {
        console.error("❌ Error fetching chunk:", err);
      });
  };

  const [stt, setStt] = useState(null);
  const [submit, setSubmit] = useState(false);
  const [answers, setAnswers] = useState();
  const createInitialAnswers = (questions) => {
    const result = {};

    questions?.forEach((q, qIndex) => {
      result[qIndex] = null;
    });

    return result;
  };

  const [checkAn, setCheckAn] = useState(false);

  const isAllAnswered = (answers) => {
    if (answers) {
      return Object.values(answers).every((ans) => {
        return ans !== null;
      });
    }
  };

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

  const handleSubmit = async() => {
    setSubmit(true);
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

    const attemptanswerRequests = exercises[stt].questions.map((q) => ({
      questionId: q.id,
      choiceId: q?.answering?.id, // value user chọn
    }));

    const data = {
      studentProfileId: getId(),
      exerciseId: exercises[stt].id,
      attemptanswerRequests,
    };

    const response = await saveAnswerEx(data);
    if(response.code === 200){
      console.log("Lưu thành công");
    }else{
      console.log(response);
    }
  };

  const [per, setPer] = useState(0);
  // ========================
  // VIDEO EVENT
  // ========================
  const setupVideoEvents = () => {
    const video = videoRef.current;
    if (!video) return;

    // === CẬP NHẬT TIẾN ĐỘ XEM ===
    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;

      // Cập nhật đoạn xa nhất mà user đã xem
      setMaxWatchTime((prev) => Math.max(prev, current));

      // Cập nhật %
      if (total && total !== Infinity) {
        setPer(((current / total) * 100).toFixed(2));
        setPercent(((current / total) * 100).toFixed(2));
      }

      if (current / total > 95) {
        console.log("⏳ Almost done → Request next chunk");
        fetchNextRangeChunk();
      }

      if (exercises !== null && exercises.length > 0) {
        const index = exercises.findIndex((ex) => {
          if (!ex?.showTime) return false;
          const t = timeToSeconds(ex.showTime);
          return t !== null && Math.abs(current - t) < 0.1;
        });

        if (
          index !== -1 &&
          !openModal &&
          exercises[index].isCompleted === false
        ) {
          video.pause();
          setStt(index);
          setSubmit(false);
          setAnswers(createInitialAnswers(exercises[index].questions));

          setTimeout(() => {
            setOpenModal(true);
          }, 1000);
        }
      }
    };

    // === CHẶN TUA VƯỢT QUÁ ĐOẠN ĐÃ XEM ===
    const handleSeeking = () => {
      const current = video.currentTime;

      // Nếu tua vượt quá maxWatchTime → kéo về
      if (current > maxWatchTimeRef.current) {
        video.currentTime = maxWatchTimeRef.current;
        setMaxWatchTime(maxWatchTimeRef.current);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeking", handleSeeking);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeking", handleSeeking);
    };
  };

  const handleCancel = () => {
    setStt(null);
    setOpenModal(false);
    setSubmit(false);
    setCheckAn(false);
    videoRef.current?.play();
  };

  useEffect(() => {
    if (stt) console.log(exercises[stt]?.questions);
    console.log(stt);
  }, [stt]);

  // ========================
  // FETCH LESSON
  // ========================
  const [lesson, setLesson] = useState();
  const [api, context] = notification.useNotification();
  const fetchApiGetLesson = async () => {
    const response = await getLesson(lessonId);
    console.log(response);
    if (response.code === 200) {
      const data = response.data;
      setLesson(data);
      setPer(data.progressWatched);

      // LƯU PATH
      currentVideoPath.current = data.videoPath;

      // VIDEO URL = VIDEO STREAM DIRECT
      const fullUrl = API_DOMAIN + "videos/stream?pathFile=" + data.videoPath;

      setVideoUrl(fullUrl);

      // PDF
      if (data.materials?.length > 0) {
        const m = data.materials[0];
        const bin = atob(m.materialData);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const pdfBlob = new Blob([arr], { type: m.type });
        setPdfUrl(URL.createObjectURL(pdfBlob));
      }
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getLesson(lessonId);
        if (retryResponse.code === 200) {
          const data = retryResponse.data;
          // LƯU PATH
          currentVideoPath.current = data.videoPath;

          // VIDEO URL = VIDEO STREAM DIRECT
          const fullUrl =
            API_DOMAIN + "videos/stream?pathFile=" + data.videoPath;

          setVideoUrl(fullUrl);

          // PDF
          if (data.materials?.length > 0) {
            const m = data.materials[0];
            const bin = atob(m.materialData);
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            const pdfBlob = new Blob([arr], { type: m.type });
            setPdfUrl(URL.createObjectURL(pdfBlob));
          }
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
    }else{
      openNotification(api, "bottomRight", "Thông báo", response.message);
      setLessonId(oldId);
    }
  };

  useEffect(() => {
    fetchApiGetLesson();
    fetchGetInteractiveEx();
  }, [lessonId]);

  useEffect(() => {
    if (videoUrl) {
      setTimeout(() => setupVideoEvents(), 200);
    }
  }, [videoUrl, lessonId]);

  return (
    <>
      {context}
      {videoUrl && (
        <div style={{ marginTop: "10px" }}>
          <video
            ref={videoRef}
            src={videoUrl}
            width="100%"
            height="600"
            controls
            style={{ background: "black" }}
          ></video>
        </div>
      )}

      {pdfUrl && (
        <div style={{ marginTop: "15px" }}>
          <h4>Tài liệu:</h4>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600"
            style={{ border: "1px solid #ccc" }}
          ></iframe>
        </div>
      )}

      {lesson?.hasExercise === true && (
        <div className="footer-button">
          <Button
            type="primary"
            onClick={() => {
              handleClick();
            }}
          >
            Bắt đầu làm bài
          </Button>
        </div>
      )}

      <Modal
        title="Bài tập tương tác"
        width="900px"
        open={openModal}
        onCancel={submit ? handleCancel : undefined}
        footer={
          stt !== null &&
          exercises[stt]?.isCompleted === false && [
            <Button
              key="submit"
              type="primary"
              onClick={handleSubmit}
              disabled={!checkAn}
            >
              Nộp bài
            </Button>,
          ]
        }
        maskClosable={false}
        closable={submit}
      >
        {stt !== null && (
          <>
            {!submit ? (
              <OnlyChoice ex={exercises[stt]} onAnswer={handleSingleAnswer} />
            ) : (
              <OnlyChoice ex={exercises[stt]} submit={true} />
            )}
          </>
        )}
      </Modal>
    </>
  );
}

export default DetailSession;
