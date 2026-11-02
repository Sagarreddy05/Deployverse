import Sidebar from "../components/Sidebar";
import Topbar  from "../components/Topbar";

const FeatureRow = ({ name, status, note }) => {
    const color = status === "ready" ? "#22c55e" : status === "planned" ? "#f59e0b" : "#6b7280";
    const label = status === "ready" ? "Ready" : status === "planned" ? "Planned" : "Future";
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "8px",
            fontSize: "0.84rem",
            marginBottom: "6px",
        }}>
            <span style={{ color, fontSize: "0.65rem", fontWeight: 700, minWidth: "60px", textTransform: "uppercase" }}>
                ● {label}
            </span>
            <span style={{ fontWeight: 600 }}>{name}</span>
            {note && <span style={{ color: "#666", marginLeft: "auto", textAlign: "right", fontSize: "0.78rem" }}>{note}</span>}
        </div>
    );
};

function AWS({ user, onLogout }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-area">
                <Topbar user={user} onLogout={onLogout} />
                <main className="dash-content">

                    <section className="dash-hero" style={{ paddingBottom: "1.5rem" }}>
                        <div className="hero-kicker">Cloud Infrastructure</div>
                        <h1 className="hero-h1" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>
                            AWS CLOUD
                        </h1>
                        <p className="hero-sub">
                            Amazon Web Services integration — ECR container registry, EKS cluster, and EC2 deployment targets.
                            Currently running on local Minikube. AWS integration is Phase 2.
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
                        ⚠ AWS integration is Phase 2. No AWS credentials are configured yet. The pipeline currently deploys to Minikube.
                    </div>

                    {/* Current infrastructure */}
                    <section>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Current</div>
                                <h2 className="sec-title">Active Infrastructure</h2>
                            </div>
                        </div>
                        <FeatureRow name="Minikube (local Kubernetes)"  status="ready"   note="Cluster running locally" />
                        <FeatureRow name="Docker (local registry)"      status="ready"   note="Images built by Jenkins" />
                        <FeatureRow name="Jenkins (self-hosted)"        status="ready"   note="localhost:8080" />
                        <FeatureRow name="SQLite (persistent volume)"   status="ready"   note="Mounted in Kubernetes pod" />
                    </section>

                    {/* Planned AWS */}
                    <section style={{ marginTop: "2rem" }}>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Phase 2 Roadmap</div>
                                <h2 className="sec-title">Planned AWS Features</h2>
                            </div>
                        </div>
                        <FeatureRow name="AWS ECR — Container Registry"       status="planned" note="Push Docker images to ECR" />
                        <FeatureRow name="AWS EKS — Managed Kubernetes"        status="planned" note="Migrate from Minikube to EKS" />
                        <FeatureRow name="AWS EC2 — Compute targets"           status="planned" note="Deploy workloads to EC2 nodes" />
                        <FeatureRow name="AWS IAM — Access management"         status="planned" note="Role-based access for CI/CD" />
                        <FeatureRow name="AWS CloudWatch — Logs & metrics"     status="planned" note="Observability integration" />
                        <FeatureRow name="AWS ALB — Load balancing"            status="future"  note="Production traffic routing" />
                        <FeatureRow name="AWS Route 53 — DNS"                  status="future"  note="Custom domain routing" />
                    </section>

                    {/* Architecture diagram placeholder */}
                    <section style={{ marginTop: "2rem" }}>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Architecture</div>
                                <h2 className="sec-title">Target Cloud Architecture</h2>
                            </div>
                        </div>
                        <div style={{
                            padding: "2rem",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            textAlign: "center",
                            color: "#555",
                            fontSize: "0.84rem",
                            lineHeight: "2.5",
                            fontFamily: "monospace",
                        }}>
                            GitHub → Jenkins → AWS ECR → AWS EKS → AWS ALB → Users<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            CloudWatch ← Logs ← EKS Pods
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
}

export default AWS;
