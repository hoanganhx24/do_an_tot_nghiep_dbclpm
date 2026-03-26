import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, notification } from "antd";
import { RightOutlined, StarFilled } from "@ant-design/icons";
import {
  getHistoryMiniTest,
  getLessonIdNext,
  getLessonIdPrevious,
  getLessonPath,
  getMiniTestStar,
  getMiniTestSummary,
} from "../../../services/CourseService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { useEffect, useRef, useState } from "react";
import { openNotification } from "../../../components/Notification";
import { logout } from "../../../components/function";
import { unlock } from "../../../services/FirstTestService";
import { getId } from "../../../components/token";

function MiniTestDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [testId, setTestId] = useState(location.state.testId);
  const courseId = location.state.courseId || null;
  const type = location.state.type || null;
  console.log(type);
  const statusRef = useRef(0);
  if (type === "DONE") {
    statusRef.current = 200;
  }

  const detailImg = (genre) => {
    if (genre === "VOCABULARY" || genre === "TEST")
      return "/images/Vocabulary.png";
    else if (genre === "LISTENING") return "/images/Listening.png";
    else if (genre === "READING") return "/images/Reading.png";
    else if (genre === "GRAMMAR") return "/images/Grammar.png";
  };

  const fetchUnLock = async () => {
    const data = {
      testId: testId,
      studentprofileId: getId(),
    };
    console.log(data);
    const response = await unlock(data);

    if (response.code === 200) {
      console.log("Mở khóa thành công");
      statusRef.current = 200;
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    } else {
      if (statusRef.current !== 200)
        openNotification(
          api,
          "bottomRight",
          "Thông báo",
          "Chưa mở khóa bài vì bạn chưa hoàn thành bài học này"
        );
    }
  };
  console.log(statusRef.current);
  const handleClick = async (lesson) => {
    await fetchUnLock();

    if (statusRef.current === 200) {
      if (lesson.type === "LESSON") {
        navigate("/study/detail-session", {
          state: { lessonId: lesson.id, courseId: courseId },
        });
      } else if (lesson.type === "TEST") {
        setTestId(lesson.id);
      }
    }
  };

  const [course, setCourse] = useState("");
  const [category, setCategory] = useState("");
  const [lesson, setLesson] = useState("");
  const [id, setId] = useState("");
  const [api, contextHolder] = notification.useNotification();

  const fetchApiGetPath = async () => {
    const response = await getLessonPath(testId);

    if (response.code === 200) {
      const [c, cat, les, i] = response.data.split("/");
      setCourse(c);
      setCategory(cat);
      setLesson(les);
      setId(parseInt(i));
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getLessonPath(testId);
        if (retryResponse.code === 200) {
          const [c, cat, les, i] = retryResponse.data.split("/");
          setCourse(c);
          setCategory(cat);
          setLesson(les);
          setId(parseInt(i));
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

  const [previousId, setPreviousId] = useState();
  const fetchPreviousLesson = async () => {
    const response = await getLessonIdPrevious(testId, "TEST");
    console.log(response.data);
    if (response.code === 200) {
      setPreviousId(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getLessonIdPrevious(testId, "TEST");
        if (retryResponse.code === 200) {
          setPreviousId(retryResponse.data);
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
      setPreviousId();
    }
  };

  const [nextId, setNextId] = useState();
  const fetchNextLesson = async () => {
    const response = await getLessonIdNext(testId, "TEST");
    console.log(response.data);
    if (response.code === 200) {
      setNextId(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getLessonIdNext(testId, "TEST");
        if (retryResponse.code === 200) {
          setNextId(retryResponse.data);
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
      setNextId();
    }
  };

  const [test, setTest] = useState();
  const fetchGetMiniTestSummary = async () => {
    const response = await getMiniTestSummary(testId);
    console.log(response.data);
    if (response.code === 200) {
      setTest(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getMiniTestSummary(testId);
        if (retryResponse.code === 200) {
          setTest(retryResponse.data);
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

  const [star, setStar] = useState();
  const fetchGetMiniTestStar = async () => {
    const response = await getMiniTestStar(testId);
    console.log(response.data);
    if (response.code === 200) {
      setStar(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getMiniTestStar(testId);
        if (retryResponse.code === 200) {
          setStar(retryResponse.data);
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

  const [history, setHistory] = useState();
  const fetchGetHistoryMiniTest = async () => {
    const response = await getHistoryMiniTest(testId);
    console.log(response.data);
    if (response.code === 200) {
      setHistory(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getMiniTestStar(testId);
        if (retryResponse.code === 200) {
          setHistory(retryResponse.data);
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
    fetchApiGetPath();
    fetchNextLesson();
    fetchPreviousLesson();
    fetchGetMiniTestSummary();
    fetchGetMiniTestStar();
    fetchGetHistoryMiniTest();
    statusRef.current = 0;
  }, [testId]);

  const items = [
    {
      title: (
        <Button type="link" onClick={() => navigate("/student/my_courses")}>
          Khóa học của tôi
        </Button>
      ),
    },
    {
      title: (
        <Button
          type="link"
          onClick={() =>
            navigate("/student/course-detail", {
              state: { id: courseId, type },
            })
          }
        >
          {category}
        </Button>
      ),
    },
    {
      title: <Button type="text">{lesson}</Button>,
    },
  ];

  return (
    <>
      {contextHolder}
      <div
        className="flex"
        style={{
          position: "fixed",
          top: "64px",
          left: 0,
          zIndex: 99,
          width: "100%",
          height: "50px",
          borderBottom: "1px solid #ddd",
          padding: "0 20px",
          backgroundColor: "white",
        }}
      >
        <div>
          <Breadcrumb items={items} />
        </div>
        <div className="flex1">
          {previousId && (
            <Button type="primary" onClick={() => handleClick(previousId)}>
              Bài trước
            </Button>
          )}
          {nextId && (
            <Button type="primary" onClick={() => handleClick(nextId)}>
              Bài sau
            </Button>
          )}
        </div>
      </div>
      <div style={{ marginTop: "60px", display: "flex", gap: "10px" }}>
        <div className="test">
          <div className="test__item flex">
            <div className="flex1">
              <img src={detailImg(test?.type)} style={{ width: "50px" }} />
              <div className="item__header--des">
                <h3>{test?.name}</h3>
              </div>
            </div>
            <Button
              type="primary"
              onClick={() =>
                navigate("/minitest", { state: { testId: testId } })
              }
            >
              Làm bài
            </Button>
          </div>

          {history?.map((item, i) => (
            <div className="test__item flex">
              <div className="flex1">
                <img src={detailImg(test?.type)} style={{ width: "50px" }} />
                <div className="item__header--des">
                  <h3>Làm bài lần {i + 1}</h3>
                </div>
              </div>
              <Button
                type="link"
                onClick={() =>
                  navigate("/minitest", {
                    state: { testId: item, completed: true },
                  })
                }
              >
                <h4>Xem chi tiết</h4>
                <RightOutlined />
              </Button>
            </div>
          ))}
        </div>

        {history?.length > 0 && (
          <div className="test test-right">
            <h2 className="white">Điểm số</h2>
            <div className="flex test-right-item">
              <h3 className="white" style={{ margin: 0 }}>
                {test?.name}
              </h3>
              <div className="flex1">
                <div className="white">{star?.maxScore} điểm</div>
                <StarFilled
                  style={{
                    color: star?.completedStar >= 1 ? "#f6b464ff" : "#ddd",
                  }}
                />
                <StarFilled
                  style={{
                    color: star?.completedStar >= 2 ? "#f6b464ff" : "#ddd",
                  }}
                />
                <StarFilled
                  style={{
                    color: star?.completedStar >= 3 ? "#f6b464ff" : "#ddd",
                  }}
                />
              </div>
            </div>
            <div className="white" style={{ marginTop: "30px" }}>
              Điểm được cập nhật theo lần làm bài đạt kết quả cao nhất
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default MiniTestDetail;
