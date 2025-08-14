import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDropzone } from "react-dropzone";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useFormPersistence } from "../../hooks/useFormPersistence";
import {
  addAgent,
  // checkUserExist,
  checkPhoneType,
  getUserByReferralCode,
  uploadToCloudinary,
} from "../../utils/api";
import { useUsers } from "../../context/UsersContext";
import { filterPhoneNumber } from "../../utils/utils";
import {
  getCurrentPositionWithFallback,
  getCachedLocation,
  cacheLocation,
} from "../../utils/geolocation";
import PageBreadcrumb from "../common/PageBreadCrumb";
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
  AlertIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  TrashBinIcon,
  UserIcon,
} from "../../icons";
import { useAuth } from "../../context/AuthContext";
import {
  ADMIN_ROLE,
  AGENT_ROLE,
  MARKETER_ROLE,
  MERCHANT_ROLE,
  SUPER_AGENT_ROLE,
} from "../../utils/roles";
import LoadingSpinner from "../common/LoadingSpinner";
import PageMeta from "../common/PageMeta";

const phoneRegExp =
  /^(232|\+232|0)?(25|30|31|32|33|34|40|44|50|55|66|72|73|74|75|76|77|78|79|80|88|90|99)\d{6}$/;

const validationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  middleName: yup.string(),
  userName: yup
    .string()
    .required("Username is required")
    .max(12, "Username cannot exceed 12 characters"),
  businessName: yup.string().required("Business name is required"),
  businessPhone: yup
    .string()
    .required("Business phone is required")
    .matches(phoneRegExp, "Invalid Sierra Leone phone number"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(phoneRegExp, "Invalid Sierra Leone phone number"),
  email: yup.string().email("Invalid email format"),
  agentType: yup.string().required("Agency type is required"),
  model: yup.string().when("agentType", {
    is: (val: string) => val === "Agent" || val === "Super Agent",
    then: (schema) => schema.required("Agency model is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessAddress: yup.string().required("Business address is required"),
  district: yup.string().required("District is required"),
  region: yup.string(),
  latitude: yup.string().required("Latitude is required"),
  longitude: yup.string().required("Longitude is required"),
  idType: yup.string().when("idImageUrl", {
    is: (val: string) => !!val,
    then: (schema) =>
      schema.required("ID Type is required when ID image is uploaded"),
    otherwise: (schema) => schema.notRequired(),
  }),
  idImageUrl: yup.string(),
  businessImageUrl: yup.string(),
  addressDocumentUrl: yup.string(),
  businessRegDocumentUrl: yup.string(),
});

type FormData = yup.InferType<typeof validationSchema>;

export default function OnboardAgentForm() {
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);
  const [geoSuccess, setGeoSuccess] = useState<string[]>([]);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successAlert, setSuccessAlert] = useState<string>("");
  const [userExistError, setUserExistError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [addressDocument, setAddressDocument] = useState<File | null>(null);
  const [businessRegDocument, setBusinessRegDocument] = useState<File | null>(
    null
  );
  const [missingUrl, setMissingUrl] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    reset,
    setError: setFormError,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      userName: "",
      businessName: "",
      businessPhone: "",
      phone: "",
      email: "",
      agentType: "",
      model: "",
      idType: "",
      businessAddress: "",
      district: "",
      region: "",
      latitude: "",
      longitude: "",
      idImageUrl: "",
      businessImageUrl: "",
      addressDocumentUrl: "",
      businessRegDocumentUrl: "",
    },
  });

  // Form persistence
  const watchedValues = watch();
  const { loadSavedData, clearSavedData } = useFormPersistence(watchedValues, {
    storageKey: "onboardAgentForm",
    autoClearTimeout: 30, // 30 minutes
    debounceMs: 500,
  });

  const agentType = watch("agentType");
  const agentModel = watch("model");
  const idImageUrl = watch("idImageUrl");
  const businessImageUrl = watch("businessImageUrl");
  const addressDocumentUrl = watch("addressDocumentUrl");
  const businessRegDocumentUrl = watch("businessRegDocumentUrl");

  const navigate = useNavigate();

  const { marketer_ref } = useParams<{ marketer_ref: string }>();
  const marketer = marketer_ref && marketer_ref.toString().toUpperCase();

  const TargetAgent = agentType === AGENT_ROLE && agentModel === "Target";

  const { fetchUsers } = useUsers();
  const { setOnboardingUser } = useAuth();

  const { isOpen, openModal, closeModal } = useModal();

  const handleDropdownToggle = (dropdownName: string) => {
    if (loading || uploadLoading) return;
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
    // setSuccessAlert("");
  };

  useEffect(() => {
    const validateReferralCode = async () => {
      if (!marketer) {
        setAlertTitle("Error!");
        setRefError("Referral code missing.");
        setRefLoading(false);
        setTimeout(() => {
          navigate("/unauthorized");
        }, 2000);
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
            setRefError("Unauthorized role. \n Redirecting...");
            setTimeout(() => {
              navigate("/unauthorized");
            }, 2000);
          }
        } else {
          setAlertTitle("Error!");
          setRefError(
            response.error
              ? `${response.error}. \n Redirecting...`
              : `Invalid referral code. \n Redirecting...`
          );
          setTimeout(() => {
            navigate("/unauthorized");
          }, 2000);
        }
      } catch (err) {
        setAlertTitle("Error!");
        setRefError(
          `Error validating referral code: ${err}. \n Redirecting...`
        );
        setTimeout(() => {
          navigate("/unauthorized");
        }, 2000);
      } finally {
        setRefLoading(false);
      }
    };

    validateReferralCode();
  }, [marketer, navigate, setOnboardingUser]);

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = loadSavedData();
    if (Object.keys(savedData).length > 0) {
      // Restore saved form data
      Object.entries(savedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          setValue(key as keyof FormData, value, { shouldValidate: false });
        }
      });
    }
  }, []); // Only run once on mount

  const typeOptions = [AGENT_ROLE, SUPER_AGENT_ROLE, MERCHANT_ROLE];
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

  const onDrop = (
    acceptedFiles: File[],
    type:
      | "idImage"
      | "businessRegDocument"
      | "businessImage"
      | "addressDocument"
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "idImage") {
        setIdImage(file);
        setValue("idImageUrl", previewUrl, { shouldValidate: true });
      }
      if (type === "businessRegDocument") {
        setBusinessRegDocument(file);
        setValue("businessRegDocumentUrl", previewUrl, {
          shouldValidate: true,
        });
      }
      if (type === "businessImage") {
        setBusinessImage(file);
        setValue("businessImageUrl", previewUrl, { shouldValidate: true });
      }
      if (type === "addressDocument") {
        setAddressDocument(file);
        setValue("addressDocumentUrl", previewUrl, { shouldValidate: true });
      }
    }
  };

  const {
    getRootProps: getBusinessImageRootProps,
    getInputProps: getBusinessImageInputProps,
    isDragActive: isBusinessImageDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, "businessImage"),
    disabled: loading || uploadLoading,
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
    disabled: loading || uploadLoading,
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
    disabled: loading || uploadLoading,
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
    disabled: loading || uploadLoading,
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

  const handleGetLocation = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setGeoLoading(true);
    setAlertTitle("");
    setError("");
    setGeoSuccess([]);
    try {
      // First check for cached location

      // Try to get fresh location with fallback
      const result = await getCurrentPositionWithFallback();

      if (result.success) {
        // Cache the successful location
        cacheLocation(result.latitude, result.longitude);

        setValue("latitude", result.latitude, { shouldValidate: true });
        setValue("longitude", result.longitude, { shouldValidate: true });

        // Show success message with accuracy info
        if (result.method === "low") {
          setAlertTitle("Location Retrieved (Low Accuracy)");
          setError(
            "Location obtained with lower accuracy. Consider moving to an open area for better precision."
          );
        } else {
          setGeoSuccess([
            "Longitude Retrieved Successfully",
            "Latitude Retrieved Successfully",
          ]);
        }
      } else {
        const cachedLocation = getCachedLocation();
        if (cachedLocation) {
          setAlertTitle("Using Cached Location");
          setError(
            "Using your last known location. Click 'Get GPS Location' for current coordinates."
          );
          setValue("latitude", cachedLocation.latitude, {
            shouldValidate: true,
          });
          setValue("longitude", cachedLocation.longitude, {
            shouldValidate: true,
          });
          setGeoLoading(false);
          return;
        } else {
          setAlertTitle("Geolocation Error");
          setError(result.error || "Failed to get location");
        }
      }
    } catch {
      setAlertTitle("Geolocation Error");
      setError(
        "An unexpected error occurred while getting location. Please try again or enter coordinates manually."
      );
    } finally {
      setGeoLoading(false);
    }
  };

  const handlePhoneBlur = async (
    e: React.FocusEvent<HTMLInputElement>,
    field: "phone" | "businessPhone"
  ) => {
    const phoneNumber = e.target.value;
    if (!phoneNumber) return;

    const isValid = await trigger(field);
    if (!isValid) return;

    const formattedPhoneNumber = filterPhoneNumber(phoneNumber);

    // Check if phone and business phone are the same
    const currentPhone = watch("phone");
    const currentBusinessPhone = watch("businessPhone");

    if (currentPhone && currentBusinessPhone) {
      const formattedCurrentPhone = filterPhoneNumber(currentPhone);
      const formattedCurrentBusinessPhone =
        filterPhoneNumber(currentBusinessPhone);

      if (formattedCurrentPhone === formattedCurrentBusinessPhone) {
        const errorMessage = "Phone and business phone cannot be the same.";
        setFormError("phone", {
          type: "manual",
          message: errorMessage,
        });
        setFormError("businessPhone", {
          type: "manual",
          message: errorMessage,
        });
        setPhoneError(errorMessage);
        return;
      }
    }

    if (field === "phone") {
      const phoneTypeResponse = await checkPhoneType(formattedPhoneNumber);
      if (phoneTypeResponse.success && phoneTypeResponse.data?.type) {
        if (phoneTypeResponse.data.type === "business_phone") {
          const errorMessage =
            "This number is already registered as a business phone.";
          setFormError("phone", {
            type: "manual",
            message: errorMessage,
          });
          setPhoneError(errorMessage);
        }
        return;
      } else {
        setPhoneError(null);
      }
    } else if (field === "businessPhone") {
      const phoneTypeResponse = await checkPhoneType(formattedPhoneNumber);
      if (phoneTypeResponse.success && phoneTypeResponse.data?.type) {
        if (phoneTypeResponse.data.type === "phone") {
          const errorMessage =
            "This number is already registered as a personal phone.";
          setFormError("businessPhone", {
            type: "manual",
            message: errorMessage,
          });
          setPhoneError(errorMessage);
        } else if (phoneTypeResponse.data.type === "business_phone") {
          const errorMessage =
            "This number is already registered as a business phone.";
          setFormError("businessPhone", {
            type: "manual",
            message: errorMessage,
          });
          setPhoneError(errorMessage);
        }
      } else {
        setPhoneError(null);
      }
    }
  };

  const processRegistration = async (data: FormData, tempValue: number) => {
    setLoading(true);
    setUploadLoading(true);
    setAlertTitle("Uploading files...");
    setError("");
    setGeoSuccess([]);
    // setSuccessAlert("");

    try {
      const filesToUpload: {
        key: keyof FormData;
        file: File | null;
      }[] = [
        { key: "idImageUrl", file: idImage },
        { key: "businessImageUrl", file: businessImage },
        { key: "addressDocumentUrl", file: addressDocument },
        { key: "businessRegDocumentUrl", file: businessRegDocument },
      ];

      const updatedData = { ...data };

      // Set registration document URL for Target agents
      if (data.model === "Target") {
        updatedData.businessRegDocumentUrl =
          "https://res.cloudinary.com/safulpaycloud/image/upload/v1753362591/aqruzbsjvigawov2zfbl.jpg";
        setValue("businessRegDocumentUrl", updatedData.businessRegDocumentUrl, {
          shouldValidate: true,
        });
      }

      for (const { key, file } of filesToUpload) {
        if (
          file &&
          !updatedData[key]?.startsWith("https://res.cloudinary.com")
        ) {
          const result = await uploadToCloudinary(
            file,
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            "safulpayAgencyKYC"
          );
          if (result.success) {
            setValue(key, result.url, { shouldValidate: true });
            updatedData[key] = result.url;
            if (key === "idImageUrl") setIdImage(null);
            if (key === "businessImageUrl") setBusinessImage(null);
            if (key === "addressDocumentUrl") setAddressDocument(null);
            if (key === "businessRegDocumentUrl") setBusinessRegDocument(null);
          } else {
            throw new Error(`Failed to upload ${file.name}: ${result.error}`);
          }
        }
      }

      setUploadLoading(false);
      setAlertTitle("Registering agent...");

      const finalData = updatedData;

      const formData = new FormData();
      formData.append("firstname", finalData.firstName);
      formData.append("lastname", finalData.lastName);
      if (finalData.middleName)
        formData.append("middlename", finalData.middleName);
      formData.append("username", finalData.userName);
      formData.append("business_name", finalData.businessName);
      formData.append("business_phone", finalData.businessPhone);
      formData.append("phone", finalData.phone);
      if (finalData.email) formData.append("email", finalData.email);
      formData.append("type", finalData.agentType);
      if (finalData.model) formData.append("model", finalData.model);
      formData.append("address", finalData.businessAddress);
      formData.append("district", finalData.district);
      if (finalData.region) formData.append("region", finalData.region);
      formData.append("latitude", finalData.latitude);
      formData.append("longitude", finalData.longitude);
      if (finalData.businessImageUrl)
        formData.append("business_image", finalData.businessImageUrl);
      if (finalData.addressDocumentUrl)
        formData.append("address_document", finalData.addressDocumentUrl);
      if (finalData.businessRegDocumentUrl)
        formData.append(
          "business_registration",
          finalData.businessRegDocumentUrl
        );
      if (finalData.idType) formData.append("id_type", finalData.idType);
      if (finalData.idImageUrl)
        formData.append("id_document", finalData.idImageUrl);
      if (marketer) formData.append("ref_by", marketer);
      formData.append("temp", tempValue.toString());

      const response = await addAgent(formData);

      if (response.success && response.data) {
        await fetchUsers({
          page: 1,
          per_page: 10,
        });
        setAlertTitle("Registration Successful!");
        setSuccessAlert(
          `You have successfully registered ${finalData.lastName} ${
            finalData.firstName
          } (${finalData.businessName}) as a ${finalData?.model} ${
            finalData.agentType
          }. ${
            tempValue === 1
              ? "All documents have been uploaded."
              : `Kindly follow up with the ${finalData.agentType} to upload the required documents.`
          }`
        );
        reset();
        setIdImage(null);
        setBusinessImage(null);
        setAddressDocument(null);
        setBusinessRegDocument(null);
        setUserExistError(null);
        setPhoneError(null);
        // Clear saved form data on successful submission
        clearSavedData();
        if (!isOpen) {
          openModal();
        }
      } else {
        setAlertTitle("Registration Failed");
        setError(response.error || "Agent registration failed");
        closeModal();
      }
    } catch (err) {
      setAlertTitle("Operation Failed");
      setError((err as Error).message);

      closeModal();
    } finally {
      setLoading(false);
      setUploadLoading(false);

      if (successAlert) {
        setMissingUrl([]);
      }
    }
  };

  const onSubmitHandler = async (data: FormData) => {
    if (!marketer) {
      setAlertTitle("Invalid ID");
      setError("Marketer not found");
      return;
    }

    // Check for phone errors first
    if (phoneError) {
      setAlertTitle("Phone Number Error");
      setError(phoneError);
      return;
    }

    // Check if phone and business phone are the same
    if (data.phone && data.businessPhone) {
      const formattedPhone = filterPhoneNumber(data.phone);
      const formattedBusinessPhone = filterPhoneNumber(data.businessPhone);

      if (formattedPhone === formattedBusinessPhone) {
        setAlertTitle("Phone Number Error");
        setError("Phone and business phone cannot be the same.");
        return;
      }
    }

    const missingFiles: string[] = [];
    if (!data.idImageUrl) missingFiles.push("ID document");
    if (!data.businessImageUrl) missingFiles.push("Business image");
    // Only check for business registration document if it's not a Target agent
    // For Target agents set the URL in processRegistration
    if (!TargetAgent && !data.businessRegDocumentUrl) {
      missingFiles.push("Business registration document");
    }
    if (
      (data.agentType === MERCHANT_ROLE ||
        data.agentType === SUPER_AGENT_ROLE) &&
      !data.addressDocumentUrl
    ) {
      missingFiles.push("Proof of address document");
    }

    if (missingFiles.length > 0) {
      setMissingUrl(missingFiles);
      openModal();
      return;
    }

    await processRegistration(data, 1);
  };

  const handleProceedWithoutDocuments = async () => {
    handleSubmit((data) => processRegistration(data, 0))();
  };

  if (refLoading) {
    return <LoadingSpinner text=" Validating referral code..." />;
  }

  if (refError)
    return <Alert variant="error" title={alertTitle} message={refError} />;

  return (
    <>
      <PageMeta
        title="Agent & Merchant | SafulPay Agency Dashboard - Finance just got better"
        description="Register an Agent or Merchant - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Register Agent & Merchant" />

      <form
        onSubmit={handleSubmit(onSubmitHandler)}
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        <Modal
          isOpen={isOpen}
          onClose={() => {
            setSuccessAlert("");
            closeModal();
          }}
          className="max-w-xl m-4"
        >
          <div className="relative w-full rounded-3xl bg-white  dark:bg-gray-900  max-w-[600px] p-5 lg:p-10">
            <div>
              <div className="text-center">
                <div className="relative flex items-center justify-center z-1 mb-7">
                  {successAlert ? (
                    <svg
                      className="fill-success-50 dark:fill-success-500/15"
                      width="90"
                      height="90"
                      viewBox="0 0 90 90"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                        fill=""
                        fill-opacity=""
                      ></path>
                    </svg>
                  ) : (
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
                  )}
                  <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                    {successAlert ? (
                      <CheckCircleIcon className="size-10 fill-success-600 dark:fill-green-500 " />
                    ) : (
                      <AlertIcon className="size-10 fill-warning-600 dark:fill-orange-400 rotate-180" />
                    )}
                  </span>
                </div>
                {successAlert ? (
                  <>
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                      {alertTitle}
                    </h4>

                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {successAlert}
                    </p>

                    <div className="flex items-center justify-center w-full gap-3 mt-8">
                      <Button
                        onClick={() => {
                          setAlertTitle("");
                          setError("");
                          setSuccessAlert("");
                          setGeoSuccess([]);
                          closeModal();
                        }}
                      >
                        Okay, Got it!
                      </Button>
                    </div>
                  </>
                ) : (
                  // ) : error ? (
                  //   <>
                  //     <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                  //       {alertTitle || "Registration Error"}
                  //     </h4>

                  //     <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  //       {error}
                  //     </p>

                  //     <div className="flex items-center justify-center w-full gap-3 mt-8">
                  //       <Button
                  //         onClick={() => {
                  //           setError("");
                  //           setAlertTitle("");
                  //           closeModal();
                  //         }}
                  //       >
                  //         Close
                  //       </Button>
                  //     </div>
                  //   </>
                  <>
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

                    <p className="mt-5 font-medium text-xl text-gray-800 dark:text-white/90">
                      Do you want to proceed without uploading?
                    </p>

                    <div className="flex items-center justify-center w-full gap-3 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMissingUrl([]);
                          setGeoSuccess([]);
                          closeModal();
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={handleProceedWithoutDocuments}
                        disabled={loading}
                      >
                        {loading ? "Registering..." : "Proceed"}
                      </Button>
                    </div>
                  </>
                )}
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
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id="firstName"
                      placeholder="Enter first name"
                      {...field}
                      disabled={loading || uploadLoading}
                      error={!!errors.firstName}
                      success={dirtyFields.firstName && !errors.firstName}
                      hint={errors.firstName?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Last Name <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id="lastName"
                      placeholder="Enter last name"
                      {...field}
                      disabled={loading || uploadLoading}
                      error={!!errors.lastName}
                      success={dirtyFields.lastName && !errors.lastName}
                      hint={errors.lastName?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label>Middle Name (Optional)</Label>
                <Controller
                  name="middleName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id="middleName"
                      placeholder="Enter middle name"
                      {...field}
                      disabled={loading || uploadLoading}
                      error={!!errors.middleName}
                      success={dirtyFields.middleName && !errors.middleName}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Username <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="userName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id="userName"
                      placeholder="Enter username"
                      {...field}
                      disabled={loading || uploadLoading}
                      error={!!errors.userName}
                      success={dirtyFields.userName && !errors.userName}
                      hint={errors.userName?.message || "max length 12"}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Business Name <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="businessName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id="businessName"
                      placeholder="Enter business name"
                      {...field}
                      disabled={loading || uploadLoading}
                      error={!!errors.businessName}
                      success={dirtyFields.businessName && !errors.businessName}
                      hint={errors.businessName?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Business Phone <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="businessPhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="tel"
                      id="businessPhone"
                      {...field}
                      disabled={loading || uploadLoading}
                      onBlur={(e) => handlePhoneBlur(e, "businessPhone")}
                      error={!!errors.businessPhone || !!phoneError}
                      success={
                        dirtyFields.businessPhone && !errors.businessPhone
                      }
                      hint={errors.businessPhone?.message || phoneError || ""}
                      selectedCountries={["SL"]}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Phone <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="tel"
                      id="phone"
                      {...field}
                      disabled={loading || uploadLoading}
                      onBlur={(e) => handlePhoneBlur(e, "phone")}
                      error={!!errors.phone || !!phoneError}
                      success={dirtyFields.phone && !errors.phone}
                      hint={
                        errors.phone?.message ||
                        userExistError ||
                        phoneError ||
                        ""
                      }
                      selectedCountries={["SL"]}
                    />
                  )}
                />
              </div>

              <div>
                <Label>Email (Optional)</Label>
                <div className="relative">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="email"
                        id="email"
                        placeholder="info@gmail.com"
                        {...field}
                        disabled={loading || uploadLoading}
                        error={!!errors.email}
                        success={dirtyFields.email && !errors.email}
                        hint={errors.email?.message}
                        className="pl-[62px]"
                      />
                    )}
                  />
                  <span className="absolute text-gray-500  pointer-events-none left-4 top-2.5 dark:text-gray-400">
                    <EnvelopeIcon className="size-6" />
                  </span>
                </div>
              </div>

              <div className="relative">
                <Label>
                  Agency Type <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="agentType"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div
                        className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer dark:text-white/90 ${
                          errors.agentType
                            ? "border-error-500"
                            : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                        }`}
                        onClick={() => handleDropdownToggle("agentType")}
                      >
                        {field.value ? (
                          <span>{field.value}</span>
                        ) : (
                          <span className="text-gray-400 dark:text-white/30">
                            Select Type
                          </span>
                        )}
                        <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                      </div>
                      <Dropdown
                        isOpen={openDropdown === "agentType"}
                        onClose={() => setOpenDropdown(null)}
                        className="w-full p-2"
                        search={false}
                      >
                        {typeOptions.map((option) => (
                          <DropdownItem
                            key={option}
                            onItemClick={() => {
                              field.onChange(option);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                          >
                            {option}
                          </DropdownItem>
                        ))}
                      </Dropdown>
                    </>
                  )}
                />
                {errors.agentType && (
                  <p className="mt-0.5 text-xs text-right pr-2 text-error-500">
                    {errors.agentType.message}
                  </p>
                )}
              </div>

              {agentType && agentType !== MERCHANT_ROLE && (
                <div className="relative">
                  <Label>
                    Agency Model <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <>
                        <div
                          className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer dark:text-white/90 ${
                            errors.model
                              ? "border-error-500"
                              : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                          }`}
                          onClick={() => handleDropdownToggle("model")}
                        >
                          {field.value ? (
                            <span>{field.value}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-white/30">
                              Select Model
                            </span>
                          )}
                          <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                        </div>
                        <Dropdown
                          isOpen={openDropdown === "model"}
                          onClose={() => setOpenDropdown(null)}
                          className="w-full p-2"
                          search={false}
                        >
                          {modelOptions.map((option) => (
                            <DropdownItem
                              key={option}
                              onItemClick={() => {
                                field.onChange(option);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {option}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                      </>
                    )}
                  />
                  {errors.model && (
                    <p className="mt-0.5 text-xs text-right pr-2 text-error-500">
                      {errors.model.message}
                    </p>
                  )}
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
                <Controller
                  name="businessAddress"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id="businessAddress"
                      {...field}
                      disabled={loading || uploadLoading}
                      error={!!errors.businessAddress}
                      success={
                        dirtyFields.businessAddress && !errors.businessAddress
                      }
                      hint={errors.businessAddress?.message}
                    />
                  )}
                />
              </div>

              <div className="relative">
                <Label>
                  District <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="district"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div
                        className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer dark:text-white/90 ${
                          errors.district
                            ? "border-error-500"
                            : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                        }`}
                        onClick={() => handleDropdownToggle("district")}
                      >
                        {field.value ? (
                          <span>{field.value}</span>
                        ) : (
                          <span className="text-gray-400 dark:text-white/30">
                            Select District
                          </span>
                        )}
                        <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                      </div>
                      <Dropdown
                        isOpen={openDropdown === "district"}
                        onClose={() => setOpenDropdown(null)}
                        className="w-full p-2 h-50 overflow-y-auto"
                        // search={true}
                      >
                        {districtOptions.map((option) => (
                          <DropdownItem
                            key={option}
                            onItemClick={() => {
                              field.onChange(option);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                          >
                            {option}
                          </DropdownItem>
                        ))}
                      </Dropdown>
                    </>
                  )}
                />
                {errors.district && (
                  <p className="mt-0.5 text-xs text-right pr-2 text-error-500">
                    {errors.district.message}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Region (Optional)
                  {/* <span className="text-error-500">*</span> */}
                </Label>
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id="region"
                      {...field}
                      disabled={loading || uploadLoading}
                      error={!!errors.region}
                      success={dirtyFields.region && !errors.region}
                      hint={errors.region?.message}
                    />
                  )}
                />
              </div>

              <div className="col-span-full flex gap-4 flex-wrap items-end">
                <div className="grow" title="click the ☉ icon to get location">
                  <Label>
                    Latitude <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="^-?[0-9]+\.?[0-9]*$"
                        id="latitude"
                        {...field}
                        value={
                          !geoLoading
                            ? field.value || ""
                            : "Fetching Location..."
                        }
                        disabled={geoLoading || loading || uploadLoading}
                        error={!!errors.latitude}
                        hint={errors.latitude?.message || geoSuccess[1]}
                        success={!!geoSuccess[1]}
                        placeholder="e.g., 8.4606"
                      />
                    )}
                  />
                  {!!geoSuccess[1] &&
                    !geoSuccess[0] &&
                    errors.latitude?.message &&
                    !errors.longitude?.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 h-4.5"></p>
                    )}
                </div>

                <div className="grow" title="click the ☉ icon to get location">
                  <Label>
                    Longitude <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="^-?[0-9]+\.?[0-9]*$"
                        id="longitude"
                        {...field}
                        value={
                          !geoLoading
                            ? field.value || ""
                            : "Fetching Location..."
                        }
                        disabled={geoLoading || loading || uploadLoading}
                        error={!!errors.longitude}
                        hint={errors.longitude?.message || geoSuccess[0]}
                        success={!!geoSuccess[0]}
                        placeholder="e.g., -13.2317"
                      />
                    )}
                  />

                  {!!geoSuccess[0] &&
                    !geoSuccess[1] &&
                    errors.longitude?.message &&
                    !errors.latitude?.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 h-4.5"></p>
                    )}
                </div>
                <div>
                  <Button
                    size="sm"
                    onClick={handleGetLocation}
                    disabled={geoLoading || loading || uploadLoading}
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
                    {geoLoading ? "Getting Location..." : "Get GPS Location"}
                  </Button>
                  {(geoSuccess.length > 0 ||
                    errors.longitude?.message ||
                    errors.latitude?.message) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 h-4.5"></p>
                  )}
                </div>

                {/* GPS Troubleshooting Tips */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs max-w-full align-bottom">
                  <p className="font-medium mb-1 grow">💡 GPS Tips:</p>
                  <ul className="gap-x-4 gap-y-2 text-xs flex flex-wrap text-gray-500 dark:text-gray-400">
                    <li>• Wait 10-15 seconds</li>
                    <li>• Check GPS is enabled</li>
                    <li>• Allow location permission</li>
                  </ul>
                </div>
              </div>

              {!TargetAgent && (
                <div
                  className={`${
                    agentType === AGENT_ROLE &&
                    agentModel === "Independent" &&
                    "col-span-full"
                  }`}
                >
                  <Label>
                    Upload Business Place Image{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <div
                    className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                      errors.businessImageUrl
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
                    } `}
                      id="id-image-upload"
                    >
                      <input {...getBusinessImageInputProps()} />
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
                          Drag and drop your document or image files here or
                          browse
                        </span>
                        <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                          {businessImage ? businessImage.name : "Browse File"}
                        </span>
                      </div>
                      {businessImageUrl && (
                        <>
                          <button
                            disabled={loading || uploadLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue("businessImageUrl", "", {
                                shouldValidate: true,
                              });
                              setBusinessImage(null);
                            }}
                            className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8 disabled:cursor-not-allowed"
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
              )}

              {agentType !== AGENT_ROLE && (
                <div>
                  <Label>
                    Upload Proof of Address{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <div
                    className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                      errors.addressDocumentUrl
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
                    } `}
                      id="id-image-upload"
                    >
                      <input {...getAddressDocumentInputProps()} />
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
                          {addressDocument
                            ? addressDocument.name
                            : "Browse File"}
                        </span>
                      </div>
                      {addressDocumentUrl && (
                        <>
                          <button
                            disabled={loading || uploadLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue("addressDocumentUrl", "", {
                                shouldValidate: true,
                              });
                              setAddressDocument(null);
                            }}
                            className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8 disabled:cursor-not-allowed"
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
              )}
            </div>
          </ComponentCard>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title="Business Document">
            <div>
              <Label>
                {TargetAgent
                  ? "Upload Business Place Image"
                  : "Upload Business Registration Document"}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <div
                className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                  TargetAgent
                    ? errors.businessImageUrl
                      ? "border-error-500"
                      : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                    : errors.businessRegDocumentUrl
                    ? "border-error-500"
                    : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                }`}
              >
                <div
                  {...(TargetAgent
                    ? getBusinessImageRootProps()
                    : getRegDocumentRootProps())}
                  className={`dropzone relative rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${
                      TargetAgent
                        ? isBusinessImageDragActive
                          ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                        : isRegDocumentDragActive
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    } `}
                  id={
                    TargetAgent
                      ? "business-image-upload"
                      : "business-document-upload"
                  }
                >
                  <input
                    {...(TargetAgent
                      ? getBusinessImageInputProps()
                      : getRegDocumentInputProps())}
                  />

                  <div
                    className={`dz-message flex flex-col items-center ${
                      TargetAgent
                        ? businessImageUrl && "opacity-40"
                        : businessRegDocumentUrl && "opacity-40"
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
                      {TargetAgent
                        ? isBusinessImageDragActive
                          ? "Drop Files Here"
                          : "Drag & Drop Files Here"
                        : isRegDocumentDragActive
                        ? "Drop Files Here"
                        : "Drag & Drop Files Here"}
                    </h4>
                    <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                      Drag and drop your PDF, DOC, DOCX, PNG, JPEG, WebP files
                      here or browse
                    </span>
                    <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                      {TargetAgent
                        ? businessImage
                          ? businessImage.name
                          : "Browse File"
                        : businessRegDocument
                        ? businessRegDocument.name
                        : "Browse File"}
                    </span>
                  </div>
                  {TargetAgent
                    ? businessImageUrl && (
                        <>
                          <button
                            disabled={loading || uploadLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue("businessImageUrl", "", {
                                shouldValidate: true,
                              });
                              setBusinessImage(null);
                            }}
                            className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8 disabled:cursor-not-allowed"
                            title="delete uploaded file"
                          >
                            <TrashBinIcon color="#e4e7ec" />
                          </button>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full hover:opacity-20 transition-all duration-300">
                            <img
                              src={businessImageUrl}
                              alt="Uploaded Business Image Preview"
                              className="object-contain h-full mx-auto"
                            />
                          </div>
                        </>
                      )
                    : businessRegDocumentUrl && (
                        <>
                          <button
                            disabled={loading || uploadLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue("businessRegDocumentUrl", "", {
                                shouldValidate: true,
                              });
                              setBusinessRegDocument(null);
                            }}
                            className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8 disabled:cursor-not-allowed"
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
              {TargetAgent
                ? businessImageUrl && (
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
                  )
                : businessRegDocumentUrl && (
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
              <Controller
                name="idType"
                control={control}
                render={({ field }) => (
                  <>
                    <div
                      className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer dark:text-white/90 ${
                        errors.idType
                          ? "border-error-500"
                          : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                      }`}
                      onClick={() => handleDropdownToggle("idType")}
                    >
                      {field.value ? (
                        <span>{field.value}</span>
                      ) : (
                        <span className="text-gray-400 dark:text-white/30">
                          Select ID Type
                        </span>
                      )}
                      <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                    </div>
                    <Dropdown
                      isOpen={openDropdown === "idType"}
                      onClose={() => setOpenDropdown(null)}
                      className="w-full p-2"
                      search={false}
                    >
                      {idTypeOptions.map((option) => (
                        <DropdownItem
                          key={option}
                          onItemClick={() => {
                            field.onChange(option);
                            setOpenDropdown(null);
                          }}
                          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          {option}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                  </>
                )}
              />
              {errors.idType && (
                <p className="mt-0.5 text-xs text-right pr-2 text-error-500">
                  {errors.idType.message}
                </p>
              )}
            </div>
            <div>
              <Label>
                Upload ID Document <span className="text-error-500">*</span>
              </Label>
              <div
                className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                  errors.idImageUrl
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
                    } `}
                  id="id-image-upload"
                >
                  <input {...getIdImageInputProps()} />

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
                      {idImage ? idImage.name : "Browse File"}
                    </span>
                  </div>
                  {idImageUrl && (
                    <>
                      <button
                        disabled={loading || uploadLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue("idImageUrl", "", { shouldValidate: true });
                          setIdImage(null);
                        }}
                        className="absolute right-3 top-3 z-999 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-gray-400 transition-colors hover:bg-red-800 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-200 dark:hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8 disabled:cursor-not-allowed"
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
            {Object.keys(errors).length > 0 && (
              <Alert variant="error" title="Please fix the following errors:">
                <ul className="list-disc pl-5">
                  {Object.entries(errors).map(([key, value]) => (
                    <li
                      key={key}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      {value.message}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
            {error && (
              <Alert variant="error" title={alertTitle} message={error} />
            )}
            {/* {successAlert && (
              <Alert
                variant="success"
                title={alertTitle}
                message={successAlert}
              />
            )} */}
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
