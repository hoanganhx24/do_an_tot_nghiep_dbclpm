import { Button} from "antd";
import { useNavigate } from "react-router-dom";
function HeaderHome(){
  const navigate = useNavigate();
  return (
    <>
      <div className="flex1">
        <h2
          style={{
            margin: "0 10px",
            height: "42px",
            alignItems: "center",
            display: "flex",
            cursor:"pointer"
          }}
          onClick={()=>navigate("/client/main")}
        >
          ToeicEdu
        </h2>
      </div>
      <div className="flex1">
        <Button type="primary" onClick={()=>navigate("/client/login")}>Đăng nhập</Button>
        <Button type="primary" onClick={()=>navigate("/client/register")}>Đăng ký</Button>
      </div>
    </>
  );
}
export default HeaderHome;
