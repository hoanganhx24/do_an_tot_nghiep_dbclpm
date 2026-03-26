import { TrophyFilled } from "@ant-design/icons";
import { Col, Input, Row, Select } from "antd";
import { useEffect, useState } from "react";
import "./MyCourses.scss";
import CourseItem from "./CourseItem";
import { getListCoursesOfStudent } from "../../../services/CourseService";
import { getId } from "../../../components/token";
import { refreshToken, saveToken } from "../../../services/AuthService";
const { Search } = Input;

function ListCoursesStudent({ type }) {
  const [select, setSelect] = useState("all");
  const [search, setSearch] = useState();
  const [listCourse, setListCourse] = useState([]);
  const handleChange = (value) => {
    setSelect(value);
  };
  const onSearch = (value) => {
    setSearch(value);
  };

  const fetchApiGetListCourse = async () => {
    const response = await getListCoursesOfStudent(getId());
    console.log(response.data);
    if (response.code === 200) {
      setListCourse(response.data);
    } else if (response.code === 401) {
      const refresh = await refreshToken();
      if (refresh.code === 200) {
        saveToken(refresh.data.token, refresh.data.refreshToken);
      }
    }
  };

  useEffect(() => {
    fetchApiGetListCourse();
  }, []);

  const sumCompletedCup = (tracks) => {
    let done = 0;
    let total = 0;

    tracks?.forEach((track) => {
      track.trackResponse.courses.forEach((course) => {
        const [d, t] = course.completedCup.split("/").map(Number);
        done += d;
        total += t;
      });
    });

    return `${done}/${total}`;
  };

  return (
    <>
      <div className="mycourse__header">
        <div className="mycourse__header--left">Khóa học của tôi</div>

        <div className="mycourse__header--right" style={{display:"none"}}>
          <Search
            placeholder="Tìm kiếm khóa học"
            onSearch={onSearch}
            className="mycourse__search"
          />

          <div className="mycourse__filter">
            <span>Lọc theo</span>
            <Select
              defaultValue="all"
              onChange={handleChange}
              options={[
                { value: "all", label: "Tất cả trình độ" },
                { value: "fresher", label: "Nền tảng Toeic" },
                { value: "middle", label: "Toeic trung cấp" },
                { value: "senior", label: "Toeic chuyên sâu" },
              ]}
            />
          </div>
        </div>
      </div>
      {listCourse?.length === 0 && <h3>Không có khóa học nào! Bạn phải tham gia bài test đầu vào để nhận lộ trình học phù hợp.</h3>}
      {/* 0-300 */}
      {listCourse?.filter(
        (item) => item.status === 2 && item.trackResponse.code === "0-300"
      ).length > 0 && (
        <div className="list">
          <div className="list__headerCourse">
            <div className="list__headerCourse--title">Nền tảng TOEIC</div>
          </div>
          {listCourse
            ?.filter(
              (item) => item.status === 2 && item.trackResponse.code === "0-300"
            )
            .map((item) => (
              <>
                <div>{item.trackResponse.courses.length} courses</div>
                <div className="list__content">
                  <Row gutter={[20, 20]}>
                    {item.trackResponse.courses.map((course) => (
                      <Col
                        key={course.id}
                        xs={24} // mobile: 1 cột
                        sm={12} // tablet nhỏ: 2 cột
                        md={8} // tablet lớn: 3 cột
                        lg={6} // desktop: 4 cột
                        xl={6}
                      >
                        <CourseItem course={course} />
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ))}
        </div>
      )}

      {listCourse?.filter(
        (item) => item.status !== 2 && item.trackResponse.code === "0-300"
      ).length > 0 && (
        <div className="list">
          <div className="list__headerCourse">
            <div className="list__headerCourse--title">Nền tảng TOEIC</div>
            <div className="list__headerCourse--cup">
              <TrophyFilled style={{ marginLeft: "8px", color: "orange" }} />{" "}
              {sumCompletedCup(
                listCourse?.filter(
                  (item) =>
                    item.status !== 2 && item.trackResponse.code === "0-300"
                )
              )}
            </div>
          </div>
          {listCourse
            ?.filter(
              (item) => item.status !== 2 && item.trackResponse.code === "0-300"
            )
            .map((item) => (
              <>
                <div>{item.trackResponse.courses.length} courses</div>
                <div className="list__content">
                  <Row gutter={[20, 20]}>
                    {item.trackResponse.courses.map((course) => (
                      <Col
                        key={course.id}
                        xs={24} // mobile: 1 cột
                        sm={12} // tablet nhỏ: 2 cột
                        md={8} // tablet lớn: 3 cột
                        lg={6} // desktop: 4 cột
                        xl={6}
                      >
                        <CourseItem course={course} />
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ))}
        </div>
      )}

      {/* 300-600 */}
      {listCourse?.filter(
        (item) => item.status === 2 && item.trackResponse.code === "300-600"
      ).length > 0 && (
        <div className="list">
          <div className="list__headerCourse">
            <div className="list__headerCourse--title">TOEIC trung cấp</div>
          </div>
          {listCourse
            ?.filter(
              (item) =>
                item.status === 2 && item.trackResponse.code === "300-600"
            )
            .map((item) => (
              <>
                <div>{item.trackResponse.courses.length} courses</div>
                <div className="list__content">
                  <Row gutter={[20, 20]}>
                    {item.trackResponse.courses.map((course) => (
                      <Col
                        key={course.id}
                        xs={24} // mobile: 1 cột
                        sm={12} // tablet nhỏ: 2 cột
                        md={8} // tablet lớn: 3 cột
                        lg={6} // desktop: 4 cột
                        xl={6}
                      >
                        <CourseItem course={course} />
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ))}
        </div>
      )}

      {listCourse?.filter(
        (item) => item.status !== 2 && item.trackResponse.code === "300-600"
      ).length > 0 && (
        <div className="list">
          <div className="list__headerCourse">
            <div className="list__headerCourse--title">TOEIC trung cấp</div>
            <div className="list__headerCourse--cup">
              <TrophyFilled style={{ marginLeft: "8px", color: "orange" }} />{" "}
              {sumCompletedCup(
                listCourse?.filter(
                  (item) =>
                    item.status !== 2 && item.trackResponse.code === "300-600"
                )
              )}
            </div>
          </div>
          {listCourse
            ?.filter(
              (item) =>
                item.status !== 2 && item.trackResponse.code === "300-600"
            )
            .map((item) => (
              <>
                <div>{item.trackResponse.courses.length} courses</div>
                <div className="list__content">
                  <Row gutter={[20, 20]}>
                    {item.trackResponse.courses.map((course) => (
                      <Col
                        key={course.id}
                        xs={24} // mobile: 1 cột
                        sm={12} // tablet nhỏ: 2 cột
                        md={8} // tablet lớn: 3 cột
                        lg={6} // desktop: 4 cột
                        xl={6}
                      >
                        <CourseItem course={course} />
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ))}
        </div>
      )}

      {/* 600+ */}
      {listCourse?.filter(
        (item) => item.status === 2 && item.trackResponse.code === "600+"
      ).length > 0 && (
        <div className="list">
          <div className="list__headerCourse">
            <div className="list__headerCourse--title">TOEIC chuyên sâu</div>
          </div>
          {listCourse
            ?.filter(
              (item) => item.status === 2 && item.trackResponse.code === "600+"
            )
            .map((item) => (
              <>
                <div>{item.trackResponse.courses.length} courses</div>
                <div className="list__content">
                  <Row gutter={[20, 20]}>
                    {item.trackResponse.courses.map((course) => (
                      <Col
                        key={course.id}
                        xs={24} // mobile: 1 cột
                        sm={12} // tablet nhỏ: 2 cột
                        md={8} // tablet lớn: 3 cột
                        lg={6} // desktop: 4 cột
                        xl={6}
                      >
                        <CourseItem course={course} />
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ))}
        </div>
      )}

      {listCourse?.filter(
        (item) => item.status !== 2 && item.trackResponse.code === "600+"
      ).length > 0 && (
        <div className="list">
          <div className="list__headerCourse">
            <div className="list__headerCourse--title">TOEIC chuyên sâu</div>
            <div className="list__headerCourse--cup">
              <TrophyFilled style={{ marginLeft: "8px", color: "orange" }} />{" "}
              {sumCompletedCup(
                listCourse?.filter(
                  (item) =>
                    item.status !== 2 && item.trackResponse.code === "600+"
                )
              )}
            </div>
          </div>
          {listCourse
            ?.filter(
              (item) => item.status !== 2 && item.trackResponse.code === "600+"
            )
            .map((item) => (
              <>
                <div>{item.trackResponse.courses.length} courses</div>
                <div className="list__content">
                  <Row gutter={[20, 20]}>
                    {item.trackResponse.courses.map((course) => (
                      <Col
                        key={course.id}
                        xs={24} // mobile: 1 cột
                        sm={12} // tablet nhỏ: 2 cột
                        md={8} // tablet lớn: 3 cột
                        lg={6} // desktop: 4 cột
                        xl={6}
                      >
                        <CourseItem course={course} />
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ))}
        </div>
      )}
    </>
  );
}
export default ListCoursesStudent;
