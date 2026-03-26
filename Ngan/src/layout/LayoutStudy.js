import { Layout,Button } from "antd";
import "./layout.scss";
import "../components/index.scss";
import { Outlet, useNavigate } from "react-router-dom";
import GoBack from "../components/GoBack";
const { Header, Content, Footer } = Layout;
function LayoutStudy() {
  const navigate = useNavigate();
  return (
    <>
      <Layout style={{ minHeight: "100vh"}}>
        <Header className="header">
          <div className="flex1">
              <GoBack onClick={() => navigate(-1)}/>
              <div className="font500">Khóa học của tôi</div>
            </div>
            <div className="flex1">
              <img src="https://g-static-assets.prepcdn.com/learning-web-app/v20251101.1244-c422471d/_nuxt/28543647_c422471d_20251101.1244.jpg" alt="avartar" style={{width: "40px", height: "40px", borderRadius:"50%"}}/>
            </div>
        </Header>
        <div style={{display: "flex", flex: 1, marginTop:"60px"}}>
          <Layout>
            <Content className="layout__content" style={{marginLeft:0}}>
              <Outlet />
            </Content>
          </Layout>
        </div>
      </Layout>
    </>
  );
}
export default LayoutStudy;
