const IcoBell = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5A3.5 3.5 0 003.5 5v3L2 9.5h10L10.5 8V5A3.5 3.5 0 007 1.5z"
              stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <path d="M5.5 10.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
);

const IcoLogout = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M5 2H2.5A1.5 1.5 0 001 3.5v5A1.5 1.5 0 002.5 10H5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <path d="M8 4l3 2-3 2M5 6h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function Topbar({ user, onLogout }) {
    return (
        <header className="topbar" role="banner">

            {/* Breadcrumb */}
            <div className="tb-left" aria-label="Breadcrumb">
                <span>DeployVerse</span>
                <span className="tb-sep" aria-hidden="true">/</span>
                <span className="tb-page">Dashboard</span>
            </div>

            {/* Right controls */}
            <div className="tb-right">

                <button
                    className="tb-icon-btn"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <IcoBell />
                </button>

                <div className="tb-divider" aria-hidden="true" />

                <div className="tb-user">
                    <div
                        className="tb-avatar"
                        aria-label={`User: ${user.name}`}
                        title={user.name}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="tb-user-info">
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                    </div>

                    <button
                        className="tb-logout"
                        onClick={onLogout}
                        aria-label="Logout"
                        title="Logout"
                    >
                        <IcoLogout /> Logout
                    </button>
                </div>

            </div>

        </header>
    );
}

export default Topbar;