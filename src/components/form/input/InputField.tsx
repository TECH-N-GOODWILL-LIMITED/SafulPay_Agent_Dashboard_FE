import type React from "react";
import type { FC } from "react";
import { useState } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { countries } from "../../../utils/countries";

interface InputProps {
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "time"
    | "tel"
    | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  select?: boolean;
  userRoles?: string[];
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value = "",
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  select = false,
  userRoles = ["Admin", "Agents", "Marketer", "Rider", "Accountant"],
}) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const rawNumber =
    typeof value === "string" && value.startsWith(selectedCountry.dialCode)
      ? value.slice(selectedCountry.dialCode.length).replace(/\D/g, "")
      : typeof value === "string"
      ? value.replace(/\D/g, "")
      : "";

  const formatPhoneNumber = (
    number: string,
    country: (typeof countries)[0]
  ) => {
    const digits = number.replace(/\D/g, "").slice(0, country.limitNumber);
    if (!digits) return "";

    const example = country.example.slice(country.dialCode.length).trim();
    let formatted = "";
    let digitIndex = 0;

    for (let i = 0; i < example.length && digitIndex < digits.length; i++) {
      if (/\d/.test(example[i])) {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += example[i];
      }
    }

    while (digitIndex < digits.length) {
      formatted += digits[digitIndex];
      digitIndex++;
    }

    return formatted.slice(0, example.length);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
      .replace(/\D/g, "")
      .slice(0, selectedCountry.limitNumber);
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: `${selectedCountry.dialCode}${input}` },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearch("");
    if (onChange) {
      const syntheticEvent = {
        target: { value: `${country.dialCode}${rawNumber}` },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.dialCode.includes(search)
  );

  let inputClasses = `h-11 w-[100%] rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative w-[100%]">
      {type === "tel" ? (
        <div className="relative w-full">
          <div className="flex w-full">
            <button
              type="button"
              onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
              className={`dropdown-toggle flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 bg-white border border-r-0 border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 w-[fit-content] h-11 ${
                disabled ? "opacity-40 cursor-not-allowed" : ""
              }`}
              disabled={disabled}
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
            <input
              type="tel"
              id={id}
              name={name}
              placeholder={placeholder}
              value={formatPhoneNumber(rawNumber, selectedCountry)}
              onChange={handlePhoneInputChange}
              disabled={disabled}
              className={`${inputClasses} rounded-l-none flex-1`}
            />
          </div>
          <Dropdown
            isOpen={isDropdownOpen}
            onClose={() => {
              setIsDropdownOpen(false);
              setSearch("");
            }}
            className="w-full mt-1"
            search={true}
            onSearchChange={setSearch}
            searchValue={search}
            searchPlaceholder="Search country or code..."
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <DropdownItem
                  key={country.code}
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
                </DropdownItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No countries found
              </div>
            )}
          </Dropdown>
        </div>
      ) : select ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="" disabled>
            Select role
          </option>
          {userRoles.map((role) => (
            <option
              key={role}
              value={role}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              {role}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
        />
      )}

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
