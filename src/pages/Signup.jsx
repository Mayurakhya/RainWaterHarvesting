import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTint, FaArrowRight } from "react-icons/fa";
import { registerUser } from "../api/Register/registerApi";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({ username, email, password });
      setSuccess("Account created. Taking you to login...");

      setTimeout(() => {
        navigate("/");
      }, 1400);
    } catch (err) {
      setError(err.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <nav className="nav-shell">
        <button className="brand-lockup text-left" onClick={() => navigate("/")} type="button">
          <div className="brand-mark">
            <FaTint />
          </div>
          <div>
            <h2 className="brand-title">RTRWH Platform</h2>
            <p className="brand-subtitle">Rooftop water intelligence</p>
          </div>
        </button>

        <div className="nav-links">
          <Link to="/" className="btn-ghost keep-mobile px-5 py-2">
            Login
          </Link>
        </div>
      </nav>

      <main className="auth-layout">
        <section className="auth-story">
          <span className="eyebrow">New Survey Crew</span>
          <h1 className="display-title">
            Turn an address into a <span className="accent">water plan.</span>
          </h1>
          <p className="lead">
            Create an account to store assessments, compare catchment decisions, and generate
            reports with component costs ready for the next site conversation.
          </p>
          <div className="water-tile mt-8">
            <div className="tile-stat">
              <strong>RTRWH</strong>
              <p className="max-w-sm text-white/80 font-semibold">
                Roof geometry, rainfall, tank sizing, recharge planning, and live product intelligence.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-head">
            <span className="eyebrow">Create Profile</span>
            <h2 className="auth-title mt-4">Start assessing</h2>
            <p className="text-white/75">A few details and your workspace is ready.</p>
          </div>

          <div className="auth-body">
            {error && <div className="alert alert-error mb-5">{error}</div>}
            {success && <div className="alert alert-success mb-5">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="field-label">Username</label>
                <div className="field-wrap">
                  <FaUser className="field-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="form-input"
                    placeholder="site_lead"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Email Address</label>
                <div className="field-wrap">
                  <FaEnvelope className="field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <FaLock className="field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input pr-14"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="field-label">Confirm Password</label>
                <div className="field-wrap">
                  <FaLock className="field-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-input pr-14"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                {loading ? "Creating workspace..." : <>Sign Up <FaArrowRight /></>}
              </button>
            </form>

            <p className="mt-7 text-center text-[color:var(--muted)] font-semibold">
              Already registered?{" "}
              <Link to="/" className="text-[color:var(--canal)] font-extrabold">
                Login here
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Signup;
