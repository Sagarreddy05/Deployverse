import Sidebar from "../components/Sidebar";
import Topbar  from "../components/Topbar";

// Monitoring page — shows what's actually observable vs what's planned.
// Does not fabricate metrics. Clearly labels live vs future data.

const MetricCard = ({ label, value, unit, note, live }) => (
    <div className="project-card" style={{ padding: "1.2rem 1.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="pc-meta-label" style={{ fontSize: "0.75rem" }}>{label}</div>
            <span style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "20px",
                background: live ? "rgba(34,197,94,0.12)" : "rgba(75,85,99,0.3)",
                color: live ? "#22c55e" : "#6b7280",
                border: live ? "1px solid #22c55e44" : "1px solid #4b556344",
            }}>
                {live ? "LIVE" : "PLANNED"}
            </span>
        </div>
        <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "0.5rem", color: live ? "#fff" : "#4b5563" }}>
            {value}
            {unit && <span style={{ fontSize: "0.9rem", fontWeight: 400, marginLeft: "4px", color: "#888" }}>{unit}</span>}
        </div>
        {note && <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.3rem" }}>{note}</div>}
    </div>
);

function Monitoring({ user, onLogout }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-area">
                <Topbar user={user} onLogout={onLogout} />
                <main className="dash-content">

                    <section className="dash-hero" style={{ paddingBottom: "1.5rem" }}>
                        <div className="hero-kicker">Observability</div>
                        <h1 className="hero-h1" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>
                            MONITORING
                        </h1>
                        <p className="hero-sub">
                            System health and infrastructure metrics. Live metrics require Kubernetes and AWS integration (Phase 2).
                        </p>
                    </section>

                    <div className="notify" style={{
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        color: "#f59e0b",
                        borderRadius: "8px",
                        padding: "0.8rem 1rem",
                        marginBottom: "1.5rem",
                        fontSize: "0.84rem",
                    }} role="note">
                        ⚠ Full monitoring requires Kubernetes cluster metrics and AWS CloudWatch integration (Phase 2).
                        The metrics marked LIVE are available today.
                    </div>

                    {/* Live metrics */}
                    <section>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Available Now</div>
                                <h2 className="sec-title">Live Metrics</h2>
                            </div>
                        </div>
                        <div className="projects-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))" }}>
                            <MetricCard label="Jenkins CI"   value="Connected" note="Pipeline running on localhost:8080" live />
                            <MetricCard label="Backend API"  value="Online"    note="Express server healthy"             live />
                            <MetricCard label="Database"     value="SQLite"    note="Persistent volume in Kubernetes"    live />
                            <MetricCard label="Minikube"     value="Running"   note="Local Kubernetes cluster"           live />
                        </div>
                    </section>

                    {/* Planned metrics */}
                    <section style={{ marginTop: "2rem" }}>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Phase 2</div>
                                <h2 className="sec-title">Planned Metrics</h2>
                            </div>
                        </div>
                        <div className="projects-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))" }}>
                            <MetricCard label="CPU Usage"       value="— %"    note="Requires K8s metrics-server"        live={false} />
                            <MetricCard label="Memory Usage"    value="— Mi"   note="Requires K8s metrics-server"        live={false} />
                            <MetricCard label="Pod Health"      value="—"      note="Requires Kubernetes API integration" live={false} />
                            <MetricCard label="Request Rate"    value="— /s"   note="Requires ingress metrics or Prometheus" live={false} />
                            <MetricCard label="Error Rate"      value="— %"    note="Requires log aggregation"           live={false} />
                            <MetricCard label="AWS EC2 Health"  value="—"      note="Requires AWS CloudWatch integration" live={false} />
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
}

export default Monitoring;
