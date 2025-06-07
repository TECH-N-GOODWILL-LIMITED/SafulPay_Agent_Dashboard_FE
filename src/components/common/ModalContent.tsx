import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { ChevronDownIcon } from "../../icons";
import { useAllUsers } from "../../context/UsersContext";
// import { useAuth } from "../../context/AuthContext";
import { filterPhoneNumber } from "../../utils/utils";
import Alert from "../ui/alert/Alert";

interface ModalCardProps {
  modalHeading: string;
  desc?: string;
  className?: string;
  userRoles?: string[];
  selectRole?: string;
}

const ModalContent: React.FC<ModalCardProps> = ({
  modalHeading,
  desc,
  userRoles,
  selectRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    selectRole
  );
  const [phone, setPhone] = useState<string | undefined>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string | undefined>("");
  const [warnError, setWarnError] = useState<string | undefined>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { registerUser, title, error: apiError } = useAllUsers();
  // const { token } = useAuth();

  const { closeModal } = useModal();

  const userOptions = userRoles?.filter((role) => role !== "Agent");

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setPhone(e.target.value);
    setError("");
    setWarnError("");
    // setSuccessAlert("");
  };

  const handleRoleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setSelectedRole(e.target.value);
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !selectedRole) {
      setAlertTitle("Fill the required field");
      setError("Input a phone number and select role");
      return;
    }

    console.log(selectedRole);

    const phoneNumber = filterPhoneNumber(phone);
    if (phoneNumber.length !== 11) {
      setAlertTitle("Invalid Phone Number Format");
      setWarnError(" ");
      return;
    }

    const regRole = selectedRole.trim();
    console.log(regRole);

    setError("");
    setWarnError("");
    // setSuccessAlert("");
    setLoading(true);

    const response = await registerUser(phoneNumber, regRole);

    if (response.success && response.data) {
      closeModal();
    }

    setLoading(false);
  };

  return (
    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
      <div className="px-2 pr-14">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {modalHeading}
        </h4>
        {desc && (
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {desc}
          </p>
        )}
      </div>
      {/* {successAlert && (
          <Alert
            variant="success"
            title={alertTitle}
            message={successAlert}
            showLink={false}
          />
        )} */}

      {warnError && (
        <Alert variant="warning" title={alertTitle} showLink={false}>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Phone number must be a Sierra Leone line</p>
            <p>Ensure to type number in this format.</p>
            <ul className="list-disc mt-2 ml-4">
              <li>23230249005</li>
              <li>30249005</li>
              <li>030249005</li>
            </ul>
          </div>
        </Alert>
      )}

      {(apiError || error) && (
        <Alert
          variant={"error"}
          title={title ? title : alertTitle}
          message={apiError ? apiError : error}
          showLink={false}
        />
      )}
      <form className="flex flex-col">
        <div className="custom-scrollbar h-full overflow-y-auto px-2 pb-3">
          <div className="">
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Enter Information
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>
                  Phone <span className="text-error-500 ml-2">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number (e.g., 23298765432)"
                  value={phone}
                  onChange={handlePhoneChange}
                />
              </div>

              <div className="relative col-span-2 lg:col-span-1">
                <Label>
                  Role<span className="text-error-500 ml-2">*</span>
                </Label>
                <Input
                  type="select"
                  selectOptions={userOptions}
                  value={selectedRole}
                  onChange={handleRoleChange}
                />
                <ChevronDownIcon className="absolute bottom-1/5 right-3 text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Close
          </Button>
          <Button size="sm" onClick={(e) => handleRegisterUser(e)}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ModalContent;
