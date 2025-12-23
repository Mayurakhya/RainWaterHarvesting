import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTint, FaUserCircle, FaArrowRight } from "react-icons/fa";
import { loginUser } from "../api/Login/loginApi"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email, password });

      if (response.access_token) {
        localStorage.setItem("token", response.access_token);
        console.log("Login successful:", response.message);
        navigate("/home");
      } else {
        setError("Login failed: No access token received.");
      }
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || err.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-100 flex flex-col items-center overflow-x-hidden font-sans text-gray-800">
      
      {/* --- NAVBAR --- */}
      <nav className="w-full bg-white shadow-md py-3 px-6 flex items-center justify-between fixed top-0 left-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
          <div className="bg-blue-600 p-2 rounded-lg">
            <FaTint className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-700">RTRWH Platform</h2>
            <p className="text-xs text-gray-500 -mt-1">Water Conservation Heroes</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          {/* <Link to="/home" className="hover:text-blue-600 transition-colors">Home</Link>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          
          <select className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700 bg-white focus:outline-none cursor-pointer">
            <option>EN</option>
            <option>HI</option>
            <option>AS</option>
          </select> */}

          <Link to="/signup" className="px-5 py-2 bg-blue-100 text-blue-600 rounded-full font-bold hover:bg-blue-200 transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="w-full flex-grow flex items-center justify-center pt-28 pb-12 px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-blue-100 text-sm opacity-90">
              Log in to access your dashboard and assessments.
            </p>
          </div>

          <div className="p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm flex items-center">
                <span className="font-bold mr-2">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Forgot Password?</a>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2
                  ${loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
              >
                {loading ? "Logging in..." : <>Login <FaArrowRight /></>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 font-medium">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-blue-700 font-bold hover:underline">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;