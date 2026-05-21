import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiHome } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      // Redirect to the user's role-specific dashboard
      navigate(`/${user.role}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-8">
          <FiAlertTriangle size={36} />
        </div>

        {/* Error Code */}
        <h1 className="text-7xl font-bold text-slate-900 tracking-tight mb-2">404</h1>

        {/* Title */}
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Page Not Found</h2>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or you may not have the required permissions to access it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FiArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <FiHome size={16} />
            {user ? "Go to Dashboard" : "Go to Home"}
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
