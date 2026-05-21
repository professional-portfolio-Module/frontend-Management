import React, { useState } from "react";
import { Modal } from "./Modal";
import { Input, Select } from "./Form";
import { Button } from "./Button";
import { FiUserPlus } from "react-icons/fi";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowedRoles: { value: string; label: string }[];
  onSubmit: (data: any) => Promise<void>;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  allowedRoles,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: allowedRoles[0]?.value || "",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      await onSubmit(formData);
      
      setSuccessMessage(`Account created! An email with a temporary password has been sent to ${formData.email}.`);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          role: allowedRoles[0]?.value || "",
          department: "",
        });
        setSuccessMessage("");
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Account"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Account
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2 p-3 bg-primary-50 rounded-md border border-primary-100">
          <FiUserPlus className="text-primary-600 flex-shrink-0" size={20} />
          <p className="text-sm text-slate-700">
            Create a new user account and assign them a specific role.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium">{successMessage}</p>
            <p className="text-xs text-emerald-600 opacity-80">The user will be prompted to set a new password upon first login.</p>
          </div>
        ) : (
          <>
            <Input
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@browns.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
            <Select
              label="Account Role"
              options={allowedRoles}
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              required
            />
            <Input
              label="Department"
              placeholder="e.g. Maintenance"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            />
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-700">Note:</strong> A temporary password will be automatically generated. The user will receive an email with activation instructions to set their permanent password.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
