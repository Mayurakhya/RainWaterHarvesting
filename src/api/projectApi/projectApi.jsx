import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get all projects of logged-in user
export const getProjects = async (
  token,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const response = await axios.get(
    `${API_BASE_URL}/projects?limit=${limit}&skip=${skip}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Get single project details
export const getProjectById = async (
  projectId,
  token
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to fetch project",
    };
  }
};

// Create new project (calculate + save)
export const createProject = async (
  projectData,
  token
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/calculate`,
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to create project",
    };
  }
};