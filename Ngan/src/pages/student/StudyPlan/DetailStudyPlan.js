import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import ListItemStudent from "../../Course/ListLessons/ListItemStudent";
import "./DetailStudyPlan.scss";
import { Col, Progress, Row, Card, notification, Badge, Modal } from "antd";
import {
  CaretRightFilled,
  ScheduleTwoTone,
  ProfileTwoTone,
  LeftCircleTwoTone,
  RightCircleTwoTone,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import {
  getInformationAboutStudyplan,
  getStudyPlanDetail,
} from "../../../services/StudyPlanService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { logout } from "../../../components/function";
import { openNotification } from "../../../components/Notification";
import StudyPlanItem from "./StudyPlanItem";
import { useNavigate } from "react-router-dom";
function DetailStudyPlan({ setPlan, trackId }) {
  const [weekActive, setWeekStudy] = useState(true);
  const handleActive = () => {
    setWeekStudy(!weekActive);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const startOfWeek = currentWeek.startOf("week").add(1, "day");
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));

  const handlePrevWeek = () => setCurrentWeek(currentWeek.subtract(1, "week"));
  const handleNextWeek = () => setCurrentWeek(currentWeek.add(1, "week"));

  const [api, context] = notification.useNotification();
  const [events, setEvents] = useState({});
  const [session, setSession] = useState();
  const [list, setList] = useState([]);

  const createSession = (data) => {
    var result = [];
    const startDay = new Date(data.studyPlanItems[0].date);
    const endDay = new Date(
      data.studyPlanItems[data.studyPlanItems.length - 1].date
    );

    for (let d = startDay; d <= endDay; d.setDate(d.getDate() + 1)) {
      var dayOfWeek = d.getDay();
      if (dayOfWeek === 0) dayOfWeek = 7;
      if (
        data.ngayHocTrongTuan.filter((item) => item === dayOfWeek).length > 0
      ) {
        result.push(d.toISOString().split("T")[0]);
      }
    }
    setSession(result);

    data.studyPlanItems.forEach((item) => {
      var arr = [];
      var s = result.findIndex((se) => se === item.date);

      item.lessons.forEach((lesson) => {
        arr.push({
          session: s,
          id: lesson.id,
          title: lesson.title,
          type: "LESSON",
          completedStar: lesson.completedStar,
          status: lesson.status,
        });
      });
      item.tests?.forEach((test) => {
        arr.push({
          session: s,
          id: test.id,
          title: test.name,
          type: test.type,
          completedStar: test.completedStar,
          status: test.status,
        });
      });
      setEvents((prev) => ({ ...prev, [item.date]: [...arr] }));
      setList((prev) => [
        ...prev,
        { date: item.date, session: s, plans: [...arr] },
      ]);
    });
  };

  const fetchGetStudyPlanDetail = async () => {
    const response = await getStudyPlanDetail(trackId);
    console.log(response);
    if (response.code === 200) {
      createSession(response.data);
      fetchGetInformationAboutStudyplan(response.data.id);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getStudyPlanDetail(trackId);
        if (retryResponse.code === 200) {
          createSession(retryResponse.data);
          fetchGetInformationAboutStudyplan(retryResponse.data.id);
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

  const [info, setInfo] = useState();
  const fetchGetInformationAboutStudyplan = async (id) => {
    const response = await getInformationAboutStudyplan(id);
    console.log(response);
    if (response.code === 200) {
      setInfo(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getInformationAboutStudyplan(id);
        if (retryResponse.code === 200) {
          setInfo(retryResponse.data);
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
    fetchGetStudyPlanDetail();
  }, []);

  const itemRefs = useRef({});
  const [focusDate, setFocusDate] = useState(null);

  const navigate = useNavigate();
  const handleClick = (lesson) => {
    if (lesson.type === "LESSON") {
      if (lesson.status !== "LOCK") {
        navigate("/study/detail-session", {
          state: { lessonId: lesson.id },
        });
      } else {
        openNotification(
          api,
          "bottomRight",
          "Thông báo",
          "Bạn chưa được phép học bài này. Hãy hoàn thành các bài trước đó."
        );
      }
    } else {
      if (lesson.status !== "LOCK") {
        navigate("/study/mini-test", {
          state: { testId: lesson.id },
        });
      } else {
        openNotification(
          api,
          "bottomRight",
          "Thông báo",
          "Bạn chưa được phép học bài này. Hãy hoàn thành các bài trước đó."
        );
      }
    }
  };

  const handleClick1 = (type, lesson) => {
    if (type === "LESSON") {
      if (lesson.status !== "LOCK") {
        navigate("/study/detail-session", {
          state: { lessonId: lesson.id },
        });
      } else {
        openNotification(
          api,
          "bottomRight",
          "Thông báo",
          "Bạn chưa được phép học bài này. Hãy hoàn thành các bài trước đó."
        );
      }
    } else {
      if (lesson.status !== "LOCK") {
        navigate("/study/mini-test", {
          state: { testId: lesson.id },
        });
      } else {
        openNotification(
          api,
          "bottomRight",
          "Thông báo",
          "Bạn chưa được phép học bài này. Hãy hoàn thành các bài trước đó."
        );
      }
    }
  };

  return (
    <>
      {context}
      <Row gutter={20}>
        <Col
          xs={{ span: 24, order: 2 }} // mobile: xuống dưới
          sm={{ span: 24, order: 2 }}
          md={{ span: 16, order: 1 }} // desktop: bên trái
          lg={{ span: 16, order: 1 }}
          xl={{ span: 16, order: 1 }}
        >
          <div className="col__left hidden-scrollbar">
            <div className="flex col__left-header">
              <div className="flex1">
                {weekActive ? (
                  <h3>Lịch học</h3>
                ) : (
                  <>
                    <div
                      className="col__left-header--button"
                      onClick={() => {
                        const today = dayjs().format("YYYY-MM-DD");

                        setTimeout(() => {
                          const el = itemRefs.current[today];
                          if (el) {
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            setFocusDate(today);
                          } else {
                            openNotification(
                              api,
                              "bottomRight",
                              "Thông báo",
                              "Hôm nay không có lịch học"
                            );
                          }
                        }, 100);
                      }}
                    >
                      Hôm nay
                    </div>{" "}
                    <h3>Danh sách buổi học</h3>
                  </>
                )}
              </div>
              <div className="flex1 col__left-header--button">
                <ScheduleTwoTone
                  onClick={handleActive}
                  twoToneColor={weekActive && "#e8b9a0ff"}
                />
                <ProfileTwoTone
                  onClick={handleActive}
                  twoToneColor={!weekActive && "#e8b9a0ff"}
                />
              </div>
            </div>
            {weekActive ? (
              <>
                <div className="flex1" style={{ justifyContent: "flex-end" }}>
                  <LeftCircleTwoTone onClick={handlePrevWeek} />
                  <RightCircleTwoTone onClick={handleNextWeek} />
                  <h3>
                    tháng {currentWeek.month() + 1} năm {currentWeek.year()}
                  </h3>
                </div>

                <div className="week-calendar__grid">
                  {days.map((day) => {
                    const key = day.format("YYYY-MM-DD");
                    var list = events[key] || [];
                    const isToday = day.isSame(dayjs(), "day");
                    return (
                      <div
                        key={key}
                        className={`week-calendar__day ${
                          isToday ? "today" : ""
                        }`}
                      >
                        <div className="week-calendar__day-name">
                          {day.day() === 0 ? <>CN</> : <>Th {day.day() + 1}</>}
                        </div>
                        <div className="week-calendar__day-date">
                          {day.date()}
                        </div>

                        {list.length === 0 ? (
                          session?.findIndex((item) => item === key) !== -1 ? (
                            <>
                              <div className="week-calendar__event">
                                <div className="week-calendar__event-title">
                                  Buổi{" "}
                                  {session?.findIndex((item) => item === key) +
                                    1}
                                </div>
                                <div className="week-calendar__event-lesson">
                                  Nghỉ
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="week-calendar__empty">
                              <div>Ngày trống</div>
                            </div>
                          )
                        ) : (
                          <>
                            <div
                              key={list[0].session}
                              className="week-calendar__event"
                            >
                              <div className="week-calendar__event-title">
                                Buổi {list[0].session + 1}
                              </div>
                              {list.map((ev) => (
                                <div
                                  className="week-calendar__event-lesson"
                                  onClick={() => handleClick(ev)}
                                  style={{
                                    backgroundColor:
                                      ev.type === "LESSON"
                                        ? ev.completedStar > 0
                                          ? "#d1fbd2ff"
                                          : "white"
                                        : ev.completedStar > 0
                                        ? "#fbe3bfff"
                                        : "white",
                                  }}
                                >
                                  {ev.type === "LESSON" ? (
                                    <div>Lesson: {ev.title}</div>
                                  ) : (
                                    <div>Test: {ev.title}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {session.map((i, index) =>
                  list.filter((s) => s.date === i).length > 0 ? (
                    list
                      .filter((s) => s.date === i)
                      .map((item) => (
                        <div
                          className={`plan ${
                            focusDate === item.date ? "focus" : ""
                          }`}
                          key={item.date}
                          ref={(el) => (itemRefs.current[item.date] = el)}
                        >
                          <div className="plan__flex">
                            <div className="flex1">
                              <div className="plan__title">
                                Buổi {index + 1}
                              </div>
                              <div className="plan__title">
                                Ngày {item.date}
                              </div>
                            </div>
                            {item.plans.filter((i) => i.completedStar > 0)
                              .length === item.plans.length ? (
                              <div className="plan__title">Đã hoàn thành</div>
                            ) : (
                              <div
                                className="plan__title"
                                style={{ backgroundColor: "#ff8c20ff" }}
                              >
                                Chưa hoàn thành
                              </div>
                            )}
                          </div>
                          <StudyPlanItem plan={item} index={index} />
                        </div>
                      ))
                  ) : (
                    <>
                      <div
                        className="plan"
                        key={i}
                        ref={(el) => (itemRefs.current[i] = el)}
                      >
                        <div className="plan__flex">
                          <div className="flex1">
                            <div className="plan__title">Buổi {index + 1}</div>
                            <div className="plan__title">Ngày {i}</div>
                            <h3>Nghỉ</h3>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                )}
              </>
            )}
          </div>
        </Col>
        <Col
          xs={{ span: 24, order: 1 }} // mobile: lên trên
          sm={{ span: 24, order: 1 }}
          md={{ span: 8, order: 2 }} // desktop: sang phải
          lg={{ span: 8, order: 2 }}
          xl={{ span: 8, order: 2 }}
        >
          <div className="col__right">
            <div className="flex">
              <h3>Tiến độ học</h3>
              <div className="col__right--button" onClick={() => setPlan(null)}>
                Xếp lại lịch
              </div>
            </div>
            <div className="flex col__right--item" style={{ paddingTop: 0 }}>
              <div>Số cup đã đạt</div>
              <div className="col__right--font">{info?.soCupDaDat}</div>
            </div>
            <div className="flex col__right--item">
              <div>Số Units đạt 2 cúp trở lên</div>
              <div className="col__right--font">{info?.soUnitDat2Cup}</div>
            </div>
            <Progress
              percent={parseInt(
                (info?.soUnitTheoKeHoach / info?.tongSoUnit) * 100
              )}
              success={{
                percent: parseInt(
                  (info?.soUnitDaHoanThanh / info?.tongSoUnit) * 100
                ),
              }}
            />
            <div className="flex1" style={{ paddingTop: "10px" }}>
              <div
                style={{
                  backgroundColor: "#52c41a",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                }}
              />
              <div className="col__right--font">
                Hoàn thành: {info?.soUnitDaHoanThanh}/{info?.tongSoUnit} Tổng số
                Units
              </div>
            </div>
            <div className="flex1" style={{ paddingTop: "10px" }}>
              <div
                style={{
                  backgroundColor: "#1677ff",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                }}
              />
              <div className="col__right--font">
                Kế hoạch: {info?.soUnitTheoKeHoach}/{info?.tongSoUnit} Tổng số
                Units
              </div>
            </div>
            {info?.soUnitDaHoanThanh < info?.soUnitTheoKeHoach && (
              <div className="col__right--font" style={{ paddingTop: "10px" }}>
                Bạn đang học chậm hơn kế hoạch. Phải cố gắng hơn nữa để đạt được
                mục tiêu đấy!
              </div>
            )}

            <div
              className="flex col__right--item1"
              style={{ cursor: "pointer" }}
              onClick={showModal}
            >
              <div>
                Bạn có{" "}
                <span style={{ color: "red", fontWeight: 700 }}>
                  {info?.unitsCanHoanThanh?.length}
                </span>{" "}
                buổi chưa hoàn thành
              </div>
              <CaretRightFilled />
            </div>
          </div>
        </Col>
      </Row>
      <Modal
        title="Các buổi học chưa hoàn thành"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[]}
      >
        {info?.unitsCanHoanThanh?.map((i) => (
          <>
            {i?.lessons?.map((l) => (
              <div
                onClick={() => handleClick1("LESSON", l)}
                className="modal-item-study"
                style={{ cursor: "pointer" }}
              >
                Lesson: {l.title}
              </div>
            ))}

            {i?.tests?.map((l) => (
              <div
                onClick={() => handleClick1("TEST", l)}
                className="modal-item-study"
                style={{ cursor: "pointer" }}
              >
                Test: {l.title}
              </div>
            ))}
          </>
        ))}
      </Modal>
    </>
  );
}
export default DetailStudyPlan;
