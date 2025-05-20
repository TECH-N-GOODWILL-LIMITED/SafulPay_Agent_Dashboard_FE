import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";

export default function ForgotPinForm() {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Please fill phone number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // const response = await fetch("/auth/request-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ phone, pin }),
      // });
      // const data = await response.json();
      // Simulated response
      const data = { success: true, sessionToken: "abc123" };

      if (data.success) {
        setSessionToken(data.sessionToken);
        setShowOtpStep(true);
      } else {
        setError(data.message || "Invalid phone number or PIN.");
      }
    } catch (err) {
      setError("Error requesting OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError("Please enter a valid PIN");
      return;
    }

    if (!confirmPin) {
      setError("Please confirm new PIN.");
      return;
    }

    if (pin !== confirmPin) {
      setError("Please ensure the pin and confirm pin are the same");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, sessionToken }),
      });
      const data = await response.json();
      // Simulated response
      // const data = { success: true, redirectUrl: "/dashboard" };

      if (data.success) {
        if (isChecked) {
          localStorage.setItem("keepLoggedIn", "true");
        }
        navigate(data.redirectUrl || "/dashboard");
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setShowOtpStep(false);
    setOtp("");
    setError("");
    setSessionToken(null);
    navigate("/signin");
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Pin
            </h1>
          </div>
          <div>
            {!showOtpStep ? (
              <form onSubmit={handleResetPin}>
                <div className="space-y-6">
                  {error && (
                    <Alert
                      variant="error"
                      title="Authentication Failed"
                      message={error}
                      showLink={false}
                    />
                  )}
                  <div>
                    <Label>
                      Phone Number <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter phone number (e.g., +1234567890)"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError("");
                      }}
                    />
                  </div>

                  {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        Keep me logged in
                      </span>
                    </div>
                    <Link
                      to="/reset-pin"
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Forgot PIN?
                    </Link>
                  </div> */}
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Requesting OTP..." : "Request OTP"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-6">
                  {error && (
                    <Alert
                      variant="error"
                      title="OTP Verification Failed"
                      message={error}
                      showLink={false}
                    />
                  )}
                  <div>
                    <Label>
                      PIN <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPin ? "text" : "password"}
                        id="pin"
                        name="pin"
                        placeholder="Create new PIN"
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value);
                          setError("");
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
                    </div>
                  </div>
                  <div>
                    <Label>
                      Confirm PIN <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPin ? "text" : "password"}
                        id="confirmPin"
                        name="confirmPin"
                        placeholder="Confirm new PIN"
                        value={confirmPin}
                        onChange={(e) => {
                          setConfirmPin(e.target.value);
                          setError("");
                        }}
                      />
                      <span
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmPin ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
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
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        Keep me logged in
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleBackToSignIn}
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Back to Sign In
                    </button>
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Verifying..." : "Verify OTP"}
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
