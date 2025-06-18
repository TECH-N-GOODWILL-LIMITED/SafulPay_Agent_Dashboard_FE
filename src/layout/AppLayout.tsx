import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useEffect, useState } from "react";
import { validateToken } from "../utils/api";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await validateToken(token);
        console.log("Token validation response:", response);
        if (response.success) {
          setIsValidToken(true);
          if (user?.role) {
            const rolePath =
              user.role.toLowerCase() === "admin"
                ? "/"
                : `/${user.role.toLowerCase()}s`;
            if (location.pathname === "/") {
              navigate(rolePath, { replace: true });
            }
          }
        } else {
          await logout();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };
    validate();
  }, [token, user, logout, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token || !isValidToken) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
