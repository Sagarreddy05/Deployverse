/**
 * PageHeader — Reusable dashboard page header
 * Props: kicker, title, subtitle, action (optional React node)
 */
function PageHeader({ kicker, title, subtitle, action }) {
    return (
        <section className="page-header">
            <div>
                {kicker && (
                    <span className="page-kicker" aria-hidden="true">
                        {kicker}
                    </span>
                )}
                <h1>{title}</h1>
                {subtitle && (
                    <p className="page-header-subtitle">{subtitle}</p>
                )}
            </div>
            {action && (
                <div className="page-header-action">
                    {action}
                </div>
            )}
        </section>
    );
}

export default PageHeader;
