import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAllUsers } from "../../context/UsersContext";
import { registerUser } from "../../utils/api";
import { filterPhoneNumber } from "../../utils/utils";
import { ChevronDownIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { AGENT_ROLE, MERCHANT_ROLE, SUPER_AGENT_ROLE } from "../../utils/roles";

interface RegisterModalProps {
  modalHeading: string;
  desc?: string;
  className?: string;
  userRoles?: string[];
  selectRole?: string;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  modalHeading,
  desc,
  userRoles,
  selectRole,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    selectRole
  );
  const [phone, setPhone] = useState<string | undefined>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string | undefined>("");
  const [warnError, setWarnError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const { fetchUsers } = useAllUsers();

  const userOptions =
    userRoles?.filter(
      (role) =>
        role !== AGENT_ROLE &&
        role !== SUPER_AGENT_ROLE &&
        role !== MERCHANT_ROLE
    ) || [];

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setPhone(e.target.value);
    setError("");
    setWarnError(false);
  };

  const handleRoleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setSelectedRole(e.target.value);
  };

  const handleRegister = async () => {
    if (!phone || !selectedRole) {
      setAlertTitle("Fill the required field");
      setError("Input a phone number and select role");
      return;
    }

    if (!token) {
      setAlertTitle("Not authenticated");
      setError("Refresh page...");
      return;
    }

    const phoneNumber = filterPhoneNumber(phone);
    if (phoneNumber.length !== 11) {
      setAlertTitle("Invalid Phone Number Format");
      setWarnError(true);
      return;
    }

    setLoading(true);
    setError("");
    setWarnError(false);

    const response = await registerUser(token, phoneNumber, selectedRole);

    if (response.success && response.data) {
      await fetchUsers();
    } else {
      setAlertTitle("Registration Failed");
      setError(response.error || "Registration failed");
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
      {error && (
        <Alert
          variant="error"
          title={alertTitle}
          message={error}
          showLink={false}
        />
      )}
      <form
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
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
                  value={phone}
                  onChange={handlePhoneChange}
                  error={warnError}
                  selectedCountries={["SL"]}
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
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={handleRegister} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterModal;
