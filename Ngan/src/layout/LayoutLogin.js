import { Layout } from "antd";
import "./layout.scss";
import { Outlet, useLocation } from "react-router-dom";
import HeaderLogin from "../components/HeaderLogin";
import HomePage from "../pages/Home/HomePage";
const { Header, Content, Sider } = Layout;
function LayoutLogin() {
  const location = useLocation();

  const isTraTu = location.pathname === "/client/main";
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Header className="header">
          <HeaderLogin/>
        </Header>
        <Content
          className={!isTraTu ? "layout__content backgroundStudy center" : "layout__content"} style={{justifyItems:"center", alignContent:"center", padding: 0}}>
          <Outlet/>
        </Content>
      </Layout>
    </>
  );
}
export default LayoutLogin;
