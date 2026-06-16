import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaMapMarkerAlt, FaCloudRain, FaRulerCombined, FaTint, FaCalculator, FaMap, FaMinus, FaPlus } from "react-icons/fa";
import axios from "axios";

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_BASE_URL = import.meta.env.VITE_API_URL ;
const DEFAULT_MAP_CENTER = [26.75, 94.22];
const isValidCoordinate = (value) => Number.isFinite(Number(value));
const selectChevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%2363706b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

const DividerLabel = ({ children }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7a8580]">{children}</span>
    <span className="h-px flex-1 bg-[#e7e7e4]" />
  </div>
);

const FieldLabel = ({ children, badge }) => (
  <label className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold text-[#26312f]">
    {children}
    {badge}
  </label>
);

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-[#f5f5f3] px-3 py-[9px] text-[13px] text-[#102321] outline-none transition-colors focus:border-[#5DCAA5]";

const selectClass = `${inputClass} appearance-none bg-no-repeat pr-9`;

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
    const resizeMap = () => map.invalidateSize();
    resizeMap();
    const frameId = window.requestAnimationFrame(resizeMap);
    const timeoutId = window.setTimeout(resizeMap, 250);

    map.setView([lat, lng], 18, { animate: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [lat, lng, map]);
  return null;
};

const MapSizeInvalidator = () => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const frameId = window.requestAnimationFrame(invalidate);
    const timeoutId = window.setTimeout(invalidate, 300);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [map]);

  return null;
};

const MapClickSelector = ({ onSelect }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (event) => {
      onSelect(event.latlng.lat, event.latlng.lng, "Selected point on map");
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onSelect]);

  return null;
};

const getPolygonOuterRing = (layer) => {
  const latlngs = layer.getLatLngs?.();
  const outerRing = Array.isArray(latlngs?.[0]) ? latlngs[0] : latlngs;

  if (!Array.isArray(outerRing)) return [];

  return outerRing.filter(
    (point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lng)
  );
};

// --- HELPER: Calculate area using local projection + Shoelace formula (fallback) ---
const calculatePolygonArea = (latlngs) => {
  if (!Array.isArray(latlngs) || latlngs.length < 3) return 0;

  const validLatLngs = latlngs.filter(
    (point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lng)
  );
  if (validLatLngs.length < 3) return 0;

  const averageLat =
    validLatLngs.reduce((total, point) => total + point.lat, 0) / validLatLngs.length;
  const latScale = 111320;
  const lngScale = latScale * Math.cos((averageLat * Math.PI) / 180);
  const projectedPoints = validLatLngs.map((point) => ({
    x: point.lng * lngScale,
    y: point.lat * latScale,
  }));

  let area = 0;
  for (let i = 0; i < projectedPoints.length; i++) {
    const current = projectedPoints[i];
    const next = projectedPoints[(i + 1) % projectedPoints.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
};

// --- LOCATION MODAL COMPONENT ---
const LocationModal = ({ onClose, onLocationConfirm, initialCenter }) => {
  const center =
    initialCenter && isValidCoordinate(initialCenter.lat) && isValidCoordinate(initialCenter.lng)
      ? [Number(initialCenter.lat), Number(initialCenter.lng)]
      : DEFAULT_MAP_CENTER;
  const [selectedLocation, setSelectedLocation] = useState({
    lat: center[0],
    lng: center[1],
    label: initialCenter?.label || "Map center",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSelectLocation = (lat, lng, label = "Selected point on map") => {
    setSelectedLocation({
      lat: Number(lat),
      lng: Number(lng),
      label,
    });
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (!data.length) {
        setSearchError("No matching locations found. Try a nearby city, landmark, or full address.");
        return;
      }
      setSearchResults(data);
      handleSelectLocation(data[0].lat, data[0].lon, data[0].display_name);
    } catch (error) {
      console.error("Location search error:", error);
      setSearchError("Location search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmLocation = () => {
    onLocationConfirm(selectedLocation);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-600">
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-md z-10">
          <div className="min-w-0">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-400" /> Select Location
            </h3>
            <p className="text-xs text-gray-400">Search for a place or click on the map to select a location.</p>
          </div>
          <button onClick={onClose} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors text-white font-bold px-4">
            Close
          </button>
        </div>
        <div className="bg-white border-b border-gray-200 p-4 z-10">
          <form onSubmit={handleSearchLocation} className="flex flex-col md:flex-row gap-3 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input flex-grow"
              placeholder="Search village, city, landmark, or address"
            />
            <button type="submit" disabled={searching} className="btn-primary px-6 py-3">
              {searching ? "Searching..." : "Search"}
            </button>
          </form>
          {searchError && <p className="text-sm text-red-600 font-semibold mb-3">{searchError}</p>}
          {searchResults.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {searchResults.map((result) => (
                <button
                  type="button"
                  key={result.place_id}
                  onClick={() => handleSelectLocation(result.lat, result.lon, result.display_name)}
                  className="shrink-0 max-w-xs text-left rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-emerald-500"
                  title={result.display_name}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-semibold flex justify-between items-center">
            <div>
              Selected: {selectedLocation.label}
              <span className="block text-xs mt-1">
                Lat {selectedLocation.lat.toFixed(6)} - Lon {selectedLocation.lng.toFixed(6)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="btn-secondary px-6 py-2 whitespace-nowrap ml-4"
            >
              Confirm Location
            </button>
          </div>
        </div>
        <div className="flex-grow relative">
          <MapContainer center={[selectedLocation.lat, selectedLocation.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <RecenterAutomatically lat={selectedLocation.lat} lng={selectedLocation.lng} />
            <MapClickSelector onSelect={handleSelectLocation} />
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
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>{selectedLocation.label}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

// --- AREA CALCULATION MODAL COMPONENT ---
const AreaCalculationModal = ({ onClose, onAreaConfirm, initialCenter, locationLabel }) => {
  const drawnItemsRef = useRef(null);
  const center =
    initialCenter && isValidCoordinate(initialCenter.lat) && isValidCoordinate(initialCenter.lng)
      ? [Number(initialCenter.lat), Number(initialCenter.lng)]
      : DEFAULT_MAP_CENTER;

  const _onCreated = (e) => {
    try {
      const layer = e.layer;
      if (!layer?.getLatLngs) {
        alert("Error: Unable to get coordinates from drawn shape. Please try again.");
        return;
      }

      drawnItemsRef.current?.clearLayers();
      drawnItemsRef.current?.addLayer(layer);

      const latlngs = getPolygonOuterRing(layer);
      if (!latlngs || latlngs.length < 3) {
        alert("Please draw a polygon with at least 3 points.");
        layer.remove();
        return;
      }

      let areaM2 = 0;
      
      // Try using L.GeometryUtil if available, otherwise use fallback
      if (L.GeometryUtil && typeof L.GeometryUtil.geodesicArea === 'function') {
        areaM2 = L.GeometryUtil.geodesicArea(latlngs);
      } else {
        areaM2 = calculatePolygonArea(latlngs);
      }

      if (!Number.isFinite(areaM2) || areaM2 <= 0) {
        alert("Error calculating area. Please try drawing again.");
        layer.remove();
        return;
      }

      const areaSqFt = (areaM2 * 10.7639).toFixed(2);
      const message = `Rooftop Area Calculated:\n• ${areaM2.toFixed(2)} square meters\n• ${areaSqFt} square feet\n\nUse this value?`;

      if (window.confirm(message)) {
        onAreaConfirm(areaM2);
      } else {
        drawnItemsRef.current?.removeLayer(layer);
      }
    } catch (error) {
      console.error("Error calculating area:", error);
      alert("Error calculating area. Please try drawing again.");
      try {
        e.layer?.remove?.();
      } catch (e) {
        console.error("Error removing layer:", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-600">
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-md z-10">
          <div className="min-w-0">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaRulerCombined className="text-green-400" /> Calculate Rooftop Area
            </h3>
            <p className="text-xs text-gray-400">Draw a polygon around your roof to calculate the area.</p>
          </div>
          <button onClick={onClose} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors text-white font-bold px-4">
            Close
          </button>
        </div>
        <div className="bg-blue-50 border-b border-blue-200 p-3 z-10">
          <p className="text-sm text-blue-800 font-semibold">
            📍 Location: {locationLabel}
          </p>
        </div>
        <div className="flex-grow relative">
          <MapContainer center={[center[0], center[1]]} zoom={18} style={{ height: '100%', width: '100%' }}>
            <RecenterAutomatically lat={center[0]} lng={center[1]} />
            <MapSizeInvalidator />
            <FeatureGroup ref={drawnItemsRef}>
              <EditControl
                position="topleft"
                onCreated={_onCreated}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: {
                    metric: true,
                    feet: true,
                    shapeOptions: { color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.2, weight: 3 },
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
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }
    localStorage.removeItem("token");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };

  const [formData, setFormData] = useState({
    location: "",
    roof_area_m2: "",
    roof_type: "RCC",
    annual_rainfall_mm: "0",
    use_type: "domestic",
    num_occupants: "4",
    system_type: "storage",
    soil_type: "sand",
    latitude: null,
    longitude: null
  });

  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [locationError, setLocationError] = useState("");
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [manualCoords, setManualCoords] = useState({
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchRainfallForCoordinates = async (lat, lon) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rainfall/average`, {
        params: { latitude: lat, longitude: lon }
      });

      let avgRainfall = response.data.average_annual_rainfall_mm || response.data.average_rainfall;
      if (avgRainfall) setFormData((prev) => ({ ...prev, annual_rainfall_mm: avgRainfall }));
      return true;
    } catch (error) {
      console.error("API Error:", error);
      return false;
    }
  };

  const handleManualCoordChange = (e) => {
    const { name, value } = e.target;
    setManualCoords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyLocationCoordinates = async (lat, lon, label = "Custom location") => {
    setLocationError("");
    setLocationStatus(`${label} applied. Looking up rainfall...`);
    setManualCoords({
      latitude: String(lat),
      longitude: String(lon),
    });
    setFormData((prev) => ({
      ...prev,
      location: `${label} (${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)})`,
      latitude: Number(lat),
      longitude: Number(lon),
    }));

    const rainfallFound = await fetchRainfallForCoordinates(lat, lon);
    setLocationStatus(
      rainfallFound
        ? `${label} applied and rainfall updated.`
        : `${label} applied, but rainfall lookup failed. You can enter rainfall manually.`
    );
  };

  const handleApplyManualLocation = async () => {
    const lat = Number(manualCoords.latitude);
    const lon = Number(manualCoords.longitude);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setLocationError("Enter a valid latitude between -90 and 90.");
      setLocationStatus("");
      return;
    }

    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      setLocationError("Enter a valid longitude between -180 and 180.");
      setLocationStatus("");
      return;
    }

    await applyLocationCoordinates(lat, lon, "Custom location");
  };

  const handleLocationConfirm = async ({ lat, lng, label }) => {
    await applyLocationCoordinates(lat, lng, label || "Map location");
    setShowLocationModal(false);
  };

  const handleAreaConfirmed = (areaM2) => {
    setFormData((prev) => ({
      ...prev,
      roof_area_m2: areaM2.toFixed(2)
    }));
    setShowAreaModal(false);
  };

  const updateOccupants = (change) => {
    setFormData((prev) => {
      const current = Number.parseInt(prev.num_occupants, 10) || 1;
      return {
        ...prev,
        num_occupants: String(Math.max(1, current + change)),
      };
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setLocationError("Current location works only on HTTPS or localhost. Please open the app through a secure URL.");
      return;
    }

    setLocationError("");
    setLocationStatus("Requesting permission from your browser...");
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 0);
        setDetectedLocation({ lat, lon, accuracy });

        setFormData((prev) => ({
          ...prev,
          location: `Current location (${lat.toFixed(6)}, ${lon.toFixed(6)})`,
          latitude: lat,
          longitude: lon
        }));
        setLocationStatus(`Location detected within about ${accuracy || "unknown"} meters.`);

        const rainfallFound = await fetchRainfallForCoordinates(lat, lon);
        if (!rainfallFound) {
          setLocationStatus("Location detected, but rainfall lookup failed. You can enter rainfall manually.");
        }
        setFetchingLocation(false);
      },
      (error) => {
        console.error("Geolocation Error:", error);
        const messageByCode = {
          1: "Location permission was denied. Allow location access in the browser and try again.",
          2: "Your device could not determine its current position. Check GPS/Wi-Fi location services and try again.",
          3: "Location request timed out. Move near a window or try again.",
        };
        setLocationError(messageByCode[error.code] || "Unable to retrieve current location.");
        setLocationStatus("");
        setFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getAuthToken();

    if (!token) {
      alert("You are not logged in. Please login first.");
      navigate("/login");
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
    <div className="app-shell">

      <nav className="nav-shell">

        {/* Logo */}
        <div className="brand-lockup cursor-pointer" onClick={() => navigate("/home")}>
          <div className="brand-mark">
            <FaTint />
          </div>
          <div>
            <h2 className="brand-title">RTRWH Platform</h2>
            <p className="brand-subtitle">Assessment cockpit</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="nav-links">

          <Link to="/home" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/blogs" className="hover:text-blue-600 transition-colors">Blogs</Link>

          {/* ACTIVE ASSESSMENT BUTTON */}
          <button
            disabled
            className="btn-secondary px-4 py-2 cursor-default"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="icon-button"
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </nav>

      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onLocationConfirm={handleLocationConfirm}
          initialCenter={
            isValidCoordinate(formData.latitude) && isValidCoordinate(formData.longitude)
              ? { lat: formData.latitude, lng: formData.longitude, label: formData.location || "Current location" }
              : null
          }
        />
      )}

      {showAreaModal && (
        <AreaCalculationModal
          onClose={() => setShowAreaModal(false)}
          onAreaConfirm={handleAreaConfirmed}
          initialCenter={
            isValidCoordinate(formData.latitude) && isValidCoordinate(formData.longitude)
              ? { lat: formData.latitude, lng: formData.longitude }
              : null
          }
          locationLabel={formData.location || "Unknown location"}
        />
      )}

      <div className="px-4 pb-12 pt-28 font-sans">
        <div className="mx-auto w-[84%] max-w-[1100px] rounded-[20px] border border-[#e8ebe7] bg-white">
          <div className="relative overflow-hidden rounded-t-[20px] bg-[#0d2e24] px-6 py-7">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#1e8f77]/25" />
            <div className="relative">
              <span className="inline-flex rounded-full bg-[#1e8f77]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9FE1CB]">
                Feasibility Check
              </span>
              <h2 className="mt-4 text-[30px] font-extrabold leading-[1.05] text-white">
                Map the roof. Run the numbers.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-6 text-[#9FE1CB]">
                Estimate rainfall yield, roof catchment, storage needs, and site fit from one focused form.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-[14px] p-5">
            <DividerLabel>Location</DividerLabel>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={fetchingLocation}
              className="relative flex w-full items-center justify-center rounded-xl bg-[#c96d2c] px-4 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#b75f23] disabled:opacity-70"
            >
              <FaMapMarkerAlt className={`absolute left-4 ${fetchingLocation ? "animate-bounce" : ""}`} />
              {fetchingLocation ? "Detecting location..." : "Auto-detect location & rainfall"}
            </button>

            {(locationError || detectedLocation || isValidCoordinate(formData.latitude)) && (
              <div className={`flex flex-col gap-3 rounded-xl border px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:justify-between ${
                locationError ? "border-red-200 bg-red-50 text-red-700" : "border-[#5DCAA5] bg-[#E1F5EE] text-[#0d4f3f]"
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${locationError ? "bg-red-500" : "bg-[#239b72]"}`} />
                  <div className="font-semibold">
                    {locationError ? (
                      locationError
                    ) : (
                      <>
                        Location detected · ~{detectedLocation?.accuracy || 200} m accuracy
                        <span className="block text-[12px] font-medium">
                          Lat {Number(formData.latitude).toFixed(6)} · Lon {Number(formData.longitude).toFixed(6)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {!locationError && (
                  <button
                    type="button"
                    onClick={() => detectedLocation && applyLocationCoordinates(detectedLocation.lat, detectedLocation.lon, "Current location")}
                    className="self-start rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#0a4f3c] sm:self-center"
                  >
                    Use this
                  </button>
                )}
              </div>
            )}

            {locationStatus && !locationError && (
              <p className="text-[12px] font-semibold text-[#0a4f3c]">{locationStatus}</p>
            )}

            <button
              type="button"
              onClick={() => setShowCustomLocation((prev) => !prev)}
              className="w-full rounded-xl border border-[#0a4f3c] bg-white px-4 py-3 text-[14px] font-bold text-[#0a4f3c] transition-colors hover:bg-[#f1faf6]"
            >
              {showCustomLocation ? "Hide custom coordinates" : "Enter custom coordinates"}
            </button>

            {showCustomLocation && (
              <>
                <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
                  <div>
                    <FieldLabel>Custom Latitude</FieldLabel>
                    <input type="number" step="any" name="latitude" value={manualCoords.latitude} onChange={handleManualCoordChange} className={inputClass} placeholder="Example: 26.1445" />
                  </div>
                  <div>
                    <FieldLabel>Custom Longitude</FieldLabel>
                    <input type="number" step="any" name="longitude" value={manualCoords.longitude} onChange={handleManualCoordChange} className={inputClass} placeholder="Example: 91.7362" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
                  <button type="button" onClick={handleApplyManualLocation} className="rounded-xl border border-[#0a4f3c] bg-white px-4 py-3 text-[14px] font-bold text-[#0a4f3c] transition-colors hover:bg-[#f1faf6]">
                    Use custom location
                  </button>
                  <button type="button" onClick={() => setShowLocationModal(true)} className="rounded-xl bg-[#0a4f3c] px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#083f31]">
                    Choose from map
                  </button>
                </div>
              </>
            )}

            <DividerLabel>Roof & rainfall</DividerLabel>

            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <div>
                <FieldLabel badge={<span className="rounded-full bg-[#E1F5EE] px-2 py-0.5 text-[10px] font-bold text-[#0a8065]">✓ Verified</span>}>
                  Annual rainfall (mm)
                </FieldLabel>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    name="annual_rainfall_mm"
                    value={formData.annual_rainfall_mm}
                    onChange={handleChange}
                    required
                    className={`${inputClass} ${fetchingLocation ? "opacity-70" : ""}`}
                    placeholder={fetchingLocation ? "Detecting rainfall..." : ""}
                    disabled={fetchingLocation}
                  />
                  {fetchingLocation && (
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#0a4f3c]" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <FieldLabel>Roof area (m²)</FieldLabel>
                <div className="relative">
                  <input type="number" step="any" name="roof_area_m2" value={formData.roof_area_m2} onChange={handleChange} required className={`${inputClass} pr-28`} placeholder="Example: 42" />
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidCoordinate(formData.latitude) || !isValidCoordinate(formData.longitude)) {
                        alert("Please set a location first before calculating roof area.");
                        return;
                      }
                      setShowAreaModal(true);
                    }}
                    className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#0a4f3c] px-3 py-1.5 text-[12px] font-bold text-white"
                  >
                    <FaMap /> Map tool
                  </button>
                </div>
              </div>
            </div>

            <DividerLabel>Property details</DividerLabel>

            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <div>
                <FieldLabel>Roof type</FieldLabel>
                <select name="roof_type" value={formData.roof_type} onChange={handleChange} className={selectClass} style={{ backgroundImage: selectChevron, backgroundPosition: "right 12px center", backgroundSize: "14px" }}>
                  <option value="RCC">RCC Concrete</option>
                  <option value="mangalore_tile">Mangalore tile</option>
                  <option value="metal_sheet">Metal sheet</option>
                </select>
              </div>

              <div>
                <FieldLabel>Soil type</FieldLabel>
                <select name="soil_type" value={formData.soil_type} onChange={handleChange} className={selectClass} style={{ backgroundImage: selectChevron, backgroundPosition: "right 12px center", backgroundSize: "14px" }}>
                  <option value="sand">Sandy</option>
                  <option value="clay">Clay</option>
                  <option value="loam">Loamy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <div>
                <FieldLabel>Usage type</FieldLabel>
                <select name="use_type" value={formData.use_type} onChange={handleChange} className={selectClass} style={{ backgroundImage: selectChevron, backgroundPosition: "right 12px center", backgroundSize: "14px" }}>
                  <option value="domestic">Domestic</option>
                  <option value="commercial">Commercial</option>
                  <option value="agricultural">Agricultural</option>
                </select>
              </div>

              <div>
                <FieldLabel>Occupants</FieldLabel>
                <div className="flex h-[39px] items-center justify-between rounded-lg border border-[#e0e0e0] bg-[#f5f5f3] px-2">
                  <button type="button" onClick={() => updateOccupants(-1)} className="grid h-7 w-7 place-items-center rounded-full text-[#0a4f3c] transition-colors hover:bg-white" aria-label="Decrease occupants">
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="num_occupants"
                    value={formData.num_occupants}
                    onChange={(event) => {
                      const value = Math.max(1, Number.parseInt(event.target.value || "1", 10));
                      setFormData((prev) => ({ ...prev, num_occupants: String(value) }));
                    }}
                    required
                    className="w-16 bg-transparent text-center text-[13px] font-bold text-[#102321] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button type="button" onClick={() => updateOccupants(1)} className="grid h-7 w-7 place-items-center rounded-full text-[#0a4f3c] transition-colors hover:bg-white" aria-label="Increase occupants">
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>Preferred system</FieldLabel>
              <select name="system_type" value={formData.system_type} onChange={handleChange} className={selectClass} style={{ backgroundImage: selectChevron, backgroundPosition: "right 12px center", backgroundSize: "14px" }}>
                <option value="storage">Storage tank</option>
                <option value="recharge">Recharge pit</option>
                <option value="hybrid">Both</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4f3c] px-4 py-4 text-[15px] font-bold text-white transition-shadow hover:shadow-[0_12px_28px_rgba(10,79,60,0.28)] disabled:opacity-70">
              <FaCalculator />
              {loading ? "Calculating..." : "Calculate feasibility"}
            </button>
          </form>
        </div>
      </div>

      {false && (
      <div className="page-pad">
        <div className="glass-panel form-panel">

          <div className="form-head">
            <span className="eyebrow bg-white/15 text-white border-white/20">Site Assessment</span>
            <h1 className="auth-title mt-4">Feasibility Check</h1>
            <p className="text-white/75 text-lg max-w-2xl">Map the roof, estimate rainfall yield, and prepare a priced implementation report.</p>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center justify-center mb-10 space-y-3">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={fetchingLocation}
                className="btn-secondary px-8 py-4 text-lg"
              >
                <FaMapMarkerAlt className={fetchingLocation ? "animate-bounce" : ""} />
                {fetchingLocation ? "Locating..." : "Auto-Detect Location & Rainfall"}
              </button>
              {(locationStatus || locationError || isValidCoordinate(formData.latitude)) && (
                <div className={`w-full max-w-2xl rounded-2xl border px-5 py-4 text-sm font-semibold ${
                  locationError
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}>
                  {locationError || locationStatus}
                  {isValidCoordinate(formData.latitude) && isValidCoordinate(formData.longitude) && (
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
                      <span>Lat {Number(formData.latitude).toFixed(6)}</span>
                      <span>Lon {Number(formData.longitude).toFixed(6)}</span>
                      <button
                        type="button"
                        onClick={() => setShowAreaModal(true)}
                        className="btn-ghost px-4 py-2"
                      >
                        Calculate Roof Area
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-10 rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_18px_42px_rgba(6,79,85,0.08)]">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-grow">
                  <label className="field-label">Custom Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={manualCoords.latitude}
                    onChange={handleManualCoordChange}
                    className="form-input"
                    placeholder="Example: 26.1445"
                  />
                </div>
                <div className="flex-grow">
                  <label className="field-label">Custom Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={manualCoords.longitude}
                    onChange={handleManualCoordChange}
                    className="form-input"
                    placeholder="Example: 91.7362"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyManualLocation}
                  className="btn-primary px-6 py-4 whitespace-nowrap"
                >
                  Use Custom Location
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="btn-secondary px-6 py-4 whitespace-nowrap"
                >
                  Choose From Map
                </button>
              </div>
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
                    className="form-input pl-11"
                  />
                </div>
              </div>

              {/* Annual Rainfall */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                  Annual Rainfall (mm)
                  {isValidCoordinate(formData.latitude) && <span className="text-green-600 text-xs font-bold">Verified</span>}
                </label>
                <div className="relative">
                  <FaCloudRain className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="number"
                    name="annual_rainfall_mm"
                    value={formData.annual_rainfall_mm}
                    onChange={handleChange}
                    required
                    className="form-input pl-11"
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
                      className="form-input pl-11"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidCoordinate(formData.latitude) || !isValidCoordinate(formData.longitude)) {
                        alert("Please set a location first before calculating roof area.");
                        return;
                      }
                      setShowAreaModal(true);
                    }}
                    className="btn-primary px-4 whitespace-nowrap"
                  >
                    <FaRulerCombined /> Map Tool
                  </button>
                </div>
              </div>

              {/* Other inputs */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Roof Type</label>
                <select name="roof_type" value={formData.roof_type} onChange={handleChange} className="form-select">
                  <option value="RCC">RCC (Concrete)</option>
                  <option value="metal_sheet">Metal Sheet</option>
                  <option value="tile">Clay Tiles</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Soil Type</label>
                <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="form-select">
                  <option value="sand">Sandy</option>
                  <option value="loam">Loamy</option>
                  <option value="clay">Clay</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Usage Type</label>
                <select name="use_type" value={formData.use_type} onChange={handleChange} className="form-select">
                  <option value="domestic">Domestic</option>
                  <option value="institutional">Institutional</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Occupants</label>
                <div className="relative">
                  <FaUserCircle className="absolute left-4 top-4 text-gray-400" />
                  <input type="number" name="num_occupants" value={formData.num_occupants} onChange={handleChange} className="form-input pl-11" required />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred System</label>
                <select name="system_type" value={formData.system_type} onChange={handleChange} className="form-select">
                  <option value="storage">Storage Tank</option>
                  <option value="recharge">Groundwater Recharge</option>
                  <option value="hybrid">Hybrid (Both)</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-5 text-xl"
                >
                  {loading ? "Calculating..." : "Calculate Feasibility"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default FeasibilityForm;
