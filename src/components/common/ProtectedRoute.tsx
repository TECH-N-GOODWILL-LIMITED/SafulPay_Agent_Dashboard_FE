import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, user } = useAuth(); // Assuming user object contains the role

  if (!token) {
    // If not authenticated, redirect to sign-in page
    return <Navigate to="/signin" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // If authenticated but not authorized, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
