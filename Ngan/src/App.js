import { useEffect, useState } from 'react';
import './App.css';
import AllRoutes from "./components/AllRoutes";
import { parseJwt } from './components/function';

function App() {
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Gửi message "ready" cho cửa sổ cha
    if (window.opener) {
      window.opener.postMessage(
        { type: "ready" },
        "http://localhost:5173"
      );
      console.log("📤 Sent 'ready' message to 5173");
    }

    // Lắng nghe message từ cửa sổ cha
    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:5173") return;

      const { type, accessToken } = event.data;

      if (type === "auth" && accessToken) {
        localStorage.setItem("accessToken", accessToken);
        const role=parseJwt(accessToken).role;
        localStorage.setItem("role",accessToken);
        setToken(accessToken);
        console.log("✅ Token received from 5173:", accessToken);
      }
    };

    window.addEventListener("message", handleMessage);

    // Kiểm tra token đã có sẵn trong localStorage chưa
    // const existingToken = localStorage.getItem("accessToken");
    // if (existingToken) {
    //   setToken(existingToken);
    //   console.log("🔄 Token loaded from localStorage:", existingToken);
    // }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <AllRoutes/>
  );
}

export default App;
