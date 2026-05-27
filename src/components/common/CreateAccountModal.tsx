import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input, Select } from "./Form";
import { Button } from "./Button";
import { FiUserPlus } from "react-icons/fi";
import apiClient from "../../services/api";

interface Hotel {
  id: string;
  name: string;
  city: string;
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowedRoles: { value: string; label: string }[];
  onSubmit: (data: any) => Promise<void>;
  defaultHotelId?: string;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  allowedRoles,
  onSubmit,
  defaultHotelId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    role: allowedRoles[0]?.value || "",
    hotelId: defaultHotelId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && allowedRoles.length > 0) {
      setFormData(prev => ({
        ...prev,
        role: allowedRoles[0].value,
        hotelId: defaultHotelId || prev.hotelId
      }));
    }
  }, [isOpen, allowedRoles, defaultHotelId]);

  useEffect(() => {
    if (!isOpen) return;
    if (defaultHotelId) {
      setFormData(prev => ({ ...prev, hotelId: defaultHotelId }));
      setHotelsLoading(false);
      return;
    }
    const fetchHotels = async () => {
      try {
        setHotelsLoading(true);
        const res = await apiClient.get("/Main/router-backend/api/hotels");
        if (res.data?.success && res.data.data) {
          setHotels(res.data.data);
          if (res.data.data.length > 0 && !formData.hotelId) {
            setFormData(prev => ({ ...prev, hotelId: res.data.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch hotels:", err);
      } finally {
        setHotelsLoading(false);
      }
    };
    fetchHotels();
  }, [isOpen, defaultHotelId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.mobileNumber || !formData.role || !formData.hotelId) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      await onSubmit(formData);
      
      setSuccessMessage(`Account created for ${formData.name}!`);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          role: allowedRoles[0]?.value || "",
          hotelId: "",
        });
        setSuccessMessage("");
        onClose();
      }, 2000);
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
            <Input
              label="Mobile Number"
              placeholder="e.g. 0987654325"
              value={formData.mobileNumber}
              onChange={(e) => handleChange("mobileNumber", e.target.value)}
              required
            />
            <Select
              label="Account Role"
              options={allowedRoles}
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              required
            />
            {!defaultHotelId && (
              <Select
                label="Hotel"
                options={
                  hotelsLoading
                    ? [{ value: "", label: "Loading hotels..." }]
                    : hotels.length === 0
                      ? [{ value: "", label: "No hotels found" }]
                      : hotels.map(h => ({ value: h.id, label: `${h.name} - ${h.city || 'N/A'}` }))
                }
                value={formData.hotelId}
                onChange={(e) => handleChange("hotelId", e.target.value)}
                required
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
