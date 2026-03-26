import { Layout, Grid } from "antd";
import "./layout.scss";
import { Outlet, useLocation } from "react-router-dom";
import MenuSiderStudent from "../components/MenuSiderStudent";
import { useState } from "react";
import HeaderCommon from "../components/Header";
const { useBreakpoint } = Grid;
const { Header, Content, Sider } = Layout;
function LayoutStudent() {
  const location = useLocation();
  const isStudyPlan = location.pathname.includes("/student/study_plan");
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  return (
    <>
      <Layout
        style={{
          minHeight: "100vh",
          backgroundColor: isStudyPlan ? "#007bff" : "white",
        }}
      >
        <Header
          className="header"
          style={{
            backgroundColor: isStudyPlan ? "#007bff" : "white",
            color: isStudyPlan ? "white" : "black",
            border: isStudyPlan && "1px solid #9cccfdff",
          }}
        >
          <HeaderCommon toggleSidebar={toggleSidebar} />
        </Header>
        <div style={{ display: "flex", flex: 1, marginTop: "60px" }}>
          <Layout>
            <Sider
              className={isStudyPlan ? "sider backgroundStudySider" : "sider"}
              collapsible
              collapsed={collapsed}
              trigger={null}
              collapsedWidth={60}
              breakpoint="md"
              onBreakpoint={(broken) => {
                setCollapsed(broken);
              }}
            >
              <MenuSiderStudent isStudyPlan={isStudyPlan} />
            </Sider>
            <Content
              className={
                isStudyPlan
                  ? "layout__content backgroundStudy"
                  : "layout__content"
              }
              style={collapsed ? {marginLeft:60} : {marginLeft:"195px"}}
            >
              <Outlet />
            </Content>
          </Layout>
        </div>
      </Layout>
    </>
  );
}
export default LayoutStudent;
