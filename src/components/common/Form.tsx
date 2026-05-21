import React from "react";
import { FiAlertCircle } from "react-icons/fi";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = "",
  icon,
}) => {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 tracking-tight">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 transition-colors">{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`input-field ${icon ? "pl-11" : ""} ${error ? "border-red-500 focus:ring-red-400 focus:ring-2" : ""} ${disabled ? "bg-slate-50" : ""}`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <FiAlertCircle size={16} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 tracking-tight">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`input-field resize-none ${error ? "border-red-500 focus:ring-red-400 focus:ring-2" : ""} ${disabled ? "bg-slate-50" : ""}`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <FiAlertCircle size={16} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

interface SelectProps {
  label?: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 tracking-tight">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field cursor-pointer ${error ? "border-red-500 focus:ring-red-400 focus:ring-2" : ""} ${disabled ? "bg-slate-50 cursor-not-allowed" : ""}`}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <FiAlertCircle size={16} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
