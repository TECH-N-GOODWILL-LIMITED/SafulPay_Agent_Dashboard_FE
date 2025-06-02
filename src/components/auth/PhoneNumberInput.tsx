import React, { useEffect, useRef, useState } from "react";
import { countries } from "../../utils/countries";
import Input from "../form/input/InputField";

interface PhoneInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PhoneNumberInput: React.FC<PhoneInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Enter phone number",
}) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawNumber = value.startsWith(selectedCountry.dialCode)
    ? value.slice(selectedCountry.dialCode.length).replace(/\D/g, "")
    : value.replace(/\D/g, "");

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const input = e.target.value
      .replace(/\D/g, "")
      .slice(0, selectedCountry.limitNumber);
    formatPhoneNumber(input, selectedCountry);
    onChange(`${selectedCountry.dialCode}${input}`);
  };

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearch("");
    formatPhoneNumber(rawNumber, country);
    onChange(`${country.dialCode}${rawNumber}`);
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.dialCode.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex w-full">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
          value={formatPhoneNumber(rawNumber, selectedCountry)}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="rounded-l-none flex-1"
        />
      </div>
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 dark:bg-gray-800 dark:border-gray-700">
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
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;
