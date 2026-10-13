import { useState } from "react";
import { loginUser } from "../services/api";

/* Mini pipeline nodes shown on left branding panel */
const PIPELINE = [
    { abbr: "GH",  label: "GitHub",  on: true  },
    { abbr: "J",   label: "Jenkins", on: false },
    { abbr: "D",   label: "Docker",  on: false },
    { abbr: "K8s", label: "K8s",     on: false },
    { abbr: "EC2", label: "AWS",     on: false },
];

function Login({ onLogin, onGoToRegister }) {
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [message,  setMessage]  = useState("");
    const [loading,  setLoading]  = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const data = await loginUser({ email, password });
            onLogin(data.user);
        } catch (error) {
            setMessage(error.message);
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

                {/* Logo */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">DV</div>
                    <span className="auth-brand-name">DeployVerse</span>
                </div>

                <div className="auth-left-body">

                    {/* Terminal chip */}
                    <div className="auth-chip">
                        <span className="chip">
                            <span className="chip-dollar">$</span>
                            git push origin main
                        </span>
                    </div>

                    {/* Hero heading */}
                    <h1 className="auth-heading">
                        SHIP CODE.<br />
                        SCALE WITHOUT<br />
                        THE <span className="ac">COMPLEXITY.</span>
                    </h1>

                    <p className="auth-sub">
                        Automate your entire CI/CD pipeline — from GitHub
                        commit to AWS EC2 production — with Jenkins, Docker,
                        and Kubernetes.
                    </p>

                    {/* Mini pipeline */}
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

            {/* ── Right: Auth form ── */}
            <div className="auth-right">
                <div className="auth-form-card">

                    <h2 className="auth-form-title">Sign in</h2>
                    <p className="auth-form-sub">Continue to DeployVerse</p>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="auth-field">
                            <label className="auth-lbl" htmlFor="login-email">
                                Email address
                            </label>
                            <input
                                id="login-email"
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
                            <label className="auth-lbl" htmlFor="login-password">
                                Password
                            </label>
                            <input
                                id="login-password"
                                className="auth-inp"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {message && (
                            <div
                                className="auth-msg err"
                                role="alert"
                                aria-live="polite"
                            >
                                <span aria-hidden="true">✕</span> {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                        >
                            {loading ? "Signing in…" : "Sign in →"}
                        </button>
                    </form>

                    <div className="auth-foot">
                        <p>
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                className="auth-switch"
                                onClick={onGoToRegister}
                            >
                                Create one
                            </button>
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Login;