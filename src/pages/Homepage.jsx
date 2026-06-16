import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaClipboardCheck, FaLeaf, FaRupeeSign, FaSignOutAlt, FaTint, FaWater } from "react-icons/fa";

function HomePage() {
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

  return (
    <div className="app-shell">
      <nav className="nav-shell">
        <button className="brand-lockup text-left" onClick={() => navigate("/home")} type="button">
          <div className="brand-mark">
            <FaTint />
          </div>
          <div>
            <h2 className="brand-title">RTRWH Assessment</h2>
            <p className="brand-subtitle">Rooftop water intelligence</p>
          </div>
        </button>

        <div className="nav-links">
          <a href="#top" className="keep-mobile">Home</a>
          <Link to="/blogs" className="keep-mobile">Blogs</Link>
          <a href="#about">Method</a>
          <button onClick={() => navigate("/feasibility")} className="btn-primary px-5 py-2" type="button">
            Assess
          </button>
          <button onClick={handleLogout} className="icon-button" title="Logout" aria-label="Logout" type="button">
            <FaSignOutAlt />
          </button>
        </div>
      </nav>

      <main id="top" className="page-pad">
        <section className="hero-grid max-w-7xl mx-auto">
          <div className="stagger-in">
            <span className="eyebrow">
              <FaWater /> Rainwater Yield Studio
            </span>
            <h1 className="display-title">
              Every roof has a <span className="accent">water signature.</span>
            </h1>
            <p className="lead">
              Measure rooftop potential, estimate storage or recharge needs, and price real-world
              components without turning the assessment into a spreadsheet hunt.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <button onClick={() => navigate("/feasibility")} className="btn-primary px-7 py-4 text-lg" type="button">
                Start Assessment <FaArrowRight />
              </button>
              <a href="#about" className="btn-ghost px-7 py-4 text-lg">
                See Method
              </a>
              <Link to="/blogs" className="btn-secondary px-7 py-4 text-lg">
                Read Blogs
              </Link>
            </div>

            <div className="stat-row">
              <div className="metric-card">
                <strong>2.4B+</strong>
                <span>liters modeled as annual potential</span>
              </div>
              <div className="metric-card">
                <strong>80%</strong>
                <span>water conservation planning target</span>
              </div>
              <div className="metric-card">
                <strong>Rs50K</strong>
                <span>average long-term saving signal</span>
              </div>
            </div>
          </div>

          <div className="water-tile">
            <div className="tile-stat">
              <span className="eyebrow bg-white/20 text-white border-white/20">Field Preview</span>
              <strong>42m2</strong>
              <p className="max-w-xs text-white/80 font-semibold">
                Roof capture, rainfall depth, tank volume, and product cost converge into one report.
              </p>
            </div>
          </div>
        </section>
      </main>

      <section id="about" className="section-band">
        <div className="max-w-7xl mx-auto">
          <span className="eyebrow">Designed For Decisions</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mt-5">
            <h2 className="section-title max-w-3xl">Less guesswork between survey and installation.</h2>
            <p className="lead max-w-md">
              The interface follows the actual assessment path: locate, size, compare, and act.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-kicker" />
              <FaClipboardCheck className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Smart Assessment</h3>
              <p className="text-[color:var(--muted)] mt-3">
                Property inputs become harvestable volume, feasibility reasons, and practical next steps.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-kicker bg-[color:var(--leaf)]" />
              <FaLeaf className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Recharge Ready</h3>
              <p className="text-[color:var(--muted)] mt-3">
                Storage, recharge, and hybrid approaches keep the recommendation tied to site conditions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-kicker bg-[color:var(--sun)]" />
              <FaRupeeSign className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Live Pricing</h3>
              <p className="text-[color:var(--muted)] mt-3">
                Filters, gutters, tanks, diverters, and recharge materials can be surfaced as priced products.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-kicker bg-[color:var(--canal)]" />
              <FaTint className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Report Flow</h3>
              <p className="text-[color:var(--muted)] mt-3">
                Downloadable reports collect sizing, guidance, costs, and products into a single handoff.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
