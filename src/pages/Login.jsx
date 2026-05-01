import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTint, FaArrowRight } from "react-icons/fa";
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
        navigate("/home");
      } else {
        setError("Login failed: no access token received.");
      }
    } catch (err) {
      setError(err.message || err.detail || "Something went wrong. Please try again.");
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
          <Link to="/signup" className="btn-ghost keep-mobile px-5 py-2">
            Create Account
          </Link>
        </div>
      </nav>

      <main className="auth-layout">
        <section className="auth-story">
          <span className="eyebrow">Catchment Console</span>
          <h1 className="display-title">
            Read the roof. <span className="accent">Save the rain.</span>
          </h1>
          <p className="lead">
            A planning workspace for rooftop harvesting: rainfall, tank sizing, recharge guidance,
            and live component pricing in one assessment flow.
          </p>
          <div className="stat-row">
            <div className="metric-card">
              <strong>18m</strong>
              <span>typical setup review</span>
            </div>
            <div className="metric-card">
              <strong>5+</strong>
              <span>material categories priced</span>
            </div>
            <div className="metric-card">
              <strong>IN</strong>
              <span>localized rainfall context</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-head">
            <span className="eyebrow">Secure Access</span>
            <h2 className="auth-title mt-4">Welcome back</h2>
            <p className="text-white/75">Continue your water-saving assessments.</p>
          </div>

          <div className="auth-body">
            {error && <div className="alert alert-error mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Your password"
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

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                {loading ? "Opening dashboard..." : <>Login <FaArrowRight /></>}
              </button>
            </form>

            <p className="mt-7 text-center text-[color:var(--muted)] font-semibold">
              New here?{" "}
              <Link to="/signup" className="text-[color:var(--canal)] font-extrabold">
                Build an account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;
