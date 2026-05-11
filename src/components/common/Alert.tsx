import React from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

interface AlertProps {
  type?: "success" | "warning" | "error" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  onClose,
  dismissible = true,
}) => {
  const typeClasses = {
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    error: "bg-red-50 border-red-200 text-red-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const iconClasses = {
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    info: "text-blue-600",
  };

  const icons = {
    success: <FiCheckCircle size={20} />,
    warning: <FiAlertCircle size={20} />,
    error: <FiAlertCircle size={20} />,
    info: <FiInfo size={20} />,
  };

  return (
    <div className={`border rounded-lg p-4 flex gap-3 shadow-elevation-1 transition-all duration-300 ${typeClasses[type]}`}>
      <div className={`flex-shrink-0 mt-0.5 ${iconClasses[type]}`}>
        {icons[type]}
      </div>
      <div className="flex-1">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className={title ? "text-sm mt-1 opacity-90" : "text-sm"}>
          {message}
        </p>
      </div>
      {dismissible && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-current hover:bg-opacity-10"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};
