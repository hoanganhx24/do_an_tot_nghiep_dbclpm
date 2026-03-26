import { Button, Col, Progress, Row } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./Profile.scss";
import { TrophyTwoTone } from "@ant-design/icons";
function ProfileLearning() {
  const data = [
    { name: "Hoàn thành", value: 0, color: "#22c55e" }, // Green
    { name: "Chưa bắt đầu", value: 6, color: "#fbbf24" }, // Yellow/Orange
    { name: "Đang học", value: 4, color: "#3b82f6" }, // Blue
  ];
  return (
    <>
      <div className="profile">
        <h3>Tiến độ Study Plan</h3>
        <div className="profile__item">
          <Row>
            <Col
              span={3}
              style={{ alignContent: "center", justifyItems: "center" }}
            >
              <div className="flex profile__item--button">Level 1</div>
            </Col>
            <Col span={16}>
              <h3 style={{ margin: "6px 0" }}>TOEIC trung cấp</h3>
              <div>
                <div>
                  Tổng số cúp đã đạt <span className="bold">100/108</span>
                </div>
                <div>
                  Số Units đạt 2 cúp trở nên{" "}
                  <span className="bold">100/108</span> Units
                </div>
              </div>
            </Col>
            <Col
              span={5}
              style={{ alignContent: "center", justifyItems: "center" }}
            >
              <Button type="primary" style={{ width: "104px" }}>
                Tiếp tục
              </Button>
            </Col>
          </Row>
        </div>
        <div className="profile__item" style={{ backgroundColor: "#e8ffffff" }}>
          <div className="bold" style={{ margin: "5px 0" }}>
            Quay trở lại đường đua thôi nào!
          </div>
          <div>
            Việc tuân thủ Study Plan của bạn chưa hiệu quả, chủ yếu do nhiều
            buổi muộn hoặc chưa hoàn thành buổi học. Hãy điều chỉnh và xây dựng
            lại Study Plan để cải thiện kết quả!
          </div>
        </div>
      </div>
      <div
        className="profile__item"
        style={{ marginTop: "20px", padding: "20px" }}
      >
        <h3 style={{ marginTop: 0 }}>Tiến độ khóa học</h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ width: "50%" }}>
            <div style={{ position: "relative", height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div>Tổng khóa học</div>
                <h3 style={{ fontSize: "20px", margin: 0 }}>10</h3>
              </div>
            </div>

            <div style={{ margin: "0 50px" }}>
              <div className="flex">
                <div className="flex1">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#fbbf24",
                    }}
                  ></div>
                  Chưa bắt đầu
                </div>
                <h3>0</h3>
              </div>

              <div className="flex">
                <div className="flex1">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#22c55e",
                    }}
                  ></div>
                  Đang học
                </div>
                <h3>4</h3>
              </div>

              <div className="flex">
                <div className="flex1">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#3b82f6",
                    }}
                  ></div>
                  Hoàn thành
                </div>
                <h3>6</h3>
              </div>
            </div>
          </div>
          <div style={{ width: "50%", padding: "0 40px" }}>
            <h3 style={{ marginBottom: 0 }}>Khóa học của tôi</h3>

            <div className="flex">
              <h4>TOEIC LR 600+</h4>
              <div className="flex1">
                <TrophyTwoTone
                  twoToneColor="#f8a24dff"
                  style={{ fontSize: "20px" }}
                />
                <h4>12/43</h4>
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <Progress percent={10} />
            </div>

            <div className="flex">
              <h4>TOEIC LR 600+</h4>
              <div className="flex1">
                <TrophyTwoTone
                  twoToneColor="#f8a24dff"
                  style={{ fontSize: "20px" }}
                />
                <h4>12/43</h4>
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <Progress percent={10} />
            </div>

            <div className="flex">
              <h4>TOEIC LR 600+</h4>
              <div className="flex1">
                <TrophyTwoTone
                  twoToneColor="#f8a24dff"
                  style={{ fontSize: "20px" }}
                />
                <h4>12/43</h4>
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <Progress percent={10} />
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
export default ProfileLearning;
