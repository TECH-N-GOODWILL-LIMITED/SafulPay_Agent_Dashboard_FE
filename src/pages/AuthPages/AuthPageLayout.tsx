import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-500 dark:bg-gray-800 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <div className="flex items-center justify-start gap-2">
                <img
                  className=""
                  src="/images/logo/safulpay-icon-lemon.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                />
                <span className="text-3xl font-bold tracking-[-0.9px]  text-[#c3f02c]">
                  SafulPay
                </span>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white dark:text-white/90">
                SafulPay Agency Dashboard
              </h2>
              <p className="text-center text-gray-400 dark:text-white/60">
                Secure Mobile Money Management for Your Business
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
