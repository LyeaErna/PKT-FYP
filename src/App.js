import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OKUTransport from "./OKUTransport"; // your homepage
import Login from "./login/login";         // login page
import Register from "./login/Register";         // register page
import PassengerDashboard from "./login/PassengerDashboard" //dashboard Penumpang
import AccessibilityForm from "./login/accessiblity"; //form OKU customize profile
import ManageDriver from "./login/DriverManagement"; //driver management
import Driver from "./login/DriverDashboard"; //driver dashboard
import Admin from "./login/AdminDashboard"; //admin dashboard
import JKM from "./login/JKMOfficerDashboard"; //jkm
import OKU from "./login/OKU";
import DriverRegistration from "./login/DriverRegistration";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OKUTransport />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/PassengerDashboard" element={<PassengerDashboard />} />
        <Route path="/accessibility" element={<AccessibilityForm />} />
        <Route path="/ManageDriver" element={<ManageDriver />} />
        <Route path="/Driver" element={<Driver />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/JKM" element={<JKM />} />
        <Route path="/OKU" element={<OKU />} />
        <Route path="/DriverRegistration" element={<DriverRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
