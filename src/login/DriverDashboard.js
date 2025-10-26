import React, { useEffect, useState } from "react";
import { Check, X, UserCog} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("accept-ride");
  const [notification, setNotification] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const driverEmail = localStorage.getItem("driver_email");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    licenseNumber: "",
    vehicleType: "",
    vehicleNumber: "",
    experience: "",
    languages: [],
    emergencyContact: "",
    emergencyPhone: "",
    availability: "",
    icPhoto: null,
    selfiePhoto: null,
    licensePhoto: null,
    vehiclePhoto: null,
  });

  // Redirect if driver not logged in
  useEffect(() => {
    if (!driverEmail) navigate("/");
  }, [driverEmail, navigate]);

  // Fetch pending bookings
  const fetchPendingBookings = async () => {
    try {
      const res = await fetch(
        `https://okutransport.site/backend/getPendingBookings.php`
      );
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
      else setNotification(data.message || "Failed to fetch bookings.");
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "accept-ride") fetchPendingBookings();
  }, [activeTab]);

  // Confirm popup
  const confirmAccept = (booking) => setConfirmPopup(booking);



  // Accept booking
  const handleAccept = async (booking) => {
    setConfirmPopup(null);
    if (!navigator.geolocation)
      return setNotification("Geolocation not supported.");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(
            "https://okutransport.site/backend/acceptBooking.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ride_id: booking.ride_id,
                passenger_email: booking.email,
                date: booking.date,
                time: booking.time,
                driver_email: driverEmail,
                latitude,
                longitude,
              }),
            }
          );
          const result = await response.json();
          if (result.success) {
            // Remove accepted booking from list
            setBookings((prev) =>
              prev.filter((b) => b.ride_id !== booking.ride_id)
            );
            setNotification("Booking accepted successfully!");

            // Switch to live tracking tab
            setActiveTab("live-tracking");
          } else setNotification(result.message || "Update failed");
        } catch {
          setNotification("Something went wrong.");
        } finally {
          setTimeout(() => setNotification(null), 3000);
        }
      },
      () => setNotification("Unable to get location.")
    );
  };

  // Detect current address
  const getCurrentAddress = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      const data = await res.json();
      if (data.results?.length) {
        setFormData((prev) => ({
          ...prev,
          address: data.results[0].formatted_address,
        }));
      } else alert("Unable to detect address.");
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        languages: checked
          ? [...prev.languages, value]
          : prev.languages.filter((l) => l !== value),
      }));
    } else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0])
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };



const handleProfileSubmit = async (e) => {
  e.preventDefault();

  const formDataToSend = new FormData();
  formDataToSend.append("email", driverEmail);
  formDataToSend.append("icNumber", formData.icNumber);
  formDataToSend.append("licenseNumber", formData.licenseNumber);
  formDataToSend.append("vehicleType", formData.vehicleType);
  formDataToSend.append("vehicleNumber", formData.vehicleNumber);
  formDataToSend.append("address", formData.address);
  formDataToSend.append("emergencyContact", formData.emergencyContact);
  formDataToSend.append("emergencyPhone", formData.emergencyPhone);
  formDataToSend.append("experience", formData.experience);
  formDataToSend.append("languages", formData.languages.join(", "));
  formDataToSend.append("availability", formData.availability);

  ["icPhoto", "selfiePhoto", "licensePhoto", "vehiclePhoto"].forEach((key) => {
    if (formData[key]) formDataToSend.append(key, formData[key]);
  });

  try {
    const res = await fetch("http://localhost/backend/saveDriverDetails.php", {
      method: "POST",
      body: formDataToSend,
    });

    const data = await res.json();
    alert(data.message || "Profile saved!");
  } catch (error) {
    console.error(error);
    alert("Failed to save driver profile.");
  }
};



  const previewImage = (file) => (file ? URL.createObjectURL(file) : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-blue-700 text-white px-6 py-4 flex flex-wrap justify-between items-center shadow-md rounded-b-2xl">
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide drop-shadow-md">
          Driver Dashboard
        </h1>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform shadow-md font-semibold"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          <button
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform shadow-md font-semibold"
            onClick={() => {
              localStorage.removeItem("driver_email");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-3xl">
        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center mt-5 gap-3 px-4">
          <button
            onClick={() => setActiveTab("accept-ride")}
            className={`flex-1 sm:flex-none min-w-[140px] text-center px-5 py-2 rounded-lg font-medium shadow-sm transition-transform ${activeTab === "accept-ride"
              ? "bg-blue-600 text-white scale-105"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            🚘 Accept Ride
          </button>

          <button
            onClick={() => setActiveTab("profile-setup")}
            className={`flex-1 sm:flex-none min-w-[140px] text-center px-5 py-2 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-transform ${activeTab === "profile-setup"
              ? "bg-purple-600 text-white scale-105"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <UserCog size={18} /> Setup Profile
          </button>


        </div>

        {notification && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md text-center mt-4 shadow-sm">
            {notification}
          </div>
        )}

        {/* Accept Ride Section */}
        {activeTab === "accept-ride" && (
          <section className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" /> Pending Bookings
            </h2>
            {loading ? (
              <p className="text-gray-500">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500">No pending bookings.</p>
            ) : (
              <ul className="space-y-4">
                {bookings.map((booking) => (
                  <li
                    key={booking.ride_id}
                    className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-medium">
                        <span className="text-indigo-600">From:</span>{" "}
                        {booking.pickup}
                      </p>
                      <p className="font-medium">
                        <span className="text-indigo-600">To:</span>{" "}
                        {booking.destination}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.date} at {booking.time} | Status:{" "}
                        <span className="font-semibold text-orange-600">
                          {booking.status}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => confirmAccept(booking)}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition"
                    >
                      <Check size={16} className="inline mr-1" /> 
                      
                      Accept Ride
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Profile Setup Section */}
        {activeTab === "profile-setup" && (
          <section className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <UserCog className="w-5 h-5" /> Driver Profile Setup
            </h2>

            <form
              onSubmit={handleProfileSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="sm:col-span-2 flex gap-2">
                <input
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* License, Vehicle, Emergency Info */}
              {["licenseNumber", "vehicleType", "vehicleNumber", "emergencyContact", "emergencyPhone"].map(
                (field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())}
                    value={formData[field]}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-300"
                  />
                )
              )}

              {/* Years of Experience - Dropdown */}
              <div>
                <label className="block mb-1 font-medium">Years of Experience:</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">Select years</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="3 years">3 years</option>
                  <option value="4 years">4 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>

              {/* Availability - Dropdown */}
              <div>
                <label className="block mb-1 font-medium">Availability:</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">Select availability</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Weekends Only">Weekends Only</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>

              {/* Languages */}
              <div className="sm:col-span-2">
                <label className="block mb-2 font-medium">
                  Languages Spoken:
                </label>
                <div className="flex gap-4">
                  {["English", "Malay", "Chinese"].map((lang) => (
                    <label key={lang} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="languages"
                        value={lang}
                        checked={formData.languages.includes(lang)}
                        onChange={handleChange}
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Uploads */}
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Upload Photos:</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["icPhoto", "IC Photo"],
                    ["selfiePhoto", "Selfie Photo"],
                    ["licensePhoto", "License Photo"],
                    ["vehiclePhoto", "Vehicle Photo"],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label className="text-sm font-medium">{label}</label>
                      <input
                        type="file"
                        name={name}
                        onChange={handleImageChange}
                        className="border rounded-lg p-2 w-full text-sm"
                      />
                      {formData[name] && (
                        <img
                          src={previewImage(formData[name])}
                          alt={label}
                          className="mt-2 w-full h-32 object-cover rounded-lg shadow-sm border"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="sm:col-span-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
              >
                💾 Save Profile
              </button>
            </form>
          </section>
        )}


      </main>

      {/* CONFIRM POPUP */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md text-center p-6 sm:p-8 animate-fadeIn">
            <div className="flex justify-center mb-4">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Accept this booking?
            </h3>
            <p className="text-gray-600 mb-6 px-2 sm:px-4">
              Are you sure you want to accept this ride? This action will assign you as the driver.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => handleAccept(confirmPopup)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition transform hover:scale-105"
              >
                <Check className="w-5 h-5" /> Yes, Accept
              </button>
              <button
                onClick={() => setConfirmPopup(null)}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-5 py-3 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 transition transform hover:scale-105"
              >
                <X className="w-5 h-5" /> Cancel
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
