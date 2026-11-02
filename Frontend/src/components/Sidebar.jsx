import { NavLink } from "react-router-dom";

/* ── SVG Icons ── */
const IcoDash = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".9"/>
        <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".4"/>
        <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".4"/>
        <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".65"/>
    </svg>
);

const IcoFolders = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 4a1.5 1.5 0 011.5-1.5H5l1.5 1.5h5A1.5 1.5 0 0113 5.5v5A1.5 1.5 0 0111.5 12h-9A1.5 1.5 0 011 10.5V4z"
              stroke="currentColor" strokeWidth="1.1" fill="none"/>
    </svg>
);

const IcoRocket = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5S10 3 10 7l-2 2H6L4 7C4 3 7 1.5 7 1.5z" stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <path d="M6 9l-.5 3h3L8 9" stroke="currentColor" strokeWidth="1" fill="none"/>
        <circle cx="7" cy="6" r="1" stroke="currentColor" strokeWidth="1"/>
    </svg>
);

const IcoPipes = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="2.5" cy="7" r="1.5" fill="currentColor"/>
        <circle cx="7"   cy="7" r="1.5" fill="currentColor"/>
        <circle cx="11.5" cy="7" r="1.5" fill="currentColor"/>
        <path d="M4 7h2M8.5 7h2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
);

const IcoMonitor = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <path d="M1 7.5l2.5-3 2.5 1.5 2.5-3.5L11 7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 13h5M7 10v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
);

const IcoCloud = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M4.5 10.5a3 3 0 010-6 3.5 3.5 0 016.5-1A2.5 2.5 0 0113 6a2.5 2.5 0 01-2.5 2.5H4.5z"
              stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <path d="M6 10.5v2M8 10.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
);

const IcoGear = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.4 2.4l1.1 1.1M10.5 10.5l1.1 1.1M11.6 2.4l-1.1 1.1M3.5 10.5l-1.1 1.1"
              stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
);

// NavItem — uses React Router NavLink for automatic active state
// end={true} prevents "/" from matching every child path in React Router v6
function NavItem({ to, icon, label, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
            aria-label={label}
            title={label}
            style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
        >
            <span className="sb-icon" aria-hidden="true">{icon}</span>
            <span className="sb-label">{label}</span>
        </NavLink>
    );
}

function Sidebar() {
    return (
        <aside className="sidebar" aria-label="Main navigation">

            {/* Brand */}
            <div className="sb-header">
                <div className="sb-logo" aria-hidden="true">DV</div>
                <span className="sb-brand">DeployVerse</span>
            </div>

            {/* Nav */}
            <nav className="sb-nav" aria-label="Primary">

                <div className="sb-group" aria-hidden="true">Main</div>

                <NavItem to="/"            icon={<IcoDash />}    label="Dashboard"   end />
                <NavItem to="/projects"    icon={<IcoFolders />} label="Projects"    />
                <NavItem to="/deployments" icon={<IcoRocket />}  label="Deployments" />
                <NavItem to="/pipelines"   icon={<IcoPipes />}   label="Pipelines"   />

                <div className="sb-group" aria-hidden="true">Infrastructure</div>

                <NavItem to="/monitoring"  icon={<IcoMonitor />} label="Monitoring"  />
                <NavItem to="/aws"         icon={<IcoCloud />}   label="AWS"         />

                <div className="sb-group" aria-hidden="true">System</div>

                <NavItem to="/settings"    icon={<IcoGear />}    label="Settings"    />

            </nav>

            {/* Status */}
            <div className="sb-footer" aria-label="System status">
                <div className="sb-status-dot" aria-hidden="true"></div>
                <div className="sb-footer-text">
                    <strong>System Online</strong>
                    <small>api.deployverse.io</small>
                </div>
            </div>

        </aside>
    );
}

export default Sidebar;