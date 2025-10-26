import React, { useState } from 'react';

const OKUPassengerDashboard = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [bookingData, setBookingData] = useState({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    specialNeeds: '',
    recurring: false
  });
  const [upcomingRides, setUpcomingRides] = useState([
    { id: 1, date: '28 Jan 2024', time: '10:00 AM', pickup: 'Main Campus', destination: 'Medical Center', status: 'Confirmed' },
    { id: 2, date: '30 Jan 2024', time: '2:30 PM', pickup: 'Medical Center', destination: 'Main Campus', status: 'Confirmed' }
  ]);
  const [pastRides, setPastRides] = useState([
    { id: 1, date: '25 Jan 2024', time: '9:00 AM', pickup: 'Main Campus', destination: 'Library', rating: 5 },
    { id: 2, date: '24 Jan 2024', time: '3:15 PM', pickup: 'Library', destination: 'Main Campus', rating: 4 }
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData({
      ...bookingData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Booking request submitted successfully!');
    // Reset form
    setBookingData({
      pickup: '',
      destination: '',
      date: '',
      time: '',
      specialNeeds: '',
      recurring: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">OKU Transport Service</h1>
            <div className="flex items-center space-x-4">
              <button className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                Help
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
                P
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, Eizleen!</h2>
          <p className="text-gray-600">How can we assist with your transportation needs today?</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {['Book Ride', 'Upcoming Rides', 'Ride History'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 text-lg font-medium ${
                  activeTab === tab.toLowerCase().replace(' ', '-') 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'book-ride' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Book a New Ride</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <select
                    id="pickup"
                    name="pickup"
                    value={bookingData.pickup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select pickup location</option>
                    <option value="Main Campus">Main Campus</option>
                    <option value="Medical Center">Medical Center</option>
                    <option value="Library">Library</option>
                    <option value="Student Residence">Student Residence</option>
                    <option value="Sports Complex">Sports Complex</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <select
                    id="destination"
                    name="destination"
                    value={bookingData.destination}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select destination</option>
                    <option value="Main Campus">Main Campus</option>
                    <option value="Medical Center">Medical Center</option>
                    <option value="Library">Library</option>
                    <option value="Student Residence">Student Residence</option>
                    <option value="Sports Complex">Sports Complex</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements (Optional)
                </label>
                <textarea
                  id="specialNeeds"
                  name="specialNeeds"
                  rows={3}
                  value={bookingData.specialNeeds}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please let us know if you have any special requirements..."
                />
              </div>

              <div className="flex items-center">
                <input
                  id="recurring"
                  name="recurring"
                  type="checkbox"
                  checked={bookingData.recurring}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                  This is a recurring ride (same time daily)
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-lg"
                >
                  Book Ride
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'upcoming-rides' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Rides</h2>
            {upcomingRides.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {upcomingRides.map((ride) => (
                  <div key={ride.id} className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{ride.pickup} to {ride.destination}</h3>
                        <p className="text-gray-600">{ride.date} at {ride.time}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {ride.status}
                      </span>
                    </div>
                    <div className="mt-2 flex space-x-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-medium">
                        Cancel Ride
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You don't have any upcoming rides.</p>
            )}
          </div>
        )}

        {activeTab === 'ride-history' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Ride History</h2>
            {pastRides.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {pastRides.map((ride) => (
                  <div key={ride.id} className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{ride.pickup} to {ride.destination}</h3>
                        <p className="text-gray-600">{ride.date} at {ride.time}</p>
                      </div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < ride.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You don't have any past rides.</p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Book a Ride</h3>
            <p className="text-gray-600">Schedule transportation to your destination</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">My Schedule</h3>
            <p className="text-gray-600">View and manage your upcoming rides</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Get Help</h3>
            <p className="text-gray-600">Contact support for assistance</p>
          </div>
        </div>
      </main>

      {/* Accessibility Features */}
      <div className="fixed bottom-4 right-4">
        <button className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OKUPassengerDashboard;