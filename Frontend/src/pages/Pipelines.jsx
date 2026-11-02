import { useEffect, useState } from "react";
import { getJenkinsStatus, getJenkinsHistory, triggerJenkins } from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar  from "../components/Topbar";

// ── Pipeline stage definitions ─────────────────────────────────────────────
// Each stage maps to something Jenkins actually does in the Jenkinsfile.
// Status is derived from real Jenkins build data, not hardcoded.
const STAGE_DEFS = [
    { id: "github",    name: "GitHub",     abbr: "GH",  desc: "Source checkout" },
    { id: "jenkins",   name: "Jenkins",    abbr: "J",   desc: "Build & test" },
    { id: "docker",    name: "Docker",     abbr: "D",   desc: "Container image" },
    { id: "k8s",       name: "Kubernetes", abbr: "K8s", desc: "Orchestration" },
    { id: "aws",       name: "AWS EC2",    abbr: "EC2", desc: "Production deploy" },
];

// Derive per-stage status from a Jenkins build result.
// Jenkins currently runs checkout + build + test + docker build.
// K8s and AWS are future phases — always "pending" until integrated.
function deriveStages(build) {
    if (!build) {
        return STAGE_DEFS.map(s => ({ ...s, status: "pending" }));
    }

    const r = build.result; // SUCCESS | FAILURE | RUNNING | ABORTED

    // GitHub: checkout always attempted — success if build didn't fail before it
    const github   = r === "ABORTED" ? "failed"  : "success";

    // Jenkins: overall build result maps directly
    const jenkins  = r === "SUCCESS"  ? "success"
                   : r === "FAILURE"  ? "failed"
                   : r === "RUNNING"  ? "running"
                   : r === "ABORTED"  ? "failed"
                   : "pending";

    // Docker: built as part of Jenkins "Docker Build" stage — same result as Jenkins
    const docker   = r === "SUCCESS"  ? "success"
                   : r === "FAILURE"  ? "failed"
                   : r === "RUNNING"  ? "running"
                   : "pending";

    // K8s & AWS: not yet integrated — always pending (honest)
    const k8s      = "pending";
    const aws      = "pending";

    return [
        { ...STAGE_DEFS[0], status: github  },
        { ...STAGE_DEFS[1], status: jenkins },
        { ...STAGE_DEFS[2], status: docker  },
        { ...STAGE_DEFS[3], status: k8s     },
        { ...STAGE_DEFS[4], status: aws     },
    ];
}

const STATUS_COLOR = {
    success: "#22c55e",
    failed:  "#ef4444",
    running: "#f59e0b",
    pending: "#4b5563",
};

const STATUS_LABEL = {
    success: "Success",
    failed:  "Failed",
    running: "Running",
    pending: "Pending",
};

function StageNode({ stage }) {
    const color = STATUS_COLOR[stage.status];
    const isRunning = stage.status === "running";
    return (
        <div
            className="pl-stage"
            style={{ position: "relative" }}
            aria-label={`${stage.name} — ${STATUS_LABEL[stage.status]}`}
            role="listitem"
        >
            <div
                className="pl-node"
                style={{
                    borderColor: color,
                    color: stage.status === "pending" ? "#6b7280" : "#fff",
                    background: stage.status === "pending" ? "transparent"
                              : stage.status === "running" ? "rgba(245,158,11,0.15)"
                              : stage.status === "success" ? "rgba(34,197,94,0.15)"
                              : "rgba(239,68,68,0.15)",
                    outline: isRunning ? `2px solid ${color}` : "none",
                    animation: isRunning ? "pulse 1.5s infinite" : "none",
                }}
                title={stage.name}
            >
                {stage.abbr}
            </div>
            <span className="pl-type" style={{ color: "#888", fontSize: "0.65rem" }}>{stage.desc}</span>
            <span className="pl-name">{stage.name}</span>
            <span
                className="pl-tag"
                style={{
                    background: `${color}22`,
                    color: color,
                    border: `1px solid ${color}44`,
                    fontSize: "0.68rem",
                    padding: "2px 7px",
                    borderRadius: "20px",
                    fontWeight: 600,
                }}
            >
                {STATUS_LABEL[stage.status]}
            </span>
        </div>
    );
}

function formatDuration(ms) {
    if (!ms) return "—";
    const s = Math.floor(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function Pipelines({ user, onLogout }) {
    const [build,    setBuild]    = useState(null);
    const [history,  setHistory]  = useState([]);
    const [stages,   setStages]   = useState(() => deriveStages(null));
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const [triggering, setTriggering] = useState(false);
    const [trigMsg,  setTrigMsg]  = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [s, h] = await Promise.all([
                getJenkinsStatus(),
                getJenkinsHistory(),
            ]);
            const b = s.build || null;
            setBuild(b);
            setHistory(h.builds || []);
            setStages(deriveStages(b));
        } catch (e) {
            setError(e.message || "Failed to load pipeline data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const id = setInterval(load, 15000);
        return () => clearInterval(id);
    }, []);

    const handleTrigger = async () => {
        setTriggering(true);
        setTrigMsg("");
        try {
            const r = await triggerJenkins();
            setTrigMsg(r.message || "Pipeline triggered successfully");
            setTimeout(load, 3000);
        } catch (e) {
            setTrigMsg(e.message || "Trigger failed");
        } finally {
            setTriggering(false);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-area">
                <Topbar user={user} onLogout={onLogout} />
                <main className="dash-content">

                    <section className="dash-hero" style={{ paddingBottom: "1.5rem" }}>
                        <div className="hero-kicker">CI/CD Automation</div>
                        <h1 className="hero-h1" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>
                            PIPELINES
                        </h1>
                        <p className="hero-sub">
                            Live pipeline visualization — status derived from actual Jenkins build data.
                        </p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "1rem", flexWrap: "wrap" }}>
                            <button className="btn-primary" onClick={load} disabled={loading}>
                                {loading ? "Loading…" : "↻ Refresh"}
                            </button>
                            <button className="btn-outline" onClick={handleTrigger} disabled={triggering}>
                                {triggering ? "Triggering…" : "▶ Trigger Build"}
                            </button>
                        </div>
                        {trigMsg && (
                            <div style={{ marginTop: "0.7rem", fontSize: "0.84rem", color: "#22c55e" }}>
                                {trigMsg}
                            </div>
                        )}
                    </section>

                    {error && <div className="notify err" role="alert">✕ {error}</div>}

                    {/* Pipeline visualization */}
                    <section className="pipeline-section" aria-label="CI/CD pipeline stages">
                        <div className="pipeline-sec-head">
                            <div>
                                <h2>Deployment Pipeline</h2>
                                <p style={{ color: "#888", fontSize: "0.84rem" }}>
                                    GitHub → Jenkins → Docker → Kubernetes → AWS EC2
                                </p>
                            </div>
                            {build && (
                                <div style={{ textAlign: "right", fontSize: "0.82rem" }}>
                                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>Build #{build.number}</div>
                                    <div style={{ color: "#888" }}>Duration: {formatDuration(build.duration)}</div>
                                    <div style={{ color: "#888" }}>
                                        {build.building ? "⏳ In progress" : `Finished: ${build.result}`}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pipeline-track" role="list">
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
                            marginTop: "1.2rem",
                            padding: "0.8rem 1rem",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                            color: "#666",
                            display: "flex",
                            gap: "1.5rem",
                            flexWrap: "wrap"
                        }}>
                            <span>● GitHub, Jenkins, Docker — connected via Jenkins CI</span>
                            <span style={{ color: "#4b5563" }}>● Kubernetes, AWS — planned Phase 2</span>
                        </div>
                    </section>

                    {/* Build history mini-list */}
                    {history.length > 0 && (
                        <section style={{ marginTop: "1.5rem" }}>
                            <div className="sec-head">
                                <div className="sec-head-left">
                                    <div className="sec-kicker">Recent</div>
                                    <h2 className="sec-title">Build History</h2>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {history.slice(0, 8).map(b => {
                                    const stgs = deriveStages(b);
                                    const jStage = stgs[1]; // Jenkins stage
                                    return (
                                        <div key={b.number} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            padding: "0.6rem 1rem",
                                            background: "rgba(255,255,255,0.03)",
                                            borderRadius: "8px",
                                            fontSize: "0.82rem",
                                        }}>
                                            <span style={{ fontWeight: 700, minWidth: "70px" }}>#{b.number}</span>
                                            <span style={{ color: STATUS_COLOR[jStage.status], fontWeight: 600, minWidth: "80px" }}>
                                                ● {STATUS_LABEL[jStage.status]}
                                            </span>
                                            <span style={{ color: "#888" }}>{formatDuration(b.duration)}</span>
                                            <span style={{ color: "#555", marginLeft: "auto" }}>
                                                {b.timestamp ? new Date(b.timestamp).toLocaleString() : ""}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                </main>
            </div>
        </div>
    );
}

export default Pipelines;
