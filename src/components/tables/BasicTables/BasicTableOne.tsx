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
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";

interface User {
  image: string;
  name: string;
  businessName?: string;
  role?: string;
  code?: string;
  cih?: number;
  phone: string;
  status: string;
}

interface TableContentItem {
  id: number;
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
  save?: () => void;
}

const BasicTableOne: React.FC<Order> = ({ tableContent, tableHeading }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

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
              className="bg-error-500"
              onClick={handlers.suspend}
            >
              Suspend
            </Button>
            <Button size="sm" onClick={handlers.save}>
              Save Changes
            </Button>
          </>
        );
      case "Pending":
        return (
          <>
            <Button size="sm" variant="outline" onClick={handlers.close}>
              Decline
            </Button>
            <Button size="sm" onClick={handlers.approve}>
              Approve
            </Button>
          </>
        );
      case "Suspended":
        return (
          <>
            <Button size="sm" variant="outline" onClick={handlers.close}>
              Close
            </Button>
            <Button size="sm" onClick={handlers.reActivate}>
              Re-activate
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const handleOpenModal = (user: User) => {
    setCurrentUser(user);
    openModal();
  };

  const handleSave = (): void => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  const handleSuspend = (): void => {
    // Suspend logic
    console.log("Suspending user...");
    closeModal();
  };

  const handleApprove = (): void => {
    // Approve logic
    console.log("Approving changes...");
    closeModal();
  };

  const handleReActivate = (): void => {
    // Re-activate logic
    console.log("Reactivating user...");
    closeModal();
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
            {tableContent.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={order.user.image}
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
                  {order.user.code ? order.user.code : order.user.role}
                  {order.user.cih && `Le ${order.user.cih}`}
                </TableCell>
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
                              <Input type="text" value="Musharof" />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                              <Label>Last Name</Label>
                              <Input type="text" value="Chowdhury" />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                              <Label>Email Address</Label>
                              <Input type="text" value="randomuser@pimjo.com" />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                              <Label>Phone</Label>
                              <Input type="text" value="+09 363 398 46" />
                            </div>

                            <div className="col-span-2">
                              <Label>Bio</Label>
                              <Input type="text" value="Team Manager" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        {currentUser &&
                          getActionButtons(currentUser.status, {
                            close: closeModal,
                            suspend: handleSuspend,
                            approve: handleApprove,
                            reActivate: handleReActivate,
                            save: handleSave,
                          })}
                      </div>
                    </form>
                  </div>
                </Modal>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BasicTableOne;
