import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    }

    if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
        if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
        if (user.role === "recruiter" || user.role === "company") return <Navigate to="/company/dashboard" replace />;
        return <Navigate to="/student/dashboard" replace />;
    }

    return children;
}
