// ============================================================
//  DeployVerse — Jenkinsfile
//  Declarative Pipeline for CI/CD
//
//  Pipeline stages:
//    1. Checkout    — get source from GitHub
//    2. Validate    — confirm project type and structure
//    3. Install     — npm install dependencies
//    4. Build       — npm run build (if script exists)
//    5. Test        — npm test (if script exists)
//    6. Report      — summarise result
//
//  This Jenkinsfile is checked into the repository root.
//  Jenkins reads it automatically when configured as a
//  Pipeline job with "Pipeline script from SCM".
// ============================================================

pipeline {

    agent any

    // ── Configurable parameters ──────────────────────────────
    // Override these in the Jenkins job UI or trigger API
    parameters {
        string(
            name: 'REPO_URL',
            defaultValue: 'https://github.com/Sagarreddy05/Deployverse.git',
            description: 'GitHub repository HTTPS URL'
        )
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'Branch to build'
        )
        choice(
            name: 'TARGET_DIR',
            choices: ['Backend', 'Frontend', 'both'],
            description: 'Which part of the project to build'
        )
    }

    // ── Environment variables ─────────────────────────────────
    environment {
        NODE_ENV = 'ci'
    }

    // ── Pipeline options ──────────────────────────────────────
    options {
        timeout(time: 20, unit: 'MINUTES')   // fail if build hangs
        timestamps()                          // prefix all log lines with time
        disableConcurrentBuilds()             // only one build at a time
    }

    stages {

        // ── Stage 1: Checkout ─────────────────────────────────
        // Jenkins checks out the repository from GitHub.
        // If the repo is private, a Jenkins credential ID must
        // be added and referenced here.
        stage('Checkout') {
            steps {
                echo "=========================================="
                echo " STAGE 1: Checkout"
                echo " Repository : ${params.REPO_URL}"
                echo " Branch     : ${params.BRANCH}"
                echo "=========================================="

                checkout scmGit(
                    branches: [[name: "*/${params.BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${params.REPO_URL}"
                        // For private repos, add:
                        // credentialsId: 'github-pat'
                    ]]
                )

                echo "Checkout complete. Workspace contents:"
                script {
                    if (isUnix()) {
                        sh 'ls -la'
                    } else {
                        bat 'dir'
                    }
                }
            }
        }

        // ── Stage 2: Validate ─────────────────────────────────
        // Confirm that the expected project structure exists.
        // Fail early with a helpful message if something is wrong.
        stage('Validate Project') {
            steps {
                echo "=========================================="
                echo " STAGE 2: Validate Project Structure"
                echo "=========================================="

                script {
                    // Check Backend
                    if (params.TARGET_DIR == 'Backend' || params.TARGET_DIR == 'both') {
                        if (!fileExists('Backend/package.json')) {
                            error("Backend/package.json not found. Cannot build Backend.")
                        }
                        echo "✅ Backend/package.json found"
                    }

                    // Check Frontend
                    if (params.TARGET_DIR == 'Frontend' || params.TARGET_DIR == 'both') {
                        if (!fileExists('Frontend/package.json')) {
                            error("Frontend/package.json not found. Cannot build Frontend.")
                        }
                        echo "✅ Frontend/package.json found"
                    }

                    echo "Validation passed."
                }
            }
        }

        // ── Stage 3: Install Dependencies ────────────────────
        // Runs npm install using package-lock.json for
        // reproducible installs (ci = clean install).
        stage('Install Dependencies') {
            steps {
                echo "=========================================="
                echo " STAGE 3: Install Dependencies"
                echo "=========================================="

                script {
                    if (params.TARGET_DIR == 'Backend' || params.TARGET_DIR == 'both') {
                        echo "Installing Backend dependencies..."
                        dir('Backend') {
                            if (isUnix()) {
                                sh 'npm ci'
                            } else {
                                bat 'npm ci'
                            }
                        }
                        echo "✅ Backend dependencies installed"
                    }

                    if (params.TARGET_DIR == 'Frontend' || params.TARGET_DIR == 'both') {
                        echo "Installing Frontend dependencies..."
                        dir('Frontend') {
                            if (isUnix()) {
                                sh 'npm ci'
                            } else {
                                bat 'npm ci'
                            }
                        }
                        echo "✅ Frontend dependencies installed"
                    }
                }
            }
        }

        // ── Stage 4: Build ────────────────────────────────────
        // Runs the build script if it exists in package.json.
        // Backend (Express) has no build step — skipped safely.
        // Frontend (Vite/React) runs: npm run build
        stage('Build') {
            steps {
                echo "=========================================="
                echo " STAGE 4: Build"
                echo "=========================================="

                script {
                    // Backend — Node.js/Express has no compile step
                    if (params.TARGET_DIR == 'Backend' || params.TARGET_DIR == 'both') {
                        echo "Backend is Node.js/Express — no build step required."
                        echo "✅ Backend: skipped (runtime server, no compilation)"
                    }

                    // Frontend — Vite builds to dist/
                    if (params.TARGET_DIR == 'Frontend' || params.TARGET_DIR == 'both') {
                        echo "Building Frontend with Vite..."
                        dir('Frontend') {
                            if (isUnix()) {
                                sh 'npm run build'
                            } else {
                                bat 'npm run build'
                            }
                        }
                        echo "✅ Frontend build complete (output: Frontend/dist/)"
                    }
                }
            }
        }


        // ── Stage: Docker Build ────────────────────────────────
        stage('Docker Build') {
            when {
                expression {
                    params.TARGET_DIR == 'Frontend' ||
                    params.TARGET_DIR == 'both'
                }
            }
            steps {
                echo "Building DeployVerse frontend Docker image..."

                bat '"C:\\Users\\reddy\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" info'

                bat '"C:\\Users\\reddy\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" build -t deployverse-frontend:%BUILD_NUMBER% .\\Frontend'

                echo "Docker frontend image build completed."
            }
        }

        // ── Stage 5: Test ─────────────────────────────────────
        // Runs npm test if a real test script exists.
        // The default package.json test script just prints an
        // error message — we detect this and report honestly.
        stage('Test') {
            steps {
                echo "=========================================="
                echo " STAGE 5: Test"
                echo "=========================================="

                script {
                    def hasTests = false

                    if (params.TARGET_DIR == 'Backend' || params.TARGET_DIR == 'both') {
                        dir('Backend') {
                            def pkgJson = readJSON file: 'package.json'
                            def testScript = pkgJson?.scripts?.test ?: ''

                            if (testScript && !testScript.contains('no test specified')) {
                                echo "Running Backend tests..."
                                if (isUnix()) {
                                    sh 'npm test'
                                } else {
                                    bat 'npm test'
                                }
                                hasTests = true
                            } else {
                                echo "⚠️  Backend: No test suite configured (package.json test script is placeholder)"
                                echo "    Action: Add a test framework (e.g. Jest) and update package.json to enable this stage."
                            }
                        }
                    }

                    if (params.TARGET_DIR == 'Frontend' || params.TARGET_DIR == 'both') {
                        dir('Frontend') {
                            def pkgJson = readJSON file: 'package.json'
                            def testScript = pkgJson?.scripts?.test ?: ''

                            if (testScript && !testScript.contains('no test specified')) {
                                echo "Running Frontend tests..."
                                if (isUnix()) {
                                    sh 'npm test'
                                } else {
                                    bat 'npm test'
                                }
                                hasTests = true
                            } else {
                                echo "⚠️  Frontend: No test suite configured"
                                echo "    Action: Add Vitest or React Testing Library to enable this stage."
                            }
                        }
                    }

                    if (!hasTests) {
                        echo "ℹ️  No automated tests exist yet — test stage skipped."
                        echo "    This is honest reporting. Tests will be added on Day 3."
                    }
                }
            }
        }

        // ── Stage 6: Report Result ───────────────────────────
        // Prints a clear summary. Jenkins marks the build
        // SUCCESS or FAILURE based on whether any stage threw.
        stage('Report') {
            steps {
                echo "=========================================="
                echo " STAGE 6: Pipeline Complete"
                echo " Build     : #${env.BUILD_NUMBER}"
                echo " Branch    : ${params.BRANCH}"
                echo " Target    : ${params.TARGET_DIR}"
                echo " Result    : ${currentBuild.currentResult}"
                echo "=========================================="
            }
        }

    } // end stages

    // ── Post-build actions ────────────────────────────────────
    post {
        success {
            echo "✅ BUILD SUCCEEDED — DeployVerse pipeline completed successfully."
        }
        failure {
            echo "❌ BUILD FAILED — Check the stage logs above for the exact error."
        }
        always {
            echo "Pipeline finished. View full console output in Jenkins at:"
            echo "http://localhost:8080/job/DeployVerse/lastBuild/console"
        }
    }

}
