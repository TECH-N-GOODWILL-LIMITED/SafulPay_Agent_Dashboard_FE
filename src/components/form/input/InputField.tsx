import type React from "react";
import type { FC } from "react";
import { useState } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { countries } from "../../../utils/countries";

interface Option {
  value: string;
  label: string;
}

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
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  select?: boolean;
  options?: Option[];
  selectedCountries?: string[];
  inputMode?: "numeric" | "text" | "tel" | "email" | "url" | "none" | "search";
  pattern?: string;
  readOnly?: boolean;
  selectOptions?: string[];
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
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
  selectedCountries,
  inputMode,
  pattern,
  readOnly = false,
  selectOptions,
  onBlur,
}) => {
  const availableCountries = selectedCountries
    ? countries.filter((c) => selectedCountries.includes(c.code))
    : countries;
  const [selectedCountry, setSelectedCountry] = useState(
    availableCountries[0] || countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const showSearch = availableCountries.length > 6;
  const isSingleCountry = availableCountries.length === 1;

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

    const example =
      country.example?.slice(country.dialCode.length).trim() || "";
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

    while (
      digitIndex < digits.length &&
      formatted.length < country.limitNumber
    ) {
      formatted += digits[digitIndex];
      digitIndex++;
    }

    return formatted;
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

  const filteredCountries = availableCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.dialCode.includes(search)
  );

  // Dynamic placeholder based on country example
  const phonePlaceholder =
    placeholder ||
    `e.g., ${
      selectedCountry.example?.slice(selectedCountry.dialCode.length).trim() ||
      "77123456"
    }`;

  let inputClasses = `h-11 w-[100%] rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled || (select && readOnly)) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
  } else if (readOnly && !select) {
    inputClasses += ` text-gray-700 border-gray-300 bg-gray-50 cursor-default dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700`;
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
            <div
              className={`flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 bg-white border border-r-0 border-gray-300 rounded-l-lg shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 w-[fit-content] h-11 ${
                disabled || readOnly || isSingleCountry
                  ? "opacity-40 cursor-not-allowed"
                  : ""
              }`}
            >
              <img
                src={selectedCountry.flag}
                alt={`${selectedCountry.name} flag`}
                className="w-5 h-3 object-contain"
              />
              <span>{selectedCountry.dialCode}</span>
              {!isSingleCountry && (
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
              )}
            </div>
            <input
              type="tel"
              id={id}
              name={name}
              placeholder={phonePlaceholder}
              value={formatPhoneNumber(rawNumber, selectedCountry)}
              onChange={handlePhoneInputChange}
              onBlur={onBlur}
              disabled={disabled}
              readOnly={readOnly}
              className={`${inputClasses} rounded-l-none flex-1`}
              inputMode={inputMode}
              pattern={pattern}
            />
          </div>
          {!isSingleCountry && (
            <Dropdown
              isOpen={isDropdownOpen}
              onClose={() => {
                setIsDropdownOpen(false);
                setSearch("");
              }}
              className="w-full mt-1"
              search={showSearch}
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
          )}
        </div>
      ) : type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`cursor-pointer ${inputClasses}`}
        >
          <option value="" disabled>
            {placeholder || "Select option"}
          </option>
          {selectOptions?.map((option) => (
            <option
              key={option}
              value={option}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              {option}
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
          onBlur={onBlur}
          min={min != null ? String(min) : undefined}
          max={max != null ? String(max) : undefined}
          step={step != null ? String(step) : undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClasses}
          inputMode={inputMode}
          pattern={pattern}
        />
      )}

      {hint && (
        <p
          className={`mt-0.5 text-xs text-right pr-2 ${
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
