import RegisterAgentForm from "../../components/auth/RegisterAgentForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../AuthPages/AuthPageLayout";

const OnboardAgent = () => {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <AuthLayout>
        <RegisterAgentForm />
      </AuthLayout>
    </>
  );
};

export default OnboardAgent;
