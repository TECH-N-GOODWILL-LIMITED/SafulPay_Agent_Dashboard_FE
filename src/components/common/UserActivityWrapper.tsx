import { ReactNode } from "react";
import { useUserActivityTokenRefresh } from "../../hooks/useUserActivityTokenRefresh";

interface UserActivityWrapperProps {
  children: ReactNode;
}

export const UserActivityWrapper: React.FC<UserActivityWrapperProps> = ({
  children,
}) => {
  // This hook will automatically track user activity and refresh tokens
  useUserActivityTokenRefresh();

  return <>{children}</>;
};
