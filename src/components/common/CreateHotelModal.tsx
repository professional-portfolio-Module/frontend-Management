import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input } from "./Form";
import { Button } from "./Button";
import { FiPlusSquare } from "react-icons/fi";

interface CreateHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; city: string; country: string }) => Promise<void>;
}

export const CreateHotelModal: React.FC<CreateHotelModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        city: "",
        country: "",
      });
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.city.trim() || !formData.country.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      await onSubmit({
        name: formData.name.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
      });
      
      setSuccessMessage(`Hotel "${formData.name.trim()}" created successfully!`);
      
      // Reset & close
      setTimeout(() => {
        setFormData({
          name: "",
          city: "",
          country: "",
        });
        setSuccessMessage("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create hotel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Hotel"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Hotel
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2 p-3 bg-primary-50 rounded-md border border-primary-100">
          <FiPlusSquare className="text-primary-600 flex-shrink-0" size={20} />
          <p className="text-sm text-slate-700">
            Register a new hotel location to initialize its management within the system.
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
              label="Hotel Name"
              placeholder="e.g. Browns Beach Hotel"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
            <Input
              label="City"
              placeholder="e.g. Negombo"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              required
            />
            <Input
              label="Country"
              placeholder="e.g. Sri Lanka"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              required
            />
          </>
        )}
      </div>
    </Modal>
  );
};
