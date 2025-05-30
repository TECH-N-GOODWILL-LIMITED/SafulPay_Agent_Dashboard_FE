import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";

// import { requestOtp, verifyOtp } from "../../utils/api";
import { filterPhoneNumber } from "../../utils/utils";
import { countries } from "../../utils/countries";
import type { countryType } from "../../utils/countries";

interface PhoneInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Enter phone number",
}) => {
  const [selectedCountry, setSelectedCountry] = useState<countryType>(
    countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawNumber = value.startsWith(selectedCountry?.dialCode)
    ? value.slice(selectedCountry?.dialCode.length).replace(/\D/g, "")
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

export default function SignInForm() {
  const [showPin, setShowPin] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [error, setError] = useState("");
  const [warnError, setWarnError] = useState<React.ReactNode | string>(null);
  const [successAlert, setSuccessAlert] = useState("");
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !pin) {
      setAlertTitle("Please fill in your Phone number and PIN.");
      setWarnError(" ");
      return;
    }

    const phoneNumber = filterPhoneNumber(phone);
    if (phoneNumber.length !== 11) {
      setAlertTitle("Invalid Phone Number Format");
      setWarnError(" ");
      return;
    }

    setError("");
    setWarnError("");
    setSuccessAlert("");
    setLoading(true);
    setPhone(phoneNumber);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      recipient: phoneNumber,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch("/api/v1/auth/send-otp", requestOptions);

      const data = await response.json();

      if (data.status) {
        setShowOtpStep(true);
        setSessionToken(data.otp_id);
        setAlertTitle("OTP Sent");
        setSuccessAlert(data.message);
      } else {
        setAlertTitle("Authentication Failed");
        setError(data.message || "Invalid phone number or PIN.");
        setSuccessAlert("");
      }
    } catch (err) {
      setAlertTitle("Authentication Failed");
      setError(`Error requesting OTP. Please try again. - ${err}`);
      setSuccessAlert("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setSuccessAlert("");
      setAlertTitle("Please enter a valid OTP.");
      setError("Check your phone for OTP");
      return;
    }

    setError("");
    setWarnError("");
    setSuccessAlert("");
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      login: phone,
      pin: pin,
      otp_code: otp,
      otp_id: sessionToken,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://test.techengood.com/api/auth/login",
        requestOptions
      );

      const data = await response.json();

      if (data.status) {
        setAlertTitle("Sign in successful");
        setSuccessAlert(data.message);
        navigate("/");
      } else {
        setAlertTitle("OTP Verification Failed");
        setError(`Error verifying OTP. Please try again. - ${data?.message}`);
      }
    } catch (err) {
      setAlertTitle("OTP Verification Failed");
      setError(`Error verifying OTP. Please try again. - ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-2 justify-center flex-1 w-full max-w-md mx-auto">
        {successAlert && (
          <Alert
            variant="success"
            title={alertTitle}
            message={successAlert}
            showLink={false}
          />
        )}
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
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
          </div>
          <div>
            {!showOtpStep ? (
              <form onSubmit={handleRequestOtp}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Phone Number <span className="text-error-500">*</span>
                    </Label>
                    {/* <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter phone number (e.g., +1234567890)"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError("");
                        setWarnError("");
                        setSuccessAlert("");
                      }}
                    /> */}
                    <PhoneInput
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(value) => {
                        setPhone(value);
                        setError("");
                      }}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label>
                      PIN <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPin ? "text" : "password"}
                        id="pin"
                        name="pin"
                        placeholder="Enter your PIN"
                        max={6}
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value);
                          setError("");
                          setWarnError("");
                          setSuccessAlert("");
                        }}
                      />
                      <span
                        onClick={() => setShowPin(!showPin)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPin ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        Keep me logged in
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Sending OTP..." : "Request OTP"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogIn}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      OTP <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="otp"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setError("");
                        setWarnError("");
                        setSuccessAlert("");
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleRequestOtp}
                      className="text-gray-700 text-theme-sm dark:text-gray-400 hover:text-brand-600"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Verifying..." : "Sign In"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// interface PhoneInputProps {
//   id: string;
//   name: string;
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
// }

// const PhoneInput: React.FC<PhoneInputProps> = ({
//   id,
//   name,
//   value,
//   onChange,
//   placeholder = "Enter phone number",
// }) => {
//   const [selectedCountry, setSelectedCountry] = useState<countryType>(
//     countries[0]
//   );
//   const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
//   const [search, setSearch] = useState<string>("");
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const rawNumber = value.startsWith(selectedCountry?.dialCode)
//     ? value.slice(selectedCountry?.dialCode.length).replace(/\D/g, "")
//     : value.replace(/\D/g, "");

//   const formatPhoneNumber = (
//     number: string,
//     country: (typeof countries)[0]
//   ) => {
//     const digits = number.replace(/\D/g, "").slice(0, country.limitNumber);
//     if (!digits) return "";

//     const example = country.example.slice(country.dialCode.length).trim();
//     let formatted = "";
//     let digitIndex = 0;

//     for (let i = 0; i < example.length && digitIndex < digits.length; i++) {
//       if (/\d/.test(example[i])) {
//         formatted += digits[digitIndex];
//         digitIndex++;
//       } else {
//         formatted += example[i];
//       }
//     }

//     while (digitIndex < digits.length) {
//       formatted += digits[digitIndex];
//       digitIndex++;
//     }

//     return formatted.slice(0, example.length);
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const input = e.target.value
//       .replace(/\D/g, "")
//       .slice(0, selectedCountry.limitNumber);
//     formatPhoneNumber(input, selectedCountry);
//     onChange(`${selectedCountry.dialCode}${input}`);
//   };

//   const handleCountrySelect = (country: (typeof countries)[0]) => {
//     setSelectedCountry(country);
//     setIsDropdownOpen(false);
//     setSearch("");
//     formatPhoneNumber(rawNumber, country);
//     onChange(`${country.dialCode}${rawNumber}`);
//   };

//   const filteredCountries = countries.filter(
//     (country) =>
//       country.name.toLowerCase().includes(search.toLowerCase()) ||
//       country.dialCode.includes(search)
//   );

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsDropdownOpen(false);
//         setSearch("");
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="relative w-full" ref={dropdownRef}>
//       <div className="flex w-full">
//         <button
//           type="button"
//           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//           className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-r-0 border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 w-[130px]"
//         >
//           <img
//             src={selectedCountry.flag}
//             alt={`${selectedCountry.name} flag`}
//             className="w-5 h-3 object-contain"
//           />
//           <span>{selectedCountry.dialCode}</span>
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M19 9l-7 7-7-7"
//             />
//           </svg>
//         </button>
//         <Input
//           type="tel"
//           id={id}
//           name={name}
//           value={formatPhoneNumber(rawNumber, selectedCountry)}
//           onChange={handleInputChange}
//           placeholder={placeholder}
//           className="rounded-l-none flex-1"
//         />
//       </div>
//       {isDropdownOpen && (
//         <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 dark:bg-gray-800 dark:border-gray-700">
//           <div className="p-2 border-b border-gray-200 dark:border-gray-700">
//             <input
//               type="text"
//               placeholder="Search country or code..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
//             />
//           </div>
//           <div className="overflow-y-auto max-h-48">
//             {filteredCountries.length > 0 ? (
//               filteredCountries.map((country) => (
//                 <button
//                   key={country.code}
//                   type="button"
//                   onClick={() => handleCountrySelect(country)}
//                   className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
//                 >
//                   <img
//                     src={country.flag}
//                     alt={`${country.name} flag`}
//                     className="w-5 h-3 object-contain mr-2"
//                   />
//                   <span>{country.name}</span>
//                   <span className="ml-auto">{country.dialCode}</span>
//                 </button>
//               ))
//             ) : (
//               <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                 No countries found
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
