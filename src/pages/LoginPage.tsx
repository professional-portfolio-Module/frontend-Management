import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Form";
import { Alert } from "../components/common/Alert";

const mockCredentials = [
  { email: "manager@browns.com", password: "123456", role: "Manager", icon: "👔" },
  { email: "engineer@browns.com", password: "123456", role: "Engineer", icon: "⚙️" },
  { email: "staff@browns.com", password: "123456", role: "Staff", icon: "👤" },
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
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 800" fill="none">
            <circle cx="300" cy="100" r="200" fill="white" fillOpacity="0.1" />
            <circle cx="100" cy="600" r="250" fill="white" fillOpacity="0.08" />
            <circle cx="350" cy="500" r="150" fill="white" fillOpacity="0.05" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
                BM
              </div>
              <div>
                <p className="font-semibold leading-none">Browns</p>
                <p className="text-xs text-white/70">Maintenance System</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Streamline Your Maintenance Operations
            </h2>
            <p className="text-base text-white/80 leading-relaxed max-w-sm">
              A complete management system for your team — track work items, manage schedules, and collaborate seamlessly.
            </p>
          </div>
          <p className="text-xs text-white/50">© 2024 Browns Company. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
              BM
            </div>
            <span className="text-sm font-semibold text-slate-900">Browns Maintenance</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 animate-fade-in-up">
              <Alert type="error" message={error} dismissible onClose={() => setError("")} />
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<FiMail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<FiLock size={16} />}
            />

            <Button fullWidth type="submit" loading={loading} size="lg" className="mt-2">
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <FiArrowRight size={16} />}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Access</p>
            <div className="grid gap-2">
              {mockCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-150 text-left group"
                >
                  <span className="text-lg">{cred.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-primary-700">{cred.role}</p>
                    <p className="text-xs text-slate-500 truncate">{cred.email}</p>
                  </div>
                  <FiArrowRight size={14} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
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
