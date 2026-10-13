/**
 * ProjectCard — reusable premium project card
 * Props: project { id, name, repository_url, branch }
 *        onDeploy — click handler
 */

const IcoArrow = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M2 5.5h7M6.5 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const IcoDeploy = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 1L9 3v3.5L5.5 9.5 2 6.5V3L5.5 1z" stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <path d="M5.5 1v8.5M2 3l3.5 2 3.5-2" stroke="currentColor" strokeWidth="0.9" opacity=".5"/>
    </svg>
);

function ProjectCard({ project, onDeploy }) {
    const initial = project.name.charAt(0).toUpperCase();

    const displayUrl = project.repository_url
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

    return (
        <article
            className="project-card"
            aria-label={`Project: ${project.name}`}
        >
            <div className="pc-head">
                <div className="pc-monogram" aria-hidden="true">{initial}</div>
                <div className="pc-info">
                    <div className="pc-name" title={project.name}>{project.name}</div>
                    <div className="pc-id">#{project.id}</div>
                </div>
                <span className="pc-status" aria-label="Status: Ready">
                    <span className="pc-status-dot" aria-hidden="true" />
                    READY
                </span>
            </div>

            <div className="pc-repo">
                <div className="pc-repo-label">Repository</div>
                <a
                    className="pc-repo-url"
                    href={project.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    title={project.repository_url}
                >
                    {displayUrl}
                </a>
            </div>

            <div className="pc-meta">
                <div className="pc-meta-item">
                    <div className="pc-meta-label">Branch</div>
                    <div className="pc-meta-val">{project.branch}</div>
                </div>
                <div className="pc-meta-item">
                    <div className="pc-meta-label">Status</div>
                    <div className="pc-meta-val green">Ready</div>
                </div>
                <div className="pc-meta-item">
                    <div className="pc-meta-label">Pipeline</div>
                    <div className="pc-meta-val">Day 2</div>
                </div>
            </div>

            <div className="pc-foot">
                <button className="btn-deploy" onClick={onDeploy} aria-label={`Deploy ${project.name}`}>
                    <IcoDeploy aria-hidden="true" /> Deploy
                </button>
                <button className="btn-details" aria-label={`View details for ${project.name}`}>
                    View Details <IcoArrow aria-hidden="true" />
                </button>
            </div>
        </article>
    );
}

export default ProjectCard;
