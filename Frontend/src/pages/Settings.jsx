import Sidebar from "../components/Sidebar";
import Topbar  from "../components/Topbar";

const SettingRow = ({ label, value, note }) => (
    <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.9rem 1rem",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "8px",
        fontSize: "0.84rem",
        marginBottom: "6px",
        flexWrap: "wrap",
        gap: "0.5rem",
    }}>
        <div>
            <div style={{ fontWeight: 600 }}>{label}</div>
            {note && <div style={{ color: "#666", fontSize: "0.76rem", marginTop: "2px" }}>{note}</div>}
        </div>
        <span style={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            color: "#aaa",
            background: "rgba(255,255,255,0.06)",
            padding: "3px 10px",
            borderRadius: "6px",
        }}>
            {value}
        </span>
    </div>
);

function Settings({ user, onLogout }) {
    const apiUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "(relative — nginx proxy)";

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-area">
                <Topbar user={user} onLogout={onLogout} />
                <main className="dash-content">

                    <section className="dash-hero" style={{ paddingBottom: "1.5rem" }}>
                        <div className="hero-kicker">Configuration</div>
                        <h1 className="hero-h1" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>
                            SETTINGS
                        </h1>
                        <p className="hero-sub">
                            System configuration and environment information.
                            Sensitive values (credentials, tokens) are never exposed here.
                        </p>
                    </section>

                    {/* Account */}
                    <section>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Account</div>
                                <h2 className="sec-title">Logged-in User</h2>
                            </div>
                        </div>
                        <SettingRow label="Username" value={user?.username || "—"} note="Your DeployVerse account name" />
                        <SettingRow label="User ID"  value={user?.id ? `#${user.id}` : "—"} note="Internal user identifier" />
                    </section>

                    {/* Environment */}
                    <section style={{ marginTop: "2rem" }}>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Environment</div>
                                <h2 className="sec-title">Runtime Configuration</h2>
                            </div>
                        </div>
                        <SettingRow label="API URL"      value={apiUrl}       note="Backend service URL (VITE_API_URL)" />
                        <SettingRow label="Environment"  value={import.meta.env.MODE || "production"} note="Vite build mode" />
                        <SettingRow label="Database"     value="SQLite"       note="Persistent volume in Kubernetes pod" />
                        <SettingRow label="Auth method"  value="Username / Password" note="Bcrypt-hashed passwords in SQLite" />
                    </section>

                    {/* Jenkins config (no credentials) */}
                    <section style={{ marginTop: "2rem" }}>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">CI/CD</div>
                                <h2 className="sec-title">Jenkins Configuration</h2>
                            </div>
                        </div>
                        <SettingRow label="Jenkins URL"  value="host.docker.internal:8080" note="Accessible from inside Kubernetes pods" />
                        <SettingRow label="Jenkins Job"  value="DeployVerse-CI" note="Pipeline job name" />
                        <SettingRow label="Credentials"  value="[secured — backend only]" note="Never exposed to frontend" />
                    </section>

                    {/* Kubernetes */}
                    <section style={{ marginTop: "2rem" }}>
                        <div className="sec-head">
                            <div className="sec-head-left">
                                <div className="sec-kicker">Kubernetes</div>
                                <h2 className="sec-title">Cluster Configuration</h2>
                            </div>
                        </div>
                        <SettingRow label="Cluster"     value="Minikube"           note="Local single-node cluster" />
                        <SettingRow label="Backend svc" value="deployverse-backend:5000" note="Internal cluster service" />
                        <SettingRow label="Frontend svc" value="deployverse-frontend:80"  note="nginx serving React SPA" />
                        <SettingRow label="NodePort"    value="31333"              note="External access port" />
                    </section>

                </main>
            </div>
        </div>
    );
}

export default Settings;
