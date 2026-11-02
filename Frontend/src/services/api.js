// ── DeployVerse API service ──────────────────────────────────────────────────
// All backend requests go through this file.
//
// In development:  set VITE_API_URL in Frontend/.env  (default: localhost:5000)
// In Kubernetes:   leave VITE_API_URL empty — nginx proxies /api to the backend
//                  service, so relative paths are used automatically.
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// ── Health ────────────────────────────────────────────────────────────────────
export const checkBackendHealth = async () => {
    const response = await fetch(`${API_URL}/api/health`);

    if (!response.ok) {
        throw new Error("Backend health check failed");
    }

    return response.json();
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const createProject = async (projectData) => {
    const response = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Project creation failed");
    }

    return data;
};

export const getProjects = async (userId) => {
    const response = await fetch(`${API_URL}/api/projects/user/${userId}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch projects");
    }

    return data.projects;
};

export const deleteProject = async (projectId, userId) => {
    const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete project");
    }

    return data;
};

// ── Jenkins ───────────────────────────────────────────────────────────────────
export const getJenkinsStatus = async () => {
    const response = await fetch(`${API_URL}/api/jenkins/status`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Jenkins status");
    }

    return data;
};

export const getJenkinsHistory = async () => {
    const response = await fetch(`${API_URL}/api/jenkins/history`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Jenkins history");
    }

    return data;
};

// project is optional — pass the selected project to send its repo URL + branch
// to Jenkins via the backend trigger endpoint.
export const triggerJenkins = async (project) => {
    const body = {};
    if (project?.repository_url) body.repository_url = project.repository_url;
    if (project?.branch)         body.branch          = project.branch;

    const response = await fetch(`${API_URL}/api/jenkins/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Jenkins trigger failed");
    }

    return data;
};
