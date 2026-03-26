import { Layout } from "antd";
import "./layout.scss";
import { Outlet, useLocation } from "react-router-dom";
import HeaderHome from "../components/HeaderHome";
const { Header, Content, Sider } = Layout;
function LayoutHome() {
  const location = useLocation();

  const isTraTu = location.pathname === "/home/tratu" || location.pathname === "/home/vocal" || location.pathname === "/home/account";
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Header className="header">
          <HeaderHome/>
        </Header>
        <Content
          className={isTraTu ? "layout__content backgroundStudy center" : "layout__content"} style={{padding: location.pathname === "/home/main" && 0}}>
          <Outlet />
        </Content>
      </Layout>
    </>
  );
}
export default LayoutHome;
