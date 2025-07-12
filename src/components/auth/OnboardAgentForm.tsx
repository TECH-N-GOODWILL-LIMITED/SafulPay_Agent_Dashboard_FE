import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  addAgent,
  checkUserExist,
  getUserByReferralCode,
  uploadToCloudinary,
} from "../../utils/api";
import { useAllUsers } from "../../context/UsersContext";
import { filterPhoneNumber } from "../../utils/utils";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Alert from "../ui/alert/Alert";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  ChevronDownIcon,
  EnvelopeIcon,
  TrashBinIcon,
  UserIcon,
} from "../../icons";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_ROLE, MARKETER_ROLE } from "../../utils/roles";

const schema = yup.object().shape({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  middleName: yup.string().notRequired(),
  userName: yup
    .string()
    .required("Username is required")
    .max(12, "Username cannot exceed 12 characters"),
  businessName: yup.string().required("Business Name is required"),
  businessPhone: yup.string().required("Business Phone is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().email("Invalid email format").notRequired(),
  agentType: yup.string().required("Agency Type is required"),
  model: yup.string().when("agentType", {
    is: (agentType: string) =>
      agentType === "Agent" || agentType === "Super Agent",
    then: (schema) =>
      schema.required("Agency Model is required for Agent/Super Agent"),
    otherwise: (schema) => schema.notRequired(),
  }),
  idType: yup.string().when("idImageUrl", {
    is: (idImageUrl: string) => !!idImageUrl,
    then: (schema) =>
      schema.required("ID Type is required when ID Image is uploaded"),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessAddress: yup.string().required("Address is required"),
  district: yup.string().required("District is required"),
  region: yup.string().notRequired(),
  latitude: yup
    .number()
    .typeError("Latitude must be a number")
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .required("Latitude is required"),
  longitude: yup
    .number()
    .typeError("Longitude must be a number")
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .required("Longitude is required"),
  idImageUrl: yup.string().notRequired(),
  businessImageUrl: yup.string().required("Business Place Image is required"),
  addressDocumentUrl: yup.string().when("agentType", {
    is: (agentType: string) =>
      agentType === "Merchant" || agentType === "Super Agent",
    then: (schema) =>
      schema.required(
        "Proof of Address Document is required for Merchant/Super Agent"
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessRegDocumentUrl: yup
    .string()
    .required("Business Registration Document is required"),
});

export default function OnboardAgentForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur", // Validate on blur
  });

  const agentType = watch("agentType");
  const idImageUrl = watch("idImageUrl");

  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [warnError, setWarnError] = useState<boolean>(false);
  const [Error, setError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string>("");
  const [userExistError, setUserExistError] = useState<string | null>(null);
  const [showRefErrorAlert, setShowRefErrorAlert] = useState<boolean>(false);
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

  const navigate = useNavigate();

  const { marketer_ref } = useParams<{ marketer_ref: string }>();
  const marketer = marketer_ref && marketer_ref.toString().toUpperCase();

  const { fetchUsers } = useAllUsers();
  const { setOnboardingUser } = useAuth();

  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const validateReferralCode = async () => {
      if (!marketer) {
        setAlertTitle("Error!");
        setRefError("Referral code missing.");
        setRefLoading(false);
        setShowRefErrorAlert(true);
        setTimeout(() => {
          navigate("/unauthorized");
        }, 5000); // 5 seconds delay
        return;
      }

      try {
        const response = await getUserByReferralCode(marketer);
        if (response.success && response.data) {
          const fetchedUser = response.data.user;

          if (
            fetchedUser.role === ADMIN_ROLE ||
            fetchedUser.role === MARKETER_ROLE
          ) {
            setOnboardingUser(fetchedUser);
          } else {
            setAlertTitle("Error!");
            setRefError("Unauthorized role.");
            setShowRefErrorAlert(true);
            setTimeout(() => {
              navigate("/unauthorized");
            }, 5000); // 5 seconds delay
          }
        } else {
          setAlertTitle("Error!");
          setRefError(response.error || "Invalid referral code.");
          setShowRefErrorAlert(true);
          setTimeout(() => {
            navigate("/unauthorized");
          }, 5000); // 5 seconds delay
        }
      } catch (err) {
        setAlertTitle("Error!");
        setRefError(`Error validating referral code: ${err}`);
        setShowRefErrorAlert(true);
        setTimeout(() => {
          navigate("/unauthorized");
        }, 5000); // 5 seconds delay
      } finally {
        setRefLoading(false);
      }
    };

    validateReferralCode();
  }, [marketer, navigate, setOnboardingUser]);

  const typeOptions = ["Merchant", "Agent", "Super Agent"];
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
      setWarnError(false);

      const result = await uploadToCloudinary(
        file,
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        "safulpayAgencyKYC"
      );
      setUploadLoading(false);
      if (result.success) {
        if (type === "idImage") {
          setValue("idImageUrl", result.url);
        }
        if (type === "businessRegDocument") {
          setValue("businessRegDocumentUrl", result.url);
        }
        if (type === "businessImage") {
          setValue("businessImageUrl", result.url);
        }
        if (type === "addressDocument") {
          setValue("addressDocumentUrl", result.url);
        }

        setSuccessAlert("File uploaded successfully!");
      } else {
        if (result.error.includes("Upload preset not found")) {
          setFormError("root.uploadError", {
            type: "manual",
            message:
              "Cloudinary upload preset 'agent_uploads_unsigned' not found. Please create it in your Cloudinary dashboard.",
          });
        } else {
          setFormError("root.uploadError", {
            type: "manual",
            message: result.error || "Failed to upload file to Cloudinary",
          });
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setAlertTitle("Geolocation Not Supported");
      setError("Your browser does not support geolocation.");
      return;
    }

    setGeoLoading(true);
    setAlertTitle("");
    setError("");
    setWarnError(false);
    setSuccessAlert("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);

        setValue("latitude", parseFloat(lat));
        setValue("longitude", parseFloat(lon));
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setFormError("root.geolocationError", {
          type: "manual",
          message: `Geolocation Error: ${err.message}`,
        });
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhoneBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    if (!phoneNumber) {
      setUserExistError(null);
      return;
    }

    try {
      const formattedPhoneNumber = filterPhoneNumber(phoneNumber);
      if (formattedPhoneNumber.length !== 11) {
        setUserExistError(
          "Invalid phone number format. Please use 232XXXXXXXX format."
        );
        return;
      }
      const response = await checkUserExist(formattedPhoneNumber);
      if (response.success) {
        setUserExistError("User already registered on SafulPay.");
      } else {
        setUserExistError(null); // User not found, which is good for onboarding
      }
    } catch (err) {
      setUserExistError("Error checking user existence.");
    }
  };

  const onSubmit = async (data: any, isTemp: number) => {
    setLoading(true);
    setAlertTitle("");
    setError("");
    setWarnError(false);
    setSuccessAlert("");

    const formData = new FormData();
    formData.append("firstname", data.firstName);
    formData.append("lastname", data.lastName);
    if (data.middleName) formData.append("middlename", data.middleName);
    formData.append("username", data.userName);
    formData.append("business_name", data.businessName);
    formData.append("business_phone", data.businessPhone);
    formData.append("phone", data.phone);
    if (data.email) formData.append("email", data.email);
    formData.append("type", data.agentType);
    if (data.model) formData.append("model", data.model);
    formData.append("address", data.businessAddress);
    formData.append("district", data.district);
    if (data.region) formData.append("region", data.region);
    formData.append("latitude", data.latitude);
    formData.append("longitude", data.longitude);
    if (data.businessImageUrl)
      formData.append("business_image", data.businessImageUrl);
    if (data.addressDocumentUrl) {
      formData.append("address_document", data.addressDocumentUrl);
    }
    if (data.businessRegDocumentUrl) {
      formData.append("business_registration", data.businessRegDocumentUrl);
    }
    if (data.idType) formData.append("id_type", data.idType);
    if (data.idImageUrl) formData.append("id_document", data.idImageUrl);
    if (marketer) formData.append("marketer_referralcode", marketer);
    formData.append("temp", isTemp.toString());

    const response = await addAgent(formData);

    if (response.success && response.data) {
      await fetchUsers();
      setAlertTitle("Successful");
      setSuccessAlert(`${data.agentType} registered successfully!`);

      // Reset form fields
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("middleName", "");
      setValue("userName", "");
      setValue("businessName", "");
      setValue("businessPhone", "");
      setValue("phone", "");
      setValue("email", "");
      setValue("agentType", "");
      setValue("model", "");
      setValue("businessAddress", "");
      setValue("district", "");
      setValue("region", "");
      setValue("latitude", 0);
      setValue("longitude", 0);
      setValue("businessImageUrl", "");
      setValue("addressDocumentUrl", "");
      setValue("businessRegDocumentUrl", "");
      setValue("idType", "");
      setValue("idImageUrl", "");
    } else {
      setFormError("root.apiError", {
        type: "manual",
        message: response.error || "Agent registration failed",
      });
    }

    setLoading(false);
  };

  const handleProceedWithoutDocuments = async () => {
    setMissingUrl([]);
    closeModal();
    await onSubmit(watch(), 1);
  };

  if (refLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">
        Validating referral code...
      </div>
    );
  }

  if (showRefErrorAlert && refError)
    return <Alert variant="error" title={alertTitle} message={refError} />;

  return (
    <>
      <PageBreadcrumb pageTitle="Register Agent & Merchant" />

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, 0))}
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl m-4">
          <div className="relative w-full rounded-3xl bg-white  dark:bg-gray-900  max-w-[600px] p-5 lg:p-10">
            <div>
              <div className="text-center">
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
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                  Warning Alert!
                </h4>

                <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {missingUrl.length}{" "}
                  {missingUrl.length > 1 ? "documents" : "document"} (
                  <span className="text-brand-accent">
                    {missingUrl.join(", ")}
                  </span>
                  ) missing.
                </p>

                <p className="mt-5 font-medium text-xl text-gray-800 dark:text-white/9">
                  Do you want to proceed without uploading?
                </p>

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
                  // name="firstName"
                  placeholder="Enter first name"
                  {...register("firstName")}
                  error={!!errors.firstName}
                  hint={errors.firstName?.message}
                />
              </div>

              <div>
                <Label>
                  Last Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  // name="lastName"
                  placeholder="Enter last name"
                  {...register("lastName")}
                  error={!!errors.lastName}
                  hint={errors.lastName?.message}
                />
              </div>

              <div>
                <Label>Middle Name (Optional)</Label>
                <Input
                  type="text"
                  id="middleName"
                  // name="middleName"
                  placeholder="Enter middle name"
                  {...register("middleName")}
                />
              </div>

              <div>
                <Label>
                  Username <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="userName"
                  // name="userName"
                  placeholder="Enter username"
                  {...register("userName")}
                  error={!!errors.userName}
                  hint={errors.userName?.message || "max length 12"}
                />
              </div>

              <div>
                <Label>
                  Business Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="businessName"
                  // name="businessName"
                  placeholder="Enter business name"
                  {...register("businessName")}
                  error={!!errors.businessName}
                  hint={errors.businessName?.message}
                />
              </div>

              <div>
                <Label>
                  Business Phone <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="businessPhone"
                  // name="businessPhone"
                  {...register("businessPhone")}
                  error={!!errors.businessPhone}
                  hint={errors.businessPhone?.message}
                  selectedCountries={["SL"]}
                />
              </div>

              <div>
                <Label>
                  Phone <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  // name="phone"
                  {...register("phone")}
                  onBlur={handlePhoneBlur}
                  error={!!errors.phone || !!userExistError}
                  selectedCountries={["SL"]}
                  hint={errors.phone?.message || userExistError || ""}
                />
              </div>

              <div>
                <Label>Email (Optional)</Label>
                <div className="relative">
                  <Input
                    type="email"
                    id="email"
                    // name="email"
                    placeholder="info@gmail.com"
                    {...register("email")}
                    className="pl-[62px]"
                    error={!!errors.email}
                    hint={errors.email?.message}
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
                    !!errors.agentType
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
                {errors.agentType && (
                  <p className="text-error-500 text-sm mt-1">
                    {errors.agentType.message}
                  </p>
                )}
                <Dropdown
                  isOpen={isTypeDropdownOpen}
                  onClose={() => setIsTypeDropdownOpen(false)}
                  className="w-full p-2"
                  search={false}
                >
                  {typeOptions.map((option) => (
                    <DropdownItem
                      key={option}
                      onItemClick={() => {
                        setValue("agentType", option);
                        setIsTypeDropdownOpen(false);
                      }}
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
                      !!errors.model
                        ? "border-error-500"
                        : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                    }`}
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  >
                    {watch("model") ? (
                      <span> {watch("model")}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-white/30">
                        Select Model
                      </span>
                    )}
                    <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                  </div>
                  {errors.model && (
                    <p className="text-error-500 text-sm mt-1">
                      {errors.model.message}
                    </p>
                  )}
                  <Dropdown
                    isOpen={isModelDropdownOpen}
                    onClose={() => setIsModelDropdownOpen(false)}
                    className="w-full p-2"
                    search={false}
                  >
                    {modelOptions.map((option) => (
                      <DropdownItem
                        key={option}
                        onItemClick={() => {
                          setValue("model", option);
                          setIsModelDropdownOpen(false);
                        }}
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
                  // name="businessAddress"
                  {...register("businessAddress")}
                  error={!!errors.businessAddress}
                  hint={errors.businessAddress?.message}
                />
              </div>

              <div className="relative">
                <Label>
                  District <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                    !!errors.district
                      ? "border-error-500"
                      : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                  }`}
                  onClick={() =>
                    setIsDistrictDropdownOpen(!isDistrictDropdownOpen)
                  }
                >
                  {watch("district") ? (
                    <span> {watch("district")}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-white/30">
                      Select District
                    </span>
                  )}
                  <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                </div>
                {errors.district && (
                  <p className="text-error-500 text-sm mt-1">
                    {errors.district.message}
                  </p>
                )}
                <Dropdown
                  isOpen={isDistrictDropdownOpen}
                  onClose={() => setIsDistrictDropdownOpen(false)}
                  className="w-full p-2 h-50 overflow-y-auto"
                  search={false}
                >
                  {districtOptions.map((option) => (
                    <DropdownItem
                      key={option}
                      onItemClick={() => {
                        setValue("district", option);
                        setIsDistrictDropdownOpen(false);
                      }}
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
                  // name="region"
                  {...register("region")}
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
                    value={
                      !geoLoading ? watch("latitude") : "Fetching Location..."
                    }
                    {...register("latitude")}
                    disabled={geoLoading}
                    error={!!errors.latitude}
                    hint={errors.latitude?.message}
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
                    // name="longitude"
                    value={
                      !geoLoading ? watch("longitude") : "Fetching Location..."
                    }
                    {...register("longitude")}
                    disabled={geoLoading}
                    error={!!errors.longitude}
                    hint={errors.longitude?.message}
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
                    !!errors.businessImageUrl
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
                        watch("businessImageUrl") && "opacity-40"
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
                        Drag and drop your document or image files here or
                        browse
                      </span>
                      <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                        {watch("businessImageUrl")
                          ? watch("businessImageUrl").split("/").pop()
                          : uploadLoading
                          ? "Uploading..."
                          : "Browse File"}
                      </span>
                    </div>
                    {watch("businessImageUrl") && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setValue("businessImageUrl", "");
                          }}
                          className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                          title="delete uploaded file"
                        >
                          <TrashBinIcon color="#e4e7ec" />
                        </button>

                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                          <img
                            src={watch("businessImageUrl")}
                            alt="Uploaded ID Image Preview"
                            className="object-contain h-full mx-auto"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {errors.businessImageUrl && (
                  <p className="text-error-500 text-sm mt-1">
                    {errors.businessImageUrl.message}
                  </p>
                )}
                {watch("businessImageUrl") && (
                  <div className="mt-2">
                    <a
                      href={watch("businessImageUrl")}
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
                    !!errors.addressDocumentUrl
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
                        watch("addressDocumentUrl") && "opacity-40"
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
                        {isAddressDocumentDragActive
                          ? "Drop Files Here"
                          : "Drag & Drop Files Here"}
                      </h4>
                      <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                        Drag and drop your document or image files here or
                        browse
                      </span>
                      <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                        {watch("addressDocumentUrl")
                          ? watch("addressDocumentUrl").split("/").pop()
                          : uploadLoading
                          ? "Uploading..."
                          : "Browse File"}
                      </span>
                    </div>
                    {watch("addressDocumentUrl") && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setValue("addressDocumentUrl", "");
                          }}
                          className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                          title="delete uploaded file"
                        >
                          <TrashBinIcon color="#e4e7ec" />
                        </button>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                          <img
                            src={watch("addressDocumentUrl")}
                            alt="Uploaded ID Image Preview"
                            className="object-contain h-full mx-auto"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {errors.addressDocumentUrl && (
                  <p className="text-error-500 text-sm mt-1">
                    {errors.addressDocumentUrl.message}
                  </p>
                )}
                {watch("addressDocumentUrl") && (
                  <div className="mt-2">
                    <a
                      href={watch("addressDocumentUrl")}
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
                className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                  !!errors.businessRegDocumentUrl
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
                      watch("businessRegDocumentUrl") && "opacity-40"
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
                      {watch("businessRegDocumentUrl")
                        ? watch("businessRegDocumentUrl").split("/").pop()
                        : uploadLoading
                        ? "Uploading..."
                        : "Browse File"}
                    </span>
                  </div>
                  {watch("businessRegDocumentUrl") && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue("businessRegDocumentUrl", "");
                        }}
                        className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                        title="delete uploaded file"
                      >
                        <TrashBinIcon color="#e4e7ec" />
                      </button>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                        <img
                          src={watch("businessRegDocumentUrl")}
                          alt="Document Preview"
                          className="object-cover h-full mx-auto"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {errors.businessRegDocumentUrl && (
                <p className="text-error-500 text-sm mt-1">
                  {errors.businessRegDocumentUrl.message}
                </p>
              )}
              {watch("businessRegDocumentUrl") && (
                <div className="mt-2">
                  <a
                    href={watch("businessRegDocumentUrl")}
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
                  !!errors.idType
                    ? "border-error-500"
                    : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                }`}
                onClick={() => setIsIdTypeDropdownOpen(!isIdTypeDropdownOpen)}
              >
                {watch("idType") ? (
                  <span> {watch("idType")}</span>
                ) : (
                  <span className="text-gray-400 dark:text-white/30">
                    Select ID Type
                  </span>
                )}
                <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
              </div>
              {errors.idType && (
                <p className="text-error-500 text-sm mt-1">
                  {errors.idType.message}
                </p>
              )}
              <Dropdown
                isOpen={isIdTypeDropdownOpen}
                onClose={() => setIsIdTypeDropdownOpen(false)}
                className="w-full p-2"
                search={false}
              >
                {idTypeOptions.map((option) => (
                  <DropdownItem
                    key={option}
                    onItemClick={() => {
                      setValue("idType", option);
                      setIsIdTypeDropdownOpen(false);
                    }}
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
                  !!errors.idImageUrl
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
                      {idImageUrl
                        ? idImageUrl.split("/").pop()
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
                          setValue("idImageUrl", "");
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
              {errors.idImageUrl && (
                <p className="text-error-500 text-sm mt-1">
                  {errors.idImageUrl.message}
                </p>
              )}
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

            {successAlert && (
              <Alert
                variant="success"
                title="Successful"
                message={successAlert}
              />
            )}
            {errors.root?.apiError && (
              <Alert
                variant="error"
                title="Registration Failed"
                message={errors.root.apiError.message}
              />
            )}
            {errors.root?.geolocationError && (
              <Alert
                variant="error"
                title="Geolocation Error"
                message={errors.root.geolocationError.message}
              />
            )}
            {errors.root?.uploadError && (
              <Alert
                variant="error"
                title="Upload Failed"
                message={errors.root.uploadError.message}
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
                  ? "Registering..."
                  : `Register ${!agentType ? "Agent" : agentType}`}
              </Button>
            </div>
          </ComponentCard>
        </div>
      </form>
    </>
  );
}
