import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCamera, FiAlertTriangle, FiCheckCircle, FiInfo, FiLoader, FiTrash2 } from "react-icons/fi";
import apiClient from "../services/api";
import { Button } from "../components/common/Button";
import { Alert } from "../components/common/Alert";

interface AssetMetadata {
  card_no: string;
  description: string;
  location: string;
  category_name: string;
  hotel_name: string;
}

export const PublicReportPage: React.FC = () => {
  const { card_no } = useParams<{ card_no: string }>();
  const navigate = useNavigate();

  // State
  const [asset, setAsset] = useState<AssetMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [reporterRole, setReporterRole] = useState("Housekeeper");
  const [customReporter, setCustomReporter] = useState("");
  const [priority, setPriority] = useState<"normal" | "emergency">("normal");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Asset Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!card_no) {
        setError("Invalid QR Code: Asset code is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get(`/Main/router-backend/api/qr/public-metadata/${card_no}`);
        if (response.data && response.data.success) {
          setAsset(response.data.data);
        } else {
          setError(response.data?.message || "Failed to retrieve asset details.");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "This asset code does not exist in our records or has been retired.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [card_no]);

  // Handle Photo Capture/Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card_no) return;
    if (!description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");

      const reporter = reporterRole === "Other" ? customReporter.trim() || "Staff Member" : reporterRole;

      const payload = {
        card_no,
        description: description.trim(),
        priority,
        reporter,
        image_base64: imageBase64,
      };

      const response = await apiClient.post("/Main/router-backend/api/qr/public-report", payload);
      if (response.data && response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data?.message || "Failed to submit report.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center">
          <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-600">Verifying Asset Details...</p>
        </div>
      </div>
    );
  }

  if (error && !asset) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">{error}</p>
          <Button fullWidth onClick={() => navigate("/")} variant="secondary">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-8 h-8 text-green-600 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            The maintenance department has been notified. A technician will be assigned to resolve the issue as soon as possible.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left border border-slate-100">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Asset Info</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">{asset?.card_no}</p>
            <p className="text-xs text-slate-500 mt-0.5">{asset?.description}</p>
          </div>
          <Button fullWidth onClick={() => window.location.reload()} size="lg">
            Submit Another Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden my-4">
        {/* Header Branding */}
        <div className="gradient-primary px-6 py-6 text-white">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center font-bold text-xs">
              BM
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {asset?.hotel_name}
            </span>
          </div>
          <h1 className="text-lg font-bold">Quick Fault Report Portal</h1>
          <p className="text-xs text-white/60 mt-0.5">Scan to report. No credentials needed.</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Banner */}
          {error && <Alert type="error" message={error} dismissible onClose={() => setError("")} />}

          {/* Asset Info Card */}
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
              <FiInfo className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Identified Equipment</p>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{asset?.card_no}</h3>
              <p className="text-xs font-medium text-slate-700 mt-0.5">{asset?.description}</p>
              {asset?.location && (
                <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">
                  📍 {asset.location}
                </p>
              )}
            </div>
          </div>

          {/* Reporter Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Who are you?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Housekeeper", "Guest", "Other"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setReporterRole(role)}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    reporterRole === role
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            {reporterRole === "Other" && (
              <input
                type="text"
                placeholder="E.g., Front Desk, Laundry staff, Waiter"
                value={customReporter}
                onChange={(e) => setCustomReporter(e.target.value)}
                required
                className="mt-2.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
              />
            )}
          </div>

          {/* Priority Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Priority / Urgency
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all select-none">
                <input
                  type="radio"
                  name="priority"
                  checked={priority === "normal"}
                  onChange={() => setPriority("normal")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <p className="text-xs font-bold text-slate-700">Normal</p>
                  <p className="text-[10px] text-slate-400">Regular fix (knob, aesthetic, minor)</p>
                </div>
              </label>

              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50/10 cursor-pointer hover:bg-red-50/30 transition-all select-none">
                <input
                  type="radio"
                  name="priority"
                  checked={priority === "emergency"}
                  onChange={() => setPriority("emergency")}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-red-300"
                />
                <div>
                  <p className="text-xs font-bold text-red-700">Emergency</p>
                  <p className="text-[10px] text-red-400">Blocks work/breakdown/danger</p>
                </div>
              </label>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Describe the fault *
            </label>
            <textarea
              rows={3}
              placeholder="What is wrong? (e.g., water leaks from bottom valve, AC fan makes noise, does not turn on)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Photo Capture */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Attach Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {!imageBase64 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50/10 transition-all"
              >
                <FiCamera className="w-8 h-8" />
                <span className="text-xs font-bold">Tap to Take/Upload Photo</span>
                <span className="text-[10px] text-slate-400">Max size: 5MB</span>
              </button>
            ) : (
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-black">
                <img
                  src={imageBase64}
                  alt="Captured evidence"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition-all"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitLoading}
            className={`w-full mt-2 py-3 font-semibold text-white ${
              priority === "emergency" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitLoading ? "Submitting Report..." : priority === "emergency" ? "🚨 Send Emergency Report" : "Send Report"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PublicReportPage;
