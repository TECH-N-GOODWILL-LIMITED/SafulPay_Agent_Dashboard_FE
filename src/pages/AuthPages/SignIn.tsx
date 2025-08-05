import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="Welcome to SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
