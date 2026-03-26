import { Layout, Grid } from "antd";
import "./layout.scss";
import MenuSiderAdmin from "../components/MenuSiderAdmin";
import { Outlet } from "react-router-dom";
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
        <div style={{ display: "flex", flex: 1, marginTop: "60px" }} className="admin">
          <Layout>
            <Sider
              className="sider admin"
              collapsible
              collapsed={collapsed}
              trigger={null}
              collapsedWidth={70}
              breakpoint="md"
              onBreakpoint={(broken) => {
                setCollapsed(broken);
              }}
            >
              <MenuSiderAdmin />
            </Sider>
            <Content
              className="layout__content"
              style={collapsed ? { marginLeft: 90, marginBottom: "25px", marginTop: "25px", marginRight: "25px", backgroundColor: "white"} : { marginLeft: "225px",marginBottom: "25px", marginTop: "25px", marginRight: "25px", backgroundColor: "white" }}
            >
              <Outlet />
            </Content>
          </Layout>
        </div>
      </Layout>
    </>
  );
}
export default LayoutAdmin;
