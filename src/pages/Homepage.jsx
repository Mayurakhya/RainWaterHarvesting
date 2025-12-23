import React from "react";
import { Link } from "react-router-dom";
import { FaBars, FaUserCircle, FaTint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
function HomePage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-teal-50">

      {/* ---------------- NAVBAR ---------------- */}
      <nav className="w-full bg-white shadow-md py-3 px-6 flex items-center justify-between fixed top-0 left-0 z-50">

        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* <FaBars className="text-blue-600 text-2xl" /> */}
          <div className="bg-blue-600 p-2 rounded-lg">
            <FaTint className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-700">RTRWH Assessment Platform</h2>
            <p className="text-xs text-gray-500 -mt-1">Water Conservation Heroes</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-8 text-gray-700 font-medium">

          <a href="#" className="text-blue-700 font-semibold">Home</a>
          <a href="#about" className="hover:text-blue-600">About</a>
          <a href="#chatbot" className="hover:text-blue-600">AI Chatbot</a>

          <button onClick={() => navigate("/feasibility")} className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow">
            Start Assessment
          </button>

          {/* Language Dropdown */}
          <select className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700">
            <option>EN</option>
            <option>HI</option>
            <option>AS</option>
            <option>BN</option>
          </select>

          {/* Profile/Login */}
          <button
            onClick={handleLogout}
            className="focus:outline-none"
            title="Logout"
          >
            <FaUserCircle className="text-3xl text-gray-600 hover:text-red-600 cursor-pointer transition-colors" />
          </button>
        </div>
      </nav>

      {/* Add spacing due to fixed navbar */}
      <div className="pt-24"></div>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="px-10 py-16 flex flex-col items-start">

        <span className="px-4 py-1 bg-green-100 text-green-700 font-medium rounded-full">
          Eco-Friendly Solution
        </span>

        <h1 className="text-5xl font-bold mt-4 leading-tight">
          <span className="text-blue-700"> Transforming Rooftops into</span>  <br />
          <span className="text-purple-600">Water Conservation Heroes</span>
        </h1>

        <p className="text-gray-700 mt-4 max-w-2xl">
          Join the revolution in sustainable water management. Assess your rainwater
          harvesting potential and contribute to groundwater conservation with our
          advanced AI-powered assessment tool.
        </p>

        {/* Stats Section */}
        <div className="flex gap-10 mt-10">
          <div>
            <h2 className="text-3xl font-bold text-blue-600">2.4B+</h2>
            <p className="text-gray-700">Liters Annual Potential</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-green-600">80%</h2>
            <p className="text-gray-700">Water Conservation</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-orange-600">₹50K</h2>
            <p className="text-gray-700">Average Savings</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-5 mt-8">
          <button onClick={() => navigate("/feasibility")} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow">
            Start Assessment
          </button>

          <button className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-200">
            Learn More
          </button>
        </div>
      </section>

      {/* ---------------- SECOND SECTION ---------------- */}
      <section id="about" className="px-10 py-20 bg-white shadow-inner rounded-t-3xl">

        <h2 className="text-4xl font-bold text-center text-blue-700 mb-4">
          Why Choose RTRWH?
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Discover the powerful benefits of rainwater harvesting
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-12">

          <div className="text-center bg-blue-50 p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold">Smart Assessment</h3>
            <p className="text-gray-600 mt-2">AI-powered analysis of your property’s rainwater harvesting potential</p>
          </div>

          <div className="text-center bg-green-50 p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold">Eco-Friendly</h3>
            <p className="text-gray-600 mt-2">Reduce environmental impact and support sustainable water management</p>
          </div>

          <div className="text-center bg-purple-50 p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold">Custom Solutions</h3>
            <p className="text-gray-600 mt-2">Personalized recommendations based on your specific requirements</p>
          </div>

          <div className="text-center bg-orange-50 p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold">Cost Savings</h3>
            <p className="text-gray-600 mt-2">Reduce water bills and enjoy long-term economic benefits</p>
          </div>

        </div>

      </section>
    </div>
  );
}

export default HomePage;