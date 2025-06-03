import { useState, type FC } from "react";
import { roles } from "../../../utils/roles";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
// import { countries } from "../../../utils/countries";

interface InputProps {
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "time"
    | "tel"
    | "select"
    | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  selectOptions?: string[];
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  selectOptions = roles,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  let inputClasses = ` h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
  } else if (error) {
    inputClasses += `  border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += `  border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800`;
  }

  function toggleDropdown() {
    setIsDropdownOpen(!isDropdownOpen);
  }

  function closeDropdown() {
    setIsDropdownOpen(false);
  }

  return (
    <div className="relative">
      {type !== "select" ? (
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          minLength={min}
          maxLength={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
        />
      ) : (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`cursor-pointer ${inputClasses}`}
        >
          <option value="" disabled>
            Select role
          </option>
          {selectOptions.map((option) => (
            <option
              key={option}
              value={option}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              {option}
            </option>
          ))}
        </select>
      )}

      {/* {type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`cursor-pointer ${inputClasses}`}
        >
          <option value="" disabled>
            Select role
          </option>
          {selectOptions.map((option) => (
            <option
              key={option}
              value={option}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              {option}
            </option>
          ))}
        </select>
      ) : type === "tel" ? (
        <div className="relative w-full">
          <div className="flex w-full">
            <button
              type="button"
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-r-0 border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 w-[130px]"
            >
              <img
                src={selectedCountry.flag}
                alt={`${selectedCountry.name} flag`}
                className="w-5 h-3 object-contain"
              />
              <span>{selectedCountry.dialCode}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <Input
              type="tel"
              id={id}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="rounded-l-none flex-1"
            />
          </div>
          <Dropdown
            isOpen={isDropdownOpen}
            onClose={closeDropdown}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <img
                        src={country.flag}
                        alt={`${country.name} flag`}
                        className="w-5 h-3 object-contain mr-2"
                      />
                      <span>{country.name}</span>
                      <span className="ml-auto">{country.dialCode}</span>
                    </button>
                  </DropdownItem>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No countries found
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          minLength={min}
          maxLength={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
        />
      )} */}

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
