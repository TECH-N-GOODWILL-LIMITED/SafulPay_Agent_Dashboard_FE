import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useDropzone } from "react-dropzone";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadToCloudinary, updateAgentInfo } from "../../utils/api";
import { useUsers } from "../../context/UsersContext";
import { getCurrentPosition } from "../../utils/geolocation";
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
  AlertIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  TrashBinIcon,
  UserIcon,
} from "../../icons";
import { useAuth } from "../../context/AuthContext";
import TextArea from "../form/input/TextArea";
import {
  ADMIN_ROLE,
  AGENT_ROLE,
  MERCHANT_ROLE,
  SUPER_AGENT_ROLE,
} from "../../utils/roles";
import type { Agent } from "../../types/types";
import PageMeta from "../common/PageMeta";
import { useVendors } from "../../hooks/useVendors";
import type { Vendor } from "../../types/types";

const validationSchema = yup.object().shape({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  middlename: yup.string(),
  username: yup
    .string()
    .required("Username is required")
    .max(12, "Username cannot exceed 12 characters"),
  business_name: yup.string().required("Business name is required"),
  business_phone: yup.string(), // Readonly
  phone: yup.string(), // Readonly
  email: yup.string().email("Invalid email format"),
  type: yup.string().required("Agency type is required"),
  model: yup.string().when("type", {
    is: (val: string) => val === "Agent" || val === "Super Agent",
    then: (schema) => schema.required("Agency model is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  id_type: yup.string(),
  address: yup.string().required("Business address is required"),
  district: yup.string().required("District is required"),
  region: yup.string(),
  latitude: yup.string().required("Latitude is required"),
  longitude: yup.string().required("Longitude is required"),
  id_document: yup.string(),
  business_image: yup.string(),
  address_document: yup.string(),
  business_registration: yup.string(),
  status: yup.number(),
  reason: yup.string(),
  master_id: yup.number().nullable(),
});

type FormData = yup.InferType<typeof validationSchema>;

interface EditAgentFormProps {
  agentData?: Agent | null;
}

export default function EditAgentForm({ agentData }: EditAgentFormProps) {
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successAlert, setSuccessAlert] = useState<string>("");

  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [businessImageFile, setBusinessImageFile] = useState<File | null>(null);
  const [addressDocumentFile, setAddressDocumentFile] = useState<File | null>(
    null
  );
  const [businessRegDocumentFile, setBusinessRegDocumentFile] =
    useState<File | null>(null);
  const [deletedImageKeys, setDeletedImageKeys] = useState<string[]>([]);
  const [showMissingImageModal, setShowMissingImageModal] =
    useState<boolean>(false);
  const [missingImages, setMissingImages] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [originalAgentData, setOriginalAgentData] = useState<Agent | null>(
    null
  );
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] =
    useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    setError: setFormError,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {},
  });

  const agentType = watch("type");
  const idImageUrl = watch("id_document");
  const businessImageUrl = watch("business_image");
  const addressDocumentUrl = watch("address_document");
  const businessRegDocumentUrl = watch("business_registration");
  const agentStatus = watch("status");
  const updateReason = watch("reason");

  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();

  const { isOpen, openModal, closeModal } = useModal();

  const {
    vendors,
    error: vendorsError,
    loading: vendorsLoading,
    refetch,
  } = useVendors();

  const { fetchUsers } = useUsers();

  useEffect(() => {
    if (agentData) {
      const defaultValues = {
        firstname: agentData.firstname || "",
        middlename: agentData.middlename || "",
        lastname: agentData.lastname || "",
        username: agentData.username || "",
        business_name: agentData.business_name || "",
        business_phone: agentData.business_phone || "",
        phone: agentData.phone || "",
        email: agentData.email || "",
        type: agentData.type || "",
        model: agentData.model || "",
        id_type: agentData.id_type || "",
        address: agentData.address || "",
        district: agentData.district || "",
        region: agentData.region || "",
        latitude: agentData.latitude || "",
        longitude: agentData.longitude || "",
        id_document: agentData.id_document || "",
        business_image: agentData.business_image || "",
        address_document: agentData.address_document || "",
        business_registration: agentData.business_registration || "",
        status: agentData.status,
        master_id: agentData.master_id || null,
        reason: "",
      };
      reset(defaultValues);
      setOriginalAgentData(agentData);
      setLoading(false);
    }
  }, [agentData, reset]);

  const statusOptions = [
    { label: "Pending", value: 0 },
    { label: "Active", value: 1 },
    { label: "Suspended", value: 2 },
    { label: "Reject", value: 3 },
  ];

  // Function to get filtered status options based on current agent status
  const getFilteredStatusOptions = () => {
    if (!originalAgentData) return statusOptions;

    const currentStatus = originalAgentData.status;

    switch (currentStatus) {
      case 0: // Pending
        return [
          { label: "Activate", value: 1 },
          { label: "Reject", value: 3 },
          { label: "Pending", value: 0 },
        ];
      case 1: // Active
        return [
          { label: "Reject", value: 3 },
          { label: "Active", value: 1 },
        ];
      case 2: // Suspended
        return [
          { label: "Reactivate", value: 1 },
          { label: "Suspended", value: 2 },
        ];
      case 3: // Rejected
        return [
          { label: "Reactivate", value: 1 },
          { label: "Rejected", value: 3 },
        ];
      default:
        return statusOptions;
    }
  };

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
        setIdImageFile(file);
        setValue("id_document", previewUrl, { shouldValidate: true });
      }
      if (type === "businessRegDocument") {
        setBusinessRegDocumentFile(file);
        setValue("business_registration", previewUrl, {
          shouldValidate: true,
        });
      }
      if (type === "businessImage") {
        setBusinessImageFile(file);
        setValue("business_image", previewUrl, { shouldValidate: true });
      }
      if (type === "addressDocument") {
        setAddressDocumentFile(file);
        setValue("address_document", previewUrl, { shouldValidate: true });
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

  const handleDropdownToggle = (dropdownName: string) => {
    if (loading || uploadLoading) return;
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleModalClose = () => {
    setSelectedVendor(null);
    closeModal();
  };

  const toggleVendorDropdown = () => {
    if (loading || uploadLoading) return;
    setIsVendorDropdownOpen(!isVendorDropdownOpen);
  };

  const closeVendorDropdown = () => {
    setIsVendorDropdownOpen(false);
  };

  const handleGetLocation = async () => {
    setGeoLoading(true);
    setAlertTitle("");
    setError("");

    try {
      const result = await getCurrentPosition();

      if (result.success) {
        setValue("latitude", result.latitude, { shouldValidate: true });
        setValue("longitude", result.longitude, { shouldValidate: true });
      } else {
        setAlertTitle("Geolocation Error");
        setError(result.error || "Failed to get location");
      }
    } catch {
      setAlertTitle("Geolocation Error");
      setError("An unexpected error occurred while getting location");
    } finally {
      setGeoLoading(false);
    }
  };

  const onSubmit = () => {
    const hasDirtyFields = Object.keys(dirtyFields).length > 0;
    const hasNewFiles =
      idImageFile ||
      businessImageFile ||
      addressDocumentFile ||
      businessRegDocumentFile;
    const hasDeletedImages = deletedImageKeys.length > 0;

    if (!hasDirtyFields && !hasNewFiles && !hasDeletedImages) {
      setAlertTitle("No Changes");
      setError("No changes detected to update.");
      return;
    }
    setError("");

    // Check for missing required images
    const missingImagesList: string[] = [];

    if (
      agentType !== "Merchant" &&
      !businessImageFile &&
      !originalAgentData?.business_image &&
      !deletedImageKeys.includes("business_image")
    ) {
      missingImagesList.push("Business Place Image");
    }

    if (
      agentType === "Merchant" &&
      !addressDocumentFile &&
      !originalAgentData?.address_document &&
      !deletedImageKeys.includes("address_document")
    ) {
      missingImagesList.push("Proof of Address");
    }

    if (
      !businessRegDocumentFile &&
      !originalAgentData?.business_registration &&
      !deletedImageKeys.includes("business_registration")
    ) {
      missingImagesList.push("Business Registration Document");
    }

    if (
      !idImageFile &&
      !originalAgentData?.id_document &&
      !deletedImageKeys.includes("id_document")
    ) {
      missingImagesList.push("ID Document");
    }

    if (missingImagesList.length > 0) {
      setMissingImages(missingImagesList);
      setShowMissingImageModal(true);
      return;
    }

    if (agentStatus === 1 && !originalAgentData?.master_id) {
      refetch();

      if (originalAgentData?.master_id) {
        const currentVendor = vendors.find(
          (vendor) => vendor.id === originalAgentData.master_id
        );
        setSelectedVendor(currentVendor || null);
      } else {
        setSelectedVendor(null);
      }
    }

    // Refetch vendors if status is being changed to active or if current status is active
    // if (agentStatus === 1 || originalAgentData?.status === 1) {
    //   refetch();
    // }

    openModal();
  };

  const handleConfirmUpdate = async (data: FormData) => {
    if (agentStatus === 1 && !data.master_id) {
      setFormError("master_id", {
        type: "manual",
        message: "Please select a vendor to continue",
      });
      return;
    }

    if (!data.reason || data.reason.trim().length < 4) {
      setFormError("reason", {
        type: "manual",
        message: "Reason must be at least 4 characters.",
      });
      return;
    }

    setLoading(true);
    setUploadLoading(true);
    setAlertTitle("Uploading files...");
    setError("");
    // closeModal();

    try {
      const updatedFields: Partial<Agent> = {};
      const dirtyKeys = Object.keys(dirtyFields) as (keyof FormData)[];

      dirtyKeys.forEach((key) => {
        if (key in originalAgentData!) {
          (updatedFields as Record<string, unknown>)[key] = data[key];
        }
      });

      const filesToUpload: {
        key: keyof Agent;
        file: File | null;
        urlField: keyof FormData;
      }[] = [
        {
          key: "business_image",
          file: businessImageFile,
          urlField: "business_image",
        },
        {
          key: "address_document",
          file: addressDocumentFile,
          urlField: "address_document",
        },
        {
          key: "business_registration",
          file: businessRegDocumentFile,
          urlField: "business_registration",
        },
        { key: "id_document", file: idImageFile, urlField: "id_document" },
      ];

      for (const { key, file, urlField } of filesToUpload) {
        if (
          file &&
          !String(data[urlField]).startsWith("https://res.cloudinary.com")
        ) {
          const result = await uploadToCloudinary(
            file,
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            "safulpayAgencyKYC"
          );
          if (result.success) {
            setValue(urlField, result.url, { shouldValidate: true });
            updatedFields[key] = result.url;
          } else {
            throw new Error(`Failed to upload ${file.name}`);
          }
        }
      }

      // Handle deleted images - set them to null to indicate deletion
      deletedImageKeys.forEach((key) => {
        (updatedFields as Record<string, unknown>)[key] = null;
      });

      const newStatusValue = statusOptions.find(
        (s) =>
          s.label ===
          statusOptions.find((opt) => opt.value === data.status)?.label
      )?.value;
      if (originalAgentData?.status !== newStatusValue) {
        updatedFields.status = newStatusValue;
      }

      // Only include master_id if status is active (1) or if it's actually changed
      const shouldIncludeMasterId =
        data.status === 1 ||
        (data.master_id && data.master_id !== originalAgentData?.master_id);

      const response = await updateAgentInfo(
        token || "",
        id || "",
        updatedFields,
        data.reason || "",
        shouldIncludeMasterId ? data.master_id : undefined
      );

      if (response.success && response.data) {
        await fetchUsers({
          page: 1,
          per_page: 10,
        });
        setAlertTitle("Update Successful!");
        setSuccessAlert(
          `${data.type} ${data.business_name}'s info has been updated successfully!`
        );
        const newAgentData = response.data.agent;
        const newDefaultValues = {
          firstname: newAgentData.firstname || "",
          middlename: newAgentData.middlename || "",
          lastname: newAgentData.lastname || "",
          username: newAgentData.username || "",
          business_name: newAgentData.business_name || "",
          business_phone: newAgentData.business_phone || "",
          phone: newAgentData.phone || "",
          email: newAgentData.email || "",
          type: newAgentData.type || "",
          model: newAgentData.model || "",
          id_type: newAgentData.id_type || "",
          address: newAgentData.address || "",
          district: newAgentData.district || "",
          region: newAgentData.region || "",
          latitude: newAgentData.latitude || "",
          longitude: newAgentData.longitude || "",
          id_document: newAgentData.id_document || "",
          business_image: newAgentData.business_image || "",
          address_document: newAgentData.address_document || "",
          business_registration: newAgentData.business_registration || "",
          status: newAgentData.status,
          master_id: newAgentData.master_id || null,
          reason: "",
        };
        reset(newDefaultValues);
        setOriginalAgentData(newAgentData);
        setDeletedImageKeys([]);
        if (!isOpen) {
          openModal();
        }
      } else {
        setAlertTitle("Update Failed");
        setError(response.error || "Agent update failed");
        closeModal();
      }
    } catch (err) {
      setAlertTitle("Operation Failed");
      setError((err as Error).message);
      closeModal();
    } finally {
      setLoading(false);
      setUploadLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Agent & Merchant | SafulPay Agency Dashboard - Finance just got better"
        description="Update an Agent or Merchant Info - Management system for SafulPay's Agency Platform"
      />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setSuccessAlert("");
          closeModal();
        }}
        className="max-w-lg m-4"
      >
        <div className="relative w-full rounded-3xl bg-white dark:bg-gray-900 max-w-[600px] p-5 lg:p-10">
          <div>
            <div className="text-center">
              {successAlert && (
                <div className="relative flex items-center justify-center z-1 mb-7">
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
                      fillOpacity=""
                    ></path>
                  </svg>
                  <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                    <CheckCircleIcon className="size-10 fill-success-600 dark:fill-green-500 " />
                  </span>
                </div>
              )}
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
                        handleModalClose();
                      }}
                    >
                      Okay, Got it!
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="mb-8 text-2xl font-semibold text-center text-gray-800 dark:text-white/90 sm:text-title-sm">
                    Confirm to update vendor
                  </h4>

                  <div className="flex flex-col gap-5">
                    {agentStatus === 1 && !originalAgentData?.master_id && (
                      <div className="relative">
                        {vendorsError && (
                          <Alert
                            variant="error"
                            title="Error Fetching Vendor list"
                            message={vendorsError}
                          />
                        )}

                        <Label className="mt-2 text-left">
                          Attach a Vendor
                        </Label>
                        <Button
                          onClick={toggleVendorDropdown}
                          size="sm"
                          variant="outline"
                          className="dropdown-toggle w-full justify-between"
                          disabled={vendorsLoading}
                        >
                          <span>
                            {vendorsLoading
                              ? "Loading Vendors..."
                              : selectedVendor?.firstname || "Select Vendor"}
                          </span>
                          <ChevronDownIcon
                            className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                              isVendorDropdownOpen && "rotate-180"
                            }`}
                          />
                        </Button>
                        <Dropdown
                          isOpen={isVendorDropdownOpen}
                          onClose={closeVendorDropdown}
                          className="w-full p-2"
                        >
                          {vendorsLoading ? (
                            <DropdownItem
                              onItemClick={() => {}}
                              className="flex w-full font-normal text-left text-gray-400 rounded-lg py-2"
                            >
                              Loading vendors...
                            </DropdownItem>
                          ) : vendorsError ? (
                            <DropdownItem
                              onItemClick={closeVendorDropdown}
                              className="flex justify-between py-1 w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              No Vendors found
                              <span className="text-brand-accent">
                                {vendorsError && `  ${vendorsError}`}
                              </span>
                            </DropdownItem>
                          ) : vendors.length === 0 ? (
                            <DropdownItem
                              onItemClick={() => {}}
                              className="flex w-full font-normal text-left text-gray-400 rounded-lg py-2"
                            >
                              No vendors available
                            </DropdownItem>
                          ) : (
                            vendors.map((vendor) => (
                              <DropdownItem
                                key={vendor.id}
                                onItemClick={() => {
                                  setSelectedVendor(vendor);
                                  setValue("master_id", vendor.id);
                                  closeVendorDropdown();
                                }}
                                className="flex justify-between py-1 w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              >
                                <span>{vendor.firstname}</span>
                                <span>
                                  ({vendor.vendor_type.toUpperCase()})
                                </span>
                              </DropdownItem>
                            ))
                          )}
                        </Dropdown>

                        {!selectedVendor && (
                          <p className="mt-0.5 text-xs text-right pr-2 text-error-500">
                            Please select a vendor to continue
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-left">
                      <Label>Reason for updating vendor information</Label>
                      <Controller
                        name="reason"
                        control={control}
                        render={({ field }) => (
                          <TextArea
                            {...field}
                            placeholder={`Enter reason for updating agent info...`}
                            rows={4}
                            minLength={4}
                            maxLength={120}
                            error={!!errors.reason}
                            hint={errors.reason?.message}
                          />
                        )}
                      />
                      <div className="flex items-center justify-end w-full gap-3 mt-4">
                        <Button variant="outline" onClick={handleModalClose}>
                          Go Back
                        </Button>
                        <Button
                          onClick={handleSubmit(handleConfirmUpdate)}
                          disabled={
                            loading ||
                            uploadLoading ||
                            vendorsLoading ||
                            (agentStatus === 1 && !selectedVendor) ||
                            !updateReason ||
                            (updateReason?.length || 0) < 4
                          }
                        >
                          {loading ? "Updating..." : "Confirm Update"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Missing Image Modal */}
      <Modal
        isOpen={showMissingImageModal}
        onClose={() => setShowMissingImageModal(false)}
        className="max-w-xl m-4"
      >
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
                  <AlertIcon className="size-10 fill-warning-600 dark:fill-orange-400 rotate-180" />
                </span>
              </div>

              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                {/* Warning Alert! */}
                Missing Required Documents!
              </h4>

              <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                {missingImages.length}{" "}
                {missingImages.length > 1 ? "documents" : "document"} (
                <span className="text-brand-accent">
                  {missingImages.join(", ")}
                </span>
                ) missing.
              </p>

              <p className="mt-5 font-medium text-xl text-gray-800 dark:text-white/90">
                Do you want to proceed without uploading?
              </p>

              <div className="flex items-center justify-center w-full gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowMissingImageModal(false)}
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => {
                    refetch();
                    setMissingImages([]);
                    setShowMissingImageModal(false);
                    openModal();
                  }}
                >
                  Proceed Anyway
                </Button>
              </div>

              {/* <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  The following documents are required to update this agent:
                </p> */}
            </div>
          </div>
        </div>
      </Modal>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title="Business Info">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="input">
                  First Name <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="firstname"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="firstname"
                      placeholder="Enter first name"
                      disabled={loading || uploadLoading}
                      error={!!errors.firstname}
                      success={dirtyFields.firstname && !errors.firstname}
                      hint={errors.firstname?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Last Name <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="lastname"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="lastname"
                      placeholder="Enter last name"
                      disabled={loading || uploadLoading}
                      error={!!errors.lastname}
                      success={dirtyFields.lastname && !errors.lastname}
                      hint={errors.lastname?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label>Middle Name (Optional)</Label>
                <Controller
                  name="middlename"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="middlename"
                      placeholder="Enter middle name"
                      disabled={loading || uploadLoading}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Username <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="username"
                      placeholder="Enter username"
                      disabled={loading || uploadLoading}
                      error={!!errors.username}
                      success={dirtyFields.username && !errors.username}
                      hint={errors.username?.message || "max length 12"}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Business Name <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="business_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="business_name"
                      placeholder="Enter business name"
                      disabled={loading || uploadLoading}
                      error={!!errors.business_name}
                      success={
                        dirtyFields.business_name && !errors.business_name
                      }
                      hint={errors.business_name?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label>
                  Business Phone{" "}
                  <span className="text-error-500">(read only)</span>
                </Label>
                <Controller
                  name="business_phone"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="tel" id="business_phone" readOnly />
                  )}
                />
              </div>

              <div>
                <Label>
                  Phone <span className="text-error-500">(read only)</span>
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="tel" id="phone" readOnly />
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
                        {...field}
                        type="email"
                        id="email"
                        placeholder="info@gmail.com"
                        className="pl-[62px]"
                        disabled={loading || uploadLoading}
                        error={!!errors.email}
                        success={dirtyFields.email && !errors.email}
                        hint={errors.email?.message}
                      />
                    )}
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
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div
                        className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                          errors.type
                            ? "border-error-500"
                            : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                        }`}
                        onClick={() => handleDropdownToggle("agentType")}
                      >
                        {field.value ? (
                          <span> {field.value}</span>
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
                {errors.type && (
                  <p className="mt-0.5 text-xs text-right pr-2 text-error-500">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {agentType !== "Merchant" && (
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
                          className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                            errors.model
                              ? "border-error-500"
                              : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                          }`}
                          onClick={() => handleDropdownToggle("model")}
                        >
                          {field.value ? (
                            <span> {field.value}</span>
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
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="address"
                      disabled={loading || uploadLoading}
                      error={!!errors.address}
                      success={dirtyFields.address && !errors.address}
                      hint={errors.address?.message}
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
                        className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                          errors.district
                            ? "border-error-500"
                            : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                        }`}
                        onClick={() => handleDropdownToggle("district")}
                      >
                        {field.value ? (
                          <span> {field.value}</span>
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
                        search={false}
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
                <Label>Region (Optional)</Label>
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="region"
                      disabled={loading || uploadLoading}
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
                        {...field}
                        type="text"
                        inputMode="numeric"
                        pattern="^-?[0-9]+\.?[0-9]*$"
                        id="latitude"
                        value={
                          !geoLoading
                            ? field.value || ""
                            : "Fetching Location..."
                        }
                        disabled={geoLoading || loading || uploadLoading}
                        error={!!errors.latitude}
                        hint={errors.latitude?.message}
                        placeholder="e.g., 8.4606"
                      />
                    )}
                  />
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
                        {...field}
                        type="text"
                        inputMode="numeric"
                        pattern="^-?[0-9]+\.?[0-9]*$"
                        id="longitude"
                        value={
                          !geoLoading
                            ? field.value || ""
                            : "Fetching Location..."
                        }
                        disabled={geoLoading || loading || uploadLoading}
                        error={!!errors.longitude}
                        hint={errors.longitude?.message}
                        placeholder="e.g., -13.2317"
                      />
                    )}
                  />
                </div>

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
                </Button>
              </div>

              <div className={`${agentType === "Agent" && "col-span-full"}`}>
                <Label>
                  Upload Business Place Image{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                    errors.business_image
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
                      disabled={uploadLoading || loading}
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
                        Drag and drop your document or image files here or
                        browse
                      </span>
                      <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                        {originalAgentData?.business_image
                          ? "Change File"
                          : businessImageFile
                          ? businessImageFile.name
                          : "Browse File"}
                      </span>
                    </div>
                    {businessImageUrl && (
                      <>
                        <button
                          disabled={loading || uploadLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            setValue("business_image", "");
                            setBusinessImageFile(null);
                            setDeletedImageKeys((prev) => [
                              ...prev,
                              "business_image",
                            ]);
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

              <div className={`${agentType === "Agent" && "hidden"}`}>
                <Label>
                  Upload Proof of Address{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <div
                  className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                    errors.address_document
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
                      disabled={uploadLoading || loading}
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
                        Drag and drop your document or image files here or
                        browse
                      </span>
                      <span className="font-medium underline text-theme-sm text-brand-500 truncate">
                        {originalAgentData?.address_document
                          ? "Change File"
                          : addressDocumentFile
                          ? addressDocumentFile.name
                          : "Browse File"}
                      </span>
                    </div>
                    {addressDocumentUrl && (
                      <>
                        <button
                          disabled={loading || uploadLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            setValue("address_document", "");
                            setAddressDocumentFile(null);
                            setDeletedImageKeys((prev) => [
                              ...prev,
                              "address_document",
                            ]);
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
                  errors.business_registration
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
                    } ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""} `}
                  id="business-document-upload"
                >
                  <input
                    {...getRegDocumentInputProps()}
                    disabled={uploadLoading || loading}
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
                        : businessRegDocumentFile
                        ? businessRegDocumentFile.name
                        : "Browse File"}
                    </span>
                  </div>
                  {businessRegDocumentUrl && (
                    <>
                      <button
                        disabled={loading || uploadLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue("business_registration", "");
                          setBusinessRegDocumentFile(null);
                          setDeletedImageKeys((prev) => [
                            ...prev,
                            "business_registration",
                          ]);
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
              <Controller
                name="id_type"
                control={control}
                render={({ field }) => (
                  <>
                    <div
                      className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                        errors.id_type
                          ? "border-error-500"
                          : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                      }`}
                      onClick={() => handleDropdownToggle("idType")}
                    >
                      {field.value ? (
                        <span> {field.value}</span>
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
            </div>

            <div>
              <Label>
                Upload ID Document <span className="text-error-500">*</span>
              </Label>
              <div
                className={`overflow-hidden transition border border-dashed cursor-pointer dark:hover:border-brand-500 rounded-xl hover:border-brand-500 ${
                  errors.id_document
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
                  <input
                    {...getIdImageInputProps()}
                    disabled={uploadLoading || loading}
                  />
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
                        : idImageFile
                        ? idImageFile.name
                        : "Browse File"}
                    </span>
                  </div>
                  {idImageUrl && (
                    <>
                      <button
                        disabled={loading || uploadLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue("id_document", "");
                          setIdImageFile(null);
                          setDeletedImageKeys((prev) => [
                            ...prev,
                            "id_document",
                          ]);
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

            {originalAgentData?.status === 3 && (
              <div className="col-span-full">
                <Label>Reason for rejection</Label>
                <TextArea
                  value={originalAgentData?.reason}
                  rows={4}
                  placeholder="No reason provided"
                  readOnly
                />
              </div>
            )}

            {user?.role === ADMIN_ROLE && (
              <>
                {/* <div className="relative">
                  <Label>
                    Change Vendor
                    {originalAgentData && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Current:{" "}
                        {vendors.find(
                          (vendor) => vendor.id === originalAgentData.master_id
                        )?.firstname || "None"}
                        )
                      </span>
                    )}
                  </Label>
                  <Controller
                    name="master_id"
                    control={control}
                    render={({ field }) => (
                      <>
                        <div
                          className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                            errors.master_id
                              ? "border-error-500"
                              : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                          }`}
                          onClick={() => handleDropdownToggle("master_id")}
                        >
                          {selectedVendor ? (
                            <span>{selectedVendor.firstname}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-white/30">
                              {originalAgentData?.master_id
                                ? "Select a different vendor"
                                : "Select Vendor"}
                            </span>
                          )}

                          <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                        </div>
                        <Dropdown
                          isOpen={openDropdown === "master_id"}
                          onClose={() => setOpenDropdown(null)}
                          className="w-full p-2"
                          search={false}
                        >
                          {vendorsLoading ? (
                            <DropdownItem
                              onItemClick={() => {}}
                              className="flex w-full font-normal text-left text-gray-400 rounded-lg py-2"
                            >
                              Loading vendors...
                            </DropdownItem>
                          ) : vendorsError ? (
                            <DropdownItem
                              onItemClick={() => {}}
                              className="flex justify-between py-1 w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              No Vendors found
                              <span className="text-brand-accent">
                                {vendorsError && `  ${vendorsError}`}
                              </span>
                            </DropdownItem>
                          ) : vendors.length === 0 ? (
                            <DropdownItem
                              onItemClick={() => {}}
                              className="flex justify-between py-1 w-full font-normal text-left text-gray-400 rounded-lg py-2"
                            >
                              No vendors available
                            </DropdownItem>
                          ) : (
                            vendors.map((vendor) => (
                              <DropdownItem
                                key={vendor.id}
                                onItemClick={() => {
                                  setSelectedVendor(vendor);
                                  field.onChange(vendor.id);
                                  setOpenDropdown(null);
                                }}
                                className="flex justify-between py-1 w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              >
                                <span>{vendor.firstname}</span>
                                <span>
                                  ({vendor.vendor_type.toUpperCase()})
                                </span>
                              </DropdownItem>
                            ))
                          )}
                        </Dropdown>
                      </>
                    )}
                  />
                </div> */}
                <div className="relative">
                  <Label>
                    Update Agent Status
                    {originalAgentData && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Current:{" "}
                        {statusOptions.find(
                          (option) => option.value === originalAgentData.status
                        )?.label || "Unknown"}
                        )
                      </span>
                    )}
                  </Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <>
                        <div
                          className={`relative dropdown-toggle h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                            errors.status
                              ? "border-error-500"
                              : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                          }`}
                          onClick={() => handleDropdownToggle("status")}
                        >
                          {field.value !== undefined ? (
                            <span>
                              {statusOptions.find(
                                (option) => option.value === field.value
                              )?.label || "Current Status"}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-white/30">
                              {originalAgentData
                                ? statusOptions.find(
                                    (option) =>
                                      option.value === originalAgentData.status
                                  )?.label || "Current Status"
                                : "Select Status"}
                            </span>
                          )}

                          <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
                        </div>
                        <Dropdown
                          isOpen={openDropdown === "status"}
                          onClose={() => setOpenDropdown(null)}
                          className="w-full p-2"
                          search={false}
                        >
                          {getFilteredStatusOptions().map((option) => (
                            <DropdownItem
                              key={option.label}
                              onItemClick={() => {
                                field.onChange(option.value);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {option.label}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                      </>
                    )}
                  />
                </div>
              </>
            )}

            {Object.keys(errors).length > 0 && (
              <Alert variant="error" title="Please fix the following errors:">
                <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>{value.message}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {error && (
              <Alert variant="error" title={alertTitle} message={error} />
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
    </>
  );
}
