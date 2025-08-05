import React, { Component, ReactNode } from "react";
import Button from "../ui/button/Button";
import GridShape from "./GridShape";
import PageMeta from "./PageMeta";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <>
            <PageMeta
              title="SafulPay Agency Dashboard | Finance just got better"
              description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
            />
            <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
              <GridShape />
              <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
                <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
                  ERROR
                </h1>

                <img
                  src="/images/error/503.svg"
                  alt="404"
                  className="dark:hidden"
                />
                <img
                  src="/images/error/503-dark.svg"
                  alt="404"
                  className="hidden dark:block"
                />

                <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
                  We're sorry, but something went wrong while loading this page.
                </p>

                <Button
                  onClick={() => window.location.reload()}
                  // className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  Reload Page
                </Button>
              </div>
              {/* <!-- Footer --> */}
              <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
                &copy; {new Date().getFullYear()} - SafulPay
              </p>
            </div>
          </>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
