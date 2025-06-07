import { usersItem } from "../context/UsersContext";
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

export const generateUserMetrics = (users: usersItem[]) => {
  const totalUsers = users.length;

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { users: "Total Users", metric: totalUsers },
    { users: "Admins", metric: roleCounts["Admin"] || 0 },
    { users: "Marketers", metric: roleCounts["Marketer"] || 0 },
    { users: "Agents", metric: roleCounts["Agent"] || 0 },
    { users: "Accountants", metric: roleCounts["Accountant"] || 0 },
    { users: "Riders", metric: roleCounts["Rider"] || 0 },
  ];
};
