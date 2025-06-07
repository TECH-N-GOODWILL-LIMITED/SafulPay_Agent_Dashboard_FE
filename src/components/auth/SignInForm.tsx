// import { useEffect, useRef, useState } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";

import { filterPhoneNumber } from "../../utils/utils";
// import { countries } from "../../utils/countries";
// import type { countryType } from "../../types/types";
import { useAuth } from "../../context/AuthContext";
import { requestOtp, verifyOtpAndLogin } from "../../utils/api";

export default function SignInForm() {
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showOtpStep, setShowOtpStep] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState("");
  const [warnError, setWarnError] = useState<React.ReactNode | string>(null);
  const [successAlert, setSuccessAlert] = useState<string>("");
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !pin) {
      setAlertTitle("Please fill in your Phone number and PIN.");
      setWarnError(" ");
      return;
    }

    const phoneNumber = filterPhoneNumber(phone);
    if (phoneNumber.length !== 11) {
      setAlertTitle("Invalid Phone Number Format");
      setWarnError(" ");
      return;
    }

    setError("");
    setWarnError("");
    setSuccessAlert("");
    setLoading(true);
    setPhone(phoneNumber);

    // Call your API function instead of fetch
    const response = await requestOtp(phoneNumber);

    if (response.success && response.data) {
      setShowOtpStep(true);
      setSessionToken(response.data.otp_id);
      setAlertTitle("OTP Sent");
      setSuccessAlert(response.data.message || "OTP sent successfully");
    } else {
      setAlertTitle("Authentication Failed");
      setError(response.error || "Invalid phone number or PIN combination.");
      setSuccessAlert("");
    }

    setLoading(false);
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setSuccessAlert("");
      setAlertTitle("Please enter a valid OTP.");
      setError("Check your phone for OTP");
      return;
    }

    setError("");
    setWarnError("");
    setSuccessAlert("");
    setLoading(true);

    const response = await verifyOtpAndLogin(phone, pin, otp, sessionToken);

    if (response.success && response.data) {
      // Save user and token in context
      login(response.data, response.success);
      // Navigate to home or dashboard
      navigate("/");
    } else {
      setAlertTitle("OTP Verification Failed");
      setError(response.error || "Error verifying OTP");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-2 justify-center flex-1 w-full max-w-md mx-auto">
        {successAlert && (
          <Alert
            variant="success"
            title={alertTitle}
            message={successAlert}
            showLink={false}
          />
        )}
        {warnError && (
          <Alert variant="warning" title={alertTitle} showLink={false}>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Phone number must be a Sierra Leone line</p>
              <p>Ensure to type number in this format.</p>
              <ul className="list-disc mt-2 ml-4">
                <li>30249005</li>
                <li>030249005</li>
                <li>23230249005</li>
              </ul>
            </div>
          </Alert>
        )}

        {error && (
          <Alert
            variant="error"
            title={alertTitle}
            message={error}
            showLink={false}
          />
        )}
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
          </div>
          <div>
            {!showOtpStep ? (
              <form onSubmit={handleRequestOtp}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Phone Number <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter phone number (e.g., 23298765432)"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError("");
                        setWarnError("");
                        setSuccessAlert("");
                      }}
                    />

                    {/* <PhoneInput
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(value) => {
                        setPhone(value);
                        setError("");
                      }}
                      placeholder="Enter phone number"
                    /> */}
                  </div>
                  <div>
                    <Label>
                      PIN <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPin ? "text" : "password"}
                        id="pin"
                        name="pin"
                        placeholder="Enter your PIN"
                        max={6}
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value);
                          setError("");
                          setWarnError("");
                          setSuccessAlert("");
                        }}
                      />
                      <span
                        onClick={() => setShowPin(!showPin)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPin ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                      {pin && (
                        <span className="text-[12px] absolute z-30 translate-y-1/2 -bottom-1/2 top-1/2 right-2 text-gray-500">
                          max length 6
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        Keep me logged in
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Sending OTP..." : "Request OTP"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogIn}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      OTP <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="otp"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setError("");
                        setWarnError("");
                        setSuccessAlert("");
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-gray-700 text-theme-sm dark:text-gray-400 hover:text-brand-600"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Verifying..." : "Sign In"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
