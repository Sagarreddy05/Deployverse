import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Deployments from "./pages/Deployments";
import Pipelines   from "./pages/Pipelines";
import Monitoring  from "./pages/Monitoring";
import AWS         from "./pages/AWS";
import Settings    from "./pages/Settings";

// Projects page — re-use Dashboard's project section or just show Dashboard
// (Dashboard already has the full project management UI)
// We route /projects to a Projects wrapper that renders the same dashboard
// with the form pre-opened; for now, point to Dashboard since all project
// management lives there.
import Projects from "./pages/Dashboard";

function App() {

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("deployverse_user");
        return saved ? JSON.parse(saved) : null;
    });

    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = (loggedInUser) => {
        localStorage.setItem("deployverse_user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        localStorage.removeItem("deployverse_user");
        setUser(null);
        setShowRegister(false);
    };

    // ── Not authenticated — show login / register ───────────────────────────
    if (!user) {
        if (showRegister) {
            return (
                <Register
                    onRegister={() => setShowRegister(false)}
                    onGoToLogin={() => setShowRegister(false)}
                />
            );
        }
        return (
            <Login
                onLogin={handleLogin}
                onGoToRegister={() => setShowRegister(true)}
            />
        );
    }

    // ── Authenticated — full SPA with routing ───────────────────────────────
    const sharedProps = { user, onLogout: handleLogout };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"            element={<Dashboard   {...sharedProps} />} />
                <Route path="/projects"    element={<Projects    {...sharedProps} />} />
                <Route path="/deployments" element={<Deployments {...sharedProps} />} />
                <Route path="/pipelines"   element={<Pipelines   {...sharedProps} />} />
                <Route path="/monitoring"  element={<Monitoring  {...sharedProps} />} />
                <Route path="/aws"         element={<AWS         {...sharedProps} />} />
                <Route path="/settings"    element={<Settings    {...sharedProps} />} />
                {/* Catch-all → Dashboard */}
                <Route path="*"            element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;