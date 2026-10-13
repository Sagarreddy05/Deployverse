import { useState } from "react";
import { registerUser } from "../services/api";

const PIPELINE = [
    { abbr: "GH",  label: "GitHub",  on: true  },
    { abbr: "J",   label: "Jenkins", on: false },
    { abbr: "D",   label: "Docker",  on: false },
    { abbr: "K8s", label: "K8s",     on: false },
    { abbr: "EC2", label: "AWS",     on: false },
];

function Register({ onRegister, onGoToLogin }) {
    const [name,     setName]     = useState("");
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [message,  setMessage]  = useState("");
    const [msgType,  setMsgType]  = useState("err");
    const [loading,  setLoading]  = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const data = await registerUser({ name, email, password });
            setMessage(data.message);
            setMsgType("ok");
            setTimeout(() => onRegister(), 800);
        } catch (error) {
            setMessage(error.message);
            setMsgType("err");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* ── Left: Branding ── */}
            <div className="auth-left" aria-hidden="true">
                <div className="auth-glow-1" />
                <div className="auth-glow-2" />

                <div className="auth-brand">
                    <div className="auth-brand-icon">DV</div>
                    <span className="auth-brand-name">DeployVerse</span>
                </div>

                <div className="auth-left-body">

                    <div className="auth-chip" style={{ marginBottom: "28px" }}>
                        <span className="chip">
                            <span className="chip-dollar">$</span>
                            deployverse init
                        </span>
                    </div>

                    <h1 className="auth-heading">
                        YOUR CI/CD<br />
                        PIPELINE<br />
                        STARTS <span className="ac">HERE.</span>
                    </h1>

                    <p className="auth-sub">
                        Join DeployVerse and take full control of your
                        cloud deployments — from GitHub commit to
                        AWS EC2 in a single automated workflow.
                    </p>

                    <div className="mini-pipeline" role="presentation">
                        {PIPELINE.map((stage, i) => (
                            <div key={stage.abbr} style={{ display: "contents" }}>
                                <div className="mp-node">
                                    <div className={`mp-box${stage.on ? " on" : ""}`}>
                                        {stage.abbr}
                                    </div>
                                    <span className="mp-lbl">{stage.label}</span>
                                </div>
                                {i < PIPELINE.length - 1 && (
                                    <div className="mp-line" aria-hidden="true" />
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* ── Right: Register form ── */}
            <div className="auth-right">
                <div className="auth-form-card">

                    <h2 className="auth-form-title">Create account</h2>
                    <p className="auth-form-sub">
                        Get started with DeployVerse for free
                    </p>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="auth-field">
                            <label className="auth-lbl" htmlFor="reg-name">
                                Full name
                            </label>
                            <input
                                id="reg-name"
                                className="auth-inp"
                                type="text"
                                placeholder="Jane Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-lbl" htmlFor="reg-email">
                                Email address
                            </label>
                            <input
                                id="reg-email"
                                className="auth-inp"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-lbl" htmlFor="reg-password">
                                Password
                            </label>
                            <input
                                id="reg-password"
                                className="auth-inp"
                                type="password"
                                placeholder="Choose a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {message && (
                            <div
                                className={`auth-msg ${msgType}`}
                                role="alert"
                                aria-live="polite"
                            >
                                <span aria-hidden="true">
                                    {msgType === "ok" ? "✓" : "✕"}
                                </span>{" "}
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating account…" : "Create account →"}
                        </button>
                    </form>

                    <div className="auth-foot">
                        <p>
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="auth-switch"
                                onClick={onGoToLogin}
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Register;