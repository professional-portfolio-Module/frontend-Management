import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = "",
  type = "button",
}) => {
  const baseClass = "font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2";

  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-elevation-1 hover:shadow-elevation-2",
    secondary: "bg-primary-100 text-primary-600 hover:bg-primary-200 active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    accent: "bg-accent-400 text-gray-900 hover:bg-accent-500 active:scale-95 focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 shadow-elevation-1 hover:shadow-elevation-2",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-95 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-elevation-1 hover:shadow-elevation-2",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseClass}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>}
      {children}
    </button>
  );
};
