import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useDropzone } from "react-dropzone";
import {
  uploadToCloudinary,
  getAgentById,
  updateAgentInfo,
} from "../../utils/api";
import { useAllUsers } from "../../context/UsersContext";

import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import {
  ChevronDownIcon,
  EnvelopeIcon,
  TrashBinIcon,
  UserIcon,
} from "../../icons";
import { useAuth } from "../../context/AuthContext";
import TextArea from "../form/input/TextArea";
import { Agent } from "../../types/types";

export default function EditAgentForm() {
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successAlert, setSuccessAlert] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [middleName, setMiddleName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [businessPhone, setBusinessPhone] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [agentType, setAgentType] = useState<
    "Merchant" | "Super Agent" | "Agent"
  >("");
  const [model, setModel] = useState<string>("");
  const [idType, setIdType] = useState<string>("");
  const [businessAddress, setBusinessAddress] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idImageUrl, setIdImageUrl] = useState<string>("");
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [businessImageUrl, setBusinessImageUrl] = useState<string>("");
  const [addressDocument, setAddressDocument] = useState<File | null>(null);
  const [addressDocumentUrl, setAddressDocumentUrl] = useState<string>("");
  const [businessRegDocument, setBusinessRegDocument] = useState<File | null>(
    null
  );
  const [businessRegDocumentUrl, setBusinessRegDocumentUrl] =
    useState<string>("");
  const [isTemp, setIsTemp] = useState<number>(0);
  const [missingUrl, setMissingUrl] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] =
    useState<boolean>(false);
  const [isIdTypeDropdownOpen, setIsIdTypeDropdownOpen] =
    useState<boolean>(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] =
    useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<string>("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] =
    useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [originalAgentData, setOriginalAgentData] = useState<Agent | null>(
    null
  );

  const { id } = useParams<{ id: string }>(); // Get agent ID from URL
  //   const navigate = useNavigate();
  const { token } = useAuth(); // Get token from AuthContext

  const { isOpen, openModal, closeModal } = useModal();

  const { fetchUsers } = useAllUsers();

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!id || !token) return;
      setLoading(true);
      setError("");
      try {
        const response = await getAgentById(token, id);
        if (response.success && response.data) {
          const agent = response.data.agent;
          setFirstName(agent.firstname || "");
          setMiddleName(agent.middlename || "");
          setLastName(agent.lastname || "");
          setUserName(agent.username || "");
          setBusinessName(agent.business_name || "");
          setBusinessPhone(agent.business_phone || "");
          setPhone(agent.phone || "");
          setEmail(agent.email || "");
          setAgentType(agent.type || "");
          setModel(agent.model || "");
          setIdType(agent.id_type || "");
          setBusinessAddress(agent.address || "");
          setDistrict(agent.district || "");
          setRegion(agent.region || "");
          setLatitude(agent.latitude || "");
          setLongitude(agent.longitude || "");
          setIdImageUrl(agent.id_document || "");
          setBusinessImageUrl(agent.business_image || "");
          setAddressDocumentUrl(agent.address_document || "");
          setBusinessRegDocumentUrl(agent.business_registration || "");
          setAgentStatus(
            statusOptions.find((s) => s.value === agent.status)?.label || ""
          );
          setIsTemp(agent.temp || 0);

          // Store original agent data
          setOriginalAgentData(agent);
        } else {
          setError(response.error || "Failed to fetch agent data");
        }
      } catch (err) {
        setError(`Error fetching agent data: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id, token]);

  const typeOptions = ["Merchant", "Super Agent", "Agent"];
  const modelOptions = ["Target", "Independent"];
  const idTypeOptions = [
    "driver's license",
    "voter id",
    "national id",
    "passport id",
  ];

  const districtOptions = [
    "Kailahun",
    "Kenema",
    "Kono",
    "Bombali",
    "Koinadugu",
    "Tonkolili",
    "Kambia",
    "Karene",
    "Port Loko",
    "Falaba",
    "Bo",
    "Bonthe",
    "Moyamba",
    "Pujehun",
    "Western Area Urban",
    "Western Area Rural",
  ];

  const statusOptions = [
    { label: "Pending", value: 0 },
    { label: "Active", value: 1 },
    { label: "Suspended", value: 2 },
    { label: "Rejected", value: 3 },
  ];

  const onDrop = async (
    acceptedFiles: File[],
    type:
      | "idImage"
      | "businessRegDocument"
      | "businessImage"
      | "addressDocument"
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadLoading(true);
      setAlertTitle("");
      setError("");
      setSuccessAlert("");

      const result = await uploadToCloudinary(
        file,
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        "safulpayAgencyKYC"
      );
      setUploadLoading(false);
      if (result.success) {
        if (type === "idImage") {
          setIdImage(file);
          setIdImageUrl(result.url);
        }
        if (type === "businessRegDocument") {
          setBusinessRegDocument(file);
          setBusinessRegDocumentUrl(result.url);
        }
        if (type === "businessImage") {
          setBusinessImage(file);
          setBusinessImageUrl(result.url);
        }
        if (type === "addressDocument") {
          setAddressDocument(file);
          setAddressDocumentUrl(result.url);
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
    getRootProps: getBusinessImageRootProps,
    getInputProps: getBusinessImageInputProps,
    isDragActive: isBusinessImageDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, "businessImage"),
    accept: {
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
    },
  });

  const {
    getRootProps: getAddressDocumentRootProps,
    getInputProps: getAddressDocumentInputProps,
    isDragActive: isAddressDocumentDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, "addressDocument"),
    accept: {
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
    },
  });

  const {
    getRootProps: getIdImageRootProps,
    getInputProps: getIdImageInputProps,
    isDragActive: isIdImageDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, "idImage"),
    accept: {
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
    },
  });

  const {
    getRootProps: getRegDocumentRootProps,
    getInputProps: getRegDocumentInputProps,
    isDragActive: isRegDocumentDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, "businessRegDocument"),
    accept: {
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value.trim());
    setAlertTitle("");
    setError("");
    setSuccessAlert("");
  };

  const handleTypeChange = (type: string) => {
    setAgentType(type);
    setAlertTitle("");
    setError("");
    setSuccessAlert("");
    setIsTypeDropdownOpen(false);
  };

  const handleModelChange = (model: string) => {
    setModel(model);
    setAlertTitle("");
    setError("");
    setSuccessAlert("");
    setIsModelDropdownOpen(false);
  };

  const handleIdTypeChange = (type: string) => {
    setIdType(type);
    setAlertTitle("");
    setError("");
    setSuccessAlert("");
    setIsIdTypeDropdownOpen(false);
  };

  const handleDistrictChange = (district: string) => {
    setDistrict(district);
    setAlertTitle("");
    setError("");
    setSuccessAlert("");
    setIsDistrictDropdownOpen(false);
  };

  const handleStatusChange = (statusLabel: string) => {
    setAgentStatus(statusLabel);
    setIsStatusDropdownOpen(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setAlertTitle("Geolocation Not Supported");
      setError("Your browser does not support geolocation.");
      return;
    }

    setGeoLoading(true);
    setAlertTitle("");
    setError("");
    setSuccessAlert("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);

        setLatitude(lat);
        setLongitude(lon);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setAlertTitle("Geolocation Error");
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setAlertTitle("Error");
            setError("Permission to access location was denied.");
            break;
          case err.POSITION_UNAVAILABLE:
            setAlertTitle("Error");
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setAlertTitle("Error");
            setError("The request to get location timed out.");
            break;
          default:
            setAlertTitle("Error");
            setError("An error occurred while fetching location.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  if (loading) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        Loading agent data...
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertTitle("");
    setError("");
    setSuccessAlert("");

    // Check for required fields before showing reason input
    if (
      !firstName ||
      !lastName ||
      !userName ||
      !businessName ||
      !businessPhone ||
      !phone ||
      !agentType ||
      ((agentType === "Agent" || agentType === "Super Agent") && !model) ||
      !businessAddress ||
      !district ||
      !latitude ||
      !longitude
    ) {
      setAlertTitle("Fill all required fields");
      setError("Please complete all required fields");
      return;
    }

    if (idImageUrl && !idType) {
      setAlertTitle("Fill all required fields");
      setError("Select ID Type");
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      setAlertTitle("Invalid Input Values");
      setError(
        "Ensure latitude (-90 to 90) and longitude (-180 to 180) are valid numbers"
      );
      return;
    }

    const missingUrls: string[] = [];

    if (!idImageUrl) missingUrls.push("ID document");
    if (!businessRegDocumentUrl)
      missingUrls.push("Business registration document");
    if (!businessImageUrl) missingUrls.push("Business image");
    if (
      (agentType === "Merchant" || agentType === "Super Agent") &&
      !addressDocumentUrl
    ) {
      missingUrls.push("Proof of address document");
    }

    if (missingUrls.length > 0) {
      setMissingUrl(missingUrls);
      setIsTemp(0);
      openModal();
      return;
    }

    // If all checks pass, show the reason input
    setIsTemp(1);
    openModal();
    // setShowReasonInput(true);
  };

  const handleConfirmUpdate = async () => {
    if (reason.length < 4) {
      setError("Reason must be at least 4 characters.");
      return;
    }

    await updateAgentData();
    // setShowReasonInput(false);
    closeModal();
  };

  const updateAgentData = async () => {
    setLoading(true);
    setAlertTitle("");
    setError("");
    setSuccessAlert("");

    // const updatedFields: Record<string, any> = {};

    const updatedFields: Partial<Agent> = {};

    if (originalAgentData?.firstname !== firstName)
      updatedFields.firstname = firstName;
    if (originalAgentData?.middlename !== middleName)
      updatedFields.middlename = middleName;
    if (originalAgentData?.lastname !== lastName)
      updatedFields.lastname = lastName;
    if (originalAgentData?.username !== userName)
      updatedFields.username = userName;
    if (originalAgentData?.business_name !== businessName)
      updatedFields.business_name = businessName;
    if (originalAgentData?.email !== email) updatedFields.email = email;
    if (originalAgentData?.type !== agentType) updatedFields.type = agentType;
    if (originalAgentData?.model !== model) updatedFields.model = model;
    if (originalAgentData?.address !== businessAddress)
      updatedFields.address = businessAddress;
    if (originalAgentData?.district !== district)
      updatedFields.district = district;
    if (originalAgentData?.region !== region) updatedFields.region = region;
    if (originalAgentData?.latitude !== latitude)
      updatedFields.latitude = latitude;
    if (originalAgentData?.longitude !== longitude)
      updatedFields.longitude = longitude;
    if (originalAgentData?.business_image !== businessImageUrl)
      updatedFields.business_image = businessImageUrl;
    if (originalAgentData?.address_document !== addressDocumentUrl)
      updatedFields.address_document = addressDocumentUrl;
    if (originalAgentData?.business_registration !== businessRegDocumentUrl)
      updatedFields.business_registration = businessRegDocumentUrl;
    if (originalAgentData?.id_type !== idType) updatedFields.id_type = idType;
    if (originalAgentData?.id_document !== idImageUrl)
      updatedFields.id_document = idImageUrl;
    if (originalAgentData?.temp !== isTemp) updatedFields.temp = isTemp;

    const newStatusValue = statusOptions.find(
      (s) => s.label === agentStatus
    )?.value;
    if (originalAgentData?.status !== newStatusValue)
      updatedFields.status = newStatusValue;

    // If no fields have changed, don't make the API call
    if (Object.keys(updatedFields).length === 0) {
      setAlertTitle("No Changes");
      setSuccessAlert("No changes detected to update.");
      setLoading(false);
      return;
    }

    const response = await updateAgentInfo(
      token || "",
      id || "",
      updatedFields,
      reason
    );

    if (response.success && response.data) {
      await fetchUsers();
      setAlertTitle("Successful");
      setSuccessAlert(
        `${agentType} ${businessName}'s info updated successfully!`
      );
    } else {
      setAlertTitle("Update Failed");
      setError(response.error || "Agent update failed");
    }

    setLoading(false);
  };

  const handleProceedWithoutDocuments = async () => {
    await updateAgentData();
    setMissingUrl([]);
    closeModal();
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="grid grid-cols-1 gap-6 xl:grid-cols-2"
    >
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl m-4">
        <div className="relative w-full rounded-3xl bg-white  dark:bg-gray-900  max-w-[600px] p-5 lg:p-10">
          <div>
            {isTemp !== 0 ? (
              <div className="text-left">
                <h4 className="mb-8 text-2xl font-semibold text-center text-gray-800 dark:text-white/90 sm:text-title-sm">
                  Confirm to update vendor
                </h4>

                <Label>Reason for updating vendor information</Label>
                <TextArea
                  value={reason}
                  onChange={setReason}
                  placeholder={`Enter reason for updating ${agentType} info...`}
                  rows={4}
                  minLength={4}
                  maxLength={120}
                  error={reason.length < 4 && reason.length > 0}
                  hint={
                    reason.length < 4 && reason.length > 0
                      ? `Reason must be at least 4 characters.`
                      : ""
                  }
                />

                <div className="flex items-center justify-end w-full gap-3 mt-4">
                  <Button variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                  <Button onClick={handleConfirmUpdate} disabled={loading}>
                    {loading ? "Updating..." : "Confirm"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-left">
                <div className="relative flex items-center justify-center z-1 mb-7">
                  <svg
                    className="fill-warning-50 dark:fill-warning-500/15"
                    width={90}
                    height={90}
                    viewBox="0 0 90 90"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                      fill=""
                      fillOpacity=""
                    />
                  </svg>
                  <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                    <svg
                      className="fill-warning-600 dark:fill-orange-400"
                      width={38}
                      height={38}
                      viewBox="0 0 38 38"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z"
                        fill=""
                      />
                    </svg>
                  </span>
                </div>
                <h4 className="mb-2 text-2xl text-center font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                  Warning! Incomplete Documents
                </h4>

                <p className="text-sm text-center leading-6 text-gray-500 dark:text-gray-400">
                  {missingUrl.length}{" "}
                  {missingUrl.length > 1 ? "documents" : "document"} (
                  <span className="text-brand-accent">
                    {missingUrl.join(", ")}
                  </span>
                  ) missing.
                </p>

                <p className="mt-5 font-semibold text-xl">
                  Do you want to proceed without uploading?
                </p>

                <Label>Reason for updating vendor information</Label>
                <TextArea
                  value={reason}
                  onChange={setReason}
                  placeholder={`Enter reason for updating ${agentType} info...`}
                  rows={4}
                  minLength={4}
                  maxLength={120}
                  error={reason.length < 4 && reason.length > 0}
                  hint={
                    reason.length < 4 && reason.length > 0
                      ? `Reason must be at least 4 characters.`
                      : ""
                  }
                />

                <div className="flex items-center justify-center w-full gap-3 mt-8">
                  <Button variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                  <Button
                    onClick={handleProceedWithoutDocuments}
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Proceed"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Business Info">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              <Label>Middle Name (Optional)</Label>
              <Input
                type="text"
                id="middleName"
                name="middeleName"
                placeholder="Enter middle name"
                value={middleName}
                onChange={(e) => handleInputChange(e, setMiddleName)}
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
                max={12}
                onChange={(e) => handleInputChange(e, setUserName)}
                error={!!error && !userName}
                hint="max length 12"
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

            <div>
              <Label>
                Business Phone{" "}
                <span className="text-error-500">(read only)</span>
              </Label>
              <Input
                type="tel"
                id="businessPhone"
                name="businessPhone"
                value={
                  businessPhone.startsWith("232")
                    ? businessPhone.substring(3)
                    : businessPhone
                }
                onChange={(e) => handleInputChange(e, setBusinessPhone)}
                error={!!error && !businessPhone}
                selectedCountries={["SL"]}
                readOnly
              />
            </div>

            <div>
              <Label>
                Phone <span className="text-error-500">(read only)</span>
              </Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={phone.startsWith("232") ? phone.substring(3) : phone}
                onChange={(e) => handleInputChange(e, setPhone)}
                error={!!error && !phone}
                selectedCountries={["SL"]}
                readOnly
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
                className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                  !!error && !agentType
                    ? "border-error-500"
                    : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                }`}
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              >
                {agentType ? (
                  <span> {agentType}</span>
                ) : (
                  <span className="text-gray-400 dark:text-white/30">
                    Select Type
                  </span>
                )}
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
                    onItemClick={() => handleTypeChange(option)}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    {option}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {agentType !== "Merchant" && (
              <div className="relative">
                <Label>
                  Agency Model <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                    !!error && !model
                      ? "border-error-500"
                      : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                  }`}
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                >
                  {model ? (
                    <span> {model}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-white/30">
                      Select Model
                    </span>
                  )}
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
                      onItemClick={() => handleModelChange(option)}
                      className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                      {option}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
            )}

            <div className="col-span-full">
              <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
                Business Location
              </h4>
            </div>

            <div className="col-span-full">
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

            <div className="relative">
              <Label>
                District <span className="text-error-500">*</span>
              </Label>
              <div
                className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                  !!error && !district
                    ? "border-error-500"
                    : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                }`}
                onClick={() =>
                  setIsDistrictDropdownOpen(!isDistrictDropdownOpen)
                }
              >
                {district ? (
                  <span> {district}</span>
                ) : (
                  <span className="text-gray-400 dark:text-white/30">
                    Select District
                  </span>
                )}
                <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
              </div>
              <Dropdown
                isOpen={isDistrictDropdownOpen}
                onClose={() => setIsDistrictDropdownOpen(false)}
                className="w-full p-2 h-50 overflow-y-auto"
                search={false}
              >
                {districtOptions.map((option) => (
                  <DropdownItem
                    key={option}
                    onItemClick={() => handleDistrictChange(option)}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    {option}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            <div>
              <Label>
                Region (Optional)
                {/* <span className="text-error-500">*</span> */}
              </Label>
              <Input
                type="text"
                id="region"
                name="region"
                value={region}
                onChange={(e) => handleInputChange(e, setRegion)}
                //   error={!!error && !region}
              />
            </div>

            <div className="col-span-full flex gap-4 flex-wrap items-end">
              <div className="grow" title="click the ☉ icon to get location">
                <Label>
                  Latitude <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
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

              <div className="grow" title="click the ☉ icon to get location">
                <Label>
                  Longitude <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
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

            <div className={`${agentType === "Agent" && "col-span-full"}`}>
              <Label>
                Upload Business Place Image{" "}
                <span className="text-error-500">*</span>
              </Label>
              <div
                className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                  !!error && !businessImageUrl
                    ? "border-error-500"
                    : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                }`}
              >
                <div
                  {...getBusinessImageRootProps()}
                  className={`dropzone relative rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${
                      isBusinessImageDragActive
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    } ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""} `}
                  id="id-image-upload"
                >
                  <input
                    {...getBusinessImageInputProps()}
                    disabled={uploadLoading}
                  />
                  <div
                    className={`dz-message flex flex-col items-center upload ${
                      businessImageUrl && "opacity-40"
                    }`}
                  >
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
                    <h4 className="mb-3 text-center font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                      {isBusinessImageDragActive
                        ? "Drop Files Here"
                        : "Drag & Drop Files Here"}
                    </h4>
                    <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                      Drag and drop your document or image files here or browse
                    </span>
                    <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                      {originalAgentData?.business_image
                        ? "Change File"
                        : businessImage
                        ? businessImage.name
                        : uploadLoading
                        ? "Uploading..."
                        : "Browse File"}
                    </span>
                  </div>
                  {businessImageUrl && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBusinessImageUrl("");
                          setBusinessImage(null);
                        }}
                        className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                        title="delete uploaded file"
                      >
                        <TrashBinIcon color="#e4e7ec" />
                      </button>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                        <img
                          src={businessImageUrl}
                          alt="Uploaded ID Image Preview"
                          className="object-contain h-full mx-auto"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {businessImageUrl && (
                <div className="mt-2">
                  <a
                    href={businessImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    View Uploaded Document
                  </a>
                </div>
              )}
            </div>

            <div className={`${agentType === "Agent" && "hidden"}`}>
              <Label>
                Upload Proof of Address{" "}
                <span className="text-error-500">*</span>
              </Label>
              <div
                className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                  !!error && !addressDocumentUrl
                    ? "border-error-500"
                    : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                }`}
              >
                <div
                  {...getAddressDocumentRootProps()}
                  className={`dropzone relative rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${
                      isAddressDocumentDragActive
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    } ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""} `}
                  id="id-image-upload"
                >
                  <input
                    {...getAddressDocumentInputProps()}
                    disabled={uploadLoading}
                  />
                  <div
                    className={`dz-message flex flex-col items-center upload ${
                      addressDocumentUrl && "opacity-40"
                    }`}
                  >
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
                      {isAddressDocumentDragActive
                        ? "Drop Files Here"
                        : "Drag & Drop Files Here"}
                    </h4>
                    <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                      Drag and drop your document or image files here or browse
                    </span>
                    <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                      {originalAgentData?.address_document
                        ? "Change File"
                        : addressDocument
                        ? addressDocument.name
                        : uploadLoading
                        ? "Uploading..."
                        : "Browse File"}
                    </span>
                  </div>
                  {addressDocumentUrl && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddressDocumentUrl("");
                          setAddressDocument(null);
                        }}
                        className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                        title="delete uploaded file"
                      >
                        <TrashBinIcon color="#e4e7ec" />
                      </button>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                        <img
                          src={addressDocumentUrl}
                          alt="Uploaded ID Image Preview"
                          className="object-contain h-full mx-auto"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {addressDocumentUrl && (
                <div className="mt-2">
                  <a
                    href={addressDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    View Uploaded Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Business Document">
          <div>
            <Label>
              Upload Business Registration Document{" "}
              <span className="text-error-500">*</span>
            </Label>
            <div
              className={`overflow-hidden transition relative border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                !!error && !businessRegDocumentUrl
                  ? "border-error-500"
                  : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
              }`}
            >
              <div
                {...getRegDocumentRootProps()}
                className={`dropzone relative rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${
                      isRegDocumentDragActive
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    } ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                id="business-document-upload"
              >
                <input
                  {...getRegDocumentInputProps()}
                  disabled={uploadLoading}
                />
                <div
                  className={`dz-message flex flex-col items-center ${
                    businessRegDocumentUrl && "opacity-40"
                  }`}
                >
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
                    {isRegDocumentDragActive
                      ? "Drop Files Here"
                      : "Drag & Drop Files Here"}
                  </h4>
                  <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                    Drag and drop your PDF, DOC, DOCX, PNG, JPEG, WebP files
                    here or browse
                  </span>
                  <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                    {originalAgentData?.business_registration
                      ? "Change File"
                      : businessRegDocument
                      ? businessRegDocument.name
                      : uploadLoading
                      ? "Uploading..."
                      : "Browse File"}
                  </span>
                </div>
                {businessRegDocumentUrl && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBusinessRegDocumentUrl("");
                        setBusinessRegDocument(null);
                      }}
                      className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                      title="delete uploaded file"
                    >
                      <TrashBinIcon color="#e4e7ec" />
                    </button>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                      <img
                        src={businessRegDocumentUrl}
                        alt="Document Preview"
                        className="object-cover h-full mx-auto"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            {businessRegDocumentUrl && (
              <div className="mt-2">
                <a
                  href={businessRegDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500 hover:underline"
                >
                  View Uploaded Document
                </a>
              </div>
            )}
          </div>

          <div className="relative">
            <Label>
              ID Type <span className="text-error-500">*</span>
            </Label>
            <div
              className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                !!error && !idType
                  ? "border-error-500"
                  : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
              }`}
              onClick={() => setIsIdTypeDropdownOpen(!isIdTypeDropdownOpen)}
            >
              {idType ? (
                <span> {idType}</span>
              ) : (
                <span className="text-gray-400 dark:text-white/30">
                  Select ID Type
                </span>
              )}
              <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
            </div>
            <Dropdown
              isOpen={isIdTypeDropdownOpen}
              onClose={() => setIsIdTypeDropdownOpen(false)}
              className="w-full p-2"
              search={false}
            >
              {idTypeOptions.map((option) => (
                <DropdownItem
                  key={option}
                  onItemClick={() => handleIdTypeChange(option)}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {option}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          <div>
            <Label>
              Upload ID Document <span className="text-error-500">*</span>
            </Label>
            <div
              className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                !!error && !idImageUrl
                  ? "border-error-500"
                  : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
              }`}
            >
              <div
                {...getIdImageRootProps()}
                className={`dropzone relative rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${
                      isIdImageDragActive
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    } ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""} `}
                id="id-image-upload"
              >
                <input {...getIdImageInputProps()} disabled={uploadLoading} />
                <div
                  className={`dz-message flex flex-col items-center upload ${
                    idImageUrl && "opacity-40"
                  }`}
                >
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
                    Drag and drop your PDF, DOC, DOCX, PNG, JPEG, WebP files
                    here or browse
                  </span>
                  <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                    {originalAgentData?.id_document
                      ? "Change File"
                      : idImage
                      ? idImage.name
                      : uploadLoading
                      ? "Uploading..."
                      : "Browse File"}
                  </span>
                </div>
                {idImageUrl && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdImageUrl("");
                        setIdImage(null);
                      }}
                      className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                      title="delete uploaded file"
                    >
                      <TrashBinIcon color="#e4e7ec" />
                    </button>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                      <img
                        src={idImageUrl}
                        alt="Uploaded ID Image Preview"
                        className="object-cover h-full mx-auto"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            {idImageUrl && (
              <div className="mt-2">
                <a
                  href={idImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500 hover:underline"
                >
                  View Uploaded Document
                </a>
              </div>
            )}
          </div>

          <div className="relative">
            <Label>
              Update Agent Status <span className="text-error-500">*</span>
            </Label>
            <div
              className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                !!error && !agentStatus
                  ? "border-error-500"
                  : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
              }`}
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              {agentStatus ? (
                <span> {agentStatus}</span>
              ) : (
                <span className="text-gray-400 dark:text-white/30">
                  Select Status
                </span>
              )}
              <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
            </div>
            <Dropdown
              isOpen={isStatusDropdownOpen}
              onClose={() => setIsStatusDropdownOpen(false)}
              className="w-full p-2"
              search={false}
            >
              {statusOptions.map((option) => (
                <DropdownItem
                  key={option.label}
                  onItemClick={() => handleStatusChange(option.label)}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {option.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {error && (
            <Alert
              variant="error"
              title={alertTitle}
              message={error}
              showLink={false}
            />
          )}
          {successAlert && (
            <Alert
              variant="success"
              title={alertTitle}
              message={successAlert}
              showLink={false}
            />
          )}

          <div className="col-span-2">
            <Button
              className="w-full"
              size="sm"
              disabled={loading || uploadLoading}
              endIcon={<UserIcon fontSize={18} />}
            >
              {loading
                ? "Updating..."
                : `Update ${!agentType ? "Agent" : agentType}`}
            </Button>
          </div>
        </ComponentCard>
      </div>
    </form>
  );
}
