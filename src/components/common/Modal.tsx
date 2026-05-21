import React from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  size = "md",
  footer,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-200 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} animate-scale-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all duration-150"
              aria-label="Close modal"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-thin">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl flex gap-3 justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
