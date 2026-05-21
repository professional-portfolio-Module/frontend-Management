import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Form";
import { Alert } from "../components/common/Alert";

const demoAccounts = [
  { email: "manager@browns.com", password: "123456", role: "Manager" },
  { email: "engineer@browns.com", password: "123456", role: "Engineer" },
  { email: "staff@browns.com", password: "123456", role: "Staff" },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
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

      {/* Right Panel - Login Form */}
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
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 animate-fade-in-up">
              <Alert type="error" message={error} dismissible onClose={() => setError("")} />
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="name@browns.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<FiMail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<FiLock size={16} />}
            />

            <Button fullWidth type="submit" loading={loading} size="lg" className="mt-1">
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <FiArrowRight size={16} />}
            </Button>
          </form>

          {/* Test Accounts - only visible in development */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-3">Test Accounts</p>
            <div className="grid gap-1.5">
              {demoAccounts.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-150 text-left group"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-700">{cred.role}</p>
                    <p className="text-[11px] text-slate-400">{cred.email}</p>
                  </div>
                  <span className="text-[10px] text-slate-300 group-hover:text-slate-400">Use →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
