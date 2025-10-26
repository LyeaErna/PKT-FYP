import React from "react";
export default function DriverDashboard() {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      <p className="mb-4">Manage your assigned rides, confirm passenger pickups, and view trip history.</p>
      <ul className="list-disc ml-6 space-y-2">
        <li>View and accept ride requests</li>
        <li>Update ride status</li>
        <li>See upcoming and completed rides</li>
      </ul>
    </div>
  );
}