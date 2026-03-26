import { Layout, Grid } from "antd";
import "./layout.scss";
import { Outlet } from "react-router-dom";
import MenuSiderTeacher from "../components/MenuSiderTeacher";
import HeaderCommon from "../components/Header";
import { useState } from "react";
const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;
function LayoutAdmin() {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Header className="header">
          <HeaderCommon toggleSidebar={toggleSidebar} />
        </Header>
        <div style={{ display: "flex", flex: 1, marginTop: "60px" }}>
          <Layout>
            <Sider
              className="sider"
              collapsible
              collapsed={collapsed}
              trigger={null}
              collapsedWidth={60}
              breakpoint="md"
              onBreakpoint={(broken) => {
                setCollapsed(broken);
              }}
            >
              <MenuSiderTeacher />
            </Sider>
            <Content className="layout__content" style={collapsed ? {marginLeft:60} : {marginLeft:"195px"}}>
              <Outlet />
            </Content>
          </Layout>
        </div>
      </Layout>
    </>
  );
}
export default LayoutAdmin;
