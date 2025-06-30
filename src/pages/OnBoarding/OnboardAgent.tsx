import OnboardAgentForm from "../../components/auth/OnboardAgentForm";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import { SidebarProvider } from "../../context/SidebarContext";
import AppHeader from "../../layout/AppHeader";

const OnboardAgent = () => {
  return (
    <SidebarProvider>
      <PageMeta
        title="Agent & Merchant | SafulPay Agency Dashboard - Finance just got better"
        description="Register an Agent or Merchant - Management system for SafulPay's Agency Platform"
      />
      <AppHeader />
      <GridShape />
      <OnboardAgentForm />
    </SidebarProvider>
  );
};

export default OnboardAgent;
