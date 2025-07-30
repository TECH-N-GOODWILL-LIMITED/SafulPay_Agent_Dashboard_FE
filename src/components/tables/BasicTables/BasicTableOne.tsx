import { useState } from "react";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
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

interface TableContentItem {
  id: number;
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
  status: string;
  temp?: number;
  kycStatus?: string;
}

interface Order {
  tableHeading?: string[];
  tableContent: TableContentItem[];
}

// Handlers type
interface Handlers {
  close: () => void;
  suspend?: () => void;
  approve?: () => void;
  reActivate?: () => void;
  reject?: () => void;
}

const BasicTableOne: React.FC<Order> = ({ tableContent, tableHeading }) => {
  const [currentUser, setCurrentUser] = useState<TableContentItem | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { isOpen, openModal, closeModal } = useModal();
  const { user, token, logout } = useAuth();
  const { fetchUsers } = useUsers();
  const { fetchMyAgents } = useMyAgents();

  const showResidualAmount = tableHeading?.includes("Residual Amount");

  const isAgent =
    currentUser?.role === AGENT_ROLE ||
    currentUser?.role === SUPER_AGENT_ROLE ||
    currentUser?.role === MERCHANT_ROLE;

  const changeStatus = async (
    user: TableContentItem,
    token: string,
    newStatus: number,
    action: string,
    reason: string
  ): Promise<boolean> => {
    setLoadingAction(action);

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

      const response = isAgent
        ? await changeAgentStatus(token, user.id, newStatus, reason)
        : await changeUserStatus(token, user.id, newStatus, reason);

      if (response.success) {
        await fetchUsers();
        await fetchMyAgents();
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
                ? "Declining..."
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
    setSelectedAction(action);
  };

  const handleSuspend = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 2, "suspend", reason)) {
      closeModal();
    }
  };

  const handleApprove = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 1, "approve", reason)) {
      closeModal();
    }
  };

  const handleReActivate = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 1, "reActivate", reason)) {
      closeModal();
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 3, "reject", reason)) {
      closeModal();
    }
  };

  const handleCloseModal = async (): Promise<void> => {
    setSelectedAction(null);
    setReason("");
    closeModal();
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
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {tableHeading?.map((tableHead) => (
                <TableCell
                  key={tableHead}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {tableHead}
                </TableCell>
              ))}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                  <TableCell className="px-5 py-4 sm:px-6 text-start  max-w-60">
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
                          {order.role === "Agent" ||
                          order.role === "Super Agent" ||
                          order.role === "Merchant"
                            ? order.businessName
                            : order.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="block font-medium text-gray-500 text-theme-sm dark:text-white/90">
                      {order.role}
                    </span>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {(order.role === AGENT_ROLE ||
                        order.role === SUPER_AGENT_ROLE ||
                        order.role === MERCHANT_ROLE) &&
                        order.model}
                    </span>
                  </TableCell>

                  {order.code && (
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.code}
                    </TableCell>
                  )}

                  {showResidualAmount && (
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      Le {order.residualAmount?.toFixed(2)}
                    </TableCell>
                  )}

                  {(order.cih || order.cih == 0) && (
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      Le {order.cih?.toFixed(2)}
                    </TableCell>
                  )}
                  {/* {!order.user.code} ||
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.user.role}
                </TableCell> */}
                  {/* <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.user.code}
                </TableCell> */}

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="block font-medium text-gray-500 text-theme-sm dark:text-white/90">
                      {(order.role === AGENT_ROLE ||
                        order.role === SUPER_AGENT_ROLE ||
                        order.role === MERCHANT_ROLE) &&
                        order.businessPhone}
                    </span>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {order.phone}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                  {order.kycStatus && (
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.kycStatus}
                    </TableCell>
                  )}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <button
                      onClick={() => handleOpenModal(order)}
                      className="hover:text-brand-500 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {canEditUser(user?.role, order) ? "View / Edit" : "View"}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  No Data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Modal
          isOpen={isOpen}
          onClose={handleCloseModal}
          className="max-w-[700px] m-4"
        >
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Personal Information
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update user status to keep their profile up-to-date.
              </p>
            </div>
            <form className="flex flex-col max-h-[65vh]">
              {selectedAction ? (
                <div className="w-full">
                  <Label>Reason for {selectedAction}</Label>
                  <TextArea
                    value={reason}
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
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAction(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedAction === "suspend") handleSuspend();
                        if (selectedAction === "approve") handleApprove();
                        if (selectedAction === "reActivate") handleReActivate();
                        if (selectedAction === "reject") handleReject();
                      }}
                      disabled={
                        !reason ||
                        reason.length < 4 ||
                        loadingAction === selectedAction
                      }
                    >
                      {loadingAction === selectedAction
                        ? `${selectedAction}...`
                        : `Confirm ${selectedAction}`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="custom-scrollbar h-full overflow-y-auto px-2 pb-3">
                  <div>
                    {isAgent ? (
                      <div className="flex flex-col gap-5">
                        {(!currentUser?.temp || currentUser?.temp === 0) && (
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
                            <Label>Full Name</Label>
                            <Input
                              type="text"
                              value={currentUser.name}
                              readOnly
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-1">
                            <Label>Business Name / Username</Label>
                            <Input
                              type="text"
                              value={`${currentUser.businessName} / ${currentUser.username}`}
                              readOnly
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-1">
                            <Label>Phone / Business Phone</Label>
                            <Input
                              type="text"
                              value={`${currentUser.phone} / ${currentUser.businessPhone}`}
                              readOnly
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-1">
                            <Label>
                              Type{" "}
                              {currentUser.role !== MERCHANT_ROLE
                                ? "/ Model"
                                : ""}
                            </Label>
                            <Input
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
                            <Label>Address</Label>
                            <Input
                              type="text"
                              value={currentUser.address}
                              readOnly
                            />
                          </div>
                          <div className="col-span-2 lg:col-span-1">
                            <Label>Latitude / Longitude</Label>
                            <Input
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
                            <Label>Business Place Image</Label>
                            {currentUser.businessImage ? (
                              <a
                                href={currentUser.businessImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 dark:text-gray-400 hover:underline"
                              >
                                Click to View Business Place Image
                              </a>
                            ) : (
                              <p className="text-brand-accent">
                                No Business Place Image
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                        <div className="col-span-2 lg:col-span-1">
                          <Label>First Name</Label>
                          <Input
                            type="text"
                            value={currentUser?.firstName || " "}
                            readOnly
                          />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                          <Label>Last Name</Label>
                          <Input
                            type="text"
                            value={currentUser?.lastName || " "}
                            readOnly
                          />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                          <Label>Email Address</Label>
                          <Input
                            type="text"
                            value={"example@email.com"}
                            readOnly
                          />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                          <Label>Phone</Label>
                          <Input
                            type="text"
                            value={currentUser?.phone || " "}
                            readOnly
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Role</Label>
                          <Input
                            type="text"
                            value={currentUser?.role || " "}
                            readOnly
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {errorMessage && (
                    <Alert
                      variant="error"
                      title={alertTitle}
                      message={errorMessage}
                      showLink={false}
                    />
                  )}

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
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BasicTableOne;
