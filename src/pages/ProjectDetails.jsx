import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../api/projectApi/projectApi";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      const token = localStorage.getItem("token");

      const data = await getProjectById(id, token);

      setProject(data);
    };

    loadProject();
  }, [id]);

  if (!project) return <h2>Loading...</h2>;

  return (
    <div className="page-pad max-w-5xl mx-auto">
      <h1 className="display-title">
        Project Details
      </h1>

      <div className="feature-card mt-8">
        <p>
          Roof Area:
          {" "}
          {project.input.roof_area_m2} m²
        </p>

        <p>
          Rainfall:
          {" "}
          {project.input.annual_rainfall_mm} mm
        </p>

        <p>
          Harvestable Volume:
          {" "}
          {project.result.harvestable_volume_m3} m³
        </p>

        <p>
          Estimated Cost:
          {" "}
          ₹{project.result.estimated_cost}
        </p>

        <h3 className="mt-6 font-bold">
          Feasibility Reasons
        </h3>

        <ul>
          {project.result.feasibility_reasons?.map(
            (reason, index) => (
              <li key={index}>• {reason}</li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

export default ProjectDetails;