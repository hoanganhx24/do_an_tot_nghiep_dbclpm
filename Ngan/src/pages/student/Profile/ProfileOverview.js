import { Button, Col, Row } from "antd";
import "./Profile.scss";
import {
  TrophyTwoTone,
  ReconciliationTwoTone,
  FileZipTwoTone,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
function ProfileOverview() {
  const data = [
    { date: "Jan 01", value: 1.5 },
    { date: "Jan 02", value: 2.1 },
    { date: "Jan 03", value: 2.8 },
    { date: "Jan 04", value: 3.2 },
    { date: "Jan 05", value: 3.5 },
    { date: "Jan 06", value: 3.3 },
    { date: "Jan 07", value: 3.1 },
    { date: "Jan 08", value: 2.9 },
    { date: "Jan 09", value: 2.7 },
    { date: "Jan 10", value: 2.8 },
    { date: "Jan 11", value: 3.0 },
    { date: "Jan 12", value: 3.2 },
    { date: "Jan 13", value: 2.9 },
    { date: "Jan 14", value: 2.6 },
    { date: "Jan 15", value: 2.5 },
    { date: "Jan 16", value: 2.7 },
    { date: "Jan 17", value: 2.9 },
    { date: "Jan 18", value: 3.1 },
    { date: "Jan 19", value: 3.3 },
    { date: "Jan 20", value: 3.0 },
    { date: "Jan 21", value: 2.8 },
    { date: "Jan 22", value: 2.6 },
    { date: "Jan 23", value: 2.5 },
    { date: "Jan 24", value: 2.7 },
    { date: "Jan 25", value: 2.9 },
    { date: "Jan 26", value: 3.0 },
    { date: "Jan 27", value: 2.8 },
    { date: "Jan 28", value: 2.6 },
    { date: "Jan 29", value: 2.5 },
    { date: "Jan 30", value: 2.3 },
    { date: "Jan 31", value: 2.4 },
  ];

  return (
    <>
      <Row gutter={20}>
        <Col span={18}>
          <div className="profile">
            <h3>Tiến độ học tập</h3>
            <div className="profile__item">
              <Row>
                <Col
                  span={3}
                  style={{ alignContent: "center", justifyItems: "center" }}
                >
                  <div className="flex profile__item--button">Level 1</div>
                </Col>
                <Col span={16}>
                  <h3 style={{ margin: "6px 0" }}>Nền tảng TOEIC</h3>
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
                    Hoàn thành
                  </Button>
                </Col>
              </Row>
            </div>
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
          </div>
        </Col>
        <Col span={6}>
          <div
            className="flex profile__item"
            style={{ paddingLeft: "20px", paddingRight: "20px" }}
          >
            <div className="flex1">
              <div
                className="icon flex2"
                style={{ backgroundColor: "#fff6f6ff" }}
              >
                <TrophyTwoTone
                  twoToneColor="#f8a24dff"
                  style={{ fontSize: "26px" }}
                />
              </div>
              Tổng số cúp đạt được
            </div>
            <h2 style={{ color: "#f8a24dff" }}>172</h2>
          </div>
          <div
            className="flex profile__item"
            style={{ paddingLeft: "20px", paddingRight: "20px" }}
          >
            <div className="flex1">
              <div
                className="icon flex2"
                style={{ backgroundColor: "#fee4e4ff" }}
              >
                <ReconciliationTwoTone
                  twoToneColor="#f84d4dff"
                  style={{ fontSize: "26px" }}
                />
              </div>
              Tổng số bài test
            </div>
            <h2 style={{ color: "#f84d4dff" }}>63</h2>
          </div>
          <div
            className="flex profile__item"
            style={{ paddingLeft: "20px", paddingRight: "20px" }}
          >
            <div className="flex1">
              <div
                className="icon flex2"
                style={{ backgroundColor: "#efffd6ff" }}
              >
                <FileZipTwoTone
                  twoToneColor="#34912cff"
                  style={{ fontSize: "26px" }}
                />
              </div>
              Tổng số bài học
            </div>
            <h2 style={{ color: "#34912cff" }}>63</h2>
          </div>
        </Col>
      </Row>
      <div className="profile__item" style={{marginTop:"20px"}}>
        <h3>Tần suất học tập trong tháng 11</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #b7eb8f",
                borderRadius: "4px",
                padding: "8px",
              }}
              formatter={(value) => [value.toFixed(2), "Value"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1890ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
export default ProfileOverview;
