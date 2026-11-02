import { useEffect, useState } from "react";
import { getJenkinsHistory, getJenkinsStatus } from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar  from "../components/Topbar";

const statusColor = (result) => {
    if (result === "SUCCESS")  return "#22c55e";
    if (result === "FAILURE")  return "#ef4444";
    if (result === "RUNNING")  return "#f59e0b";
    if (result === "ABORTED")  return "#6b7280";
    return "#6b7280";
};

const statusLabel = (result) => {
    if (result === "SUCCESS")  return "Success";
    if (result === "FAILURE")  return "Failed";
    if (result === "RUNNING")  return "Running";
    if (result === "ABORTED")  return "Aborted";
    return "Unknown";
};

function formatDuration(ms) {
    if (!ms) return "—";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatDate(ts) {
    if (!ts) return "—";
    return new Date(ts).toLocaleString();
}

function Deployments({ user, onLogout }) {
    const [builds,   setBuilds]   = useState([]);
    const [latest,   setLatest]   = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const [lastRefresh, setLastRefresh] = useState(null);

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [histData, statusData] = await Promise.all([
                getJenkinsHistory(),
                getJenkinsStatus()
            ]);
            setBuilds(histData.builds || []);
            setLatest(statusData.build || null);
            setLastRefresh(new Date());
        } catch (e) {
            setError(e.message || "Failed to load deployment data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const success = builds.filter(b => b.result === "SUCCESS").length;
    const failed  = builds.filter(b => b.result === "FAILURE").length;
    const running = builds.filter(b => b.result === "RUNNING").length;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-area">
                <Topbar user={user} onLogout={onLogout} />
                <main className="dash-content">

                    <section className="dash-hero" style={{ paddingBottom: "1.5rem" }}>
                        <div className="hero-kicker">CI/CD History</div>
                        <h1 className="hero-h1" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>
                            DEPLOYMENTS
                        </h1>
                        <p className="hero-sub">
                            Live Jenkins build records. Data pulled directly from the Jenkins API.
                        </p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "1rem", alignItems: "center" }}>
                            <button className="btn-primary" onClick={load} disabled={loading}>
                                {loading ? "Loading…" : "↻ Refresh"}
                            </button>
                            {lastRefresh && (
                                <span style={{ color: "var(--clr-muted, #888)", fontSize: "0.78rem" }}>
                                    Updated {lastRefresh.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="stats-strip" aria-label="Deployment statistics">
                        <div className="stat-cell">
                            <div className="stat-pip pip-cyan"  aria-hidden="true" />
                            <div className="stat-tag">Total</div>
                            <div className="stat-num">{builds.length}</div>
                            <div className="stat-hint">Jenkins builds</div>
                        </div>
                        <div className="stat-cell">
                            <div className="stat-pip pip-green" aria-hidden="true" />
                            <div className="stat-tag">Successful</div>
                            <div className="stat-num">{success}</div>
                            <div className="stat-hint">Build success</div>
                        </div>
                        <div className="stat-cell">
                            <div className="stat-pip pip-orange" aria-hidden="true" />
                            <div className="stat-tag">Failed</div>
                            <div className="stat-num">{failed}</div>
                            <div className="stat-hint">Build failures</div>
                        </div>
                        <div className="stat-cell">
                            <div className="stat-pip pip-purple" aria-hidden="true" />
                            <div className="stat-tag">Running</div>
                            <div className="stat-num">{running}</div>
                            <div className="stat-hint">Active builds</div>
                        </div>
                    </section>

                    {error && (
                        <div className="notify err" role="alert">✕ {error}</div>
                    )}

                    {/* Latest build highlight */}
                    {latest && (
                        <section style={{ margin: "1.5rem 0 1rem" }}>
                            <div className="sec-head">
                                <div className="sec-head-left">
                                    <div className="sec-kicker">Latest</div>
                                    <h2 className="sec-title">Most Recent Build</h2>
                                </div>
                            </div>
                            <div className="project-card" style={{ maxWidth: "600px", padding: "1.2rem 1.4rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                                        Build #{latest.number}
                                    </span>
                                    <span style={{
                                        color: statusColor(latest.result),
                                        fontWeight: 700,
                                        fontSize: "0.82rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}>
                                        ● {statusLabel(latest.result)}
                                    </span>
                                </div>
                                <div style={{ marginTop: "0.6rem", fontSize: "0.82rem", color: "#888", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                                    <span>⏱ {formatDuration(latest.duration)}</span>
                                    <span>🕐 {formatDate(latest.timestamp)}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Build history table */}
                    <section>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">History</div>
                                <h2 className="sec-title">Build History</h2>
                            </div>
                            <span className="count-badge">{builds.length} builds</span>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>Loading build history…</div>
                        ) : builds.length === 0 ? (
                            <div className="empty-state">
                                <h3>No builds yet</h3>
                                <p>Trigger a Jenkins pipeline from the Dashboard to see deployment history here.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left" }}>
                                            <th style={{ padding: "0.6rem 0.8rem", color: "#888", fontWeight: 600 }}>Build</th>
                                            <th style={{ padding: "0.6rem 0.8rem", color: "#888", fontWeight: 600 }}>Status</th>
                                            <th style={{ padding: "0.6rem 0.8rem", color: "#888", fontWeight: 600 }}>Duration</th>
                                            <th style={{ padding: "0.6rem 0.8rem", color: "#888", fontWeight: 600 }}>Started</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {builds.map(b => (
                                            <tr key={b.number} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                                <td style={{ padding: "0.7rem 0.8rem", fontWeight: 600 }}>#{b.number}</td>
                                                <td style={{ padding: "0.7rem 0.8rem" }}>
                                                    <span style={{ color: statusColor(b.result), fontWeight: 600 }}>
                                                        ● {statusLabel(b.result)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "0.7rem 0.8rem", color: "#aaa" }}>{formatDuration(b.duration)}</td>
                                                <td style={{ padding: "0.7rem 0.8rem", color: "#aaa" }}>{formatDate(b.timestamp)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                </main>
            </div>
        </div>
    );
}

export default Deployments;
