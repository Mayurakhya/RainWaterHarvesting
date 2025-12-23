import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/Homepage";
import FeasibilityForm from "./pages/Feasibility";
import FeasibilityResult from "./pages/ResultFeasibility";
import ProtectedRoute from "./components/protectedRoute.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
       <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage/>} />
          <Route path="/feasibility" element={<FeasibilityForm />} />
          <Route path="/result" element={<FeasibilityResult />} />
        </Route>
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;