import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Suspense } from "react";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Unauthorized from "./pages/OtherPage/Unauthorized";
import { ADMIN_ROLE, MARKETER_ROLE, ACCOUNTANT_ROLE } from "./utils/roles";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Users from "./pages/Users/Users";
import Recollections from "./pages/Recollections/Recollections";
import Marketers from "./pages/Marketers/Marketers";
import Riders from "./pages/Riders/Riders";
import Agents from "./pages/Agents/Agents";
import Accountants from "./pages/Accountants/Accountants";
import Transactions from "./pages/Transactions/Transactions";
import ForgotPin from "./pages/AuthPages/ForgotPin";
import Admin from "./pages/Admin/Admin";
import Disbursement from "./pages/Disbursement.tsx/Disbursement";
import Audit from "./pages/Audit/Audit";
import Withdrawal from "./pages/Withdrawal/Withdrawal";
import Deposit from "./pages/Deposit/Deposit";
import EditAgent from "./pages/Agents/EditAgent";
import MarketersLeaderboard from "./pages/MarketersLeaderboard/MarketersLeaderboard";
import MyAgents from "./pages/Agents/MyAgents";
import OnboardAgentForm from "./components/auth/OnboardAgentForm";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Suspense
          fallback={
            <div>
              <h1>I love bread</h1>
              Loading...
            </div>
          }
        >
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              {/* Agents Page */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[MARKETER_ROLE, ACCOUNTANT_ROLE, ADMIN_ROLE]}
                  />
                }
              >
                <Route index path="/" element={<Home />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/profile" element={<UserProfiles />} />
              </Route>

              {/* Admin, All Users Create Account Page */}
              <Route element={<ProtectedRoute allowedRoles={[ADMIN_ROLE]} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/audit" element={<Audit />} />
              </Route>

              {/* Marketers Page */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={[MARKETER_ROLE, ADMIN_ROLE]} />
                }
              >
                {/* <Route element={<MarketersLayout />}> */}
                <Route path="/marketers" element={<Marketers />} />
                <Route path="/editagent/:id" element={<EditAgent />} />
                {/* </Route> */}
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
                  <ProtectedRoute allowedRoles={[MARKETER_ROLE, ADMIN_ROLE]} />
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
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgotpin" element={<ForgotPin />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}
