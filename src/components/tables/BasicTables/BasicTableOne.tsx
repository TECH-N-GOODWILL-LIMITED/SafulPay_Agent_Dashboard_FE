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
import { useAllUsers } from "../../../context/UsersContext";
import {
  changeAgentStatus,
  changeUserStatus,
  checkSession,
} from "../../../utils/api";
import Alert from "../../ui/alert/Alert";

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
  save?: () => void;
}

const BasicTableOne: React.FC<Order> = ({ tableContent, tableHeading }) => {
  const [currentUser, setCurrentUser] = useState<TableContentItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [alertTitle, setAlertTitle] = useState<string>("");

  const { isOpen, openModal, closeModal } = useModal();
  const { token, logout } = useAuth();
  const { fetchUsers } = useAllUsers();

  const showResidualAmount = tableHeading?.includes("Residual Amount");

  const changeStatus = async (
    user: TableContentItem,
    token: string,
    newStatus: number
  ): Promise<boolean> => {
    setIsActionLoading(true);

    const sessionResponse = await checkSession(token);
    if (!sessionResponse.success || !sessionResponse.data?.status) {
      setAlertTitle("Session Expired");
      setErrorMessage("Your session has expired. You will be logged out.");
      setIsActionLoading(false);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      await logout();
      return false;
    }

    setAlertTitle("");
    setErrorMessage("");
    try {
      const isAgent = user.role === "Agent" || user.role === "Merchant";
      const response = isAgent
        ? await changeAgentStatus(token, user.id, newStatus)
        : await changeUserStatus(token, user.id, newStatus);

      if (response.success) {
        await fetchUsers();
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
      setIsActionLoading(false);
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
              onClick={handlers.suspend}
              disabled={isActionLoading}
            >
              {isActionLoading
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
              onClick={handlers.reject}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Declining..." : "Reject Application"}
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
              onClick={handlers.approve}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Approving..." : `Approve Application`}
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
              onClick={handlers.reActivate}
              disabled={isActionLoading}
            >
              {isActionLoading
                ? "Reactivating..."
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

  const handleSave = (): void => {
    console.log("Saving changes...");
    closeModal();
  };

  const handleSuspend = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 2)) {
      closeModal();
    }
  };

  const handleApprove = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 1)) {
      closeModal();
    }
  };

  const handleReActivate = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 1)) {
      closeModal();
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 3)) {
      closeModal();
    }
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
                  <TableCell className="px-5 py-4 sm:px-6 text-start truncate">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={order?.image}
                          alt={order.name}
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {order.role === "Agent" || order.role === "Merchant"
                            ? order.businessName
                            : order.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.role}
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

                  {order.cih && (
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {`Le ${order.cih}`}
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
                    {order.phone}
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
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <button
                      onClick={() => handleOpenModal(order)}
                      className="hover:text-brand-500 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Edit
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
          onClose={closeModal}
          className="max-w-[700px] m-4"
        >
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Personal Information
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update user details to keep their profile up-to-date.
              </p>
            </div>
            <form className="flex flex-col max-h-[64vh]">
              <div className="custom-scrollbar h-full overflow-y-auto px-2 pb-3">
                <div className="">
                  {currentUser?.role === "Agent" ||
                  currentUser?.role === "Merchant" ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                      <div className="col-span-2 lg:col-span-1">
                        <Label>Full Name</Label>
                        <Input type="text" value={currentUser.name} readOnly />
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
                        <Label>Role / Model</Label>
                        <Input
                          type="text"
                          value={`${currentUser.role} ${
                            currentUser.role === "Agent"
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
                            className="text-brand-500 hover:underline"
                          >
                            Click to view {currentUser.idType} document
                          </a>
                        ) : (
                          <p className="text-brand-accent">No ID Document</p>
                        )}
                      </div>

                      <div className="col-span-2 lg:col-span-1 truncate">
                        <Label>Registration Document</Label>
                        {currentUser.bizRegDocument ? (
                          <a
                            href={currentUser.bizRegDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:underline"
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
                            className="text-brand-500 hover:underline"
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
              </div>
              {errorMessage && (
                <Alert
                  variant="error"
                  title={alertTitle}
                  message={errorMessage}
                  showLink={false}
                />
              )}
              <div className="flex items-center gap-3 px-2 mt-6">
                {currentUser &&
                  getActionButtons(currentUser.status, {
                    close: closeModal,
                    suspend: handleSuspend,
                    approve: handleApprove,
                    reActivate: handleReActivate,
                    reject: handleReject,
                    save: handleSave,
                  })}
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BasicTableOne;
