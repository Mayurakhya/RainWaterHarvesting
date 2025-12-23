import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaMapMarkerAlt, FaCloudRain, FaRulerCombined, FaTint, FaTimes, FaCheck } from "react-icons/fa";
import axios from "axios";

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
});

const API_BASE_URL = import.meta.env.VITE_API_URL ;

// --- HELPER: GET TOKEN (Cookies -> LocalStorage) ---
const getAuthToken = () => {
  // 1. Try to find 'access_token' or 'token' in cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token' || name === 'token') {
      return value;
    }
  }
  // 2. Fallback: Check localStorage (from your previous Login code)
  return localStorage.getItem("token");
};

// --- HELPER: Auto-center Map ---
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

// --- MAP MODAL COMPONENT ---
const MapAreaModal = ({ onClose, onConfirm, initialCenter }) => {
  const [map, setMap] = useState(null);
  const center = initialCenter && initialCenter.lat ? [initialCenter.lat, initialCenter.lng] : [26.75, 94.22];

  const _onCreated = (e) => {
    const layer = e.layer;
    if (layer.getLatLngs) {
      const latlngs = layer.getLatLngs()[0];
      const areaM2 = L.GeometryUtil.geodesicArea(latlngs);
      const areaSqFt = (areaM2 * 10.7639).toFixed(2);

      const message = `Rooftop Area Calculated:\n• ${areaM2.toFixed(2)} square meters\n• ${areaSqFt} square feet\n\nUse this value?`;

      if (window.confirm(message)) {
        onConfirm(areaM2);
      } else {
        layer.remove();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-600">
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-md z-10">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaRulerCombined className="text-green-400" /> Accurate Area Calculator
            </h3>
            <p className="text-xs text-gray-400">Draw points around your roof. Click the first point to close.</p>
          </div>
          <button onClick={onClose} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors text-white font-bold px-4">
            Close Tool
          </button>
        </div>
        <div className="flex-grow relative">
          <MapContainer center={center} zoom={18} style={{ height: '100%', width: '100%' }} ref={setMap}>
            <RecenterAutomatically lat={center[0]} lng={center[1]} />
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={_onCreated}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: {
                    allowIntersection: false,
                    showArea: false,
                    shapeOptions: { color: '#00ff00' },
                  },
                }}
              />
            </FeatureGroup>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Satellite View (Esri)">
                <TileLayer
                  attribution='&copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenStreetMap">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>
            </LayersControl>
            <Marker position={center}>
              <Popup>Your Detected Location</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

// --- MAIN FORM ---
function FeasibilityForm() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };

  const [formData, setFormData] = useState({
    location: "",
    roof_area_m2: "",
    roof_type: "RCC",
    annual_rainfall_mm: "",
    use_type: "domestic",
    num_occupants: "",
    system_type: "storage",
    soil_type: "sand",
    latitude: null,
    longitude: null
  });

  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          location: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
          latitude: lat,
          longitude: lon
        }));
        try {
          const response = await axios.get(`${API_BASE_URL}/rainfall/average`, {
            params: { latitude: lat, longitude: lon }
          });

          let avgRainfall = response.data.average_annual_rainfall_mm || response.data.average_rainfall;
          if (avgRainfall) setFormData((prev) => ({ ...prev, annual_rainfall_mm: avgRainfall }));
        } catch (error) {
          console.error("API Error:", error);
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation Error:", error);
        alert("Unable to retrieve location.");
        setFetchingLocation(false);
      }
    );
  };

  const handleAreaCalculated = (areaM2) => {
    setFormData((prev) => ({
      ...prev,
      roof_area_m2: areaM2.toFixed(2)
    }));
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getAuthToken();

    if (!token) {
      alert("You are not logged in. Please login first.");
      navigate("/");
      return;
    }

    const payload = {
      input: {
        location: formData.location,
        roof_area_m2: Number(formData.roof_area_m2),
        roof_type: formData.roof_type,
        annual_rainfall_mm: Number(formData.annual_rainfall_mm),
        use_type: formData.use_type,
        num_occupants: Number(formData.num_occupants),
        system_type: formData.system_type,
        soil_type: formData.soil_type
      }
    };

    try {
      // 2. Add Authorization Header
      const response = await axios.post(
        `${API_BASE_URL}/projects/calculate`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        }
      );
      navigate("/result", { state: { data: response.data } });
      console.log("Response:", response.data);
      alert("Feasibility Calculation Successful!");

    } catch (error) {
      console.error("Submission Error:", error);
      if (error.response?.status === 401) {
        alert("Session expired or unauthorized. Please login again.");
        navigate("/login");
      } else {
        const errMsg = error.response?.data?.detail
          ? JSON.stringify(error.response.data.detail)
          : "Calculation failed.";
        alert(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-100 flex flex-col items-center overflow-x-hidden font-sans text-gray-800">

      <nav className="w-full bg-white shadow-md py-3 px-6 flex items-center justify-between fixed top-0 left-0 z-50">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
          <div className="bg-blue-600 p-2 rounded-lg">
            <FaTint className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-700">RTRWH Platform</h2>
            <p className="text-xs text-gray-500 -mt-1">Water Conservation Heroes</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">

          <Link to="/home" className="hover:text-blue-600 transition-colors">Home</Link>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href="#chatbot" className="hover:text-blue-600 transition-colors">AI Chatbot</a>

          {/* ACTIVE ASSESSMENT BUTTON */}
          <button
            disabled
            className="px-4 py-1.5 bg-blue-100 text-blue-700 font-bold border border-blue-200 rounded-lg shadow-inner cursor-default flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Assessment Active
          </button>

          {/* Language Dropdown */}
          <select className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700 bg-white">
            <option>EN</option>
            <option>HI</option>
            <option>AS</option>
            <option>BN</option>
          </select>

          {/* Profile */}
          <button
            onClick={handleLogout}
            className="focus:outline-none"
            title="Logout"
          >
            <FaUserCircle className="text-3xl text-gray-600 hover:text-red-600 cursor-pointer transition-colors" />
          </button>
        </div>
      </nav>

      {showMap && (
        <MapAreaModal
          onClose={() => setShowMap(false)}
          onConfirm={handleAreaCalculated}
          initialCenter={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
        />
      )}

      <div className="w-full flex-grow flex items-center justify-center pt-32 pb-12 px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-100">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Feasibility Check</h1>
            <p className="text-blue-100 text-lg opacity-90">Analyze your rooftop's potential.</p>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center justify-center mb-10 space-y-3">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={fetchingLocation}
                className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg"
              >
                <FaMapMarkerAlt className={fetchingLocation ? "animate-bounce" : "text-blue-400"} />
                {fetchingLocation ? "Locating..." : "Auto-Detect Location & Rainfall"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Location */}
              <div className="md:col-span-2 group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-xl"
                  />
                </div>
              </div>

              {/* Annual Rainfall */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                  Annual Rainfall (mm)
                  {formData.latitude && <span className="text-green-600 text-xs font-bold">Verified</span>}
                </label>
                <div className="relative">
                  <FaCloudRain className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="number"
                    name="annual_rainfall_mm"
                    value={formData.annual_rainfall_mm}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-xl"
                  />
                </div>
              </div>

              {/* Roof Area */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Roof Area (m²)</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <FaRulerCombined className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="number"
                      name="roof_area_m2"
                      value={formData.roof_area_m2}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-xl"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaRulerCombined /> Map Tool
                  </button>
                </div>
              </div>

              {/* Other inputs */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Roof Type</label>
                <select name="roof_type" value={formData.roof_type} onChange={handleChange} className="w-full p-4 border rounded-xl bg-white">
                  <option value="RCC">RCC (Concrete)</option>
                  <option value="sheet">Metal Sheet</option>
                  <option value="tiles">Clay Tiles</option>
                  <option value="thatched">Thatched</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Soil Type</label>
                <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="w-full p-4 border rounded-xl bg-white">
                  <option value="sand">Sandy</option>
                  <option value="clay">Clay</option>
                  <option value="loam">Loamy</option>
                  <option value="rocky">Rocky</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Usage Type</label>
                <select name="use_type" value={formData.use_type} onChange={handleChange} className="w-full p-4 border rounded-xl bg-white">
                  <option value="domestic">Domestic</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="agricultural">Agricultural</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Occupants</label>
                <div className="relative">
                  <FaUserCircle className="absolute left-4 top-4 text-gray-400" />
                  <input type="number" name="num_occupants" value={formData.num_occupants} onChange={handleChange} className="w-full pl-11 pr-4 py-4 border rounded-xl" required />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred System</label>
                <select name="system_type" value={formData.system_type} onChange={handleChange} className="w-full p-4 border rounded-xl bg-white">
                  <option value="storage">Storage Tank</option>
                  <option value="recharge">Groundwater Recharge</option>
                  <option value="both">Hybrid (Both)</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl text-xl font-bold text-white shadow-xl transition-all
                    ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {loading ? "Calculating..." : "Calculate Feasibility"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeasibilityForm;