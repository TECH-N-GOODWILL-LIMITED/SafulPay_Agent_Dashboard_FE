import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useDropzone } from "react-dropzone";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  uploadToCloudinary,
  getAgentById,
  updateAgentInfo,
} from "../../utils/api";
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
  ChevronDownIcon,
  EnvelopeIcon,
  TrashBinIcon,
  UserIcon,
} from "../../icons";
import { useAuth } from "../../context/AuthContext";
import TextArea from "../form/input/TextArea";
import { Agent } from "../../types/types";
import {
  ADMIN_ROLE,
  AGENT_ROLE,
  MERCHANT_ROLE,
  SUPER_AGENT_ROLE,
} from "../../utils/roles";
import LoadingSpinner from "../common/LoadingSpinner";

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
});

type FormData = yup.InferType<typeof validationSchema>;

export default function EditAgentForm() {
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState<string>("");

  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [businessImageFile, setBusinessImageFile] = useState<File | null>(null);
  const [addressDocumentFile, setAddressDocumentFile] = useState<File | null>(
    null
  );
  const [businessRegDocumentFile, setBusinessRegDocumentFile] =
    useState<File | null>(null);
  const [deletedImageKeys, setDeletedImageKeys] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [originalAgentData, setOriginalAgentData] = useState<Agent | null>(
    null
  );

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

  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();

  const { isOpen, openModal, closeModal } = useModal();

  const { fetchUsers } = useUsers();

  const statusOptions = [
    { label: "Pending", value: 0 },
    { label: "Active", value: 1 },
    { label: "Suspended", value: 2 },
    { label: "Rejected", value: 3 },
  ];

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!id || !token) return;
      setLoading(true);
      setFetchError("");
      try {
        const response = await getAgentById(token, id);
        if (response.success && response.data) {
          const agent = response.data.agent;
          const defaultValues = {
            firstname: agent.firstname || "",
            middlename: agent.middlename || "",
            lastname: agent.lastname || "",
            username: agent.username || "",
            business_name: agent.business_name || "",
            business_phone: agent.business_phone || "",
            phone: agent.phone || "",
            email: agent.email || "",
            type: agent.type || "",
            model: agent.model || "",
            id_type: agent.id_type || "",
            address: agent.address || "",
            district: agent.district || "",
            region: agent.region || "",
            latitude: agent.latitude || "",
            longitude: agent.longitude || "",
            id_document: agent.id_document || "",
            business_image: agent.business_image || "",
            address_document: agent.address_document || "",
            business_registration: agent.business_registration || "",
            status: agent.status,
            reason: "",
          };
          reset(defaultValues);
          setOriginalAgentData(agent);
        } else {
          setFetchError(response.error || "Failed to fetch agent data");
        }
      } catch (err) {
        setFetchError(`Error fetching agent data: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id, token, reset]);

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

  const handleGetLocation = async () => {
    setGeoLoading(true);
    setAlertTitle("");
    setError("");
    setUpdateSuccess("");

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

  if (loading) {
    return <LoadingSpinner text="Loading agent data..." />;
  }

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

    openModal();
  };

  const handleConfirmUpdate = async (data: FormData) => {
    if (!data.reason || data.reason.trim().length < 4) {
      setFormError("reason", {
        type: "manual",
        message: "Reason must be at least 4 characters.",
      });
      return;
    }

    setLoading(true);
    setUploadLoading(true);
    setError("");
    setUpdateSuccess("");
    closeModal();

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

      deletedImageKeys.forEach((key) => {
        updatedFields[key as keyof Agent] = undefined;
      });

      const newStatusValue = statusOptions.find(
        (s) =>
          s.label ===
          statusOptions.find((opt) => opt.value === data.status)?.label
      )?.value;
      if (originalAgentData?.status !== newStatusValue) {
        updatedFields.status = newStatusValue;
      }

      const response = await updateAgentInfo(
        token || "",
        id || "",
        updatedFields,
        data.reason || ""
      );

      if (response.success && response.data) {
        await fetchUsers({
          page: 1,
          per_page: 10,
        });
        setAlertTitle("Successful");
        setUpdateSuccess(
          `${data.type} ${data.business_name}'s info updated successfully!`
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
          reason: "",
        };
        reset(newDefaultValues);
        setOriginalAgentData(newAgentData);
        setDeletedImageKeys([]);
      } else {
        setAlertTitle("Update Failed");
        setError(response.error || "Agent update failed");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setUploadLoading(false);
    }
  };

  return (
    <>
      {fetchError && (
        <Alert variant="error" title="Error" message={fetchError} />
      )}

      {updateSuccess && (
        <Alert variant="success" title={alertTitle} message={updateSuccess} />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-lg m-4">
          <div className="relative w-full rounded-3xl bg-white dark:bg-gray-900 max-w-[600px] p-5 lg:p-10">
            <div className="text-left">
              <h4 className="mb-8 text-2xl font-semibold text-center text-gray-800 dark:text-white/90 sm:text-title-sm">
                Confirm to update vendor
              </h4>
              <Label>Reason for updating vendor information</Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    placeholder={`Enter reason for updating agent info...`}
                    rows={4}
                    error={!!errors.reason}
                    hint={errors.reason?.message}
                  />
                )}
              />
              <div className="flex items-center justify-end w-full gap-3 mt-4">
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button
                  onClick={handleSubmit(handleConfirmUpdate)}
                  disabled={loading || uploadLoading}
                >
                  {loading ? "Updating..." : "Confirm Update"}
                </Button>
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

            {user?.role === ADMIN_ROLE && (
              <div className="relative">
                <Label>
                  Update Agent Status <span className="text-error-500">*</span>
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
                            {
                              statusOptions.find(
                                (option) => option.value === field.value
                              )?.label
                            }
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-white/30">
                            Select Status
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
                        {statusOptions.map((option) => (
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
            )}

            {Object.keys(errors).length > 0 && (
              <Alert variant="error" title="Please fix the following errors:">
                <ul className="list-disc pl-5">
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
