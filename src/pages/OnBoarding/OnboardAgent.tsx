import OnboardAgentForm from "../../components/auth/OnboardAgentForm";
import RegisterAgentForm from "../../components/auth/RegisterAgentForm";
import PageMeta from "../../components/common/PageMeta";
import { SidebarProvider } from "../../context/SidebarContext";
import AppHeader from "../../layout/AppHeader";
import AuthLayout from "../AuthPages/AuthPageLayout";

const OnboardAgent = () => {
  return (
    <>
      <SidebarProvider>
        <PageMeta
          title="SafulPay Agency Dashboard | Finance just got better"
          description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
        />
        <AppHeader />
        <OnboardAgentForm />
        {/* <AuthLayout>
          <RegisterAgentForm />
        </AuthLayout> */}
      </SidebarProvider>
    </>
  );
};

export default OnboardAgent;
