import { Navigate, Outlet, useLocation } from "react-router-dom";
import { parseJwt } from "../components/function";

const HOME_BY_ROLE = {
  ADMIN: "/admin/teachers",
  TEACHER: "/teacher/courses",
  STUDENT: "/home/main",
};

export default function RequireRole({ allow = [] }) {
  const location = useLocation();
  const obj = parseJwt(localStorage.getItem("accessToken"));
  const role = obj.role;

  // Không có role (lỗi) -> quay về client
  if (!role) return <Navigate to="/client/main" replace />;

  // Role không nằm trong allow -> đá về trang home theo role
  if (!allow.includes(role)) {
    return (
      <Navigate
        to={HOME_BY_ROLE[role] || "/client/main"}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
