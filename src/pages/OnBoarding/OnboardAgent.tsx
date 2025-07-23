import OnboardAgentForm from "../../components/auth/OnboardAgentForm";
// import OnboardAgentForm from "../../components/auth/OnboardAgentForm.original.tsx";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";

const OnboardAgent = () => {
  return (
    <>
      <PageMeta
        title="Agent & Merchant | SafulPay Agency Dashboard - Finance just got better"
        description="Register an Agent or Merchant - Management system for SafulPay's Agency Platform"
      />
      <GridShape />
      <OnboardAgentForm />
    </>
  );
};

export default OnboardAgent;
