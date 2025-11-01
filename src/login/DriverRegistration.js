import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DriverRegistration = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", icNumber: "",
    licenseNumber: "", vehicleType: "", vehicleNumber: "",
    address: "", emergencyContact: "", emergencyPhone: "",
    experience: "", languages: [], availability: "",
    icPhoto: null, selfiePhoto: null, licensePhoto: null, vehiclePhoto: null
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraType, setCameraType] = useState("");
  const [currentFacingMode, setCurrentFacingMode] = useState("user");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // --- Input Handling ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        languages: checked
          ? [...prev.languages, value]
          : prev.languages.filter((lang) => lang !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Camera Functions ---
  const startCamera = async (type) => {
    try {
      setCameraType(type);
      setIsCapturing(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Cannot access camera.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return setError("Failed to capture photo.");

      const file = new File([blob], `${cameraType}_${Date.now()}.jpg`, { type: "image/jpeg" });
      setFormData((prev) => ({ ...prev, [cameraType]: file }));
      stopCamera();
    }, "image/jpeg", 0.8);
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsCapturing(false);
    setCameraType("");
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, [type]: file }));
  };

  // --- Step Navigation ---
  const nextStep = () => { setError(""); setStep(prev => Math.min(prev + 1, 4)); };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredPhotos = ["icPhoto", "selfiePhoto", "licensePhoto", "vehiclePhoto"];
    const missingPhotos = requiredPhotos.filter(p => !formData[p]);
    if (missingPhotos.length > 0) return setError(`Upload all photos: ${missingPhotos.join(", ")}`);

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    dataToSend.append("userType", "Driver");
    dataToSend.append("status", "pending");

    try {
      const response = await fetch("https://okutransport.site/backend/driverRegister.php", { method: "POST", body: dataToSend });
      const data = await response.json();
      if (data.status !== "success") return setError(data.message);

      setSuccess("Registration submitted successfully!");
      setTimeout(() => { navigate("/"); onClose(); }, 3000);
    } catch {
      setError("Server error. Try again.");
    }
  };

  // --- Render Photo Upload with Preview ---
  const renderPhotoUpload = (label, type) => (
    <div className="mb-4">
      <label className="block font-medium">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2 mt-1 items-start sm:items-center">
        <button type="button" onClick={() => startCamera(type)} className="btn-primary mb-2 sm:mb-0">Take Photo</button>
        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, type)} className="btn-secondary" />
        {formData[type] && <img src={URL.createObjectURL(formData[type])} alt={type} className="w-24 h-24 object-cover rounded border border-gray-300" />}
      </div>
    </div>
  );

  // --- Render Step 4 ---
  const renderStep4 = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
      {renderPhotoUpload("IC Photo", "icPhoto")}
      {renderPhotoUpload("Selfie Photo", "selfiePhoto")}
      {renderPhotoUpload("License Photo", "licensePhoto")}
      {renderPhotoUpload("Vehicle Photo", "vehiclePhoto")}
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="input-field" />
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="input-field" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" className="input-field" />
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="input-field" />
            <input type="text" name="icNumber" value={formData.icNumber} onChange={handleInputChange} placeholder="IC Number" className="input-field" />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Driver & Vehicle Info</h3>
            <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="License Number" className="input-field" />
            <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="input-field">
              <option value="">Select Vehicle Type</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="wheelchair_accessible">Wheelchair Accessible</option>
            </select>
            <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} placeholder="Vehicle Number" className="input-field" />
            <select name="experience" value={formData.experience} onChange={handleInputChange} className="input-field">
              <option value="">Years of Experience</option>
              <option value="0-1">0-1 years</option>
              <option value="2-5">2-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Info</h3>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="input-field" />
            <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="Emergency Contact Name" className="input-field" />
            <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} placeholder="Emergency Phone" className="input-field" />
            <select name="availability" value={formData.availability} onChange={handleInputChange} className="input-field">
              <option value="">Availability</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="weekends">Weekends</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        )}
        {step === 4 && renderStep4()}

        <div className="flex justify-between mt-6">
          {step > 1 && <button type="button" onClick={prevStep} className="btn-secondary">Previous</button>}
          {step < 4 ? <button type="button" onClick={nextStep} className="btn-primary">Next</button> : <button type="submit" className="btn-primary">Submit</button>}
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </form>

      {isCapturing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50 p-4">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-lg shadow-lg" />
          <div className="flex gap-4 mt-4">
            <button onClick={capturePhoto} className="btn-primary">Capture</button>
            <button onClick={stopCamera} className="btn-secondary">Cancel</button>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
    </div>
  );
};

export default DriverRegistration;
