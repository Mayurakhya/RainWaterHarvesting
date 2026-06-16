import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaChartLine,
  FaClipboardList,
  FaCloudRain,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaTint,
  FaWater,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaClipboardList />,
    title: "Enter roof details",
    body: "Add roof area, material, location, and intended use in a guided assessment.",
  },
  {
    icon: <FaCloudRain />,
    title: "Get rainfall estimate",
    body: "RTRWH maps the site to India-localized rainfall data and estimates annual yield.",
  },
  {
    icon: <FaRupeeSign />,
    title: "See sizing + pricing",
    body: "Compare tank volume, recharge options, and priced components for the project.",
  },
];

function HarvestAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const width = 680;
    const height = 420;
    const drops = [];
    let tankLevel = 12;
    let tankTarget = 12;
    let frame = 0;
    let animationId;

    const drawRoundedRect = (x, y, w, h, r) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const initDrops = () => {
      for (let i = 0; i < 86; i += 1) {
        drops.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.58,
          speed: 3 + Math.random() * 3.4,
          len: 8 + Math.random() * 10,
          alpha: 0.35 + Math.random() * 0.48,
        });
      }
    };

    const drawSky = () => {
      const sky = ctx.createLinearGradient(0, 0, width, height);
      sky.addColorStop(0, "#123241");
      sky.addColorStop(0.55, "#145b61");
      sky.addColorStop(1, "#0a211f");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      for (let s = 0; s < 32; s += 1) {
        const sx = (s * 97 + 13) % width;
        const sy = (s * 53 + 7) % (height * 0.42);
        ctx.fillStyle = `rgba(255,255,255,${0.05 + (s % 5) * 0.03})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (s % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawCloud = (x, y, scale) => {
      ctx.fillStyle = "rgba(210, 234, 240, 0.86)";
      [[0, 0, 34], [28, 6, 26], [56, 4, 31], [84, 0, 26], [-24, 4, 22]].forEach(([bx, by, r]) => {
        ctx.beginPath();
        ctx.arc(x + bx * scale, y + by * scale, r * scale, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawGround = () => {
      ctx.fillStyle = "#244f33";
      ctx.fillRect(0, height - 80, width, 80);
      ctx.fillStyle = "#589244";
      ctx.fillRect(0, height - 84, width, 8);
      for (let gx = 0; gx < width; gx += 18) {
        ctx.fillStyle = "#78b94b";
        ctx.beginPath();
        ctx.moveTo(gx, height - 84);
        ctx.lineTo(gx + 4, height - 96);
        ctx.lineTo(gx + 8, height - 84);
        ctx.fill();
      }
    };

    const drawHouse = () => {
      const hx = 180;
      const hy = height - 82;
      const hw = 200;
      const hh = 120;

      ctx.fillStyle = "#efe4d4";
      ctx.fillRect(hx, hy - hh, hw, hh);
      ctx.strokeStyle = "rgba(9, 32, 31, 0.28)";
      ctx.strokeRect(hx, hy - hh, hw, hh);

      ctx.fillStyle = "#bf8458";
      ctx.fillRect(hx + 30, hy - 70, 50, 70);
      ctx.fillStyle = "#8bc2d6";
      ctx.fillRect(hx + 110, hy - 90, 45, 40);
      ctx.strokeStyle = "#4f8294";
      ctx.beginPath();
      ctx.moveTo(hx + 132, hy - 90);
      ctx.lineTo(hx + 132, hy - 50);
      ctx.moveTo(hx + 110, hy - 70);
      ctx.lineTo(hx + 155, hy - 70);
      ctx.stroke();

      ctx.fillStyle = "#c65325";
      ctx.beginPath();
      ctx.moveTo(hx - 14, hy - hh);
      ctx.lineTo(hx + hw / 2, hy - hh - 70);
      ctx.lineTo(hx + hw + 14, hy - hh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#873615";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      ctx.fillStyle = "#33413d";
      ctx.fillRect(hx + hw / 2 - 6, hy - hh - 72, 12, 30);
    };

    const drawGutter = () => {
      const hx = 180;
      const hy = height - 82;
      const hw = 200;
      const hh = 120;

      ctx.strokeStyle = "#94938c";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hx + hw + 14, hy - hh + 12);
      ctx.lineTo(hx + hw + 14, hy - hh + 60);
      ctx.quadraticCurveTo(hx + hw + 14, hy - hh + 90, hx + hw + 50, hy - hh + 90);
      ctx.lineTo(hx + hw + 100, hy - hh + 90);
      ctx.stroke();

      ctx.strokeStyle = "#555";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx + hw + 5, hy - hh + 12);
      ctx.lineTo(hx + hw + 22, hy - hh + 12);
      ctx.stroke();
    };

    const drawFlow = () => {
      const hx = 180;
      const hy = height - 82;
      const hh = 120;
      const progress = (frame % 42) / 42;
      const points = [
        [hx + 214, hy - hh + 12],
        [hx + 214, hy - hh + 60],
        [hx + 250, hy - hh + 90],
        [hx + 314, hy - hh + 90],
      ];
      const segment = Math.min(2, Math.floor(progress * 3));
      const local = progress * 3 - segment;
      const [x1, y1] = points[segment];
      const [x2, y2] = points[segment + 1];
      const fx = x1 + (x2 - x1) * local;
      const fy = y1 + (y2 - y1) * local;

      ctx.fillStyle = "rgba(133, 183, 235, 0.88)";
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTank = () => {
      const tx = 430;
      const ty = height - 82;
      const tw = 90;
      const th = 130;

      ctx.fillStyle = "#083f35";
      drawRoundedRect(tx, ty - th, tw, th, 10);
      ctx.fill();

      const waterHeight = Math.floor((tankLevel / 100) * (th - 20));
      if (waterHeight > 0) {
        ctx.save();
        drawRoundedRect(tx + 2, ty - th, tw - 4, th - 2, 10);
        ctx.clip();
        ctx.fillStyle = "rgba(55, 138, 221, 0.75)";
        ctx.fillRect(tx + 2, ty - waterHeight - 2, tw - 4, waterHeight);

        const waveY = ty - waterHeight - 2;
        ctx.fillStyle = "rgba(159, 225, 203, 0.55)";
        ctx.beginPath();
        ctx.moveTo(tx + 2, waveY);
        for (let wx = tx + 2; wx < tx + tw - 2; wx += 8) {
          ctx.quadraticCurveTo(wx + 4, waveY - 3 + Math.sin((wx + frame * 0.1) * 0.5) * 3, wx + 8, waveY);
        }
        ctx.lineTo(tx + tw - 2, waveY + 8);
        ctx.lineTo(tx + 2, waveY + 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.strokeStyle = "#24a878";
      ctx.lineWidth = 2;
      drawRoundedRect(tx, ty - th, tw, th, 10);
      ctx.stroke();

      for (let band = 1; band < 4; band += 1) {
        ctx.strokeStyle = "rgba(159, 225, 203, 0.24)";
        ctx.beginPath();
        ctx.moveTo(tx, ty - th + band * (th / 4));
        ctx.lineTo(tx + tw, ty - th + band * (th / 4));
        ctx.stroke();
      }

      ctx.fillStyle = "#26312f";
      ctx.fillRect(tx + 30, ty - th - 16, 30, 16);
      ctx.fillStyle = "#9fe1cb";
      ctx.font = "700 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(tankLevel)}%`, tx + tw / 2, ty - th / 2 + 4);
      ctx.font = "10px sans-serif";
      ctx.fillText("storage", tx + tw / 2, ty - th / 2 + 18);
    };

    const drawRain = () => {
      ctx.strokeStyle = "#93c8ff";
      ctx.lineWidth = 1.3;
      drops.forEach((drop) => {
        ctx.globalAlpha = drop.alpha;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.len);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    const updateRain = () => {
      const roofTopX = 180;
      const roofTopY = height - 82 - 120 - 70;
      const roofRightX = 394;
      const roofRightY = height - 82 - 120;

      drops.forEach((drop) => {
        drop.y += drop.speed;
        if (drop.y > height * 0.6) {
          drop.y = -20;
          drop.x = Math.random() * width;
        }

        const hitsRoof = drop.x > roofTopX && drop.x < roofRightX && drop.y > roofTopY && drop.y < roofRightY;
        if (hitsRoof) {
          drop.y = -20;
          drop.x = Math.random() * width;
          tankTarget = Math.min(96, tankTarget + 0.08);
        }
      });

      if (tankLevel < tankTarget) {
        tankLevel = Math.min(tankTarget, tankLevel + 0.12);
      }
    };

    const drawBadges = () => {
      const liters = Math.round((tankLevel / 100) * 5000);

      ctx.fillStyle = "rgba(10, 79, 60, 0.92)";
      drawRoundedRect(20, 14, 150, 30, 15);
      ctx.fill();
      ctx.fillStyle = "#9fe1cb";
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("catchment console", 34, 34);

      ctx.fillStyle = "rgba(9, 32, 31, 0.82)";
      drawRoundedRect(438, 18, 150, 42, 10);
      ctx.fill();
      ctx.fillStyle = "#9fe1cb";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("collected so far", 513, 36);
      ctx.fillStyle = "#fff8df";
      ctx.font = "700 15px sans-serif";
      ctx.fillText(`${liters.toLocaleString()} L`, 513, 54);

      ctx.fillStyle = "rgba(224, 246, 226, 0.94)";
      drawRoundedRect(220, 92, 126, 24, 8);
      ctx.fill();
      ctx.fillStyle = "#085041";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("rain to tank", 283, 108);
    };

    const loop = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);
      drawSky();
      drawCloud(78, 42, 1.08);
      drawCloud(306, 28, 0.9);
      drawCloud(520, 52, 1);
      drawRain();
      updateRain();
      drawGround();
      drawHouse();
      drawGutter();
      drawFlow();
      drawTank();
      drawBadges();
      animationId = requestAnimationFrame(loop);
    };

    initDrops();
    loop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="harvest-animation-canvas"
      width="680"
      height="420"
      aria-label="Animated rainwater harvesting preview"
    />
  );
}

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="app-shell landing-shell">
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
          <a href="#how-it-works" className="keep-mobile">How it works</a>
          <a href="#features">Features</a>
          <Link to="/login" className="btn-ghost keep-mobile px-5 py-2">
            Login
          </Link>
          <Link to="/signup" className="btn-primary keep-mobile px-5 py-2">
            Sign Up
          </Link>
        </div>
      </nav>

      <main id="top" className="page-pad">
        <section className="hero-grid landing-hero max-w-7xl mx-auto">
          <div className="stagger-in">
            <span className="eyebrow">
              <FaWater /> Rainwater Yield Studio
            </span>
            <h1 className="display-title">
              Read the roof. <span className="accent">Save the rain.</span>
            </h1>
            <p className="lead hero-lead">
              Turn rooftop details into a rainwater harvesting plan.
              Estimate yield, tank size, recharge fit, and material cost in one guided flow.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/signup" className="btn-primary px-7 py-4 text-lg">
                Start Free Assessment <FaArrowRight />
              </Link>
              <a href="#how-it-works" className="btn-ghost px-7 py-4 text-lg">
                See How It Works
              </a>
            </div>

            <div className="stat-row proof-row">
              <div className="metric-card">
                <strong>18 min</strong>
                <span>avg. setup for a first roof assessment</span>
              </div>
              <div className="metric-card">
                <strong>5</strong>
                <span>material categories priced for planning</span>
              </div>
              <div className="metric-card">
                <strong>India</strong>
                <span>localized rainfall data for site estimates</span>
              </div>
            </div>
          </div>

          <div className="dashboard-preview" aria-label="Assessment dashboard preview">
            <div className="preview-header">
              <span>Assessment Preview</span>
              <strong>42 m2 roof</strong>
            </div>
            <div className="roof-diagram">
              <HarvestAnimation />
            </div>
            <div className="preview-grid">
              <div>
                <span>Annual yield</span>
                <strong>57,030 L</strong>
              </div>
              <div>
                <span>Recharge fit</span>
                <strong>High</strong>
              </div>
              <div>
                <span>Materials</span>
                <strong>Rs 99K</strong>
              </div>
              <div>
                <span>Report</span>
                <strong>Ready</strong>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section id="how-it-works" className="section-band">
        <div className="max-w-7xl mx-auto">
          <span className="eyebrow">How It Works</span>
          <h2 className="section-title max-w-3xl mt-5">From roof survey to practical water plan.</h2>
          <div className="step-grid">
            {steps.map((step, index) => (
              <article className="step-card" key={step.title}>
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section-band feature-band">
        <div className="max-w-7xl mx-auto">
          <span className="eyebrow">Features</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mt-5">
            <h2 className="section-title max-w-3xl">Useful outputs before anyone buys a tank.</h2>
            <p className="lead max-w-md">
              RTRWH keeps the assessment readable for households and specific enough for builders.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-kicker" />
              <FaMapMarkerAlt className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Local Rainfall</h3>
              <p className="text-[color:var(--muted)] mt-3">
                Location-aware estimates help convert roof area into credible annual yield.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-kicker bg-[color:var(--leaf)]" />
              <FaTint className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Tank Sizing</h3>
              <p className="text-[color:var(--muted)] mt-3">
                See storage guidance and recharge options aligned to site use and conditions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-kicker bg-[color:var(--sun)]" />
              <FaRupeeSign className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Material Pricing</h3>
              <p className="text-[color:var(--muted)] mt-3">
                Estimate filters, gutters, tanks, diverters, and recharge materials in one place.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-kicker bg-[color:var(--canal)]" />
              <FaChartLine className="text-[color:var(--canal)] text-3xl mb-5" />
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--night)]">Report Handoff</h3>
              <p className="text-[color:var(--muted)] mt-3">
                Package sizing, cost, and feasibility into a report that is easy to share.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
