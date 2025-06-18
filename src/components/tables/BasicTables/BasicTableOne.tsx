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
import { changeAgentStatus, changeUserStatus } from "../../../utils/api";

interface User {
  id: number;
  image?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  role?: string;
  code?: string;
  cih?: number;
  residualAmount?: number;
  phone: string;
  status: string;
}

interface TableContentItem {
  user: User;
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
  decline?: () => void;
  save?: () => void;
}

const BasicTableOne: React.FC<Order> = ({ tableContent, tableHeading }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { isOpen, openModal, closeModal } = useModal();
  const { token } = useAuth();
  const { fetchUsers } = useAllUsers();

  const showResidualAmount = tableHeading?.includes("Residual Amount");

  const changeStatus = async (
    user: User,
    token: string,
    newStatus: number
  ): Promise<boolean> => {
    setIsActionLoading(true);
    setErrorMessage("");
    try {
      const isAgent = user.role === "Agent";
      const response = isAgent
        ? await changeAgentStatus(token, user.id, newStatus)
        : await changeUserStatus(token, user.id, newStatus);

      if (response.success) {
        await fetchUsers();
        return true;
      } else {
        setErrorMessage(response.error || `Failed to change status`);
        console.error("Failed to change status:", response.error);
        return false;
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      console.error("Error changing status:", err);
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
              {isActionLoading ? "Suspending..." : "Suspend"}
            </Button>
          </>
        );
      case "Pending":
        return (
          <>
            <Button
              size="sm"
              className="bg-brand-accent"
              onClick={handlers.decline}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Declining..." : "Decline"}
            </Button>
            <Button
              size="sm"
              onClick={handlers.approve}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Approving..." : "Approve"}
            </Button>
          </>
        );
      case "Suspended":
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
              {isActionLoading ? "Reactivating..." : "Re-activate"}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const handleOpenModal = (user: User) => {
    setCurrentUser(user);
    setErrorMessage("");
    openModal();
  };

  const handleSave = (): void => {
    console.log("Saving changes...");
    closeModal();
  };

  const handleSuspend = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 3)) {
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

  const handleDecline = async (): Promise<void> => {
    if (!currentUser || !token) return;
    if (await changeStatus(currentUser, token, 4)) {
      // Assuming 4 not sure about this, just added this just in case, cc @yero
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
                <TableRow key={`${order.user.id}${order.user.role}`}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={order.user?.image}
                          alt={order.user.name}
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.user.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {order.user.businessName}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.user.role}
                  </TableCell>

                  {order.user.code && (
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.user.code}
                    </TableCell>
                  )}

                  {showResidualAmount && (
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      Le {order.user.residualAmount?.toFixed(2)}
                    </TableCell>
                  )}

                  {order.user.cih && (
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {`Le ${order.user.cih}`}
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
                    {order.user.phone}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        order.user.status === "Active"
                          ? "success"
                          : order.user.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <button
                      onClick={() => handleOpenModal(order.user)}
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
                Edit Personal Information
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update your details to keep your profile up-to-date.
              </p>
            </div>
            <form className="flex flex-col">
              <div className="custom-scrollbar h-full overflow-y-auto px-2 pb-3">
                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Personal Information
                  </h5>

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
                      <Input type="text" value={"example@email.com"} readOnly />
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
                </div>
              </div>
              {errorMessage && (
                <p className="px-2 text-sm text-error-500">{errorMessage}</p>
              )}
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                {currentUser &&
                  getActionButtons(currentUser.status, {
                    close: closeModal,
                    suspend: handleSuspend,
                    approve: handleApprove,
                    reActivate: handleReActivate,
                    decline: handleDecline,
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
