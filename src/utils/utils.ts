import type { countryType } from "../types/types";

export function filterPhoneNumber(phoneNumber: string) {
  // Remove all whitespace characters
  let number = phoneNumber.replace(/\s+/g, "").trim();

  // Check if number already starts with '232' and is 11 characters long
  if (number.startsWith("232") && number.length === 11) {
    return number;
  }

  // Handle numbers starting with '+232'
  if (number.startsWith("+232")) {
    // Remove the '+' sign
    number = number.substring(1);
  }
  // Handle numbers starting with '0' only if length is 9
  else if (number.startsWith("0") && number.length === 9) {
    number = "232" + number.substring(1);
  }
  // Handle numbers not starting with '232'
  else if (!number.startsWith("232")) {
    number = "232" + number;
  }

  return number;
}

export const formatPhoneNumber = (number: string, country: countryType) => {
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

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper function to validate date format (YYYY-MM-DD)
export const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return (
    !isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().split("T")[0] === date
  );
};

// Helper function to validate date range
export const validateDateRange = (start: string, end: string): string => {
  if (!start || !end) return ""; // Allow empty dates

  if (!isValidDateFormat(start) || !isValidDateFormat(end)) {
    return "Please enter valid dates in YYYY-MM-DD format";
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today

  if (startDate > today || endDate > today) {
    return "Date cannot be greater than today";
  }

  if (startDate > endDate) {
    return "Start date cannot be greater than end date";
  }

  return "";
};
