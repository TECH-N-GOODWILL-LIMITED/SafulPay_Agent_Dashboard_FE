import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Suspense, lazy } from "react";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Unauthorized from "./pages/OtherPage/Unauthorized";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import LoadingSpinner from "./components/common/LoadingSpinner";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import { ADMIN_ROLE, MARKETER_ROLE, ACCOUNTANT_ROLE } from "./utils/roles";
// import { useVendors } from "./hooks/useVendors";

const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const Blank = lazy(() => import("./pages/Blank"));
const Home = lazy(() => import("./pages/Dashboard/Home"));
const Users = lazy(() => import("./pages/Users/Users"));
const Recollections = lazy(() => import("./pages/Recollections/Recollections"));
const Marketers = lazy(() => import("./pages/Marketers/Marketers"));
const Riders = lazy(() => import("./pages/Riders/Riders"));
const Agents = lazy(() => import("./pages/Agents/Agents"));
const Accountants = lazy(() => import("./pages/Accountants/Accountants"));
const Transactions = lazy(() => import("./pages/Transactions/Transactions"));
const Admin = lazy(() => import("./pages/Admin/Admin"));
const Disbursement = lazy(
  () => import("./pages/Disbursement.tsx/Disbursement")
);
const Audit = lazy(() => import("./pages/Audit/Audit"));
const Withdrawal = lazy(() => import("./pages/Withdrawal/Withdrawal"));
const Deposit = lazy(() => import("./pages/Deposit/Deposit"));
const EditAgent = lazy(() => import("./pages/Agents/EditAgent"));
const MarketersLeaderboard = lazy(
  () => import("./pages/MarketersLeaderboard/MarketersLeaderboard")
);
const MyAgents = lazy(() => import("./pages/Agents/MyAgents"));
const OnboardAgentForm = lazy(
  () => import("./components/auth/OnboardAgentForm")
);

// Loading component for Suspense
// const SuspenseLoadingSpinner = () => (
//   <div className="flex items-center justify-center min-h-screen">
//     <div className="flex flex-col items-center space-y-4">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
//       <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
//     </div>
//   </div>
// );

export default function App() {
  // Remove unused token variable
  // const { token } = useAuth();

  // Remove the direct function call and console.log statements
  // The vendors should be fetched in the component that needs them

  // const { vendors } = useVendors();

  // console.log(vendors);

  return (
    <>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
            {/* <Suspense fallback={<SuspenseLoadingSpinner />}> */}
            <Routes>
              {/* Dashboard Layout */}
              <Route element={<AppLayout />}>
                {/* Agents Page */}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        MARKETER_ROLE,
                        ACCOUNTANT_ROLE,
                        ADMIN_ROLE,
                      ]}
                    />
                  }
                >
                  <Route index path="/" element={<Home />} />
                  <Route path="/agents" element={<Agents />} />
                  {/* <Route path="/agents/:params" element={<Agents />} /> */}
                  <Route path="/profile" element={<UserProfiles />} />
                </Route>

                {/* Admin, All Users, Audit Page */}
                <Route element={<ProtectedRoute allowedRoles={[ADMIN_ROLE]} />}>
                  <Route path="/users" element={<Users />} />
                  {/* <Route path="/users/:params" element={<Users />} /> */}
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/audit" element={<Audit />} />
                </Route>

                {/* Marketers Page */}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[MARKETER_ROLE, ADMIN_ROLE]}
                    />
                  }
                >
                  <Route path="/marketers" element={<Marketers />} />
                  <Route path="/editagent/:id" element={<EditAgent />} />
                </Route>

                {/* Accountants, Riders Page and financial pages*/}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[ACCOUNTANT_ROLE, ADMIN_ROLE]}
                    />
                  }
                >
                  <Route path="/accountants" element={<Accountants />} />
                  <Route path="/riders" element={<Riders />} />
                  <Route path="/recollections" element={<Recollections />} />
                  <Route path="/disbursement" element={<Disbursement />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/withdrawal" element={<Withdrawal />} />
                  <Route path="/deposit" element={<Deposit />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[MARKETER_ROLE, ADMIN_ROLE]}
                    />
                  }
                >
                  <Route path="/myagents" element={<MyAgents />} />
                </Route>

                {/* Open pages */}
                <Route
                  path="/onboardagent/:marketer_ref"
                  element={<OnboardAgentForm />}
                />
                <Route
                  path="/marketers-leaderboard"
                  element={<MarketersLeaderboard />}
                />

                {/* Others Page */}
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />

                {/* Forms */}
                <Route path="/form-elements" element={<FormElements />} />

                {/* Tables */}
                <Route path="/basic-tables" element={<BasicTables />} />

                {/* Ui Elements */}
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />

                {/* Charts */}
                {/* <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} /> */}
              </Route>

              {/* Auth Layout */}
              <Route path="/signin" element={<SignIn />} />
              {/* <Route path="/signup" element={<SignUp />} /> */}
              {/* <Route path="/forgotpin" element={<ForgotPin />} /> */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </>
  );
}
