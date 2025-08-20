import { useState } from "react";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
} from "../../../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { useAuth } from "../../../context/AuthContext";
import { useUsers } from "../../../context/UsersContext";
import { useMyAgents } from "../../../context/MyAgentsContext";
import {
  agentSignup,
  changeAgentStatus,
  changeUserStatus,
  checkSession,
} from "../../../utils/api";
import Alert from "../../ui/alert/Alert";
import TextArea from "../../form/input/TextArea";
import {
  ADMIN_ROLE,
  AGENT_ROLE,
  MARKETER_ROLE,
  MERCHANT_ROLE,
  SUPER_AGENT_ROLE,
} from "../../../utils/roles";
import { formatDateTime } from "../../../utils/utils";
import TableShimmer from "../../common/TableShimmer";
import { useAgents } from "../../../context/AgentsContext";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { useVendors } from "../../../hooks/useVendors";
import { Vendor } from "../../../types/types";

interface TableContentItem {
  id: number;
  masterId?: number;
  image?: string;
  name: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  username?: string;
  role?: string;
  model?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  idType?: string;
  idDocument?: string;
  bizRegDocument?: string;
  businessImage?: string;
  code?: string;
  cih?: number;
  residualAmount?: number;
  phone: string;
  businessPhone?: string;
  refBy?: string;
  status: string;
  temp?: number;
  kycStatus?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Order {
  tableHeading?: string[];
  tableContent: TableContentItem[];
  loading?: boolean;
  resetFilters?: () => void;
}

// Handlers type
interface Handlers {
  close: () => void;
  suspend?: () => void;
  approve?: () => void;
  reActivate?: () => void;
  reject?: () => void;
}

const BasicTableOne: React.FC<Order> = ({
  tableContent,
  tableHeading,
  loading = false,
  resetFilters,
}) => {
  const [currentUser, setCurrentUser] = useState<TableContentItem | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorError, setShowVendorError] = useState<boolean>(false);

  const {
    vendors,
    loading: vendorsLoading,
    error: vendorsError,
    refetch,
  } = useVendors();

  function toggleDropdown() {
    setIsDropdownOpen(!isDropdownOpen);
  }

  function closeDropdown() {
    setIsDropdownOpen(false);
  }

  const { isOpen, openModal, closeModal } = useModal();
  const { user, token, coreApiToken, logout } = useAuth();
  const { fetchUsers } = useUsers();
  const { fetchAgents } = useAgents();
  const { fetchMyAgents } = useMyAgents();

  const showResidualAmount = tableHeading?.includes("Residual Amount");

  const isAgent =
    currentUser?.role === AGENT_ROLE ||
    currentUser?.role === SUPER_AGENT_ROLE ||
    currentUser?.role === MERCHANT_ROLE;

  const changeStatus = async (
    user: TableContentItem,
    newStatus: number,
    action: string
  ): Promise<boolean> => {
    if (!token) {
      setAlertTitle("Authentication Error");
      setErrorMessage(
        "No valid authentication token found. Please log in again."
      );
      setLoadingAction(null);
      return false;
    }

    setLoadingAction(action);

    if (action === "approve" && !selectedVendor) {
      setShowVendorError(true);
      setLoadingAction(null);
      return false;
    }

    const sessionResponse = await checkSession(token);
    if (!sessionResponse.success || !sessionResponse.data?.status) {
      setAlertTitle("Session Expired");
      setErrorMessage("Your session has expired. You will be logged out.");
      setLoadingAction(null);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      await logout();
      return false;
    }

    setAlertTitle("");
    setErrorMessage("");
    try {
      const isAgent =
        user.role === AGENT_ROLE ||
        user.role === SUPER_AGENT_ROLE ||
        user.role === MERCHANT_ROLE;

      let response;

      if (isAgent && action === "approve" && selectedVendor && coreApiToken) {
        response = await agentSignup(
          coreApiToken, // Use agency token instead of coreApiToken
          user.id,
          selectedVendor.id,
          reason
        );
      } else if (isAgent) {
        response = await changeAgentStatus(token, user.id, newStatus, reason);
      } else {
        response = await changeUserStatus(token, user.id, newStatus, reason);
      }

      if (response.success) {
        if (isAgent) {
          await fetchAgents({ page: 1, per_page: 10 });
        } else {
          await fetchUsers({ page: 1, per_page: 10 });
        }

        await fetchMyAgents();
        resetFilters?.();
        return true;
      } else {
        setAlertTitle("Validation Error");
        setErrorMessage(response.error || `Failed to change status`);
        return false;
      }
    } catch (err) {
      setAlertTitle("Error");
      setErrorMessage(`An unexpected error occurred- ${err}`);
      return false;
    } finally {
      setLoadingAction(null);
    }
  };

  const getActionButtons = (
    status: string,
    handlers: Handlers
  ): React.ReactNode | null => {
    switch (status) {
      case "Active":
        return (
          <>
            <Button size="sm" variant="outline" onClick={handlers.close}>
              Close
            </Button>
            <Button
              size="sm"
              className="bg-brand-accent hover:bg-brand-accent-100"
              onClick={() => handleActionClick("suspend")}
              disabled={loadingAction === "suspend"}
            >
              {loadingAction === "suspend"
                ? "Suspending..."
                : `Suspend ${currentUser?.role}`}
            </Button>
          </>
        );
      case "Pending":
        return (
          <>
            <Button
              size="sm"
              variant={
                !currentUser?.businessImage ||
                !currentUser?.bizRegDocument ||
                !currentUser.idDocument
                  ? "primary"
                  : "outline"
              }
              className="bg-brand-accent hover:bg-brand-accent-100! hover:text-white"
              onClick={() => handleActionClick("reject")}
              disabled={loadingAction === "reject"}
            >
              {loadingAction === "reject"
                ? "Rejecting..."
                : "Reject Application"}
            </Button>
            <Button
              size="sm"
              variant={
                !currentUser?.businessImage ||
                !currentUser?.bizRegDocument ||
                !currentUser.idDocument
                  ? "outline"
                  : "primary"
              }
              className="hover:bg-brand-600! hover:text-white"
              onClick={() => handleActionClick("approve")}
              disabled={loadingAction === "approve"}
            >
              {loadingAction === "approve"
                ? "Approving..."
                : `Approve Application`}
            </Button>
          </>
        );

      default:
        return (
          <>
            <Button size="sm" variant="outline" onClick={handlers.close}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => handleActionClick("reActivate")}
              disabled={loadingAction === "reActivate"}
            >
              {loadingAction === "reActivate"
                ? "Re activating..."
                : `Re-activate ${currentUser?.role}`}
            </Button>
          </>
        );
    }
  };

  const handleOpenModal = (user: TableContentItem) => {
    setCurrentUser(user);
    setAlertTitle("");
    setErrorMessage("");
    openModal();
  };

  const handleActionClick = (action: string) => {
    if (action === "approve") {
      refetch();

      if (currentUser?.masterId) {
        const currentVendor = vendors.find(
          (vendor) => vendor.id === currentUser?.masterId
        );
        setSelectedVendor(currentVendor || null);
      } else {
        setSelectedVendor(null);
      }
    }

    setSelectedAction(action);
    setShowVendorError(false); // Reset Vendor error when action changes
  };

  const isAgentRole =
    currentUser?.role === AGENT_ROLE ||
    currentUser?.role === SUPER_AGENT_ROLE ||
    currentUser?.role === MERCHANT_ROLE;

  const handleSuspend = async (): Promise<void> => {
    if (!currentUser) return;
    if (await changeStatus(currentUser, 2, "suspend")) {
      setAlertTitle("Status Change Successful!");
      setSuccessAlert(
        `${currentUser.role} ${
          isAgentRole ? currentUser.businessName : currentUser.name
        } has been suspended!`
      );
      setSelectedAction(null);
      setReason("");
      setSelectedVendor(null);
      setShowVendorError(false);
      if (!isOpen) {
        openModal();
      }
    }
  };

  const handleApprove = async (): Promise<void> => {
    if (!currentUser) return;
    if (await changeStatus(currentUser, 1, "approve")) {
      setAlertTitle("Status Change Successful!");
      setSuccessAlert(
        `${currentUser.role} ${
          isAgentRole ? currentUser.businessName : currentUser.name
        } application has been approved!`
      );
      setSelectedAction(null);
      setReason("");
      setSelectedVendor(null);
      setShowVendorError(false);
      if (!isOpen) {
        openModal();
      }
    }
  };

  const handleReActivate = async (): Promise<void> => {
    if (!currentUser) return;
    if (await changeStatus(currentUser, 1, "reActivate")) {
      setAlertTitle("Status Change Successful!");
      setSuccessAlert(
        `${currentUser.role} ${
          isAgentRole ? currentUser.businessName : currentUser.name
        } has been reactivated!`
      );
      setSelectedAction(null);
      setReason("");
      setSelectedVendor(null);
      setShowVendorError(false);
      if (!isOpen) {
        openModal();
      }
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!currentUser) return;
    if (await changeStatus(currentUser, 3, "reject")) {
      setAlertTitle("Status Change Successful!");
      setSuccessAlert(
        `${currentUser.role} ${
          isAgentRole ? currentUser.businessName : currentUser.name
        } application has been rejected!`
      );
      setSelectedAction(null);
      setReason("");
      setSelectedVendor(null);
      setShowVendorError(false);
      if (!isOpen) {
        openModal();
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedAction(null);
    setSuccessAlert("");
    setReason("");
    setSelectedVendor(null);
    setShowVendorError(false); // Reset Vendor error when modal closes
    closeModal();
  };

  const handleGoBack = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setAlertTitle("");
    setErrorMessage("");
    setSelectedAction(null);
    setSelectedVendor(null);
    setShowVendorError(false);
  };

  const canEditUser = (userRole: string | undefined, row: TableContentItem) => {
    if (userRole === ADMIN_ROLE) {
      return true;
    }
    if (userRole === MARKETER_ROLE) {
      return row.temp === 0 && row.status === "Pending";
    }
    return false;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <TableShimmer
            rows={tableContent.length || 10}
            columns={tableHeading?.length || 6}
            showAvatar={true}
            showAction={true}
          />
        ) : (
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {tableHeading?.map((tableHead) => (
                  <TableCell
                    key={tableHead}
                    isHeader
                    className="p-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {tableHead}
                  </TableCell>
                ))}
                <TableCell
                  isHeader
                  className="p-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableContent.length > 0 ? (
                tableContent.map((order) => (
                  <TableRow key={`${order.id}${order.role}`}>
                    <TableCell className="p-3 text-start max-w-60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <img
                            width={40}
                            height={40}
                            src={order?.image}
                            alt={order.name}
                          />
                        </div>
                        <div className="truncate shrink">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate">
                            {order.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400 truncate">
                            {order.role === AGENT_ROLE ||
                            order.role === SUPER_AGENT_ROLE ||
                            order.role === MERCHANT_ROLE
                              ? order.businessName
                              : order.username}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="p-3 text-start flex flex-col max-w-50">
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {(order.role === AGENT_ROLE ||
                          order.role === SUPER_AGENT_ROLE ||
                          order.role === MERCHANT_ROLE) &&
                          order.model}
                      </span>
                      <span className="block font-medium text-gray-500 text-theme-sm dark:text-white/90">
                        {order.role}
                      </span>
                    </TableCell>

                    {order.code && (
                      <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order.code}
                      </TableCell>
                    )}

                    {showResidualAmount && (
                      <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        Le {order.residualAmount?.toFixed(2)}
                      </TableCell>
                    )}

                    {(order.cih || order.cih == 0) && (
                      <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        Le {order.cih?.toFixed(2)}
                      </TableCell>
                    )}
                    {/* {!order.user.code} ||
                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.user.role}
                </TableCell> */}
                    {/* <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.user.code}
                </TableCell> */}

                    <TableCell className="p-3 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(order.role === AGENT_ROLE ||
                          order.role === SUPER_AGENT_ROLE ||
                          order.role === MERCHANT_ROLE) &&
                          order.businessPhone}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.phone}
                      </span>
                    </TableCell>

                    {order.refBy && (
                      <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order.refBy}
                      </TableCell>
                    )}

                    {order.kycStatus && (
                      <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {order.kycStatus}
                      </TableCell>
                    )}

                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          order.status === "Active"
                            ? "success"
                            : order.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>

                    {order.createdAt && (
                      <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDateTime(order.createdAt || "No date found")}
                      </TableCell>
                    )}
                    <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Button
                        endIcon={<EyeIcon />}
                        variant="outline"
                        onClick={() => handleOpenModal(order)}
                        className="hover:text-brand-500 p-2! shadow-sm"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    No Data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Modal
          isOpen={isOpen}
          onClose={handleCloseModal}
          className={`${
            successAlert || selectedAction ? "max-w-lg" : "max-w-[700px]"
          } m-4`}
        >
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            {successAlert ? (
              <div className="text-center">
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
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                  {alertTitle}
                </h4>
                <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {successAlert}
                </p>
                <div className="flex items-center justify-center w-full gap-3 mt-8">
                  <Button
                    onClick={() => {
                      handleCloseModal();
                    }}
                  >
                    Okay, Got it!
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-2 pr-14">
                  <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Personal Information
                  </h4>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                    Update user status to keep their profile up-to-date.
                  </p>
                </div>
                <form className="flex flex-col gap-5 max-h-[65vh]">
                  {selectedAction ? (
                    <>
                      {selectedAction === "approve" && (
                        <div className="relative">
                          {errorMessage && (
                            <Alert
                              variant="error"
                              title={alertTitle}
                              message={errorMessage}
                              showLink={false}
                            />
                          )}

                          {vendorsError && (
                            <Alert
                              variant="error"
                              title="Error Fetching Vendor list"
                              message={vendorsError}
                            />
                          )}
                          <Label htmlFor="vendor-button" className="mt-2">
                            Attach a Vendor
                          </Label>
                          <Button
                            id="vendor-button"
                            type="button"
                            onClick={toggleDropdown}
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
                                isDropdownOpen && "rotate-180"
                              }`}
                            />
                          </Button>
                          <Dropdown
                            isOpen={isDropdownOpen}
                            onClose={closeDropdown}
                            className="w-full p-2"
                          >
                            {vendorsLoading ? (
                              <DropdownItem
                                onItemClick={closeDropdown}
                                className="flex w-full font-normal text-left text-gray-400 rounded-lg py-2"
                              >
                                Loading vendors...
                              </DropdownItem>
                            ) : vendorsError ? (
                              <DropdownItem
                                onItemClick={closeDropdown}
                                className="flex justify-between py-1 w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              >
                                No Vendors found
                                <span className="text-brand-accent">
                                  {vendorsError && `  ${vendorsError}`}
                                </span>
                              </DropdownItem>
                            ) : vendors.length === 0 ? (
                              <DropdownItem
                                onItemClick={closeDropdown}
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
                                    closeDropdown();
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
                          {showVendorError &&
                            !selectedVendor &&
                            (selectedAction === "approve" ||
                              selectedAction === "reActivate") && (
                              <p className="mt-1 text-sm text-red-500">
                                Please select a vendor to continue
                              </p>
                            )}
                        </div>
                      )}

                      <div className="w-full">
                        <Label htmlFor="action-reason">
                          Reason for {selectedAction}
                        </Label>
                        <TextArea
                          id="action-reason"
                          value={reason || ""}
                          onChange={setReason}
                          placeholder={`Enter reason for ${selectedAction}...`}
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

                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleGoBack(e)}
                          >
                            Go Back
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (selectedAction === "suspend") handleSuspend();
                              if (selectedAction === "approve") handleApprove();
                              if (selectedAction === "reActivate")
                                handleReActivate();
                              if (selectedAction === "reject") handleReject();
                            }}
                            disabled={
                              !reason ||
                              reason.length < 4 ||
                              loadingAction === selectedAction ||
                              (selectedAction === "approve" && !selectedVendor)
                            }
                          >
                            {loadingAction === selectedAction
                              ? `${selectedAction}...`
                              : `Confirm ${selectedAction}`}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="custom-scrollbar h-full overflow-y-auto px-2 pb-3">
                      <div>
                        {isAgent ? (
                          <div className="flex flex-col gap-5">
                            {(canEditUser("Marketer", currentUser) ||
                              (user?.role === "Admin" &&
                                currentUser.temp === 0)) && (
                              <Alert
                                variant="warning"
                                title="Incomplete Agent Information"
                                message="This agent has incomplete credentials. Please update their profile."
                                showLink={true}
                                linkText={`Update ${currentUser.role} Info`}
                                linkHref={`/editagent/${currentUser.id}`}
                              />
                            )}

                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                              <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input
                                  id="full-name"
                                  type="text"
                                  value={currentUser.name}
                                  readOnly
                                />
                              </div>

                              <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="business-name">
                                  Business Name / Username
                                </Label>
                                <Input
                                  id="business-name"
                                  type="text"
                                  value={`${currentUser.businessName} / ${currentUser.username}`}
                                  readOnly
                                />
                              </div>

                              <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="phone-business-phone">
                                  Phone / Business Phone
                                </Label>
                                <Input
                                  id="phone-business-phone"
                                  type="text"
                                  value={`${currentUser.phone} / ${currentUser.businessPhone}`}
                                  readOnly
                                />
                              </div>

                              <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="type-model">
                                  Type{" "}
                                  {currentUser.role !== MARKETER_ROLE
                                    ? "/ Model"
                                    : ""}
                                </Label>
                                <Input
                                  id="type-model"
                                  type="text"
                                  value={`${currentUser.role} ${
                                    currentUser.role !== MERCHANT_ROLE
                                      ? `/ ${currentUser.model} model`
                                      : ""
                                  }`}
                                  readOnly
                                />
                              </div>

                              <div className="col-span-2">
                                <Label htmlFor="agent-address">Address</Label>
                                <Input
                                  id="agent-address"
                                  type="text"
                                  value={currentUser.address}
                                  readOnly
                                />
                              </div>

                              <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="lat-lng">
                                  Latitude / Longitude
                                </Label>
                                <Input
                                  id="lat-lng"
                                  type="text"
                                  value={`${currentUser.latitude} / ${currentUser.longitude}`}
                                  readOnly
                                />
                              </div>

                              <div className="col-span-2 lg:col-span-1 truncate">
                                <Label>ID Document</Label>
                                {currentUser.idDocument ? (
                                  <a
                                    href={currentUser.idDocument}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-500 dark:text-gray-400 hover:underline"
                                  >
                                    Click to view {currentUser.idType} document
                                  </a>
                                ) : (
                                  <p className="text-brand-accent">
                                    No ID Document
                                  </p>
                                )}
                              </div>

                              <div className="col-span-2 lg:col-span-1 truncate">
                                <Label>Registration Document</Label>
                                {currentUser.bizRegDocument ? (
                                  <a
                                    href={currentUser.bizRegDocument}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-500 dark:text-gray-400 hover:underline"
                                  >
                                    Click to view registration document
                                  </a>
                                ) : (
                                  <p className="text-brand-accent">
                                    No Registration Document
                                  </p>
                                )}
                              </div>

                              <div className="col-span-2 lg:col-span-1 truncate">
                                <Label htmlFor="business-image">
                                  Business Place Image
                                </Label>
                                {currentUser.businessImage ? (
                                  <a
                                    id="business-image"
                                    href={currentUser.businessImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-500 dark:text-gray-400 hover:underline"
                                  >
                                    Click to View Business Place Image
                                  </a>
                                ) : (
                                  <p
                                    id="business-image"
                                    className="text-brand-accent"
                                  >
                                    No Business Place Image
                                  </p>
                                )}
                              </div>

                              <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="date-registered">
                                  Date Registered
                                </Label>
                                <Input
                                  id="date-registered"
                                  type="text"
                                  value={formatDateTime(
                                    currentUser.createdAt || "No date found"
                                  )}
                                  readOnly
                                />
                              </div>

                              <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="date-modified">
                                  Date Modified
                                </Label>
                                <Input
                                  id="date-modified"
                                  type="text"
                                  value={formatDateTime(
                                    currentUser.updatedAt || ""
                                  )}
                                  readOnly
                                />
                              </div>

                              {currentUser.status === "Rejected" && (
                                <div className="col-span-2">
                                  <Label htmlFor="rejection-reason">
                                    Reason for rejection
                                  </Label>
                                  <TextArea
                                    id="rejection-reason"
                                    value={currentUser.rejectionReason || ""}
                                    placeholder="No reason provided"
                                    readOnly
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                            <div className="col-span-2 lg:col-span-1">
                              <Label htmlFor="first-name">First Name</Label>
                              <Input
                                id="first-name"
                                type="text"
                                value={currentUser?.firstName || " "}
                                readOnly
                              />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                              <Label htmlFor="last-name">Last Name</Label>
                              <Input
                                id="last-name"
                                type="text"
                                value={currentUser?.lastName || " "}
                                readOnly
                              />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                              <Label htmlFor="email-address">
                                Email Address
                              </Label>
                              <Input
                                id="email-address"
                                type="text"
                                value={"example@email.com"}
                                readOnly
                              />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                type="text"
                                value={currentUser?.phone || " "}
                                readOnly
                              />
                            </div>

                            <div className="col-span-2">
                              <Label htmlFor="role">Role</Label>
                              <Input
                                id="role"
                                type="text"
                                value={currentUser?.role || " "}
                                readOnly
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {isAgent && currentUser?.temp !== 0 && (
                        <p
                          className={`text-sm mt-6 italic ${
                            currentUser.temp !== 0
                              ? "text-brand-accent dark:text-brand-accent-100"
                              : "text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          Incorrect information?{" "}
                          {canEditUser(user?.role, currentUser) ? (
                            <a
                              href={`/editagent/${currentUser?.id}`}
                              className="underline"
                            >
                              Click to update {currentUser?.role} info.
                            </a>
                          ) : (
                            <span>
                              Contact support to update {currentUser?.role} info
                            </span>
                          )}
                        </p>
                      )}
                      {user?.role === ADMIN_ROLE && (
                        <div className="flex items-center justify-end gap-3 px-2 mt-4">
                          {currentUser &&
                            getActionButtons(currentUser.status, {
                              close: closeModal,
                              suspend: handleSuspend,
                              approve: handleApprove,
                              reActivate: handleReActivate,
                              reject: handleReject,
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BasicTableOne;
