const API_URL = "http://localhost:5000/api";

export const checkBackendHealth = async () => {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
        throw new Error("Backend request failed");
    }

    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

export const createProject = async (projectData) => {
    const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Project creation failed");
    }

    return data;
};

export const getProjects = async (userId) => {
    const response = await fetch(`${API_URL}/projects/user/${userId}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch projects");
    }

    return data.projects;
};