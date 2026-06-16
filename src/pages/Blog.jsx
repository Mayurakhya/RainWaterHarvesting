import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaBookOpen, FaSignOutAlt, FaTint } from "react-icons/fa";

export const blogPosts = [
  {
    slug: "rooftop-storage",
    title: "Rooftop Storage Systems",
    eyebrow: "Household Capture",
    readTime: "5 min read",
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rooftop%20Rainwater%20Harvesting%20System%20-%20Digha%20Science%20Centre%20-%20New%20Digha%20-%20East%20Midnapore%202015-05-03%209927.JPG",
    imageCredit: "Biswarup Ganguly, Wikimedia Commons",
    imageSource:
      "https://commons.wikimedia.org/wiki/File:Rooftop_Rainwater_Harvesting_System_-_Digha_Science_Centre_-_New_Digha_-_East_Midnapore_2015-05-03_9927.JPG",
    summary:
      "The classic roof-to-filter-to-tank setup is still the most direct way to turn monsoon runoff into usable household water.",
    sections: [
      {
        heading: "How it works",
        body:
          "Gutters collect roof runoff and route it through a leaf screen, first-flush diverter, and filter before it reaches a storage tank. The system is compact, inspectable, and easy to explain to a homeowner or building committee.",
      },
      {
        heading: "Best suited for",
        body:
          "Independent houses, schools, clinics, small offices, and any building with a clean roof surface and space for a tank. It is especially useful where water supply is intermittent but rainfall is seasonal and intense.",
      },
      {
        heading: "Design note",
        body:
          "Tank sizing should follow roof area, annual rainfall, runoff coefficient, and demand. Oversized tanks can waste budget; undersized tanks overflow during useful storms.",
      },
    ],
  },
  {
    slug: "rain-gardens",
    title: "Rain Gardens and Bioswales",
    eyebrow: "Landscape Capture",
    readTime: "4 min read",
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rain%20Garden%20%2832851238970%29.jpg",
    imageCredit: "Oregon Convention Center / Jeremy Jeziorski, Wikimedia Commons",
    imageSource: "https://commons.wikimedia.org/wiki/File:Rain_Garden_(32851238970).jpg",
    summary:
      "Rain gardens slow down runoff and let planted soil do the quiet work of filtration, infiltration, and cooling.",
    sections: [
      {
        heading: "How it works",
        body:
          "A shallow planted basin receives runoff from roofs, paths, or parking edges. Soil, mulch, and plant roots hold water briefly, filter sediment, and let cleaner water infiltrate instead of rushing into drains.",
      },
      {
        heading: "Best suited for",
        body:
          "Campuses, parks, apartment courtyards, roadside edges, and public buildings where visible green infrastructure can manage runoff and improve the landscape at the same time.",
      },
      {
        heading: "Design note",
        body:
          "The garden needs an overflow path, salt- and drought-tolerant plants, and soil that drains fast enough after storms. Beauty matters, but hydraulics still gets the final vote.",
      },
    ],
  },
  {
    slug: "permeable-pavement",
    title: "Permeable Pavement Recharge",
    eyebrow: "Hardscape Infiltration",
    readTime: "4 min read",
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Permeable%20Pavement%20%2815456488240%29.jpg",
    imageCredit: "Alisha Goldstein / USEPA, Wikimedia Commons",
    imageSource: "https://commons.wikimedia.org/wiki/File:Permeable_Pavement_(15456488240).jpg",
    summary:
      "Permeable pavement turns courtyards, walkways, and parking bays into recharge surfaces instead of runoff launchpads.",
    sections: [
      {
        heading: "How it works",
        body:
          "Porous pavers or open-joint blocks sit over graded aggregate. Rain passes between or through the surface, temporarily stores in the stone layer, and then infiltrates into the soil below.",
      },
      {
        heading: "Best suited for",
        body:
          "Low-speed parking areas, pedestrian zones, residential lanes, and campus paths where conventional paving would shed stormwater too quickly.",
      },
      {
        heading: "Design note",
        body:
          "Maintenance is not optional. Vacuum sweeping or surface cleaning keeps pores open, and clay-heavy subgrades may need underdrains or amended base design.",
      },
    ],
  },
  {
    slug: "stepwells-recharge",
    title: "Stepwells and Community Recharge",
    eyebrow: "Traditional Infrastructure",
    readTime: "6 min read",
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rooftop%20rainwater%20harvesting.jpg",
    imageCredit: "Meg Stewart, Wikimedia Commons",
    imageSource: "https://commons.wikimedia.org/wiki/File:Rooftop_rainwater_harvesting.jpg",
    summary:
      "Older water systems still have modern lessons: slow water down, keep it clean, and let communities see the value of recharge.",
    sections: [
      {
        heading: "How it works",
        body:
          "Traditional recharge structures hold stormwater long enough to replenish shallow aquifers. In contemporary projects, filtered runoff can be routed into wells, shafts, trenches, or restored community water bodies.",
      },
      {
        heading: "Best suited for",
        body:
          "Dense neighborhoods, heritage sites, and public projects where rainwater harvesting is both infrastructure and civic memory.",
      },
      {
        heading: "Design note",
        body:
          "Water quality is the hard part. Recharge systems need silt traps, filtration, periodic desilting, and local stewardship so they do not become drains by another name.",
      },
    ],
    sourceNote:
      "The Guardian reported in February 2026 that restored Indian stepwells are again being used as groundwater recharge and public water assets in parts of Hyderabad.",
    sourceLink:
      "https://www.theguardian.com/global-development/2026/feb/26/ancient-stepwells-brought-back-india-run-out-water-day-zero",
  },
];

function BlogNav() {
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
    <nav className="nav-shell">
      <button className="brand-lockup text-left" onClick={() => navigate("/home")} type="button">
        <div className="brand-mark">
          <FaTint />
        </div>
        <div>
          <h2 className="brand-title">RTRWH Journal</h2>
          <p className="brand-subtitle">Harvesting field notes</p>
        </div>
      </button>

      <div className="nav-links">
        <Link to="/home" className="keep-mobile">Home</Link>
        <Link to="/blogs" className="keep-mobile">Blogs</Link>
        <button onClick={() => navigate("/feasibility")} className="btn-primary px-5 py-2" type="button">
          Assess
        </button>
        <button onClick={handleLogout} className="icon-button" title="Logout" aria-label="Logout" type="button">
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
}

function Blog() {
  return (
    <div className="app-shell">
      <BlogNav />
      <main className="page-pad">
        <section className="max-w-7xl mx-auto">
          <div className="max-w-4xl stagger-in">
            <span className="eyebrow">
              <FaBookOpen /> Rainwater Harvesting Library
            </span>
            <h1 className="display-title">
              Four ways to <span className="accent">hold a storm.</span>
            </h1>
            <p className="lead">
              Explore practical harvesting approaches, from tank-based rooftop systems to green
              infrastructure and community recharge.
            </p>
          </div>

          <div className="blog-grid mt-12">
            {blogPosts.map((post, index) => (
              <Link to={`/blogs/${post.slug}`} className="blog-card stagger-in" key={post.slug} style={{ animationDelay: `${index * 90}ms` }}>
                <img src={post.image} alt={post.title} />
                <div className="blog-card-body">
                  <span className="eyebrow">{post.eyebrow}</span>
                  <h2>{post.title}</h2>
                  <p>{post.summary}</p>
                  <span className="blog-read">
                    {post.readTime} <FaArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export { BlogNav };
export default Blog;
