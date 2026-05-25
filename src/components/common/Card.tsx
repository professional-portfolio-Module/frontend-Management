import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  onClick,
  padding = "md",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-slate-200/80 transition-all duration-200
        ${paddingClasses[padding]}
        ${hover ? "cursor-pointer hover:shadow-md hover:border-slate-300 active:shadow-sm" : "shadow-sm"}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "teal";
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendValue,
  color = "blue",
}) => {
  const colorConfig = {
    blue: {
      iconBg: "bg-primary-50",
      iconText: "text-primary-600",
      accent: "border-l-primary-500",
    },
    green: {
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      accent: "border-l-emerald-500",
    },
    yellow: {
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      accent: "border-l-amber-500",
    },
    red: {
      iconBg: "bg-rose-50",
      iconText: "text-rose-600",
      accent: "border-l-rose-500",
    },
    purple: {
      iconBg: "bg-purple-50",
      iconText: "text-purple-600",
      accent: "border-l-purple-500",
    },
    teal: {
      iconBg: "bg-teal-50",
      iconText: "text-teal-600",
      accent: "border-l-teal-500",
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`bg-white rounded-lg border border-slate-200/80 shadow-sm p-5 border-l-4 ${config.accent} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{value}</p>
          {trendValue && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
              <svg className={`w-3.5 h-3.5 ${trend === "down" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{trendValue}</span>
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${config.iconBg} ${config.iconText} flex items-center justify-center text-lg flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
