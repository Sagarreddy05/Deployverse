const express = require("express");

const router = express.Router();

// ── Shared config helper ──────────────────────────────────────────────────────
// Reads Jenkins credentials from environment variables.
// Throws if any required variable is missing.
// Used by all three routes to ensure consistent auth headers.
// ─────────────────────────────────────────────────────────────────────────────
function getJenkinsConfig() {
    const {
        JENKINS_URL,
        JENKINS_JOB,
        JENKINS_USER,
        JENKINS_API_TOKEN
    } = process.env;

    if (!JENKINS_URL || !JENKINS_JOB || !JENKINS_USER || !JENKINS_API_TOKEN) {
        throw new Error("Jenkins configuration is missing. Check JENKINS_URL, JENKINS_JOB, JENKINS_USER, JENKINS_API_TOKEN environment variables.");
    }

    const baseUrl = JENKINS_URL.replace(/\/+$/, "");

    // Build the job URL path — supports nested folders (e.g. "folder/job")
    const jobPath = JENKINS_JOB
        .split("/")
        .map(part => `job/${encodeURIComponent(part)}`)
        .join("/");

    const credentials = Buffer.from(
        `${JENKINS_USER}:${JENKINS_API_TOKEN}`
    ).toString("base64");

    return {
        baseUrl,
        jobPath,
        headers: {
            Authorization: `Basic ${credentials}`,
            Accept: "application/json"
        }
    };
}

// ── Helper: Fetch Jenkins CSRF crumb ─────────────────────────────────────────
// Jenkins requires a crumb on state-changing POST requests (unless disabled).
// Returns the crumb header field+value, or null if crumb issuer is disabled.
// ─────────────────────────────────────────────────────────────────────────────
async function fetchCrumb(baseUrl, headers) {
    const crumbResponse = await fetch(
        `${baseUrl}/crumbIssuer/api/json`,
        {
            method: "GET",
            headers,
            signal: AbortSignal.timeout(15000)
        }
    );

    if (crumbResponse.ok) {
        const crumb = await crumbResponse.json();

        if (crumb.crumbRequestField && crumb.crumb) {
            console.log("Jenkins CSRF crumb obtained successfully");
            return { field: crumb.crumbRequestField, value: crumb.crumb };
        }
    } else if (crumbResponse.status === 404) {
        // Crumb issuer disabled on this Jenkins instance — proceed without
        console.log("Jenkins crumb issuer not found (404) — proceeding without crumb");
        return null;
    } else if (crumbResponse.status === 401) {
        const body = await crumbResponse.text().catch(() => "");
        console.error("Jenkins crumb 401 — check JENKINS_USER and JENKINS_API_TOKEN");
        throw new Error(`Jenkins authentication failed (401). Check username and API token. Details: ${body.slice(0, 200)}`);
    } else {
        const errorText = await crumbResponse.text().catch(() => "");
        console.error("Jenkins crumb request failed:", { status: crumbResponse.status, body: errorText.slice(0, 500) });
        throw new Error(`Jenkins crumb request failed (${crumbResponse.status})`);
    }

    return null;
}

// ── POST /api/jenkins/trigger ─────────────────────────────────────────────────
// Jenkins response codes for buildWithParameters:
//   201 Created  — build queued successfully, Location: /queue/item/<n>/
//   302 Found    — redirected (some Jenkins versions use 302 instead of 201)
//   303 See Other — build NOT queued because DisableConcurrentBuilds is set
//                   and a build is already running; Location points to that build.
//                   This is NOT an error — a build is in progress.
//   400 Bad Request — job has parameters but /build (not /buildWithParameters) was called
//   401/403  — authentication or authorization failure
router.post("/trigger", async (req, res) => {
    let config;

    try {
        config = getJenkinsConfig();
    } catch (configErr) {
        console.error("Jenkins config error:", configErr.message);
        return res.status(500).json({
            status: "error",
            message: configErr.message
        });
    }

    const { baseUrl, jobPath, headers } = config;

    // ── Read and validate optional project parameters from request body ───────
    const rawRepoUrl   = req.body?.repository_url || "";
    const rawBranch    = req.body?.branch          || "";

    // Validate GitHub URL if provided — must be a plain https://github.com URL.
    // This prevents arbitrary shell injection or unintended SCM targets.
    let repoUrl = "";
    if (rawRepoUrl) {
        try {
            const parsed = new URL(rawRepoUrl);
            if (parsed.protocol !== "https:" || !parsed.hostname.endsWith("github.com")) {
                return res.status(400).json({
                    status:  "error",
                    message: "repository_url must be an HTTPS GitHub URL (https://github.com/...)"
                });
            }
            // Normalise: ensure .git suffix
            repoUrl = parsed.href.replace(/\.git$/, "") + ".git";
        } catch {
            return res.status(400).json({
                status:  "error",
                message: "Invalid repository_url — must be a valid HTTPS URL"
            });
        }
    }

    // Validate branch — only alphanumeric, hyphens, underscores, slashes, dots
    const branch = rawBranch
        ? rawBranch.replace(/[^a-zA-Z0-9._\-\/]/g, "").slice(0, 100) || "main"
        : "";

    try {
        // Step 1: Obtain CSRF crumb
        const crumb = await fetchCrumb(baseUrl, headers);

        const requestHeaders = { ...headers };

        if (crumb) {
            requestHeaders[crumb.field] = crumb.value;
        }

        // Step 2: Trigger Jenkins build with parameters.
        // Jenkins buildWithParameters reads parameters from the POST body
        // (application/x-www-form-urlencoded), NOT from the URL query string.
        // The `delay` quiet-period is kept in the query string as Jenkins expects.
        const formBody = new URLSearchParams();
        if (repoUrl) formBody.set("REPO_URL", repoUrl);
        if (branch)  formBody.set("BRANCH",   branch);

        const triggerUrl = `${baseUrl}/${jobPath}/buildWithParameters?delay=0sec`;

        console.log("Triggering Jenkins job:", triggerUrl.replace(/\/\/[^@]+@/, "//***@"));
        console.log("  Form body:", formBody.toString());
        if (repoUrl) console.log("  REPO_URL:", repoUrl);
        if (branch)  console.log("  BRANCH:",   branch);

        const triggerResponse = await fetch(triggerUrl, {
            method: "POST",
            headers: {
                ...requestHeaders,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formBody.toString(),
            signal: AbortSignal.timeout(15000),
            redirect: "manual"  // Always capture redirect — never auto-follow
        });


        const status   = triggerResponse.status;
        const location = triggerResponse.headers.get("location") || "";

        console.log(`Jenkins trigger response: HTTP ${status}, Location: ${location}`);

        // ── 201: Newly queued ────────────────────────────────────────────────
        if (status === 201) {
            // Confirm via queue API that the item is actually pending
            const queueConfirmed = await confirmQueueItem(location, headers);
            return res.status(202).json({
                status:   "success",
                message:  "Jenkins pipeline triggered successfully",
                queued:   true,
                location: location,
                queue:    queueConfirmed
            });
        }

        // ── 302: Some Jenkins versions redirect on success ────────────────────
        if (status === 302) {
            return res.status(202).json({
                status:   "success",
                message:  "Jenkins pipeline triggered successfully",
                queued:   true,
                location: location
            });
        }

        // ── 303 See Other: DisableConcurrentBuilds — a build is already running
        // Jenkins refuses to queue a duplicate when concurrency is disabled.
        // This is not an error — report the in-progress build to the caller.
        if (status === 303) {
            console.log("Jenkins 303: concurrent build is already running or queued, location:", location);
            return res.status(202).json({
                status:   "success",
                message:  "A build is already running or queued in Jenkins. No new build was queued.",
                queued:   false,
                running:  true,
                location: location
            });
        }

        // ── Any other status is a genuine failure ────────────────────────────
        const errorText = await triggerResponse.text().catch(() => "");

        console.error("Jenkins trigger failed:", {
            status,
            url:      triggerUrl,
            location,
            response: errorText.slice(0, 500)
        });

        return res.status(502).json({
            status:  "error",
            message: `Jenkins rejected the build request (${status})`
        });

    } catch (error) {
        console.error("Jenkins trigger error:", error.message);

        return res.status(502).json({
            status:  "error",
            message: error.message || "Could not connect to Jenkins"
        });
    }
});

// ── Helper: Confirm queue item via Jenkins queue API ─────────────────────────
// Given a Location URL like http://host:8080/queue/item/27/
// fetch the queue item JSON to confirm it is pending (not cancelled).
// Returns the queue item summary, or null if unreachable.
async function confirmQueueItem(location, headers) {
    if (!location || !location.includes("/queue/item/")) {
        return null;
    }

    try {
        const queueApiUrl = location.replace(/\/?$/, "/api/json?tree=id,blocked,buildable,why,task[name]");
        const queueRes = await fetch(queueApiUrl, {
            headers,
            signal: AbortSignal.timeout(8000)
        });

        if (!queueRes.ok) {
            return null;
        }

        const item = await queueRes.json();
        console.log("Queue item confirmed:", { id: item.id, buildable: item.buildable, why: item.why });
        return { id: item.id, buildable: item.buildable, why: item.why };
    } catch (err) {
        // Non-fatal — queue confirmation is best-effort
        console.warn("Queue confirmation failed (non-fatal):", err.message);
        return null;
    }
}



// ── GET /api/jenkins/status ───────────────────────────────────────────────────
router.get("/status", async (req, res) => {
    let config;

    try {
        config = getJenkinsConfig();
    } catch (configErr) {
        return res.status(500).json({ status: "error", message: configErr.message });
    }

    const { baseUrl, jobPath, headers } = config;

    try {
        const response = await fetch(
            `${baseUrl}/${jobPath}/lastBuild/api/json?tree=number,result,building,timestamp,url,displayName,duration`,
            { headers, signal: AbortSignal.timeout(15000) }
        );

        if (response.status === 404) {
            return res.json({
                status: "success",
                build: null,
                message: "No Jenkins builds found yet"
            });
        }

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("Jenkins status request failed:", response.status, errText.slice(0, 300));
            return res.status(502).json({
                status: "error",
                message: `Jenkins status request failed (${response.status})`
            });
        }

        const build = await response.json();

        return res.json({
            status: "success",
            build: {
                number:      build.number,
                result:      build.building ? "RUNNING" : (build.result || "UNKNOWN"),
                building:    build.building,
                timestamp:   build.timestamp,
                url:         build.url,
                displayName: build.displayName,
                duration:    build.duration
            }
        });

    } catch (error) {
        console.error("Jenkins status error:", error.message);
        return res.status(502).json({
            status: "error",
            message: "Could not retrieve Jenkins build status"
        });
    }
});

// ── GET /api/jenkins/history ──────────────────────────────────────────────────
router.get("/history", async (req, res) => {
    let config;

    try {
        config = getJenkinsConfig();
    } catch (configErr) {
        return res.status(500).json({ status: "error", message: configErr.message });
    }

    const { baseUrl, jobPath, headers } = config;

    try {
        const response = await fetch(
            `${baseUrl}/${jobPath}/api/json?tree=builds[number,result,building,timestamp,url,displayName,duration]{0,10}`,
            { headers, signal: AbortSignal.timeout(15000) }
        );

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("Jenkins history request failed:", response.status, errText.slice(0, 300));
            return res.status(502).json({
                status: "error",
                message: `Jenkins history request failed (${response.status})`
            });
        }

        const data = await response.json();

        const builds = (data.builds || []).map(build => ({
            number:      build.number,
            result:      build.building ? "RUNNING" : (build.result || "UNKNOWN"),
            building:    build.building,
            timestamp:   build.timestamp,
            url:         build.url,
            displayName: build.displayName,
            duration:    build.duration
        }));

        return res.json({
            status: "success",
            count: builds.length,
            builds
        });

    } catch (error) {
        console.error("Jenkins history error:", error.message);
        return res.status(502).json({
            status: "error",
            message: "Could not retrieve Jenkins build history"
        });
    }
});

// ── GET /api/jenkins/connection ───────────────────────────────────────────────
// Lightweight connectivity test — does not trigger a build.
router.get("/connection", async (req, res) => {
    let config;

    try {
        config = getJenkinsConfig();
    } catch (configErr) {
        return res.status(500).json({ status: "error", message: configErr.message });
    }

    const { baseUrl, headers } = config;

    try {
        const response = await fetch(
            `${baseUrl}/api/json?tree=nodeName,version`,
            { headers, signal: AbortSignal.timeout(10000) }
        );

        if (response.status === 401) {
            return res.status(502).json({
                status: "error",
                message: "Jenkins authentication failed — check JENKINS_USER and JENKINS_API_TOKEN"
            });
        }

        if (!response.ok) {
            return res.status(502).json({
                status: "error",
                message: `Jenkins returned HTTP ${response.status}`
            });
        }

        const data = await response.json();

        return res.json({
            status: "success",
            message: "Jenkins connection successful",
            jenkins: {
                url:     baseUrl,
                node:    data.nodeName,
                version: response.headers.get("X-Jenkins") || "unknown"
            }
        });

    } catch (error) {
        console.error("Jenkins connection test error:", error.message);
        return res.status(502).json({
            status: "error",
            message: `Cannot reach Jenkins at ${config.baseUrl}: ${error.message}`
        });
    }
});

module.exports = router;
