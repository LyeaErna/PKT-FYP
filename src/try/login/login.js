import React, { useState } from "react";

const Login = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("OKU User"); // default role

  const handleSubmit = (e) => {
    e.preventDefault();
    // you can handle login logic here
    console.log("Login with role:", role);
    setIsOpen(false);
  };

  return (
    <>
      {/* Login Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-800 hover:text-blue-600 font-medium transition-all duration-300 hover:-translate-y-0.5 px-3 py-2 rounded-lg hover:bg-blue-50"
      >
        Login
      </button>

      {/* Login Modal */}
      <div
        className={`
          fixed inset-0 flex items-center justify-center z-50
          bg-black/30 backdrop-blur-sm
          transition-opacity duration-500
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label
                htmlFor="role"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Login as:
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                required
              >
                <option>OKU User</option>
                <option>Driver</option>
                <option>Company Admin</option>
                <option>JKM Officer</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Sign in
            </button>
          </form>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
