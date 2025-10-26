import React from "react";
export default function JKMOfficerDashboard() {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">JKM Officer Dashboard</h1>
      <p className="mb-4">Monitor and approve monthly service plans, access reports, and oversee the OKU transport service.</p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Review monthly plans</li>
        <li>Monitor bookings and emergency alerts</li>
        <li>Access service reports</li>
      </ul>
    </div>
  );
}