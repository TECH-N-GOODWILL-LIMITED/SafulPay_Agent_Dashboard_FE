import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Alert from "../ui/alert/Alert";

export default function AdminAccountCreationForm() {
  const [showPin, setShowPin] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !accountType || !pin) {
      setError("Please fill phone number, account type, and PIN.");
      return;
    }
    if (!isChecked) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const accountData = { phone, accountType, pin };
      const response = await fetch("/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });
      const data = await response.json();
      // Simulated response
      // const data = { success: true };

      if (data.success) {
        setSuccess(
          "Account created successfully! Redirecting to account list..."
        );
        setTimeout(() => {
          navigate("/dashboard/accounts");
        }, 2000);
      } else {
        setError(data.message || "Error creating account.");
      }
    } catch (err) {
      setError("Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Create Account
            </h1>
          </div>
          <div>
            <form onSubmit={handleCreateAccount}>
              <div className="space-y-5">
                {error && (
                  <Alert
                    variant="error"
                    title="Account Creation Failed"
                    message={error}
                    showLink={false}
                  />
                )}
                {success && (
                  <Alert
                    variant="success"
                    title="Account Created"
                    message={success}
                    showLink={false}
                  />
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Phone Number<span className="text-error-500">*</span>
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
                        setSuccess("");
                      }}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Account Type<span className="text-error-500">*</span>
                    </Label>
                    <select
                      id="account-type"
                      name="account-type"
                      value={accountType}
                      onChange={(e) => {
                        setAccountType(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                    >
                      <option value="" disabled>
                        Select account type
                      </option>
                      <option value="admin">Admin</option>
                      <option value="marketer">Marketer</option>
                      <option value="agent">Agent</option>
                      <option value="rider">Rider</option>
                      <option value="accountant">Accountant</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>
                    PIN<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter PIN"
                      type={showPin ? "text" : "password"}
                      id="pin"
                      name="pin"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        setError("");
                        setSuccess("");
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
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={(checked) => {
                      setIsChecked(checked);
                      setError("");
                      setSuccess("");
                    }}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
