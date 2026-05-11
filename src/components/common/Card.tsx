import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-elevation-2 transition-all duration-300 ${
        hover ? "card-hover" : ""
      } ${className}`}
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
  color?: "blue" | "green" | "yellow" | "red";
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendValue,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-3">{value}</p>
          {trendValue && (
            <p className={`text-sm mt-3 font-medium flex items-center gap-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              <span>{trend === "up" ? "↑" : "↓"}</span>
              <span>{trendValue}</span>
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
