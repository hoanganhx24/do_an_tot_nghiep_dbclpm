import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

function MenuSiderHome() {
  const location = useLocation();

  const handleGoExam = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ No accessToken");
      return;
    }

    const examWindow = window.open("http://localhost:5173/user", "_self");

    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:5173") return;

      // 👈 đúng với bên 5173: type === "ready"
      if (event.data?.type === "ready") {
        console.log("📥 5173 ready → send token");

        examWindow.postMessage(
          {
            type: "auth", // 👈 đúng type
            accessToken: token,
          },
          "http://localhost:5173"
        );

        // cleanup
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);
  };

  const items = [
    {
      key: "/home/main",
      label: <Link to="/home/main">Trang chủ</Link>,
    },
    {
      key: "",
      label: <span onClick={handleGoExam}>Luyện đề</span>,
    },
    {
      key: "/home/tratu",
      label: <Link to="/home/tratu">Tra từ</Link>,
    },
    {
      key: "/home/vocal",
      label: <Link to="/home/vocal">Ôn tập từ vựng</Link>,
    },
  ];

  return (
    <>
      <Menu
        mode="horizontal"
        items={items}
        disabledOverflow
        selectedKeys={[location.pathname]}
      />
    </>
  );
}
export default MenuSiderHome;
