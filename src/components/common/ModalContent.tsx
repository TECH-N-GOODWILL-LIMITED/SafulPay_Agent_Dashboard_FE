import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { ChevronDownIcon } from "../../icons";

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
  const [selectedRole, setSelectedRole] = useState(selectRole);

  const { closeModal } = useModal();

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setSelectedRole(e.target.value);
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
            Enter Information
          </p>
        )}
      </div>
      <form className="flex flex-col">
        <div className="custom-scrollbar h-full overflow-y-auto px-2 pb-3">
          <div className="">
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Enter Information
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Phone</Label>
                <Input type="text" value="+09 363 398 46" />
              </div>

              <div className="relative col-span-2 lg:col-span-1">
                <Label>Role</Label>
                <Input
                  select={true}
                  userRoles={userRoles}
                  value={selectedRole}
                  onChange={handleChange}
                />
                <ChevronDownIcon className="absolute bottom-1/5 right-3" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Close
          </Button>
          <Button size="sm" onClick={handleSave}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ModalContent;
