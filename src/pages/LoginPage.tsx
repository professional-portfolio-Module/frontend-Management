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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              BM
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Browns Maintenance System</p>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} dismissible onClose={() => setError("")} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<FiMail />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<FiLock />}
            />

            <Button fullWidth type="submit" loading={loading} size="lg">
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-semibold mb-4">Demo Credentials</p>
            <div className="space-y-2">
              {mockCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                  className="w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-left"
                >
                  <p className="text-sm font-medium text-gray-900">{cred.role}</p>
                  <p className="text-xs text-gray-500">{cred.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex gap-3">
            <FiAlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Click any demo credential to auto-fill and test the system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
