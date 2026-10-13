/**
 * PipelineViz — CI/CD pipeline visualization
 * Shows each stage with connected/pending states.
 * Pure UI component — no fake data, no real API calls.
 */

const STAGES = [
    {
        type: "SOURCE",
        name: "GitHub",
        abbr: "GH",
        connected: true,   /* Day 1 — projects are linked from GitHub */
    },
    {
        type: "BUILD",
        name: "Jenkins",
        abbr: "J",
        connected: false,  /* Day 2 */
    },
    {
        type: "PACKAGE",
        name: "Docker",
        abbr: "D",
        connected: false,  /* Day 2 */
    },
    {
        type: "ORCHESTRATE",
        name: "Kubernetes",
        abbr: "K8s",
        connected: false,  /* Day 2 */
    },
    {
        type: "DEPLOY",
        name: "AWS EC2",
        abbr: "EC2",
        connected: false,  /* Day 2 */
    },
];

function PipelineViz() {
    return (
        <section className="pipeline-section" aria-label="CI/CD pipeline overview">

            <div className="pipeline-sec-head">
                <div>
                    <h2>Deployment Pipeline</h2>
                    <p>Automated CI/CD workflow — GitHub to AWS EC2</p>
                </div>
                <span className="cs-badge" aria-label="Day 2 integration">
                    ⏳ Day 2 Integration
                </span>
            </div>

            <div className="pipeline-track" role="list" aria-label="Pipeline stages">

                {STAGES.map((stage, i) => (
                    <div key={stage.name} style={{ display: "contents" }}>

                        <div
                            className={`pl-stage${stage.connected ? " connected" : ""}`}
                            role="listitem"
                            aria-label={`${stage.name} — ${stage.connected ? "Connected" : "Coming soon"}`}
                        >
                            <div
                                className="pl-node"
                                title={stage.name}
                            >
                                {stage.abbr}
                            </div>

                            <span className="pl-type">{stage.type}</span>
                            <span className="pl-name">{stage.name}</span>

                            <span className={`pl-tag ${stage.connected ? "pl-tag-on" : "pl-tag-off"}`}>
                                {stage.connected ? "Connected" : "Coming Soon"}
                            </span>
                        </div>

                        {/* Connector arrow between stages */}
                        {i < STAGES.length - 1 && (
                            <div className="pl-connector" aria-hidden="true">
                                <div className="pl-line"></div>
                                <span className="pl-arrow">›</span>
                            </div>
                        )}

                    </div>
                ))}

            </div>

        </section>
    );
}

export default PipelineViz;
