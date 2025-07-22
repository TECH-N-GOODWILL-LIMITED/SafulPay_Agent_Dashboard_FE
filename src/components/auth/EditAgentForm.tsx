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
import { ADMIN_ROLE } from "../../utils/roles";

const validationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  middleName: yup.string(),
  userName: yup
    .string()
    .required("Username is required")
    .max(12, "Username cannot exceed 12 characters"),
  businessName: yup.string().required("Business name is required"),
  businessPhone: yup.string(), // Readonly
  phone: yup.string(), // Readonly
  email: yup.string().email("Invalid email format"),
  agentType: yup.string().required("Agency type is required"),
  model: yup.string().when("agentType", {
    is: (val: string) => val === "Agent" || val === "Super Agent",
    then: (schema) => schema.required("Agency model is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  idType: yup.string(),
  businessAddress: yup.string().required("Business address is required"),
  district: yup.string().required("District is required"),
  region: yup.string(),
  latitude: yup.string().required("Latitude is required"),
  longitude: yup.string().required("Longitude is required"),
  idImageUrl: yup.string(),
  businessImageUrl: yup.string(),
  addressDocumentUrl: yup.string(),
  businessRegDocumentUrl: yup.string(),
  agentStatus: yup.string(),
  reason: yup.string().min(4, "Reason must be at least 4 characters."),
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
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] =
    useState<boolean>(false);
  const [originalAgentData, setOriginalAgentData] = useState<Agent | null>(
    null
  );

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {},
  });

  const agentType = watch("agentType");
  const idImageUrl = watch("idImageUrl");
  const businessImageUrl = watch("businessImageUrl");
  const addressDocumentUrl = watch("addressDocumentUrl");
  const businessRegDocumentUrl = watch("businessRegDocumentUrl");

  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();

  const { isOpen, openModal, closeModal } = useModal();

  const { fetchUsers } = useAllUsers();

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
            firstName: agent.firstname || "",
            middleName: agent.middlename || "",
            lastName: agent.lastname || "",
            userName: agent.username || "",
            businessName: agent.business_name || "",
            businessPhone: agent.business_phone || "",
            phone: agent.phone || "",
            email: agent.email || "",
            agentType: agent.type || "",
            model: agent.model || "",
            idType: agent.id_type || "",
            businessAddress: agent.address || "",
            district: agent.district || "",
            region: agent.region || "",
            latitude: agent.latitude || "",
            longitude: agent.longitude || "",
            idImageUrl: agent.id_document || "",
            businessImageUrl: agent.business_image || "",
            addressDocumentUrl: agent.address_document || "",
            businessRegDocumentUrl: agent.business_registration || "",
            agentStatus:
              statusOptions.find((s) => s.value === agent.status)?.label || "",
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
        setValue("idImageUrl", previewUrl, { shouldValidate: true });
      }
      if (type === "businessRegDocument") {
        setBusinessRegDocumentFile(file);
        setValue("businessRegDocumentUrl", previewUrl, {
          shouldValidate: true,
        });
      }
      if (type === "businessImage") {
        setBusinessImageFile(file);
        setValue("businessImageUrl", previewUrl, { shouldValidate: true });
      }
      if (type === "addressDocument") {
        setAddressDocumentFile(file);
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setAlertTitle("Geolocation Not Supported");
      setError("Your browser does not support geolocation.");
      return;
    }

    setGeoLoading(true);
    setAlertTitle("");
    setError("");
    setUpdateSuccess("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);

        setValue("latitude", lat, { shouldValidate: true });
        setValue("longitude", lon, { shouldValidate: true });
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

  const onSubmit = (data: FormData) => {
    const updatedFields: Partial<Agent> = {};
    if (originalAgentData?.firstname !== data.firstName)
      updatedFields.firstname = data.firstName;
    if (originalAgentData?.middlename !== data.middleName)
      updatedFields.middlename = data.middleName;
    if (originalAgentData?.lastname !== data.lastName)
      updatedFields.lastname = data.lastName;
    if (originalAgentData?.username !== data.userName)
      updatedFields.username = data.userName;
    if (originalAgentData?.business_name !== data.businessName)
      updatedFields.business_name = data.businessName;
    if (originalAgentData?.email !== data.email)
      updatedFields.email = data.email;
    if (originalAgentData?.type !== data.agentType)
      updatedFields.type = data.agentType;
    if (originalAgentData?.model !== data.model)
      updatedFields.model = data.model;
    if (originalAgentData?.address !== data.businessAddress)
      updatedFields.address = data.businessAddress;
    if (originalAgentData?.district !== data.district)
      updatedFields.district = data.district;
    if (originalAgentData?.region !== data.region)
      updatedFields.region = data.region;
    if (originalAgentData?.latitude !== data.latitude)
      updatedFields.latitude = data.latitude;
    if (originalAgentData?.longitude !== data.longitude)
      updatedFields.longitude = data.longitude;
    if (businessImageFile) updatedFields.business_image = "updated";
    if (addressDocumentFile) updatedFields.address_document = "updated";
    if (businessRegDocumentFile)
      updatedFields.business_registration = "updated";
    if (idImageFile) updatedFields.id_document = "updated";
    if (originalAgentData?.id_type !== data.idType)
      updatedFields.id_type = data.idType;

    const newStatusValue = statusOptions.find(
      (s) => s.label === data.agentStatus
    )?.value;
    if (originalAgentData?.status !== newStatusValue)
      updatedFields.status = newStatusValue;

    if (Object.keys(updatedFields).length === 0) {
      setAlertTitle("No Changes");
      setUpdateSuccess("No changes detected to update.");
      return;
    }

    openModal();
  };

  const handleConfirmUpdate = async (data: FormData) => {
    setLoading(true);
    setUploadLoading(true);
    setError("");
    setUpdateSuccess("");
    closeModal();

    try {
      const updatedFields: Partial<Agent> = {};
      const filesToUpload: {
        key: keyof Agent;
        file: File | null;
        urlField: keyof FormData;
      }[] = [
        {
          key: "business_image",
          file: businessImageFile,
          urlField: "businessImageUrl",
        },
        {
          key: "address_document",
          file: addressDocumentFile,
          urlField: "addressDocumentUrl",
        },
        {
          key: "business_registration",
          file: businessRegDocumentFile,
          urlField: "businessRegDocumentUrl",
        },
        { key: "id_document", file: idImageFile, urlField: "idImageUrl" },
      ];

      for (const { key, file, urlField } of filesToUpload) {
        if (file && !data[urlField]?.startsWith("https://res.cloudinary.com")) {
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

      if (originalAgentData?.firstname !== data.firstName)
        updatedFields.firstname = data.firstName;
      if (originalAgentData?.middlename !== data.middleName)
        updatedFields.middlename = data.middleName;
      if (originalAgentData?.lastname !== data.lastName)
        updatedFields.lastname = data.lastName;
      if (originalAgentData?.username !== data.userName)
        updatedFields.username = data.userName;
      if (originalAgentData?.business_name !== data.businessName)
        updatedFields.business_name = data.businessName;
      if (originalAgentData?.email !== data.email)
        updatedFields.email = data.email;
      if (originalAgentData?.type !== data.agentType)
        updatedFields.type = data.agentType;
      if (originalAgentData?.model !== data.model)
        updatedFields.model = data.model;
      if (originalAgentData?.address !== data.businessAddress)
        updatedFields.address = data.businessAddress;
      if (originalAgentData?.district !== data.district)
        updatedFields.district = data.district;
      if (originalAgentData?.region !== data.region)
        updatedFields.region = data.region;
      if (originalAgentData?.latitude !== data.latitude)
        updatedFields.latitude = data.latitude;
      if (originalAgentData?.longitude !== data.longitude)
        updatedFields.longitude = data.longitude;
      if (originalAgentData?.id_type !== data.idType)
        updatedFields.id_type = data.idType;
      const newStatusValue = statusOptions.find(
        (s) => s.label === data.agentStatus
      )?.value;
      if (originalAgentData?.status !== newStatusValue)
        updatedFields.status = newStatusValue;

      if (Object.keys(updatedFields).length === 0) {
        setAlertTitle("No Changes");
        setUpdateSuccess("No changes detected to update.");
        setLoading(false);
        setUploadLoading(false);
        return;
      }

      const response = await updateAgentInfo(
        token || "",
        id || "",
        updatedFields,
        data.reason || ""
      );

      if (response.success && response.data) {
        await fetchUsers();
        setAlertTitle("Successful");
        setUpdateSuccess(
          `${data.agentType} ${data.businessName}'s info updated successfully!`
        );
        const newAgentData = response.data.agent;
        const newDefaultValues = {
          firstName: newAgentData.firstname || "",
          middleName: newAgentData.middlename || "",
          lastName: newAgentData.lastname || "",
          userName: newAgentData.username || "",
          businessName: newAgentData.business_name || "",
          businessPhone: newAgentData.business_phone || "",
          phone: newAgentData.phone || "",
          email: newAgentData.email || "",
          agentType: newAgentData.type || "",
          model: newAgentData.model || "",
          idType: newAgentData.id_type || "",
          businessAddress: newAgentData.address || "",
          district: newAgentData.district || "",
          region: newAgentData.region || "",
          latitude: newAgentData.latitude || "",
          longitude: newAgentData.longitude || "",
          idImageUrl: newAgentData.id_document || "",
          businessImageUrl: newAgentData.business_image || "",
          addressDocumentUrl: newAgentData.address_document || "",
          businessRegDocumentUrl: newAgentData.business_registration || "",
          agentStatus:
            statusOptions.find((s) => s.value === newAgentData.status)?.label ||
            "",
          reason: "",
        };
        reset(newDefaultValues);
        setOriginalAgentData(newAgentData);
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
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl m-4">
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
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="firstName"
                      placeholder="Enter first name"
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
                      {...field}
                      type="text"
                      id="lastName"
                      placeholder="Enter last name"
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
                      {...field}
                      type="text"
                      id="middleName"
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
                  name="userName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="userName"
                      placeholder="Enter username"
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
                      {...field}
                      type="text"
                      id="businessName"
                      placeholder="Enter business name"
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
                  Business Phone{" "}
                  <span className="text-error-500">(read only)</span>
                </Label>
                <Controller
                  name="businessPhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="tel"
                      id="businessPhone"
                      selectedCountries={["SL"]}
                      readOnly
                    />
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
                    <Input
                      {...field}
                      type="tel"
                      id="phone"
                      selectedCountries={["SL"]}
                      readOnly
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
                  name="agentType"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div
                        className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                          errors.agentType
                            ? "border-error-500"
                            : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                        }`}
                        onClick={() => {
                          if (loading || uploadLoading) return;
                          setIsTypeDropdownOpen(!isTypeDropdownOpen);
                        }}
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
                        isOpen={isTypeDropdownOpen}
                        onClose={() => setIsTypeDropdownOpen(false)}
                        className="w-full p-2"
                        search={false}
                      >
                        {typeOptions.map((option) => (
                          <DropdownItem
                            key={option}
                            onItemClick={() => {
                              field.onChange(option);
                              setIsTypeDropdownOpen(false);
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
                          className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                            errors.model
                              ? "border-error-500"
                              : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                          }`}
                          onClick={() => {
                            if (loading || uploadLoading) return;
                            setIsModelDropdownOpen(!isModelDropdownOpen);
                          }}
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
                          isOpen={isModelDropdownOpen}
                          onClose={() => setIsModelDropdownOpen(false)}
                          className="w-full p-2"
                          search={false}
                        >
                          {modelOptions.map((option) => (
                            <DropdownItem
                              key={option}
                              onItemClick={() => {
                                field.onChange(option);
                                setIsModelDropdownOpen(false);
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
                      {...field}
                      type="text"
                      id="businessAddress"
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
                        className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                          errors.district
                            ? "border-error-500"
                            : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                        }`}
                        onClick={() => {
                          if (loading || uploadLoading) return;
                          setIsDistrictDropdownOpen(!isDistrictDropdownOpen);
                        }}
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
                        isOpen={isDistrictDropdownOpen}
                        onClose={() => setIsDistrictDropdownOpen(false)}
                        className="w-full p-2 h-50 overflow-y-auto"
                        search={false}
                      >
                        {districtOptions.map((option) => (
                          <DropdownItem
                            key={option}
                            onItemClick={() => {
                              field.onChange(option);
                              setIsDistrictDropdownOpen(false);
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
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="latitude"
                        value={
                          !geoLoading ? field.value : "Fetching Location..."
                        }
                        disabled={geoLoading || loading || uploadLoading}
                        error={!!errors.latitude}
                        hint={errors.latitude?.message}
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
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="longitude"
                        value={
                          !geoLoading ? field.value : "Fetching Location..."
                        }
                        disabled={geoLoading || loading || uploadLoading}
                        error={!!errors.longitude}
                        hint={errors.longitude?.message}
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
                            setValue("businessImageUrl", "");
                            setBusinessImageFile(null);
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
                            setValue("addressDocumentUrl", "");
                            setAddressDocumentFile(null);
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
                  errors.businessRegDocumentUrl
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
                          setValue("businessRegDocumentUrl", "");
                          setBusinessRegDocumentFile(null);
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
                name="idType"
                control={control}
                render={({ field }) => (
                  <>
                    <div
                      className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                        errors.idType
                          ? "border-error-500"
                          : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                      }`}
                      onClick={() => {
                        if (loading || uploadLoading) return;
                        setIsIdTypeDropdownOpen(!isIdTypeDropdownOpen);
                      }}
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
                      isOpen={isIdTypeDropdownOpen}
                      onClose={() => setIsIdTypeDropdownOpen(false)}
                      className="w-full p-2"
                      search={false}
                    >
                      {idTypeOptions.map((option) => (
                        <DropdownItem
                          key={option}
                          onItemClick={() => {
                            field.onChange(option);
                            setIsIdTypeDropdownOpen(false);
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
                          setValue("idImageUrl", "");
                          setIdImageFile(null);
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
                  name="agentStatus"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div
                        className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 ${
                          errors.agentStatus
                            ? "border-error-500"
                            : "border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
                        }`}
                        onClick={() => {
                          if (loading || uploadLoading) return;
                          setIsStatusDropdownOpen(!isStatusDropdownOpen);
                        }}
                      >
                        {field.value ? (
                          <span> {field.value}</span>
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
                            onItemClick={() => {
                              field.onChange(option.label);
                              setIsStatusDropdownOpen(false);
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
