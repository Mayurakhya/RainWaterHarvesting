import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getProjects } from "../api/projectApi/projectApi";
import ProjectCardSkeleton from "../components/ProjectCardSkeleton";

function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const LIMIT = 10;

  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  const fetchProjects = async (currentPage) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await getProjects(
        token,
        currentPage,
        LIMIT
      );

      setProjects(response.projects || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error(error);
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-pad max-w-7xl mx-auto">
      {/* Header */}

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="display-title">
            My Assessments
          </h1>

          <p className="text-gray-500 mt-2">
            Total Projects: {total}
          </p>
        </div>

        <button
          onClick={() => navigate("/feasibility")}
          className="btn-primary px-6 py-3"
        >
          New Assessment
        </button>
      </div>

      {/* Loading */}

      {loading ? (
        <div className="feature-grid">
          {[...Array(6)].map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="feature-card text-center py-16">
          <h2 className="text-2xl font-bold">
            No Projects Found
          </h2>

          <p className="text-gray-500 mt-3">
            Create your first rainwater harvesting
            assessment.
          </p>

          <button
            onClick={() => navigate("/feasibility")}
            className="btn-primary mt-6 px-6 py-3"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <>
          {/* Projects Grid */}

          <div className="feature-grid">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() =>
                  navigate(
                    `/projects/${project._id}`
                  )
                }
                className="feature-card cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-xl font-bold text-[color:var(--night)]">
                    Project #
                    {project._id.slice(-6)}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.result?.feasible
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {project.result?.feasible
                      ? "Feasible"
                      : "Not Feasible"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-500 mt-3">
                  <FaCalendarAlt />
                  <span className="text-sm">
                    {formatDate(
                      project.created_at
                    )}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div>
                    <span className="text-gray-500">
                      Roof Area
                    </span>
                    <p className="font-semibold">
                      {project.input?.roof_area_m2}
                      m²
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Rainfall
                    </span>
                    <p className="font-semibold">
                      {
                        project.input
                          ?.annual_rainfall_mm
                      }
                      mm
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Harvestable Volume
                    </span>
                    <p className="font-semibold">
                      {
                        project.result
                          ?.harvestable_volume_m3
                      }
                      m³/year
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Estimated Cost
                    </span>
                    <p className="font-bold text-lg text-[color:var(--canal)]">
                      ₹
                      {project.result?.estimated_cost?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}

          <div className="flex justify-center items-center gap-5 mt-14">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
              className={`flex items-center gap-2 px-5 py-2 rounded-lg ${
                page === 1
                  ? "bg-gray-200 cursor-not-allowed"
                  : "btn-ghost"
              }`}
            >
              <FaChevronLeft />
              Previous
            </button>

            <div className="font-semibold">
              Page {page} of {totalPages}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((prev) => prev + 1)
              }
              className={`flex items-center gap-2 px-5 py-2 rounded-lg ${
                page >= totalPages
                  ? "bg-gray-200 cursor-not-allowed"
                  : "btn-primary"
              }`}
            >
              Next
              <FaChevronRight />
            </button>
          </div>

          {/* Footer Count */}

          <div className="text-center text-gray-500 mt-5">
            Showing{" "}
            {(page - 1) * LIMIT + 1}
            {" - "}
            {Math.min(page * LIMIT, total)}
            {" "}of {total} projects
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectsPage;