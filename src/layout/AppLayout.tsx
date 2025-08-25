import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { MyAgentsProvider } from "../context/MyAgentsContext";
import { useRevalidateSessionOnRouteChange } from "../hooks/validateSessionOnRouteChange";
import { MarketersProvider } from "../context/MarketersContext";
import { useUserActivityTokenRefresh } from "../hooks/useUserActivityTokenRefresh";

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
  useRevalidateSessionOnRouteChange();
  useUserActivityTokenRefresh(); // Track user activity for token refresh

  return (
    <SidebarProvider>
      <MyAgentsProvider>
        <MarketersProvider>
          <LayoutContent />
        </MarketersProvider>
      </MyAgentsProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
