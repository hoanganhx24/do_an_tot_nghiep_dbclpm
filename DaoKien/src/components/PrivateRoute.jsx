import { Navigate } from "react-router-dom";

export function PrivateRoute({ user, children }) {
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export function RoleRoute({ user, allow, children }) {
    if (!user) return <Navigate to="/login" replace />;
    if (!allow.includes(user.role)) return <Navigate to="/no-permission" replace />;
    return children;
}
