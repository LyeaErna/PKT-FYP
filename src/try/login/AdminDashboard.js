import React, { useState } from 'react';
import DriverManagement from './DriverManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceData, setServiceData] = useState({
    period: '1 Jan - 31 Jan 2024',
    driver: {
      name: 'Encik Ahmad Rahman',
      phone: '012-345-6789',
      status: 'Active',
      rating: 4.8,
      completedRides: 127
    },
    metrics: {
      totalRides: 42,
      completedRides: 38,
      cancelledRides: 4,
      satisfactionRate: 92,
      emergencyCalls: 2
    },
    recentActivities: [
      { id: 1, time: '10:30 AM', date: '25 Jan 2024', type: 'Ride Completed', location: 'Kuala Lumpur City Center' },
      { id: 2, time: '9:15 AM', date: '25 Jan 2024', type: 'Ride Started', location: 'Bangsar South' },
      { id: 3, time: '4:45 PM', date: '24 Jan 2024', type: 'Emergency Alert', location: 'Petaling Jaya', status: 'Resolved' },
      { id: 4, time: '8:30 AM', date: '24 Jan 2024', type: 'Ride Scheduled', location: 'Damansara Heights' }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Monthly Transport Service - Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              New Ride
            </button>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Period Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-blue-800">January 2024 Service</h2>
              <p className="text-blue-600">Service Period: {serviceData.period}</p>
              <p className="text-blue-600 mt-1">Approved by JKM</p>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {['Overview', 'Driver Management', 'Ride Schedule', 'Emergency', 'Reports'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 text-sm font-medium ${
                  activeTab === tab.toLowerCase() 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Metrics */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{serviceData.metrics.totalRides}</p>
                  <p className="text-sm text-blue-600">Total Rides</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{serviceData.metrics.completedRides}</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{serviceData.metrics.cancelledRides}</p>
                  <p className="text-sm text-red-600">Cancelled</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700">{serviceData.metrics.satisfactionRate}%</p>
                  <p className="text-sm text-purple-600">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {serviceData.recentActivities.map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.type} {activity.status && `- ${activity.status}`}
                          </p>
                          <p className="text-sm text-gray-500">{activity.location}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{activity.date}</p>
                          <p>{activity.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Driver Info & Emergency */}
          <div className="space-y-6">
            {/* Driver Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Driver</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-800">AR</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{serviceData.driver.name}</h4>
                  <p className="text-sm text-gray-500">{serviceData.driver.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium text-green-600">{serviceData.driver.status}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="font-medium text-yellow-600">{serviceData.driver.rating}/5.0</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm">
                Contact Driver
              </button>
            </div>

            {/* Emergency Panel */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-red-800">Emergency (989)</h4>
                  <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">2 Active</span>
                </div>
                <p className="text-sm text-red-600 mt-2">Press for immediate assistance</p>
              </div>
              
              <div className="space-y-3">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-md text-sm flex items-center justify-center">
                  <span>View Service History</span>
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-md text-sm flex items-center justify-center">
                  <span>Accessibility Settings</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-sm font-medium">
                  Schedule Ride
                </button>
                <button className="bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg text-sm font-medium">
                  Generate Report
                </button>
                <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-sm font-medium">
                  Message Driver
                </button>
                <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-3 rounded-lg text-sm font-medium">
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      
      {/* Drivers Tab */}
      {activeTab === 'driver management' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pengurusan Pemandu</h2>
          <DriverManagement />
        </section>
      )}

      </main>
    </div>
  );
};

export default AdminDashboard;