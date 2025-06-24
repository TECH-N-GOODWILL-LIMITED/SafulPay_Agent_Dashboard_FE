import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAllUsers } from "../../context/UsersContext";
import { addAgent } from "../../utils/api";
import { filterPhoneNumber } from "../../utils/utils";
import { ChevronDownIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function RegisterAgentForm() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [idType, setIdType] = useState<string>("");
  const [idImage, setIdImage] = useState<File | null>(null);
  const [businessDocument, setBusinessDocument] = useState<File | null>(null);
  const [businessAddress, setBusinessAddress] = useState<string>("");
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [referralCode, setReferralCode] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [thresholdWalletBalance, setThresholdWalletBalance] =
    useState<string>("");
  const [thresholdCashInHand, setThresholdCashInHand] = useState<string>("");
  const [residualAmount, setResidualAmount] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [marketerId, setMarketerId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [warnError, setWarnError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [isIdTypeDropdownOpen, setIsIdTypeDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const { token } = useAuth();
  const { fetchUsers } = useAllUsers();

  const idTypeOptions = [
    "driver's license",
    "voter id",
    "national id",
    "passport id",
  ];
  const modelOptions = ["Target", "Independent"];
  const typeOptions = ["Merchant", "Agent"];
  const statusOptions = [
    { value: "0", label: "Pending" },
    { value: "1", label: "Approved" },
    { value: "2", label: "Suspended" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
    setError("");
    setWarnError(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0] || null;
    setter(file);
    setError("");
    setWarnError(false);
  };

  const handleIdTypeChange = (type: string) => {
    setIdType(type);
    setIsIdTypeDropdownOpen(false);
  };

  const handleModelChange = (model: string) => {
    setModel(model);
    setIsModelDropdownOpen(false);
  };

  const handleTypeChange = (type: string) => {
    setType(type);
    setIsTypeDropdownOpen(false);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setIsStatusDropdownOpen(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setAlertTitle("Geolocation Not Supported");
      setError("Your browser does not support geolocation.");
      return;
    }

    setGeoLoading(true);
    setError("");
    setWarnError(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(8);
        const lon = position.coords.longitude.toFixed(8);
        setLatitude(lat);
        setLongitude(lon);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setAlertTitle("Geolocation Error");
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Permission to access location was denied.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("The request to get location timed out.");
            break;
          default:
            setError("An error occurred while fetching location.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !userName ||
      !businessName ||
      !idType ||
      !idImage ||
      !businessDocument ||
      !businessAddress ||
      !businessImage ||
      !phone ||
      !model ||
      !latitude ||
      !longitude ||
      !thresholdWalletBalance ||
      !thresholdCashInHand ||
      !residualAmount ||
      !status ||
      !marketerId ||
      !type
    ) {
      setAlertTitle("Fill all required fields");
      setError("Please complete all required fields");
      return;
    }

    if (!token) {
      setAlertTitle("Not authenticated");
      setError("Refresh page...");
      return;
    }

    let phoneNumber: string;
    try {
      phoneNumber = filterPhoneNumber(phone);
      if (phoneNumber.length !== 11) {
        setAlertTitle("Invalid Phone Number Format");
        setWarnError(true);
        return;
      }
    } catch (err) {
      setAlertTitle("Invalid Phone Number");
      setError((err as Error).message);
      setWarnError(true);
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const walletBalance = parseFloat(thresholdWalletBalance);
    const cashInHand = parseFloat(thresholdCashInHand);
    const residual = parseFloat(residualAmount);
    const statusNum = parseInt(status);
    const marketer = parseInt(marketerId);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180 ||
      isNaN(walletBalance) ||
      isNaN(cashInHand) ||
      isNaN(residual) ||
      isNaN(statusNum) ||
      isNaN(marketer)
    ) {
      setAlertTitle("Invalid Input Values");
      setError(
        "Ensure latitude (-90 to 90), longitude (-180 to 180), wallet balance, cash in hand, residual amount, status, and marketer ID are valid numbers"
      );
      return;
    }

    setLoading(true);
    setError("");
    setWarnError(false);

    const formData = new FormData();
    formData.append("firstname", firstName);
    formData.append("lastname", lastName);
    formData.append("username", userName);
    formData.append("business_name", businessName);
    formData.append("id_type", idType);
    if (idImage) formData.append("idImage", idImage);
    if (businessDocument)
      formData.append("business_document", businessDocument);
    formData.append("address", businessAddress);
    if (businessImage) formData.append("business_image", businessImage);
    formData.append("phone", phoneNumber);
    formData.append("model", model);
    if (email) formData.append("email", email);
    if (referralCode) formData.append("referral_code", referralCode);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("threshold_wallet_balance", thresholdWalletBalance);
    formData.append("threshold_cash_in_hand", thresholdCashInHand);
    formData.append("residual_amount", residualAmount);
    formData.append("status", status);
    formData.append("marketer_id", marketerId);
    formData.append("type", type);

    const response = await addAgent(token, formData);

    if (response.success && response.data) {
      await fetchUsers();
    } else {
      setAlertTitle("Registration Failed");
      setError(response.error || "Agent registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-2 justify-center flex-1 w-full max-w-md mx-auto">
        {warnError && (
          <Alert variant="warning" title={alertTitle} showLink={false}>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Phone number must be a Sierra Leone line</p>
              <p>Ensure to type number in this format.</p>
              <ul className="list-disc mt-2 ml-4">
                <li>23230249005</li>
                <li>30249005</li>
                <li>030249005</li>
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
              Register Agent
            </h1>
          </div>
          <form onSubmit={handleRegister}>
            <div className="space-y-6">
              <div>
                <Label>
                  First Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => handleInputChange(e, setFirstName)}
                  error={!!error && !firstName}
                />
              </div>
              <div>
                <Label>
                  Last Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => handleInputChange(e, setLastName)}
                  error={!!error && !lastName}
                />
              </div>
              <div>
                <Label>
                  User Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="userName"
                  name="username"
                  value={userName}
                  onChange={(e) => handleInputChange(e, setUserName)}
                  error={!!error && !userName}
                />
              </div>
              <div>
                <Label>
                  Business Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="businessName"
                  name="business_name"
                  value={businessName}
                  onChange={(e) => handleInputChange(e, setBusinessName)}
                  error={!!error && !businessName}
                />
              </div>
              <div className="relative">
                <Label>
                  ID Type <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent border-gray-300 shadow-theme-xs flex items-center justify-between cursor-pointer dark:border-gray-700 dark:text-white/90 ${
                    !!error && !idType
                      ? "border-error-500"
                      : "focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                  }`}
                  onClick={() => setIsIdTypeDropdownOpen(!isIdTypeDropdownOpen)}
                >
                  <span>{idType || "Select ID Type"}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                </div>
                <Dropdown
                  isOpen={isIdTypeDropdownOpen}
                  onClose={() => setIsIdTypeDropdownOpen(false)}
                  className="w-full top-full left-0 mt-1 z-50"
                  search={false}
                >
                  {idTypeOptions.map((type) => (
                    <DropdownItem
                      key={type}
                      onClick={() => handleIdTypeChange(type)}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {type}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
              <div>
                <Label>
                  ID Image <span className="text-error-500">*</span>
                </Label>
                <input
                  type="file"
                  id="idImage"
                  name="idImage"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setIdImage)}
                />
              </div>
              <div>
                <Label>
                  Business Document <span className="text-error-500">*</span>
                </Label>
                <input
                  type="file"
                  id="businessDocument"
                  name="business_document"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, setBusinessDocument)}
                />
              </div>
              <div>
                <Label>
                  Address <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="businessAddress"
                  name="address"
                  value={businessAddress}
                  onChange={(e) => handleInputChange(e, setBusinessAddress)}
                  error={!!error && !businessAddress}
                />
              </div>
              <div>
                <Label>
                  Business Image <span className="text-error-500">*</span>
                </Label>
                <input
                  type="file"
                  id="businessImage"
                  name="business_image"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setBusinessImage)}
                />
              </div>
              <div>
                <Label>
                  Phone <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => handleInputChange(e, setPhone)}
                  error={warnError || (!!error && !phone)}
                  selectedCountries={["SL"]}
                />
              </div>
              <div className="relative">
                <Label>
                  Model <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent border-gray-300 shadow-theme-xs flex items-center justify-between cursor-pointer dark:border-gray-700 dark:text-white/90 ${
                    !!error && !model
                      ? "border-error-500"
                      : "focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                  }`}
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                >
                  <span>{model || "Select Model"}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                </div>
                <Dropdown
                  isOpen={isModelDropdownOpen}
                  onClose={() => setIsModelDropdownOpen(false)}
                  className="w-full top-full left-0 mt-1 z-50"
                  search={false}
                >
                  {modelOptions.map((option) => (
                    <DropdownItem
                      key={option}
                      onClick={() => handleModelChange(option)}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {option}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
              <div>
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail)}
                />
              </div>
              <div>
                <Label>Referral Code (Optional)</Label>
                <Input
                  type="text"
                  id="referralCode"
                  name="referral_code"
                  value={referralCode}
                  onChange={(e) => handleInputChange(e, setReferralCode)}
                />
              </div>
              <div>
                <Label>
                  Latitude <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={latitude}
                  onChange={(e) => handleInputChange(e, setLatitude)}
                  error={!!error && !latitude}
                />
              </div>
              <div>
                <Label>
                  Longitude <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={longitude}
                  onChange={(e) => handleInputChange(e, setLongitude)}
                  error={!!error && !longitude}
                />
              </div>
              <div>
                <Button
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                >
                  {geoLoading ? "Fetching Location..." : "Get Current Location"}
                </Button>
              </div>
              <div>
                <Label>
                  Threshold Wallet Balance{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  id="thresholdWalletBalance"
                  name="threshold_wallet_balance"
                  value={thresholdWalletBalance}
                  onChange={(e) =>
                    handleInputChange(e, setThresholdWalletBalance)
                  }
                  error={!!error && !thresholdWalletBalance}
                />
              </div>
              <div>
                <Label>
                  Threshold Cash In Hand{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  id="thresholdCashInHand"
                  name="threshold_cash_in_hand"
                  value={thresholdCashInHand}
                  onChange={(e) => handleInputChange(e, setThresholdCashInHand)}
                  error={!!error && !thresholdCashInHand}
                />
              </div>
              <div>
                <Label>
                  Residual Amount <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  id="residualAmount"
                  name="residual_amount"
                  value={residualAmount}
                  onChange={(e) => handleInputChange(e, setResidualAmount)}
                  error={!!error && !residualAmount}
                />
              </div>
              <div className="relative">
                <Label>
                  Status <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent border-gray-300 shadow-theme-xs flex items-center justify-between cursor-pointer dark:border-gray-700 dark:text-white/90 ${
                    !!error && !status
                      ? "border-error-500"
                      : "focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                  }`}
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <span>
                    {statusOptions.find((opt) => opt.value === status)?.label ||
                      "Select Status"}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                </div>
                <Dropdown
                  isOpen={isStatusDropdownOpen}
                  onClose={() => setIsStatusDropdownOpen(false)}
                  className="w-full top-full left-0 mt-1 z-50"
                  search={false}
                >
                  {statusOptions.map((option) => (
                    <DropdownItem
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {option.label}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
              <div>
                <Label>
                  Marketer ID <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  id="marketerId"
                  name="marketer_id"
                  value={marketerId}
                  onChange={(e) => handleInputChange(e, setMarketerId)}
                  error={!!error && !marketerId}
                />
              </div>
              <div className="relative">
                <Label>
                  Type <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent border-gray-300 shadow-theme-xs flex items-center justify-between cursor-pointer dark:border-gray-700 dark:text-white/90 ${
                    !!error && !type
                      ? "border-error-500"
                      : "focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                  }`}
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  <span>{type || "Select Type"}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                </div>
                <Dropdown
                  isOpen={isTypeDropdownOpen}
                  onClose={() => setIsTypeDropdownOpen(false)}
                  className="w-full top-full left-0 mt-1 z-50"
                  search={false}
                >
                  {typeOptions.map((option) => (
                    <DropdownItem
                      key={option}
                      onClick={() => handleTypeChange(option)}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {option}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Registering..." : "Register Agent"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
