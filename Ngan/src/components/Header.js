import {
  BellFilled,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import { getAccessToken, setAccessToken, setRefreshToken } from "./token";
import { logout, parseJwt } from "./function";
import { useNavigate } from "react-router-dom";
function HeaderCommon({ toggleSidebar }) {
  const token = getAccessToken();
  const obj = parseJwt(token);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const items = [
    {
      key: "1",
      label: (
        <>
          <div className="flex" style={{ width: "200px" }}>
            <img
              src="https://g-static-assets.prepcdn.com/learning-web-app/v20251101.1244-c422471d/_nuxt/28543647_c422471d_20251101.1244.jpg"
              alt="avartar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            <h3
              style={{
                margin: "0",
              }}
            >
              {obj.name}
            </h3>
          </div>
        </>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: <div style={{fontWeight:"500"}} onClick={()=> role === "ADMIN" ? navigate("/admin/account") : role === "TEACHER" ? navigate("/teacher/account") : navigate("/home/account")}>Cài đặt</div>,
    },
    {
      key: "3",
      label: <div style={{color:"red", fontWeight:"500"}} onClick={()=>logout()}>Đăng xuất</div>,
    },
  ];
  return (
    <>
      <div className="flex1">
        <UnorderedListOutlined
          style={{ fontSize: "25px" }}
          className="cursor"
          onClick={toggleSidebar}
        />
        <h2
          style={{
            margin: "0 10px",
            height: "42px",
            alignItems: "center",
            display: "flex",
            cursor: role === "STUDENT" ? "pointer" : undefined
          }}
          onClick={() => {role === "STUDENT" && navigate("/home/main")}}
        >
          ToeicEdu
        </h2>
      </div>
      <div className="flex1">
        <Dropdown menu={{ items }}>
          <img
            src="https://g-static-assets.prepcdn.com/learning-web-app/v20251101.1244-c422471d/_nuxt/28543647_c422471d_20251101.1244.jpg"
            alt="avartar"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            className="cursor"
          />
        </Dropdown>
      </div>
    </>
  );
}
export default HeaderCommon;
