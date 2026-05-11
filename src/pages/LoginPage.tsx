import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Form";
import { Alert } from "../components/common/Alert";

const mockCredentials = [
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
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-700 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-elevation-4 p-8 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-elevation-2 transform transition-transform duration-300 hover:scale-105">
              BM
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2 font-medium">Browns Maintenance System</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 animate-slide-in-left">
              <Alert type="error" message={error} dismissible onClose={() => setError("")} />
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<FiMail />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<FiLock />}
            />

            <Button fullWidth type="submit" loading={loading} size="lg">
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-700 font-semibold mb-4 flex items-center gap-2">
              <FiAlertCircle size={16} />
              Demo Credentials
            </p>
            <div className="space-y-2.5">
              {mockCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                  className="w-full p-3.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600">{cred.role}</p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700">{cred.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-8">
            This is a demo application. Use the credentials above to log in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
