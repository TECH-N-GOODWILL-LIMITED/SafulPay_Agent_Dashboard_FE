import { BrowserRouter as Router, Routes, Route } from "react-router";
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
// import LineChart from "./pages/Charts/LineChart";
// import BarChart from "./pages/Charts/BarChart";
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
import OnboardAgent from "./pages/OnBoarding/OnboardAgent";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Admin Create Account Page */}
            <Route path="/users" element={<Users />} />

            {/* Admin Page */}
            <Route path="/admin" element={<Admin />} />

            {/* Marketers Page */}
            <Route path="/marketers" element={<Marketers />} />

            {/* Agents Page */}
            <Route path="/agents" element={<Agents />} />

            {/* Riders Page */}
            <Route path="/riders" element={<Riders />} />

            {/* Accountants Page */}
            <Route path="/accountants" element={<Accountants />} />

            {/* Recollections Page */}
            <Route path="/recollections" element={<Recollections />} />

            {/* FIX THE COMPONENTS */}
            {/* Disbursement Page */}
            <Route path="/disbursement" element={<Disbursement />} />

            {/* Transactions Log Page */}
            <Route path="/transactions" element={<Transactions />} />

            {/* Withdrawals Log Page */}
            <Route path="/withdrawal" element={<Withdrawal />} />

            {/* Deposit Log Page */}
            <Route path="/deposit" element={<Deposit />} />

            {/* Audit Log Page */}
            <Route path="/audit" element={<Audit />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
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

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />

          {/* Agent Onboarding */}
          <Route
            path="/onboardagent/:marketer_ref"
            element={<OnboardAgent />}
          />
        </Routes>
      </Router>
    </>
  );
}
