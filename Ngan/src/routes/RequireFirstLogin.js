import { Navigate, Outlet } from "react-router-dom";

const RequireFirstLogin = () => {
  const firstLogin = localStorage.getItem("firstLogin");

  if (firstLogin !== true) {
    return <Navigate to="/home/main" replace />;
  }

  return <Outlet />;
};

export default RequireFirstLogin;
