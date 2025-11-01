import React, { useState, useEffect } from "react";

// SVG Icons (no dependencies)
const PeopleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 8a3 3 0 100-6 3 3 0 000 6zM2 16v-1a4 4 0 014-4h8a4 4 0 014 4v1"
      stroke="#2563eb"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M15 7a2 2 0 110-4 2 2 0 010 4zM17.5 12.5a3.5 3.5 0 00-5.2 0"
      stroke="#2563eb"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const CarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <rect
      x="2"
      y="10"
      width="16"
      height="7"
      rx="2"
      stroke="#22c55e"
      strokeWidth="1.5"
    />
    <path
      d="M4 11V8a2 2 0 012-2h8a2 2 0 012 2v3"
      stroke="#22c55e"
      strokeWidth="1.5"
    />
    <circle cx="5.5" cy="16.5" r="1.5" fill="#22c55e" />
    <circle cx="14.5" cy="16.5" r="1.5" fill="#22c55e" />
  </svg>
);
const LocationIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 18s-6-5.686-6-10A6 6 0 0110 2a6 6 0 016 6c0 4.314-6 10-6 10z"
      stroke="#7c3aed"
      strokeWidth="1.5"
    />
    <circle cx="10" cy="8" r="2" stroke="#7c3aed" strokeWidth="1.5" />
  </svg>
);
const MoneyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <path
      d="M16 5V4a2 2 0 00-2-2H6a2 2 0 00-2 2v1"
      stroke="#fb923c"
      strokeWidth="1.5"
    />
    <rect
      x="3"
      y="5"
      width="14"
      height="11"
      rx="2"
      stroke="#fb923c"
      strokeWidth="1.5"
    />
    <text
      x="10"
      y="14"
      textAnchor="middle"
      fontSize="10"
      fill="#fb923c"
      fontWeight="bold"
    >
      $
    </text>
  </svg>
);

export default function AdminDashboard() {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [bookings, setBookings] = useState([]); // ✅ to store all booking data
  const [setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [expandedRow, setExpandedRow] = useState(null);

  // Load drivers on component mount
  useEffect(() => {
    fetchDrivers();
    fetchBookings();
  }, []);

  // Fetch drivers from backend
  const fetchDrivers = async () => {
    try {
      console.log("Fetching drivers from backend...");
      const response = await fetch("http://localhost/backend/getDrivers.php");
      const data = await response.json();
      console.log("Fetched drivers data:", data);

      if (data.status === "success") {
        setPendingDrivers(data.pending || []);
        setApprovedDrivers(data.approved || []);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Handle driver approval/rejection
  const handleDriverAction = async (driverEmail, action) => {
    try {
      const response = await fetch(
        "https://okutransport.site/backend/approveDriver.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverEmail, action }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        fetchDrivers(); // Refresh drivers list
        alert(
          `Driver ${action} successfully! Email notification attempted. Check email_notifications.log for details.`
        );
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating driver status:", error);
      alert("Error updating driver status");
    }
  };

  // Handle driver status reset (back to pending)
  const handleDriverReset = async (driverEmail) => {
    const confirmed = window.confirm(
      "Are you sure you want to reset this driver's status back to pending? This will allow them to be reviewed again."
    );
    if (confirmed) {
      try {
        const response = await fetch(
          "https://okutransport.site/backend/approveDriver.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ driverEmail, action: "pending" }),
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          fetchDrivers(); // Refresh drivers list
          alert("Driver status reset to pending successfully!");
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error resetting driver status:", error);
        alert("Error resetting driver status");
      }
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(
        "https://okutransport.site/backend/getAllBooking.php"
      ); // 👈 use your file name
      const data = await res.json();
      setBookings(data); // ✅ directly set the result array
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
    }
  };

  // View driver details
  const viewDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const stats = [
    {
      label: "Total Drivers",
      value: pendingDrivers.length + approvedDrivers.length,
      icon: <PeopleIcon />,
    },
    {
      label: "Pending Approval",
      value: pendingDrivers.length,
      icon: <CarIcon />,
    },
    {
      label: "Approved Drivers",
      value: approvedDrivers.length,
      icon: <LocationIcon />,
    },
    {
      label: "Active Services",
      value: approvedDrivers.length,
      icon: <MoneyIcon />,
    },
  ];

  // Combine pending and approved drivers for display
  const allDrivers = [
    ...pendingDrivers.map((driver) => ({ ...driver, status: "Pending" })),
    ...approvedDrivers.map((driver) => ({ ...driver, status: "Approved" })),
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#fff",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <div className="min-h-screen overflow-x-hidden bg-white flex flex-col">
        {/* ✅ Banner/Header */}
        <header className="bg-blue-700 text-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4">
            {/* Title */}
            <h1 className="text-2xl font-bold">OKU Transport Service</h1>
            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDrivers}
                className="bg-white text-blue-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm sm:text-base"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/";
                }}
                className="bg-white text-blue-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
                P
              </div>
            </div>
          </div>
        </header>

        {/* Add top padding so content isn't hidden behind fixed banner */}
        <div className="pt-32 sm:pt-36 px-2 sm:px-4 w-full min-h-screen bg-white">
          {/* HEADER */}
          <h2 className="font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-8">
            Driver Management
          </h2>

          {/* STATS */}

          <div className="px-2 sm:px-4 py-4">
            {/* ✅ Centered container */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col items-center justify-center text-center w-full transition-all hover:shadow-lg"
                  >
                    <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      {s.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {s.value}
                    </div>
                    <div className="mt-1 sm:mt-2">{s.icon}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Tab Navigation */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                activeTab === "drivers"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("drivers")}
            >
              Driver App
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              Ride Orders
            </button>
          </div>

          {/* ✅ Tab Content */}
          <div>
            {/* DRIVER MANAGEMENT TAB */}
            {/* ✅ DRIVER MANAGEMENT TAB */}
            {activeTab === "drivers" && (
              <div className="w-full overflow-x-auto">
                <table className="min-w-[950px] w-full border-collapse text-sm sm:text-base">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-left text-xs sm:text-sm">
                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        DRIVER
                      </th>
                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        STATUS
                      </th>
                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {allDrivers.map((d, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                      >
                        {/* DRIVER */}
                        <td className="py-4 px-4 flex items-center gap-3 whitespace-nowrap">
                          <div>
                            <div className="font-semibold text-sm sm:text-base">
                              {d.name}
                            </div>
                            <div className="text-gray-500 text-xs sm:text-sm">
                              {d.vehicleType} - {d.vehicleNumber}
                            </div>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                              d.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : d.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-4 px-4 whitespace-nowrap space-x-2">
                          <button
                            onClick={() => viewDriverDetails(d)}
                            className="text-blue-600 font-medium text-xs sm:text-sm"
                          >
                            View
                          </button>

                          {d.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleDriverAction(d.email, "approved")
                                }
                                className="text-green-600 font-medium text-xs sm:text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleDriverAction(d.email, "rejected")
                                }
                                className="text-red-600 font-medium text-xs sm:text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(d.status === "Approved" ||
                            d.status === "Rejected") && (
                            <button
                              onClick={() => handleDriverReset(d.email)}
                              className="text-yellow-600 font-medium text-xs sm:text-sm"
                            >
                              Reset
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* RIDE ORDERS TAB (your original unchanged section) */}
            {/* ✅ RIDE ORDERS TAB */}
            {/* ✅ RIDE ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="w-full px-2 sm:px-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 px-2 sm:px-4">
                  Ride Orders
                </h2>

                <div className="overflow-x-auto border border-gray-100 rounded-lg shadow-sm bg-white">
                  <table className="w-full min-w-[600px] border-collapse text-sm sm:text-base">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-left text-xs sm:text-sm">
                        <th className="py-3 px-3 sm:px-6 font-medium whitespace-nowrap">
                          RIDE ID
                        </th>
                        <th className="py-3 px-3 sm:px-6 font-medium whitespace-nowrap">
                          STATUS
                        </th>
                        <th className="py-3 px-3 sm:px-6 font-medium whitespace-nowrap text-center">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {bookings.length > 0 ? (
                        bookings.map((b, i) => (
                          <React.Fragment key={i}>
                            {/* Main row */}
                            <tr className="border-t border-gray-200 bg-white hover:bg-gray-50 text-gray-900">
                              <td className="py-4 px-3 sm:px-6 text-xs sm:text-sm">
                                {b.ride_id}
                              </td>
                              <td className="py-4 px-3 sm:px-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                    b.status === "Accepted"
                                      ? "bg-green-100 text-green-700"
                                      : b.status === "Pending"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-4 px-3 sm:px-6 text-center">
                                <button
                                  onClick={() =>
                                    setExpandedRow(expandedRow === i ? null : i)
                                  }
                                  className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
                                >
                                  {expandedRow === i ? "Hide" : "More"}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded details row */}
                            {expandedRow === i && (
                              <tr className="bg-gray-50 border-t border-gray-200">
                                <td
                                  colSpan="5"
                                  className="py-3 px-4 sm:px-6 text-sm text-gray-700"
                                >
                                  <div>
                                    <strong>Pickup:</strong> {b.pickup || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Destination:</strong>{" "}
                                    {b.destination || "N/A"}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-6 text-gray-500 text-sm"
                          >
                            No bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

{/* Driver Details Modal */}
{showDriverModal && selectedDriver && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
    {/* ✅ Modal Container */}
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
      
      {/* ✅ Header (scrolls with content) */}
      <div className="flex items-center justify-between bg-blue-600 text-white py-4 px-6 rounded-t-xl shadow-md">
        <h2 className="text-lg sm:text-2xl font-semibold">Driver Details</h2>
        <button
          onClick={() => setShowDriverModal(false)}
          className="flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50 font-medium text-sm sm:text-base transition"
        >
          Back →
        </button>
      </div>

      {/* ✅ Scrollable Modal Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info, Driver Info, Vehicle Info, Emergency Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800 text-sm sm:text-base">
          
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-1">
              Basic Information
            </h3>
            <p><strong>Name:</strong> {selectedDriver.name}</p>
            <p><strong>Email:</strong> {selectedDriver.email}</p>
            <p><strong>Phone:</strong> {selectedDriver.phone}</p>
            <p><strong>IC Number:</strong> {selectedDriver.icNumber}</p>
            <p><strong>Address:</strong> {selectedDriver.address}</p>
          </div>

          {/* Driver Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-1">
              Driver Information
            </h3>
            <p><strong>License Number:</strong> {selectedDriver.licenseNumber}</p>
            <p><strong>Experience:</strong> {selectedDriver.experience}</p>
            <p><strong>Languages:</strong> {selectedDriver.languages}</p>
            <p><strong>Availability:</strong> {selectedDriver.availability}</p>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-1">
              Vehicle Information
            </h3>
            <p><strong>Vehicle Type:</strong> {selectedDriver.vehicleType}</p>
            <p><strong>Vehicle Number:</strong> {selectedDriver.vehicleNumber}</p>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-1">
              Emergency Contact
            </h3>
            <p><strong>Contact Name:</strong> {selectedDriver.emergencyContact}</p>
            <p><strong>Contact Phone:</strong> {selectedDriver.emergencyPhone}</p>
          </div>
        </div>

        {/* ✅ Documents Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedDriver.icPhoto && (
              <div className="text-center">
                <h4 className="font-medium mb-2">IC Photo</h4>
                <a
                  href={`http://localhost/backend/${selectedDriver.icPhoto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`http://localhost/backend/${selectedDriver.icPhoto}`}
                    alt="IC"
                    className="object-cover rounded-lg border mx-auto cursor-pointer hover:scale-105 transition-transform"
                    style={{ width: "150px", height: "150px" }}
                  />
                </a>
              </div>
            )}
            {selectedDriver.selfiePhoto && (
              <div className="text-center">
                <h4 className="font-medium mb-2">Selfie</h4>
                <a
                  href={`http://localhost/backend/${selectedDriver.selfiePhoto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`http://localhost/backend/${selectedDriver.selfiePhoto}`}
                    alt="Selfie"
                    className="object-cover rounded-lg border mx-auto cursor-pointer hover:scale-105 transition-transform"
                    style={{ width: "150px", height: "150px" }}
                  />
                </a>
              </div>
            )}
            {selectedDriver.licensePhoto && (
              <div className="text-center">
                <h4 className="font-medium mb-2">License</h4>
                <a
                  href={`http://localhost/backend/${selectedDriver.licensePhoto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`http://localhost/backend/${selectedDriver.licensePhoto}`}
                    alt="License"
                    className="object-cover rounded-lg border mx-auto cursor-pointer hover:scale-105 transition-transform"
                    style={{ width: "150px", height: "150px" }}
                  />
                </a>
              </div>
            )}
            {selectedDriver.vehiclePhoto && (
              <div className="text-center">
                <h4 className="font-medium mb-2">Vehicle</h4>
                <a
                  href={`http://localhost/backend/${selectedDriver.vehiclePhoto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`http://localhost/backend/${selectedDriver.vehiclePhoto}`}
                    alt="Vehicle"
                    className="object-cover rounded-lg border mx-auto cursor-pointer hover:scale-105 transition-transform"
                    style={{ width: "150px", height: "150px" }}
                  />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Footer (action buttons) */}
      {(selectedDriver.status === "Pending" ||
        selectedDriver.status === "Approved" ||
        selectedDriver.status === "Rejected") && (
        <div className="flex justify-end gap-3 px-6 pb-6">
          {selectedDriver.status === "Pending" && (
            <>
              <button
                onClick={() => {
                  handleDriverAction(selectedDriver.email, "rejected");
                  setShowDriverModal(false);
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleDriverAction(selectedDriver.email, "approved");
                  setShowDriverModal(false);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
            </>
          )}
          {(selectedDriver.status === "Approved" ||
            selectedDriver.status === "Rejected") && (
            <button
              onClick={() => {
                handleDriverReset(selectedDriver.email);
                setShowDriverModal(false);
              }}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
            >
              Reset to Pending
            </button>
          )}
        </div>
      )}
    </div>
  </div>
)}


      </div>
    </div>
  );
}
