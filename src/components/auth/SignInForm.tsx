import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { countries } from "../../utils/countries";
import { requestOtp, verifyOtpAndLogin } from "../../utils/api";
import { useAppContext } from "../../context/AppContext";

export default function SignInForm() {
  const [showPin, setShowPin] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setToken } = useAppContext();

  const handlePinChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
    setError("");
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !pin) {
      setError("Please fill phone number and PIN.");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    const selectedCountry = countries.find((c) => phone.startsWith(c.dialCode));
    if (!selectedCountry) {
      setError("Invalid country code.");
      return;
    }

    const digits = phone
      .slice(selectedCountry.dialCode.length)
      .replace(/\D/g, "");
    if (digits.length !== selectedCountry.limitNumber) {
      setError(
        `Invalid phone number for ${selectedCountry.name}. Must be ${selectedCountry.limitNumber} digits.`
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await requestOtp(phone);
      if (response.success && response.data) {
        setOtpId(response.data.otp_id);
        setShowOtpStep(true);
      } else {
        setError(response.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError(`Error requesting OTP. Please try again. - ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!otpId) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await verifyOtpAndLogin(phone, pin, otp, otpId);
      if (response.success && response.data) {
        setToken(response.data.token, isChecked);
        navigate("/dashboard");
      } else {
        setError(response.error || "Invalid OTP.");
      }
    } catch (err) {
      setError(`Error verifying OTP. Please try again. - ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setShowOtpStep(false);
    setOtp("");
    setError("");
    setOtpId(null);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
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
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter phone number"
                    />
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
                        value={pin}
                        onChange={handlePinChange}
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
                  <div className="flex items-center justify-between">
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
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Sending OTP..." : "Sign In"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndLogin}>
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
