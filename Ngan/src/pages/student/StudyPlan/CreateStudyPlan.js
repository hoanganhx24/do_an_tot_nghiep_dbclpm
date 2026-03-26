import { useEffect, useState } from "react";
import "./background.css";
import { Button, DatePicker, notification } from "antd";
import GoBack from "../../../components/GoBack";
import { useNavigate } from "react-router-dom";
import {
  createPlan,
  getMinDayForStudy,
  getStudyPlanOverview,
  verifyInformation,
} from "../../../services/StudyPlanService";
import { refreshToken, saveToken } from "../../../services/AuthService";
import { openNotification } from "../../../components/Notification";
import { logout } from "../../../components/function";
import { getId } from "../../../components/token";
import dayjs from "dayjs";
import DetailStudyPlan from "./DetailStudyPlan";

function CreateStudyPlan({ setPlan, onCreated }) {
  const [isActive, setIsActive] = useState(true);
  const [time, setTime] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [startDay, setStartDay] = useState(null);
  const [trackId, setTrackId] = useState();

  const [listTime, setListTime] = useState();
  const createListTime = (time) => {
    var timeStudyList = [];
    if (time % 15 === 0) {
      let i = time / 15;
      for (let dem = 0; dem < 7; dem++) {
        timeStudyList.push(15 * (i + dem));
      }
    } else {
      let i = parseInt(time / 15);
      for (let dem = 0; dem < 7; dem++) {
        timeStudyList.push(15 * (i + dem + 1));
      }
    }
    setListTime(timeStudyList);
  };
  const fetchGetMinDayForStudy = async (trackId) => {
    const response = await getMinDayForStudy(trackId);
    console.log(response.data);
    if (response.code === 200) {
      createListTime(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getMinDayForStudy(trackId);
        if (retryResponse.code === 200) {
          createListTime(retryResponse.data);
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

  const handleActive = () => {
    setIsActive(false);
    fetchGetMinDayForStudy(trackId);
  };
  const handleTime = (t) => {
    setTime(t);
  };

  const handleCanlendar = (value) => {
    let cal = [...calendar];
    if (cal.find((i) => i === value)) {
      cal = cal.filter((i) => i !== value);
      setCalendar([...cal]);
    } else {
      setCalendar([...cal, value]);
    }
  };

  const onChange = (date, dateString) => {
    const today = dayjs().startOf("day"); // ngày hiện tại (00:00)
    const selected = date.startOf("day"); // ngày chọn

    if (selected.isBefore(today)) {
      openNotification(
        api,
        "bottomRight",
        "Lỗi",
        "Không được chọn ngày nhỏ hơn ngày hiện tại"
      );
    } else {
      const formatted = date ? date.format("DD/MM/YYYY") : null;
      setStartDay(formatted);
    }
  };

  const navigate = useNavigate();
  const [api, context] = notification.useNotification();

  const [overview, setOverview] = useState();
  const fetchGetStudyPlanOverview = async () => {
    const response = await getStudyPlanOverview();
    console.log(response.data);
    if (response.code === 200) {
      setOverview(response.data);
      setTrackId(response.data.trackId);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await getStudyPlanOverview();
        if (retryResponse.code === 200) {
          setOverview(retryResponse.data);
          setTrackId(retryResponse.data.trackId);
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
    fetchGetStudyPlanOverview();
  }, []);

  const [verify, setVerify] = useState();
  const [loading, setLoading] = useState(false);
  const handleVerifyPlan = async () => {
    setLoading(true);
    const data = {
      startDate: startDay,
      studentProfileId: getId(),
      soLuongNgayHoc: time,
      ngayHocTrongTuan: calendar,
      trackId: trackId,
    };
    console.log(data);

    const response = await verifyInformation(data);
    console.log(response.data);
    if (response.code === 200) {
      setLoading(false);
      setVerify(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await verifyInformation(data);
        if (retryResponse.code === 200) {
          setLoading(false);
          setVerify(retryResponse.data);
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

  const [loadingCreate, setLoadingCreate] = useState(false);
  const handleCreatePlan = async () => {
    setLoadingCreate(true);
    const data = {
      startDate: startDay,
      studentProfileId: getId(),
      soLuongNgayHoc: time,
      ngayHocTrongTuan: calendar,
      trackId: trackId,
    };
    const response = await createPlan(data);
    console.log(response);
    if (response.code === 200) {
      setLoadingCreate(false);
      onCreated();
      setTimeout(() => setPlan(true),1000);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
        const retryResponse = await createPlan(data);
        if (retryResponse.code === 200) {
          setLoadingCreate(false);
          onCreated();
          setTimeout(() => setPlan(true),1000);
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

  const [disabled, setDisabled] = useState(true);
  const check = () => {
    if (calendar.length > 0 && time !== null && startDay !== null)
      setDisabled(false);
  };

  useEffect(() => {
    check();
  }, [calendar, time, startDay]);

  return (
    <>
      {context}
      <div className="toeic-background">
        {/* Clouds and stars */}
        <div className="cloud cloud1">
          <img src="https://g-static-assets.prepcdn.com/learning-web-app/v20251101.1244-c422471d/_nuxt/97e0500f_c422471d_20251101.1244.svg" />
        </div>
        <div className="cloud cloud2">
          <img src="https://g-static-assets.prepcdn.com/learning-web-app/v20251101.1244-c422471d/_nuxt/97e0500f_c422471d_20251101.1244.svg" />
        </div>
        <div className="cloud cloud3">
          <img src="https://g-static-assets.prepcdn.com/learning-web-app/v20251101.1244-c422471d/_nuxt/97e0500f_c422471d_20251101.1244.svg" />
        </div>
        <div className="btnback">
          <Button onClick={() => navigate(-1)}>Thoát</Button>
        </div>
        {isActive ? (
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Khởi tạo Study Plan</h2>
            <h1>Chặng: {overview?.trackName}</h1>

            <div className="card-content">
              <p>
                <strong>Chặng này bạn sẽ học:</strong>{" "}
                {overview?.trackDescription}
              </p>
              <p>
                <strong>Bao gồm các khóa:</strong> {overview?.overview}
              </p>
              <p>
                <strong>Mục tiêu đầu ra:</strong> {overview?.mucTieuDauRa}
              </p>
              <p>
                <strong>Thời gian học tiêu chuẩn:</strong>{" "}
                {overview?.thoiGianHocTieuChuan}
              </p>
            </div>

            <Button className="start-btn" onClick={handleActive} type="primary">
              Khởi tạo
            </Button>
          </div>
        ) : (
          <>
            {!verify ? (
              <div className="flex3">
                <div className="card1">
                  <h2>Thiết lập lịch học</h2>
                </div>
                <div style={{ width: "100%" }}>
                  <h3 style={{ color: "white" }}>Thời lượng học dự kiến</h3>
                  <div className="time">
                    {listTime?.map((t) => (
                      <Button
                        onClick={() => handleTime(t)}
                        className={time === t && "active"}
                        disabled={loading}
                      >
                        {t} ngày
                      </Button>
                    ))}
                  </div>
                  <h3 style={{ color: "white" }}>Lịch học trong tuần</h3>
                  <div className="time">
                    <Button
                      onClick={() => handleCanlendar(1)}
                      className={calendar.find((i) => i === 1) && "active"}
                      disabled={loading}
                    >
                      Thứ 2
                    </Button>
                    <Button
                      onClick={() => handleCanlendar(2)}
                      className={calendar.find((i) => i === 2) && "active"}
                      disabled={loading}
                    >
                      Thứ 3
                    </Button>
                    <Button
                      onClick={() => handleCanlendar(3)}
                      className={calendar.find((i) => i === 3) && "active"}
                      disabled={loading}
                    >
                      Thứ 4
                    </Button>
                    <Button
                      onClick={() => handleCanlendar(4)}
                      className={calendar.find((i) => i === 4) && "active"}
                      disabled={loading}
                    >
                      Thứ 5
                    </Button>
                    <Button
                      onClick={() => handleCanlendar(5)}
                      className={calendar.find((i) => i === 5) && "active"}
                      disabled={loading}
                    >
                      Thứ 6
                    </Button>
                    <Button
                      onClick={() => handleCanlendar(6)}
                      className={calendar.find((i) => i === 6) && "active"}
                      disabled={loading}
                    >
                      Thứ 7
                    </Button>
                    <Button
                      onClick={() => handleCanlendar(7)}
                      className={calendar.find((i) => i === 7) && "active"}
                      disabled={loading}
                    >
                      Chủ nhật
                    </Button>
                  </div>
                  <h3 style={{ color: "white" }}>Ngày bắt đầu</h3>
                  <DatePicker
                    onChange={onChange}
                    disabled={loading}
                    style={{
                      zIndex: "100",
                      width: "100%",
                      height: "64px",
                      minWidth: "650px",
                      backgroundColor: "white",
                    }}
                  />
                </div>
                <Button
                  className="start-btn"
                  onClick={() => handleVerifyPlan()}
                  disabled={disabled}
                  loading={loading}
                  type="primary"
                >
                  Tiếp tục
                </Button>
              </div>
            ) : (
              <div className="flex3">
                <div className="card1">
                  <h2>Xác nhận Study Plan</h2>
                </div>
                <div style={{ width: "100%" }}>
                  <div className="itemStudy" style={{ marginBottom: "10px" }}>
                    <div className="flexStudy">
                      <div>Số buổi học</div>
                      <h3>{verify?.tongSoBuoiHoc} buổi</h3>
                    </div>
                    <div className="flexStudy">
                      <div>Lịch học trong tuần</div>
                      <h3>
                        {verify?.ngayHocTrongTuan.map((d, i) => {
                          if (i < verify?.ngayHocTrongTuan.length - 1)
                            if (d !== 7) return "Th " + (d + 1) + ", ";
                            else return "CN, ";
                          else {
                            if (d !== 7) return "Th " + (d+1);
                            else return "CN";
                          }
                        })}
                      </h3>
                    </div>
                    <div className="flexStudy">
                      <div>Ngày bắt đầu</div>
                      <h3>{verify?.startDate}</h3>
                    </div>
                  </div>
                  <div className="itemStudy">
                    <div className="flexStudy">
                      <div>Tổng số Units</div>
                      <h3>{verify?.tongSoUnits} Units</h3>
                    </div>
                    <div className="flexStudy">
                      <div>
                        Số Unit cần học mỗi buổi (Tương đương với 1 - 2 giờ /
                        buổi)
                      </div>
                      <h3>{verify?.soUnitsTrenBuoi} Units</h3>
                    </div>
                    <div className="flexStudy">
                      <div>Ngày hoàn thành dự kiến</div>
                      <h3>{verify?.ngayHoanThanh}</h3>
                    </div>
                  </div>
                </div>
                <Button
                  className="start-btn"
                  onClick={() => handleCreatePlan()}
                  type="primary"
                  loading={loadingCreate}
                >
                  Khởi tạo
                </Button>
              </div>
            )}
          </>
        )}

        {/* Bottom gradient */}
        <div className="bottom-gradient" />
      </div>
    </>
  );
}
export default CreateStudyPlan;
