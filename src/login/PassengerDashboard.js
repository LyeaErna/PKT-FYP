import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LiveMap from "../components/LiveMap";

const OKUPassengerDashboard = () => {
  const [activeTab, setActiveTab] = useState("book-ride");
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeRideId, setActiveRideId] = useState(() => localStorage.getItem("ride_id") || "");
  const [driverLoc, setDriverLoc] = useState(null);
  const [etaMin, setEtaMin] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const pollRef = useRef(null);
  const [selectingDestination, setSelectingDestination] = useState(false);
  const [selectingPickup, setSelectingPickup] = useState(false);
  const [driverAddress, setDriverAddress] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
    specialNeeds: "",
    recurring: false,
    email: "",
    pickupLat: null,
    pickupLng: null,
    destLat: null,
    destLng: null,
  });

  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load user info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setBookingData(prev => ({ ...prev, email: JSON.parse(userData).email }));
    }
  }, []);

  // Poll bookings every 3s
  useEffect(() => {
    if (user?.email) {
      const interval = setInterval(() => fetchBookings(user.email), 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchBookings = async (email) => {
    try {
      const response = await fetch(`http://localhost/backend/getBook.php?email=${email}`);
      const data = await response.json();
      if (data.success) {
        const fetchedBookings = data.bookings || [];
        setBookings(fetchedBookings);
        if (activeRideId) {
          const activeRide = fetchedBookings.find(b => b.ride_id === activeRideId);
          if (activeRide) {
            let pickup = activeRide.pickup;
            if (typeof pickup === "string") {
              const [lat, lng] = pickup.split(",").map(Number);
              pickup = { lat, lng };
            }
            setPickupLocation(pickup);

            let destination = activeRide.destination;
            if (typeof destination === "string") {
              const [lat, lng] = destination.split(",").map(Number);
              destination = { lat, lng };
            }
            setDestinationLocation(destination);
          }
        }
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (!user?.email) return;

    // Initial fetch
    fetchBookings(user.email);

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchBookings(user.email);
    }, 5000);

    return () => clearInterval(interval);
  }, [user, activeRideId]);


  // Haversine formula for distance
  const haversineKm = useCallback((a, b) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }, []);

  const computeEta = useCallback((from, to, speedMps) => {
    if (!from || !to) return null;
    const distanceKm = haversineKm(from, to);
    const kmh = speedMps && speedMps > 0 ? speedMps * 3.6 : 30;
    const etaHours = distanceKm / kmh;
    return Math.max(0, Math.round(etaHours * 60));
  }, [haversineKm]);

  // UseEffect for live tracking
  // In your OKUPassengerDashboard.jsx (or a separate hook)

  const fetchLatest = useCallback(async () => {
    if (!activeRideId) return;
    try {
      const res = await fetch(`http://localhost/backend/location.php?ride_id=${encodeURIComponent(activeRideId)}`);
      const json = await res.json();
      if (json?.success && json.data) {
        const d = json.data;
        const driver = { lat: Number(d.lat), lng: Number(d.lng), speed: Number(d.speed) || null };
        setDriverLoc(driver);

        // Compute ETA to pickup if needed
        if (pickupLocation) setEtaMin(computeEta(driver, pickupLocation, driver.speed));

        // If first load, set pickup/destination pins from API
        if (!pickupCoords && !destinationCoords) {
          const pickup = { lat: json.pickup_lat, lng: json.pickup_lng };
          const dest = { lat: json.dest_lat, lng: json.dest_lng };
          setPickupCoords(pickup);
          setDestinationCoords(dest);
          setPickupLocation(pickup);
          setDestinationLocation(dest);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [activeRideId, pickupLocation, pickupCoords, destinationCoords, computeEta]);


  useEffect(() => {
    fetchLatest();                      // initial fetch
    const interval = setInterval(fetchLatest, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [fetchLatest]);



  // Booking submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost/backend/book.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          pickup_lat: pickupCoords?.lat || null,
          pickup_lng: pickupCoords?.lng || null,
          dest_lat: destinationCoords?.lat || null,
          dest_lng: destinationCoords?.lng || null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Booking request submitted successfully!");
        fetchBookings(user.email);

        // Reset form
        setBookingData({ pickup: "", destination: "", date: "", time: "", specialNeeds: "", recurring: false, email: user.email });
        setPickupCoords(null);
        setDestinationCoords(null);
        setPickupLocation(null);
        setDestinationLocation(null);

        // Set active ride and switch tab
        if (result.ride_id) {
          localStorage.setItem("ride_id", result.ride_id);
          setActiveRideId(result.ride_id);
          setActiveTab("live-tracking");

          window.location.reload();
          setActiveTab("live-tracking");

          // Optionally force refresh of live tracking
          fetchLatest(); // immediately fetch driver location
          // If you want full page refresh: window.location.reload();
        }
      } else alert("Booking failed: " + result.message);
    } catch (error) {
      console.error(error);
      alert("Error submitting booking.");
    } finally {
      setIsLoading(false);
    }
  };




  // Map click for selecting pickup/destination
  const handleMapClick = useCallback(async (lat, lng) => {
    if (activeTab === "book-ride") {
      const address = await getAddressFromCoords(lat, lng); // uses LocationIQ now
      if (selectingPickup) {
        setPickupCoords({ lat, lng });
        setBookingData(prev => ({
          ...prev,
          pickup: address,
          pickupLat: lat,
          pickupLng: lng
        }));
        setSelectingPickup(false);
      } else if (selectingDestination) {
        setDestinationCoords({ lat, lng });
        setBookingData(prev => ({
          ...prev,
          destination: address,
          destLat: lat,
          destLng: lng
        }));
        setSelectingDestination(false);
      }
    }
  }, [activeTab, selectingPickup, selectingDestination]);


  useEffect(() => { window.onMapClick = handleMapClick; return () => { window.onMapClick = null; }; }, [handleMapClick]);

  async function getAddressFromCoords(lat, lng) {
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=pk.23eb8a91613432aeadf72aa65e30190d&lat=${lat}&lon=${lng}&format=json`
      );
      if (!res.ok) throw new Error("Failed to fetch address");
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error("Error fetching address:", err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }


  if (!user) return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading...</div>;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: isMobile ? "16px" : "24px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "16px", padding: isMobile ? "20px" : "24px", marginBottom: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? "24px" : "28px", fontWeight: "bold", marginBottom: "8px" }}>OKU Transport Dashboard</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: isMobile ? "14px" : "16px" }}>Welcome, {user.name}! Book your accessible transport service.</p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/")} style={{ padding: isMobile ? "10px 14px" : "12px 20px", borderRadius: "10px", border: "none", fontSize: isMobile ? "13px" : "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.2)", color: "white", backdropFilter: "blur(10px)" }}>Home</button>
              <button onClick={() => alert(`Profile Info:\nName: ${user.name}\nEmail: ${user.email}`)} style={{ padding: isMobile ? "10px 14px" : "12px 20px", borderRadius: "10px", border: "none", fontSize: isMobile ? "13px" : "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.2)", color: "white", backdropFilter: "blur(10px)" }}>Profile</button>
              <button onClick={() => { if (window.confirm("Are you sure you want to logout?")) { localStorage.removeItem("user"); localStorage.removeItem("ride_id"); navigate("/"); } }} style={{ padding: isMobile ? "10px 14px" : "12px 20px", borderRadius: "10px", border: "none", fontSize: isMobile ? "13px" : "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", background: "rgba(239, 68, 68, 0.8)", color: "white" }}>Logout</button>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: isMobile ? "wrap" : "nowrap", justifyContent: isMobile ? "center" : "flex-start" }}>
          {["book-ride", "live-tracking", "history"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: isMobile ? "12px 16px" : "14px 24px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                flex: isMobile ? "1" : "none",
                minWidth: isMobile ? "120px" : "auto",
                fontSize: isMobile ? "14px" : "15px",
                background: activeTab === tab ? "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)" : "white",
                color: activeTab === tab ? "white" : "#374151",
                boxShadow: activeTab === tab ? "0 4px 15px rgba(79,70,229,0.3)" : "0 2px 8px rgba(0,0,0,0.1)"
              }}>{tab === "book-ride" ? "Book Ride" : tab === "live-tracking" ? "Live Tracking" : "Trip History"}</button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {/* BOOK RIDE */}
        {activeTab === "book-ride" && (
          <div style={{ display: isMobile ? "block" : "flex", gap: "24px" }}>
            {/* Form */}
            <div style={{ flex: 1, marginBottom: isMobile ? "20px" : "0" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "20px" : "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: isMobile ? "20px" : "24px", fontWeight: "bold", color: "#1f2937" }}>Book Your Ride</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: isMobile ? "14px" : "15px" }}>Pickup Location</label>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <input type="text" readOnly value={bookingData.pickup} placeholder="Type or click button + map" style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" }} required />
                      <button type="button" onClick={() => setSelectingPickup(true)} style={{ padding: "14px 20px", borderRadius: "10px", backgroundColor: "#4f46e5", color: "white", fontWeight: "600", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: isMobile ? "13px" : "14px" }}>Set</button>
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: isMobile ? "14px" : "15px" }}>Destination</label>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <input type="text" readOnly value={bookingData.destination} placeholder="Type destination or click button + map" style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" }} required />
                      <button type="button" onClick={() => setSelectingDestination(true)} style={{ padding: "14px 20px", borderRadius: "10px", backgroundColor: "#4f46e5", color: "white", fontWeight: "600", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: isMobile ? "13px" : "14px" }}>Set</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: isMobile ? "14px" : "15px" }}>Date</label>
                      <input type="date" value={bookingData.date} onChange={e => setBookingData(prev => ({ ...prev, date: e.target.value }))} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" }} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: isMobile ? "14px" : "15px" }}>Time</label>
                      <input type="time" value={bookingData.time} onChange={e => setBookingData(prev => ({ ...prev, time: e.target.value }))} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" }} required />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: isMobile ? "14px" : "15px" }}>Special Needs (Optional)</label>
                    <select value={bookingData.specialNeeds} onChange={e => setBookingData(prev => ({ ...prev, specialNeeds: e.target.value }))} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "14px", backgroundColor: "white" }}>
                      <option value="">-- Select Special Need --</option>
                      <option value="Wheelchair-accessible ramp (side or rear)">Wheelchair-accessible ramp (side or rear)</option>
                      <option value="Wheelchair lift / hydraulic lift">Wheelchair lift / hydraulic lift</option>
                      <option value="Swivel / turning point / passenger seat / seat lift">Swivel / turning point / passenger seat / seat lift</option>
                      <option value="Slope (or sloper) variant">Slope (or sloper) variant</option>
                      <option value="High roof / tall cabin / large door aperture">High roof / tall cabin / large door aperture</option>
                      <option value="Vertical platform lift">Vertical platform lift</option>
                      <option value="Removable / roll-in van / MPV conversion">Removable / roll-in van / MPV conversion</option>
                    </select>
                  </div>

                  <button type="submit" style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)", color: "#fff", border: "none", borderRadius: "12px", fontSize: isMobile ? "16px" : "18px", fontWeight: "bold", cursor: "pointer", opacity: isLoading ? 0.6 : 1 }}>
                    {isLoading ? <div style={{ width: "20px", height: "20px", border: "2px solid transparent", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }}></div> : "Submit Booking Request"}
                  </button>
                </form>
              </div>
            </div>
            {/* Map */}
            <div style={{ flex: 1 }}>
              <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "20px" : "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: isMobile ? "20px" : "24px", fontWeight: "bold", color: "#1f2937" }}>Select Locations</h3>
                <p style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "14px" }}>
                  {!pickupCoords ? "Click on map to set pickup location" : !destinationCoords ? "Click on map to set destination" : "Both locations set! You can submit your booking."}
                </p>
                <LiveMap
                  passengerLocation={passengerLocation}      // you can set this via geolocation
                  pickupLocation={pickupCoords}              // use the coords state
                  destinationLocation={destinationCoords}    // use the coords state
                />
              </div>
            </div>
          </div>
        )}

        {/* LIVE TRACKING */}
        {activeTab === "live-tracking" && (
          <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "20px" : "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: isMobile ? "20px" : "24px", fontWeight: "bold", color: "#1f2937" }}>Live Driver Tracking</h2>
            {activeRideId ? (
              <>
                <LiveMap
                  driverLocation={driverLoc?.lat ? driverLoc : null}
                  pickupLocation={pickupLocation?.lat ? pickupLocation : null}
                  destinationLocation={destinationLocation?.lat ? destinationLocation : null}
                  passengerLocation={passengerLocation?.lat ? passengerLocation : null}
                  eta={etaMin}
                  rideId={activeRideId}
                  isDriver={false}
                />




                <div style={{ marginTop: "20px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ flex: isMobile ? "1 1 100%" : "1", minWidth: "200px" }}>
                    <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "16px" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: "600", color: "#374151" }}>Ride Information</h4>
                      <p style={{ margin: "6px 0", fontSize: "14px", color: "#6b7280" }}><strong>Ride ID:</strong> {activeRideId}</p>
                      <p style={{ margin: "6px 0", fontSize: "14px", color: "#6b7280" }}><strong>Status:</strong> {driverLoc ? "Driver Connected" : "Waiting for Driver"}</p>
                      <p style={{ margin: "6px 0", fontSize: "14px", color: "#6b7280" }}><strong>ETA:</strong> {etaMin !== null ? `${etaMin} minutes` : "Calculating..."}</p>
                    </div>
                  </div>
                  {driverLoc && (
                    <div style={{ flex: isMobile ? "1 1 100%" : "1", minWidth: "200px" }}>
                      <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "16px" }}>
                        <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: "600", color: "#374151" }}>Driver Location</h4>
                        <p style={{ margin: "6px 0", fontSize: "14px", color: "#6b7280" }}><strong>Speed:</strong> {driverLoc.speed ? `${driverLoc.speed} m/s` : "N/A"}</p>
                        <p style={{ margin: "6px 0", fontSize: "14px", color: "#6b7280" }}><strong>Address:</strong> {driverAddress || "Fetching..."}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>No active ride. Book a ride first to start live tracking.</p>}
          </div>
        )}

        {/* TRIP HISTORY */}
        {activeTab === "history" && (
          <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "20px" : "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: isMobile ? "20px" : "24px", fontWeight: "bold", color: "#1f2937" }}>Trip History</h2>
            {bookings.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? "13px" : "14px" }}>
                  <thead style={{ background: "#f3f4f6", border: "1px solid #d1d5db" }}>
                    <tr>
                      {["Ride ID", "Pickup", "Destination", "Date", "Time", "Status"].map((th, i) => <th key={i} style={{ padding: isMobile ? "10px" : "12px", fontWeight: "600", color: "#374151", textAlign: "left" }}>{th}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={i} style={{ transition: "background 0.2s ease" }} onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: isMobile ? "10px" : "12px", border: "1px solid #e5e7eb", color: "#6b7280" }}>{b.ride_id}</td>
                        <td style={{ padding: isMobile ? "10px" : "12px", border: "1px solid #e5e7eb", color: "#6b7280" }}>{b.pickup?.address || "Unknown"}</td>
                        <td style={{ padding: isMobile ? "10px" : "12px", border: "1px solid #e5e7eb", color: "#6b7280" }}>{b.destination?.address || "Unknown"}</td>
                        <td style={{ padding: isMobile ? "10px" : "12px", border: "1px solid #e5e7eb", color: "#6b7280" }}>{b.date}</td>
                        <td style={{ padding: isMobile ? "10px" : "12px", border: "1px solid #e5e7eb", color: "#6b7280" }}>{b.time}</td>
                        <td style={{ padding: isMobile ? "10px" : "12px", border: "1px solid #e5e7eb" }}>
                          <span style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block", background: b.status === 'active' ? "#dbeafe" : b.status === 'pending' ? "#fef3c7" : "#dcfce7", color: b.status === 'active' ? "#1e40af" : b.status === 'pending' ? "#92400e" : "#166534" }}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>No trips found.</p>}
          </div>
        )}
      </div>
      <style>{`@keyframes spin {0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
    </div>
  );
};

export default OKUPassengerDashboard;
