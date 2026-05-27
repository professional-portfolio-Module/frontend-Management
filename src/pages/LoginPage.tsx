import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiKey } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Form";
import { Alert } from "../components/common/Alert";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot Password State
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const navigateToDashboard = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        navigate("/admin");
        break;
      case 'manager':
        navigate("/manager");
        break;
      case 'engineer':
        navigate("/engineer");
        break;
      case 'staff':
        navigate("/staff");
        break;
      default:
        navigate("/");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const authUser = await login({ email, password });
      navigateToDashboard(authUser.role);
    } catch (err: any) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const message = await authService.forgotPassword(email);
      setSuccessMessage(message);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (resetStep === 1) {
        // Request OTP
        const message = await authService.forgotPassword(email);
        setSuccessMessage(message);
        setResetStep(2);
      } else {
        // Validate passwords match
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        // Reset Password
        await authService.resetPassword(email, otp, newPassword);
        setSuccessMessage("Password reset successful. Logging you in...");
        
        // Automatically login with new credentials
        const authUser = await login({ email, password: newPassword });
        navigateToDashboard(authUser.role);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="w-full h-full" viewBox="0 0 400 800" fill="none">
            <circle cx="300" cy="100" r="200" fill="white" />
            <circle cx="100" cy="600" r="250" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-20">
              <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
                BM
              </div>
              <div>
                <p className="font-semibold leading-none">Browns Company</p>
                <p className="text-xs text-white/60 mt-0.5">Maintenance Division</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Maintenance Management System
            </h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Centralized platform for work orders, team scheduling, maintenance reports, and internal communications.
            </p>
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Browns Company</p>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-[380px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
              BM
            </div>
            <span className="text-sm font-semibold text-slate-900">Browns Maintenance</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              {isForgotPasswordMode ? (resetStep === 1 ? "Reset Password" : "Enter OTP") : "Sign in"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isForgotPasswordMode 
                ? (resetStep === 1 ? "Enter your email to receive an OTP" : "Enter the OTP sent to your email and your new password") 
                : "Enter your credentials to continue"}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 animate-fade-in-up">
              <Alert type="error" message={error} dismissible onClose={() => setError("")} />
            </div>
          )}
          {successMessage && (
            <div className="mb-5 animate-fade-in-up">
              <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage("")} />
            </div>
          )}

          {/* Form */}
          {!isForgotPasswordMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="name@browns.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<FiMail size={16} />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<FiLock size={16} />}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordMode(true);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <Button fullWidth type="submit" loading={loading} size="lg" className="mt-1">
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <FiArrowRight size={16} />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {resetStep === 1 ? (
                <Input
                  label="Email"
                  type="email"
                  placeholder="name@browns.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<FiMail size={16} />}
                />
              ) : (
                <>
                  <Input
                    label="OTP Code"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    icon={<FiKey size={16} />}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    icon={<FiLock size={16} />}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    icon={<FiLock size={16} />}
                  />
                </>
              )}

              <Button fullWidth type="submit" loading={loading} size="lg" className="mt-1">
                {loading ? "Processing…" : (resetStep === 1 ? "Send OTP" : "Reset & Login")}
              </Button>

              <div className="flex flex-col items-center gap-2 mt-4">
                {resetStep === 2 && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setResetStep(1);
                    setError("");
                    setSuccessMessage("");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Back to Sign in
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
