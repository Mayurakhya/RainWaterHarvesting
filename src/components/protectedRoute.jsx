import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const getAuthToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token' || name === 'token') return value;
  }
  return localStorage.getItem("token");
};

const ProtectedRoute = () => {
  const token = getAuthToken();
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;