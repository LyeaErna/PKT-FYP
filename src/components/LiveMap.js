import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LiveMap = ({
  driverLocation,
  passengerLocation,
  pickupLocation,
  destinationLocation,
  eta,
  rideId = "",
  isDriver = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    driver: null,
    passenger: null,
    pickup: null,
    destination: null,
  });
  const routeLineRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([5.3299, 103.1370], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (!isDriver) {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (window.onMapClick) window.onMapClick(lat, lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isDriver]);

  const updateMarker = (key, location, color, label) => {
    if (!mapInstanceRef.current || !location?.lat || !location?.lng) return;

    if (markersRef.current[key]) mapInstanceRef.current.removeLayer(markersRef.current[key]);

    const icon = L.divIcon({
      className: `${key}-marker`,
      html: `<div style="
        width: ${key === "passenger" ? 16 : 18}px; 
        height: ${key === "passenger" ? 16 : 18}px;
        background: ${color};
        border: 2px solid white; 
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ${key === "driver" ? "animation: pulse 2s infinite;" : ""}
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const popup = `<div style="text-align:center;"><strong>${label}</strong><br/>
      Lat: ${location.lat.toFixed(5)}<br/>
      Lng: ${location.lng.toFixed(5)}${key === "driver" && eta ? `<br/>ETA: ${eta} min` : ""}</div>`;

    const marker = L.marker([location.lat, location.lng], { icon }).addTo(mapInstanceRef.current).bindPopup(popup);
    markersRef.current[key] = marker;
  };

  // Update all markers whenever locations change
  useEffect(() => { updateMarker("driver", driverLocation, "#22c55e", "🚗 Driver"); }, [driverLocation, eta]);
  useEffect(() => { updateMarker("passenger", passengerLocation, "#3b82f6", "👤 Passenger"); }, [passengerLocation]);
  useEffect(() => { updateMarker("pickup", pickupLocation, "#f59e0b", "📍 Pickup"); }, [pickupLocation]);
  useEffect(() => { updateMarker("destination", destinationLocation, "#ef4444", "🏁 Destination"); }, [destinationLocation]);

  // Update route line dynamically
  useEffect(() => {
    if (!driverLocation || !pickupLocation || !mapInstanceRef.current) return;

    if (routeLineRef.current) mapInstanceRef.current.removeLayer(routeLineRef.current);

    const line = L.polyline([
      [driverLocation.lat, driverLocation.lng],
      [pickupLocation.lat, pickupLocation.lng],
    ], { color: "#22c55e", weight: 4, opacity: 0.7, dashArray: "10,10" }).addTo(mapInstanceRef.current);

    routeLineRef.current = line;

    const group = new L.featureGroup(Object.values(markersRef.current).filter(Boolean).concat(line));
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
  }, [driverLocation, pickupLocation, passengerLocation, destinationLocation]);

  // Center map on driver if it's driver view
  useEffect(() => {
    if (isDriver && driverLocation?.lat && driverLocation?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.setView([driverLocation.lat, driverLocation.lng], 15);
    }
  }, [driverLocation, isDriver]);

  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden" }} />
      {eta && <div style={{
        position: "absolute", top: 10, right: 10,
        background: "rgba(0,0,0,0.8)", color: "white",
        padding: "8px 12px", borderRadius: "8px", fontSize: 14, fontWeight: "bold", zIndex: 1000
      }}>🚗 ETA: {eta} min</div>}
      {rideId && <div style={{
        position: "absolute", top: 10, left: 10,
        background: "rgba(0,0,0,0.8)", color: "white",
        padding: "6px 10px", borderRadius: "6px", fontSize: 12, zIndex: 1000
      }}>Ride: {rideId}</div>}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LiveMap;
