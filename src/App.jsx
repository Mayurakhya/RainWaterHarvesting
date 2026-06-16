import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/Homepage";
import FeasibilityForm from "./pages/Feasibility";
import FeasibilityResult from "./pages/ResultFeasibility";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProtectedRoute from "./components/protectedRoute.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/projects" element={<ProjectsPage />} />
<Route
  path="/projects/:id"
  element={<ProjectDetails />}
/>
       <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage/>} />
          <Route path="/feasibility" element={<FeasibilityForm />} />
          <Route path="/result" element={<FeasibilityResult />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blogs/:slug" element={<BlogPost />} />
        </Route>
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
