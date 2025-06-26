import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import DefaultInputs from "../../components/form/form-elements/DefaultInputs";
// import InputGroup from "../../components/form/form-elements/InputGroup";
// import DropzoneComponent from "../../components/form/form-elements/DropZone";
// import CheckboxComponents from "../../components/form/form-elements/CheckboxComponents";
// import RadioButtons from "../../components/form/form-elements/RadioButtons";
// import ToggleSwitch from "../../components/form/form-elements/ToggleSwitch";
// import FileInputExample from "../../components/form/form-elements/FileInputExample";
// import SelectInputs from "../../components/form/form-elements/SelectInputs";
// import TextAreaInput from "../../components/form/form-elements/TextAreaInput";
// import InputStates from "../../components/form/form-elements/InputStates";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import { useDropzone } from "react-dropzone";
import Label from "../form/Label";
import FileInput from "../form/input/FileInput";
import Input from "../form/input/InputField";
import { useState } from "react";
import { useAllUsers } from "../../context/UsersContext";
import { useAuth } from "../../context/AuthContext";
import { addAgent, uploadToCloudinary } from "../../utils/api";
import { filterPhoneNumber } from "../../utils/utils";
import Radio from "../form/input/Radio";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDownIcon, EnvelopeIcon, UserIcon } from "../../icons";
import Alert from "../ui/alert/Alert";
import Button from "../ui/button/Button";

export default function OnboardAgentForm() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [agentType, setAgentType] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [idType, setIdType] = useState<string>("");
  const [businessAddress, setBusinessAddress] = useState<string>("");
  const [referralCode, setReferralCode] = useState<string>("");
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idImageUrl, setIdImageUrl] = useState<string>("");
  const [businessDocument, setBusinessDocument] = useState<File | null>(null);
  const [businessDocumentUrl, setBusinessDocumentUrl] = useState<string>("");
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [businessImageUrl, setBusinessImageUrl] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  // const [thresholdWalletBalance, setThresholdWalletBalance] = useState<string>("");
  // const [thresholdCashInHand, setThresholdCashInHand] = useState<string>("");
  // const [residualAmount, setResidualAmount] = useState<string>("");
  // const [status, setStatus] = useState<string>("");
  // const [marketerId, setMarketerId] = useState<string>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [warnError, setWarnError] = useState<boolean>(false);
  const [successAlert, setSuccessAlert] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  // const [isIdTypeDropdownOpen, setIsIdTypeDropdownOpen] = useState(false);
  // const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const { token } = useAuth();
  const { fetchUsers } = useAllUsers();

  const typeOptions = ["Merchant", "Agent"];
  const modelOptions = ["Target", "Independent"];
  const idTypeOptions = [
    "driver's license",
    "voter id",
    "national id",
    "passport id",
  ];

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "idImage" | "businessImage"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadLoading(true);
      setError("");
      setSuccessAlert("");
      const result = await uploadToCloudinary(
        file,
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        "agent_uploads_unsigned"
      );
      setUploadLoading(false);
      if (result.success) {
        if (type === "idImage") {
          setIdImage(file);
          setIdImageUrl(result.url);
        } else {
          setBusinessImage(file);
          setBusinessImageUrl(result.url);
        }
        setSuccessAlert("File uploaded successfully!");
      } else {
        setAlertTitle("Upload Failed");
        if (result.error.includes("Upload preset not found")) {
          setError(
            "Cloudinary upload preset 'agent_uploads_unsigned' not found. Please create it in your Cloudinary dashboard."
          );
        } else {
          setError(result.error || "Failed to upload file to Cloudinary");
        }
      }
    }
  };

  const onDrop = async (
    acceptedFiles: File[],
    type: "idImage" | "businessDocument"
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadLoading(true);
      setError("");
      setSuccessAlert("");
      const result = await uploadToCloudinary(
        file,
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        "agent_uploads_unsigned"
      );
      setUploadLoading(false);
      if (result.success) {
        if (type === "idImage") {
          setIdImage(file);
          setIdImageUrl(result.url);
        } else {
          setBusinessDocument(file);
          setBusinessDocumentUrl(result.url);
        }
        setSuccessAlert("File uploaded successfully!");
      } else {
        setAlertTitle("Upload Failed");
        if (result.error.includes("Upload preset not found")) {
          setError(
            "Cloudinary upload preset 'agent_uploads_unsigned' not found. Please create it in your Cloudinary dashboard."
          );
        } else {
          setError(result.error || "Failed to upload file to Cloudinary");
        }
      }
    }
  };

  const {
    getRootProps: getIdImageRootProps,
    getInputProps: getIdImageInputProps,
    isDragActive: isIdImageDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, "idImage"),
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const {
    getRootProps: getBusinessDocumentRootProps,
    getInputProps: getBusinessDocumentInputProps,
    isDragActive: isBusinessDocumentDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, "businessDocument"),
    accept: {
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
    setError("");
    setWarnError(false);
    setSuccessAlert("");
  };

  const handleTypeChange = (type: string) => {
    setAgentType(type);
    setIsTypeDropdownOpen(false);
  };

  const handleModelChange = (model: string) => {
    setModel(model);
    setIsModelDropdownOpen(false);
  };

  const handleIdTypeChange = (type: string) => {
    setIdType(type);
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
    setSuccessAlert("");

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
      !phone ||
      !agentType ||
      !model ||
      !idType ||
      !businessAddress ||
      !latitude ||
      !longitude ||
      !idImageUrl ||
      !businessDocumentUrl ||
      !businessImageUrl
      // !thresholdWalletBalance ||
      // !thresholdCashInHand ||
      // !residualAmount ||
      // !status ||
      // !marketerId
    ) {
      setAlertTitle("Fill all required fields");
      setError("Please complete all required fields, including file uploads");
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
    // const walletBalance = parseFloat(thresholdWalletBalance);
    // const cashInHand = parseFloat(thresholdCashInHand);
    // const residual = parseFloat(residualAmount);
    // const statusNum = parseInt(status);
    // const marketer = parseInt(marketerId);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
      // isNaN(walletBalance) ||
      // isNaN(cashInHand) ||
      // isNaN(residual) ||
      // isNaN(statusNum) ||
      // isNaN(marketer)
    ) {
      setAlertTitle("Invalid Input Values");
      setError(
        "Ensure latitude (-90 to 90) and longitude (-180 to 180) are valid numbers"
      );
      return;
    }

    setLoading(true);
    setError("");
    setWarnError(false);
    setSuccessAlert("");

    const formData = new FormData();
    formData.append("firstname", firstName);
    formData.append("lastname", lastName);
    formData.append("username", userName);
    formData.append("business_name", businessName);
    formData.append("phone", phoneNumber);
    formData.append("agencytype", agentType);
    formData.append("model", model);
    if (email) formData.append("email", email);
    formData.append("id_type", idType);
    formData.append("address", businessAddress);
    formData.append("idImage", idImageUrl);
    formData.append("business_document", businessDocumentUrl);
    formData.append("business_image", businessImageUrl);
    if (referralCode) formData.append("referral_code", referralCode);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    // formData.append("threshold_wallet_balance", thresholdWalletBalance);
    // formData.append("threshold_cash_in_hand", thresholdCashInHand);
    // formData.append("residual_amount", residualAmount);
    // formData.append("status", status);
    // formData.append("marketer_id", marketerId);

    const response = await addAgent(token, formData);

    if (response.success && response.data) {
      await fetchUsers();
      setAlertTitle("Success");
      setSuccessAlert("Agent registered successfully!");
    } else {
      setAlertTitle("Registration Failed");
      setError(response.error || "Agent registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Register Agent & Merchant" />
      {successAlert && (
        <Alert
          variant="success"
          title={alertTitle}
          message={successAlert}
          showLink={false}
        />
      )}
      <form
        onSubmit={handleRegister}
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        <div className="space-y-6">
          <ComponentCard title="Personal Info">
            {error && (
              <Alert
                variant="error"
                title={alertTitle}
                message={error}
                showLink={false}
              />
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="input">
                  First Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
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
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => handleInputChange(e, setLastName)}
                  error={!!error && !lastName}
                />
              </div>
              <div>
                <Label>
                  Username <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="userName"
                  name="username"
                  placeholder="Enter username"
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
                  placeholder="Enter business name"
                  value={businessName}
                  onChange={(e) => handleInputChange(e, setBusinessName)}
                  error={!!error && !businessName}
                />
              </div>

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
              <div>
                <Label>
                  Phone <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="example (76 123 456)"
                  value={phone}
                  onChange={(e) => handleInputChange(e, setPhone)}
                  error={warnError || (!!error && !phone)}
                  selectedCountries={["SL"]}
                />
              </div>

              <div>
                <Label>Email (Optional)</Label>
                <div className="relative">
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => handleInputChange(e, setEmail)}
                    className="pl-[62px]"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
                    <EnvelopeIcon className="size-6" />
                  </span>
                </div>
              </div>

              <div className="relative">
                <Label>
                  Agency Type <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent border-gray-300 shadow-theme-xs flex items-center justify-between cursor-pointer dark:border-gray-700 dark:text-white/90 ${
                    !!error && !agentType
                      ? "border-error-500"
                      : "focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                  }`}
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  <span>{agentType || "Select Type"}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                </div>
                <Dropdown
                  isOpen={isTypeDropdownOpen}
                  onClose={() => setIsTypeDropdownOpen(false)}
                  className="w-full p-2"
                  search={false}
                >
                  {typeOptions.map((option) => (
                    <DropdownItem
                      key={option}
                      onClick={() => handleTypeChange(option)}
                      className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                      {option}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
              {agentType === "Agent" && (
                <div className="relative">
                  <Label>
                    Agency Model <span className="text-error-500">*</span>
                  </Label>
                  <div
                    className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent border-gray-300 shadow-theme-xs flex items-center justify-between cursor-pointer dark:border-gray-700 dark:text-white/90 ${
                      !!error && !model
                        ? "border-error-500"
                        : "focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                    }`}
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  >
                    <span>{model || "Select Type"}</span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                  </div>
                  <Dropdown
                    isOpen={isModelDropdownOpen}
                    onClose={() => setIsModelDropdownOpen(false)}
                    className="w-full p-2"
                    search={false}
                  >
                    {modelOptions.map((option) => (
                      <DropdownItem
                        key={option}
                        onClick={() => handleModelChange(option)}
                        className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      >
                        {option}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </div>
              )}

              <div className="col-span-2">
                <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
                  Location
                </h4>
              </div>
              <div className="col-span-2">
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
                <Label>Region (Optional)</Label>
                <Input type="text" id="region" name="region" value=" " />
              </div>

              <div>
                <Label>District (Optional)</Label>
                <Input type="text" id="district" name="district" value=" " />
              </div>

              <div className="col-span-2 flex gap-4 items-end">
                <div className="grow" title="click the ☉ icon to get location">
                  <Label>
                    Longitude <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="longitude"
                    name="longitude"
                    value={!geoLoading ? longitude : "Fetching Location..."}
                    onChange={(e) => handleInputChange(e, setLongitude)}
                    disabled={geoLoading}
                    error={!!error && !longitude}
                  />
                </div>

                <div className="grow" title="click the ☉ icon to get location">
                  <Label>
                    Latitude <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="latitude"
                    name="latitude"
                    value={!geoLoading ? latitude : "Fetching Location..."}
                    onChange={(e) => handleInputChange(e, setLatitude)}
                    disabled={geoLoading}
                    error={!!error && !latitude}
                  />
                </div>

                <Button
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                >
                  <span title="Get location">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18"
                      width="18"
                      viewBox="0 0 512 512"
                      className="z-9999 cursor-pointer"
                    >
                      <path
                        fill="white"
                        d="M256 0c17.7 0 32 14.3 32 32l0 34.7C368.4 80.1 431.9 143.6 445.3 224l34.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-34.7 0C431.9 368.4 368.4 431.9 288 445.3l0 34.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.7C143.6 431.9 80.1 368.4 66.7 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l34.7 0C80.1 143.6 143.6 80.1 224 66.7L224 32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"
                      />
                    </svg>
                  </span>
                </Button>
              </div>

              <div className="col-span-2">
                <Label>
                  Upload Business Image{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <div className="relative h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90">
                  <FileInput
                    onChange={(e) => handleFileChange(e, "businessImage")}
                    // disabled={uploadLoading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="truncate">
                    {businessImage
                      ? businessImage.name
                      : uploadLoading
                      ? "Uploading..."
                      : "Upload Business Image"}
                  </span>
                </div>
                {businessImageUrl && (
                  <div className="mt-2">
                    <img
                      src={businessImageUrl}
                      alt="Business Image Preview"
                      className="rounded-lg w-24 h-24 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </ComponentCard>
        </div>
        <div className="space-y-6">
          <ComponentCard title="Dropzone">
            <div className="flex items-center gap-3 col-span-full">
              <Label>
                ID Type <span className="text-error-500">*</span>
              </Label>

              {idTypeOptions.map((option) => (
                <Radio
                  key={option}
                  id={option}
                  name={option}
                  value={option}
                  checked={idType === option}
                  onChange={() => handleIdTypeChange(option)}
                  label={option}
                />
              ))}
            </div>

            <div>
              <Label>
                Upload ID Document <span className="text-error-500">*</span>
              </Label>
              <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
                <form
                  {...getIdImageRootProps()}
                  className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${
                      isIdImageDragActive
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    } ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  id="id-image-upload"
                >
                  <input {...getIdImageInputProps()} disabled={uploadLoading} />
                  <div className="dz-message flex flex-col items-center m-0!">
                    <div className="mb-[22px] flex justify-center">
                      <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        <svg
                          className="fill-current"
                          width="29"
                          height="28"
                          viewBox="0 0 29 28"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                      {isIdImageDragActive
                        ? "Drop Files Here"
                        : "Drag & Drop Files Here"}
                    </h4>
                    <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                      Drag and drop your PNG, JPG, WebP, SVG images here or
                      browse
                    </span>
                    <span className="font-medium underline text-theme-sm text-brand-500">
                      {idImage
                        ? idImage.name
                        : uploadLoading
                        ? "Uploading..."
                        : "Browse File"}
                    </span>
                  </div>
                </form>
              </div>
              {idImageUrl && (
                <div className="mt-2">
                  <img
                    src={idImageUrl}
                    alt="ID Image Preview"
                    className="rounded-lg w-24 h-24 object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>
                Upload Business Document{" "}
                <span className="text-error-500">*</span>
              </Label>
              <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
                <form
                  {...getBusinessDocumentRootProps()}
                  className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${
                      isBusinessDocumentDragActive
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    } ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  id="business-document-upload"
                >
                  <input
                    {...getBusinessDocumentInputProps()}
                    disabled={uploadLoading}
                  />
                  <div className="dz-message flex flex-col items-center m-0!">
                    <div className="mb-[22px] flex justify-center">
                      <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        <svg
                          className="fill-current"
                          width="29"
                          height="28"
                          viewBox="0 0 29 28"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                      {isBusinessDocumentDragActive
                        ? "Drop Files Here"
                        : "Drag & Drop Files Here"}
                    </h4>
                    <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                      Drag and drop your PDF, DOC, DOCX files here or browse
                    </span>
                    <span className="font-medium underline text-theme-sm text-brand-500">
                      {businessDocument
                        ? businessDocument.name
                        : uploadLoading
                        ? "Uploading..."
                        : "Browse File"}
                    </span>
                  </div>
                </form>
              </div>
              {businessDocumentUrl && (
                <div className="mt-2">
                  <a
                    href={businessDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    View Uploaded Document
                  </a>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
                Marketer Info
              </h4>
            </div>

            <div className="col-span-2">
              <Label>Referral Code (Optional)</Label>
              <Input
                type="text"
                id="referralCode"
                name="referral_code"
                value={referralCode}
                onChange={(e) => handleInputChange(e, setReferralCode)}
              />
            </div>

            <div className="col-span-2">
              <Button
                className="w-full"
                size="sm"
                disabled={loading || uploadLoading}
                endIcon={<UserIcon fontSize={18} />}
              >
                {loading
                  ? "Registering..."
                  : `Register ${!agentType ? "Agent" : agentType}`}
              </Button>
            </div>
          </ComponentCard>
        </div>

        {/* <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div>
        <div className="space-y-6">
          <InputGroup />
          <FileInputExample />
          <CheckboxComponents />
          <RadioButtons />
          <ToggleSwitch />
          <DropzoneComponent />
        </div> */}
      </form>
    </div>
  );
}
