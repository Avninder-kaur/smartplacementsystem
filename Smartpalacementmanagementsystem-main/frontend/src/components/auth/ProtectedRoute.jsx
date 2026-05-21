import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
const getRoleDashboard = (role) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "recruiter" || role === "company") return "/company/dashboard";
    return "/student/dashboard";
};
export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>);
    }
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getRoleDashboard(user.role)} replace />;
    }
    return children;
}
