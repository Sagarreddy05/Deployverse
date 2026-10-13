import { useEffect, useState } from "react";
import { getProjects, createProject } from "../services/api";

import Sidebar     from "../components/Sidebar";
import Topbar      from "../components/Topbar";
import PipelineViz from "../components/PipelineViz";
import ProjectCard from "./Components/ProjectCard";

/* ── Inline SVG icons ── */
const IcoPlus = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
);

const IcoArrowRight = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const IcoFolder = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
              stroke="currentColor" strokeWidth="1.4" fill="none"/>
    </svg>
);

/* ── Helper: is message an error? ── */
const isError = (msg) => {
    if (!msg) return false;
    const l = msg.toLowerCase();
    return l.includes("fail") || l.includes("error") ||
           l.includes("invalid") || l.includes("exist") ||
           l.includes("wrong");
};

function Dashboard({ user, onLogout }) {

    /* ── State — identical to original ── */
    const [projects,       setProjects]       = useState([]);
    const [showForm,       setShowForm]       = useState(false);
    const [name,           setName]           = useState("");
    const [repositoryUrl,  setRepositoryUrl]  = useState("");
    const [branch,         setBranch]         = useState("main");
    const [message,        setMessage]        = useState("");
    const [loading,        setLoading]        = useState(false);

    useEffect(() => {
        loadProjects();
    }, [user.id]);

    /* ── API calls — identical to original ── */
    const loadProjects = async () => {
        try {
            const data = await getProjects(user.id);
            setProjects(data);
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleAddProject = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const data = await createProject({
                user_id: user.id,
                name,
                repository_url: repositoryUrl,
                branch,
            });

            setMessage(data.message);
            setName("");
            setRepositoryUrl("");
            setBranch("main");
            setShowForm(false);
            await loadProjects();

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = () => {
        alert("Deployment pipeline will be connected on Day 2.");
    };

    return (
        <div className="app-layout">

            {/* Sidebar */}
            <Sidebar />

            {/* Main area */}
            <div className="main-area">

                {/* Topbar */}
                <Topbar user={user} onLogout={onLogout} />

                {/* Content */}
                <main className="dash-content">

                    {/* ═══ HERO ═══════════════════════════════════════ */}
                    <section className="dash-hero" aria-label="Dashboard overview">

                        <div className="hero-kicker" aria-hidden="true">
                            Cloud Deployment Center
                        </div>

                        <h1 className="hero-h1">
                            YOUR CODE&apos;S FASTEST<br />
                            PATH TO <span className="h1-accent">CLOUD</span><br />
                            PRODUCTION.
                        </h1>

                        <p className="hero-sub">
                            Build, deploy, and monitor applications through an
                            automated CI/CD workflow powered by Jenkins, Docker,
                            Kubernetes, and AWS EC2.
                        </p>

                        <div className="hero-actions">
                            <button
                                className="btn-primary"
                                onClick={() => setShowForm(!showForm)}
                                aria-expanded={showForm}
                                aria-controls="add-project-panel"
                            >
                                <IcoPlus aria-hidden="true" />
                                Deploy Project
                            </button>

                            <button className="btn-outline">
                                View Pipeline
                                <IcoArrowRight aria-hidden="true" />
                            </button>
                        </div>

                    </section>


                    {/* ═══ STATS ══════════════════════════════════════ */}
                    <section
                        className="stats-strip"
                        aria-label="Key statistics"
                    >
                        <div className="stat-cell">
                            <div className="stat-pip pip-purple" aria-hidden="true" />
                            <div className="stat-tag">Projects</div>
                            <div className="stat-num">{projects.length}</div>
                            <div className="stat-hint">GitHub repositories</div>
                        </div>

                        <div className="stat-cell">
                            <div className="stat-pip pip-cyan" aria-hidden="true" />
                            <div className="stat-tag">Deployments</div>
                            <div className="stat-num na">--</div>
                            <div className="stat-hint">Available on Day 2</div>
                        </div>

                        <div className="stat-cell">
                            <div className="stat-pip pip-green" aria-hidden="true" />
                            <div className="stat-tag">Running</div>
                            <div className="stat-num na">--</div>
                            <div className="stat-hint">Available on Day 2</div>
                        </div>

                        <div className="stat-cell">
                            <div className="stat-pip pip-orange" aria-hidden="true" />
                            <div className="stat-tag">Failed</div>
                            <div className="stat-num na">--</div>
                            <div className="stat-hint">Available on Day 2</div>
                        </div>
                    </section>


                    {/* ═══ ADD PROJECT PANEL ══════════════════════════ */}
                    {showForm && (
                        <div
                            className="add-panel"
                            id="add-project-panel"
                            role="region"
                            aria-label="Add new project"
                        >
                            <div className="add-panel-head">
                                <div className="add-panel-head-text">
                                    <h2>Add GitHub Project</h2>
                                    <p>Connect a repository to DeployVerse</p>
                                </div>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowForm(false)}
                                    aria-label="Close panel"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="add-panel-body">
                                <form
                                    className="proj-form"
                                    onSubmit={handleAddProject}
                                >
                                    <div className="form-grp">
                                        <label
                                            className="form-lbl"
                                            htmlFor="proj-name"
                                        >
                                            Project Name
                                        </label>
                                        <input
                                            id="proj-name"
                                            className="form-inp"
                                            type="text"
                                            placeholder="my-api-service"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-grp">
                                        <label
                                            className="form-lbl"
                                            htmlFor="proj-repo"
                                        >
                                            Repository URL
                                        </label>
                                        <input
                                            id="proj-repo"
                                            className="form-inp"
                                            type="url"
                                            placeholder="https://github.com/username/project"
                                            value={repositoryUrl}
                                            onChange={(e) => setRepositoryUrl(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-grp">
                                        <label
                                            className="form-lbl"
                                            htmlFor="proj-branch"
                                        >
                                            Branch
                                        </label>
                                        <input
                                            id="proj-branch"
                                            className="form-inp"
                                            type="text"
                                            placeholder="main"
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-sm-outline"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? "Adding…" : "Add Project"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}


                    {/* ═══ NOTIFICATION ═══════════════════════════════ */}
                    {message && (
                        <div
                            className={`notify ${isError(message) ? "err" : "ok"}`}
                            role="alert"
                            aria-live="polite"
                        >
                            <span aria-hidden="true">
                                {isError(message) ? "✕" : "✓"}
                            </span>
                            {message}
                        </div>
                    )}


                    {/* ═══ PROJECTS ════════════════════════════════════ */}
                    <section
                        className="projects-section"
                        aria-label="Your projects"
                    >
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">GitHub Repositories</div>
                                <h2 className="sec-title">Your Projects</h2>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="count-badge" aria-label={`${projects.length} projects`}>
                                    {projects.length}{" "}
                                    {projects.length === 1 ? "project" : "projects"}
                                </span>
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowForm(true)}
                                    aria-label="Add new project"
                                >
                                    <IcoPlus aria-hidden="true" /> Add Project
                                </button>
                            </div>
                        </div>

                        {projects.length === 0 ? (

                            <div className="empty-state">
                                <div className="empty-icon" aria-hidden="true">
                                    <IcoFolder />
                                </div>
                                <h3>No projects yet</h3>
                                <p>
                                    Connect your first GitHub repository to start
                                    using the DeployVerse pipeline.
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowForm(true)}
                                >
                                    <IcoPlus aria-hidden="true" />
                                    Add Your First Project
                                </button>
                            </div>

                        ) : (

                            <div className="projects-grid">
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        onDeploy={handleDeploy}
                                    />
                                ))}
                            </div>

                        )}
                    </section>


                    {/* ═══ PIPELINE ════════════════════════════════════ */}
                    <PipelineViz />

                </main>

            </div>
        </div>
    );
}

export default Dashboard;