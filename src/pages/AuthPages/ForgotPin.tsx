import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ForgotPinForm from "../../components/auth/ForgotPinForm";

export default function ForgotPin() {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <AuthLayout>
        <ForgotPinForm />
      </AuthLayout>
    </>
  );
}
