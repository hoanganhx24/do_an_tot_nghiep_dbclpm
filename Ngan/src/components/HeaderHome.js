import { Button, Dropdown } from "antd";
import { getAccessToken, setAccessToken } from "./token";
import { logout, parseJwt } from "./function";
import { useNavigate } from "react-router-dom";
import MenuSiderHome from "./MenuSiderHome";
function HeaderHome() {
//   const token = getAccessToken();
//   const obj = parseJwt(token);
  const navigate = useNavigate();
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
              {/* {obj.name} */}
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
      label: <div style={{fontWeight:"500"}} onClick={()=>navigate("/home/account")}>Cài đặt</div>,
    },
    {
      key: "3",
      label: <div style={{color:"red", fontWeight:"500"}} onClick={()=>logout()}>Đăng xuất</div>,
    },
  ];
  return (
    <>
      <div className="flex1">
        <h2
          style={{
            margin: "0 10px",
            height: "42px",
            alignItems: "center",
            display: "flex",
          }}
        >
          ToeicEdu
        </h2>
        <MenuSiderHome/>
      </div>
      <div className="flex1">
        <Button type="primary" onClick={() => navigate("/student/my_courses")}>Bắt đầu học</Button>
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
export default HeaderHome;
