/**
 * PipelineViz — CI/CD pipeline visualization
 * Props:
 *   build — latest Jenkins build object { number, result, duration, building, timestamp }
 *           or null when no build exists yet.
 *
 * Stage statuses are derived from actual Jenkins build data.
 * Kubernetes and AWS are honestly marked as Pending (Phase 2).
 */

const STAGE_DEFS = [
    { id: "github",  name: "GitHub",     abbr: "GH",  desc: "Source" },
    { id: "jenkins", name: "Jenkins",    abbr: "J",   desc: "Build & Test" },
    { id: "docker",  name: "Docker",     abbr: "D",   desc: "Package" },
    { id: "k8s",     name: "Kubernetes", abbr: "K8s", desc: "Orchestrate" },
    { id: "aws",     name: "AWS EC2",    abbr: "EC2", desc: "Deploy" },
];

// Derive per-stage status from the Jenkins build result.
// Only stages that Jenkins actually runs are marked live.
// K8s and AWS are always pending until Phase 2 integration.
function deriveStages(build) {
    if (!build) {
        return STAGE_DEFS.map(s => ({ ...s, status: "pending" }));
    }

    const r = build.result; // SUCCESS | FAILURE | RUNNING | ABORTED | null (building)
    const isBuilding = build.building;

    const jenkins = isBuilding      ? "running"
                  : r === "SUCCESS" ? "success"
                  : r === "FAILURE" ? "failed"
                  : r === "ABORTED" ? "failed"
                  : "pending";

    // GitHub checkout always ran if Jenkins started
    const github  = jenkins === "pending" ? "pending" : "success";

    // Docker build stage runs as part of Jenkins — same result
    const docker  = jenkins === "pending" ? "pending"
                  : jenkins === "running" ? "running"
                  : jenkins === "success" ? "success"
                  : "failed";

    return [
        { ...STAGE_DEFS[0], status: github },
        { ...STAGE_DEFS[1], status: jenkins },
        { ...STAGE_DEFS[2], status: docker },
        { ...STAGE_DEFS[3], status: "pending" }, // K8s — Phase 2
        { ...STAGE_DEFS[4], status: "pending" }, // AWS — Phase 2
    ];
}

const STATUS_STYLES = {
    success: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Success" },
    failed:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Failed"  },
    running: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Running" },
    pending: { color: "#4b5563", bg: "transparent",           label: "Pending" },
};

function formatDuration(ms) {
    if (!ms) return null;
    const s = Math.floor(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function StageNode({ stage }) {
    const style = STATUS_STYLES[stage.status];
    const isRunning = stage.status === "running";

    return (
        <div
            className={`pl-stage${stage.status === "success" || stage.status === "running" ? " connected" : ""}`}
            role="listitem"
            aria-label={`${stage.name} — ${style.label}`}
        >
            <div
                className="pl-node"
                title={stage.name}
                style={{
                    borderColor: style.color,
                    color: stage.status === "pending" ? "#4b5563" : "#fff",
                    background: style.bg,
                    outline: isRunning ? `2px solid ${style.color}` : "none",
                    transition: "all 0.3s ease",
                }}
            >
                {stage.abbr}
            </div>
            <span className="pl-type" style={{ fontSize: "0.65rem" }}>{stage.desc}</span>
            <span className="pl-name">{stage.name}</span>
            <span
                className={`pl-tag ${stage.status === "success" || stage.status === "running" ? "pl-tag-on" : "pl-tag-off"}`}
                style={{
                    color: style.color,
                    background: style.bg,
                    border: `1px solid ${style.color}44`,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                }}
            >
                {style.label}
            </span>
        </div>
    );
}

function PipelineViz({ build }) {
    const stages = deriveStages(build);
    const duration = build ? formatDuration(build.duration) : null;
    const hasData  = !!build;

    return (
        <section className="pipeline-section" aria-label="CI/CD pipeline overview">

            <div className="pipeline-sec-head">
                <div>
                    <h2>Deployment Pipeline</h2>
                    <p>Automated CI/CD workflow — GitHub to AWS EC2</p>
                </div>
                <div style={{ textAlign: "right" }}>
                    {hasData ? (
                        <div style={{ fontSize: "0.82rem" }}>
                            <div style={{ fontWeight: 700 }}>Build #{build.number}</div>
                            {duration && <div style={{ color: "#888" }}>⏱ {duration}</div>}
                            <div style={{ color: "#888", marginTop: "2px" }}>
                                {build.building ? "⏳ In progress…" : `Result: ${build.result || "unknown"}`}
                            </div>
                        </div>
                    ) : (
                        <span className="cs-badge">No builds yet</span>
                    )}
                </div>
            </div>

            <div className="pipeline-track" role="list" aria-label="Pipeline stages">
                {stages.map((stage, i) => (
                    <div key={stage.id} style={{ display: "contents" }}>
                        <StageNode stage={stage} />
                        {i < stages.length - 1 && (
                            <div className="pl-connector" aria-hidden="true">
                                <div className="pl-line" />
                                <span className="pl-arrow">›</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "#555",
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap",
                paddingTop: "0.6rem",
                borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
                <span>● GitHub, Jenkins, Docker — connected (Phase 1)</span>
                <span style={{ color: "#3a3a4a" }}>● Kubernetes, AWS EC2 — Phase 2</span>
            </div>

        </section>
    );
}

export default PipelineViz;
