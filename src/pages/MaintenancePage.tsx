import React from "react";
import { FiSettings, FiRefreshCw } from "react-icons/fi";

export const MaintenancePage: React.FC = () => {
  const handleRetry = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-8 animate-pulse">
          <FiSettings size={36} className="animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        {/* Error Code */}
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Scheduled Maintenance</h1>

        {/* Title */}
        <h2 className="text-lg font-medium text-slate-650 mb-3">System is offline for updates</h2>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
          The Browns Maintenance Management System is currently undergoing scheduled maintenance to improve our services. We apologize for the inconvenience and will be back online shortly.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <FiRefreshCw size={16} />
            Check Again
          </button>
        </div>

        {/* Subtle footer */}
        <p className="text-xs text-slate-400 mt-12">
          Browns Maintenance Management System
        </p>
      </div>
    </div>
  );
};
