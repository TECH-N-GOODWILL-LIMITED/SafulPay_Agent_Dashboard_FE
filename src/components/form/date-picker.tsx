import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon, CloseIcon } from "../../icons";
import DateOption = flatpickr.Options.DateOption;
import Input from "./input/InputField";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (dates: Date[], currentDateString: string) => void;
  onClear?: () => void;
  value?: string;
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  maxDate?: Date;
  error?: boolean;
  hint?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  onClear,
  label,
  defaultDate,
  value,
  placeholder,
  maxDate,
  error,
  hint,
}: PropsType) {
  const flatpickrInstanceRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const handleDateChange = (selectedDates: Date[], dateStr: string) => {
      if (onChangeRef.current) {
        onChangeRef.current(selectedDates, dateStr);
      }
    };

    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange: handleDateChange,
      maxDate: maxDate || new Date(),
      disable: [
        function (date) {
          return date > (maxDate || new Date());
        },
      ],
    });

    flatpickrInstanceRef.current = Array.isArray(flatPickr)
      ? flatPickr[0]
      : flatPickr;

    return () => {
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.destroy();
        flatpickrInstanceRef.current = null;
      }
    };
  }, [mode, id, defaultDate, maxDate]);

  const handleClear = () => {
    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.clear();
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative flatpickr">
        <Input
          id={id}
          placeholder={placeholder}
          error={error}
          hint={hint}
          value={value}
          readOnly
        />

        {value && (
          <button
            type="button"
            className="absolute text-gray-500 -translate-y-1/2 right-10 top-1/2 dark:text-gray-400"
            onClick={handleClear}
          >
            <CloseIcon className="size-6" />
          </button>
        )}
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
