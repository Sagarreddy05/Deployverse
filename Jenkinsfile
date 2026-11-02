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
        // Detect the actual structure of the checked-out repository.
        // Works for any public GitHub repo — does NOT require the
        // DeployVerse Backend/Frontend monorepo layout.
        stage('Validate Project') {
            steps {
                echo "=========================================="
                echo " STAGE 2: Validate Project Structure"
                echo " Repository : ${params.REPO_URL}"
                echo "=========================================="

                script {
                    // ── Detect common project artefacts ──────────────────────
                    def hasRootDockerfile    = fileExists('Dockerfile')
                    def hasRootPackageJson   = fileExists('package.json')
                    def hasBackendPackage    = fileExists('Backend/package.json')
                    def hasFrontendPackage   = fileExists('Frontend/package.json')
                    def hasFrontendDockerfile = fileExists('Frontend/Dockerfile')
                    def hasBackendDockerfile  = fileExists('Backend/Dockerfile')

                    echo "Detected structure:"
                    echo "  Root Dockerfile:      ${hasRootDockerfile}"
                    echo "  Root package.json:    ${hasRootPackageJson}"
                    echo "  Backend/package.json: ${hasBackendPackage}"
                    echo "  Frontend/package.json:${hasFrontendPackage}"
                    echo "  Frontend/Dockerfile:  ${hasFrontendDockerfile}"
                    echo "  Backend/Dockerfile:   ${hasBackendDockerfile}"

                    // Require at least one recognisable build artefact
                    if (!hasRootDockerfile && !hasRootPackageJson &&
                        !hasBackendPackage && !hasFrontendPackage) {
                        error("No recognisable project structure found in ${params.REPO_URL}. " +
                              "Expected a Dockerfile or package.json at root or in Backend/Frontend sub-directories.")
                    }

                    // Persist flags so later stages can branch without re-checking
                    env.DV_HAS_ROOT_DOCKERFILE     = hasRootDockerfile.toString()
                    env.DV_HAS_ROOT_PKG            = hasRootPackageJson.toString()
                    env.DV_HAS_BACKEND_PKG         = hasBackendPackage.toString()
                    env.DV_HAS_FRONTEND_PKG        = hasFrontendPackage.toString()
                    env.DV_HAS_FRONTEND_DOCKERFILE = hasFrontendDockerfile.toString()
                    env.DV_HAS_BACKEND_DOCKERFILE  = hasBackendDockerfile.toString()

                    // Derive a safe image name from the repo URL
                    // e.g. https://github.com/user/AI-Study-Planner.git  ->  ai-study-planner
                    def rawName = params.REPO_URL
                        .replaceAll(/.*\//, '')  // keep last path segment
                        .replaceAll(/\.git$/, '') // strip .git
                    env.DV_IMAGE_NAME = rawName.toLowerCase().replaceAll(/[^a-z0-9]/, '-')

                    echo "Image name will be: ${env.DV_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    echo "Validation passed."
                }
            }
        }

        // ── Stage 3: Install Dependencies ────────────────────
        // Installs npm dependencies in every directory that has
        // a package.json — works for any repo structure.
        // Falls back from 'npm ci' to 'npm install' when no
        // package-lock.json exists (fresh / unfamiliar repos).
        stage('Install Dependencies') {
            steps {
                echo "=========================================="
                echo " STAGE 3: Install Dependencies"
                echo "=========================================="

                script {
                    def installIn = { String dir ->
                        echo "Installing in ${dir}..."
                        script {
                            def lockExists = fileExists("${dir}/package-lock.json")
                            def cmd = lockExists ? 'npm ci' : 'npm install'
                            dir(dir) {
                                if (isUnix()) { sh cmd } else { bat cmd }
                            }
                            echo "✅ ${dir} dependencies installed"
                        }
                    }

                    def installed = false

                    if (env.DV_HAS_ROOT_PKG == 'true') {
                        def lockExists = fileExists('package-lock.json')
                        def cmd = lockExists ? 'npm ci' : 'npm install'
                        echo "Installing root dependencies (${cmd})..."
                        if (isUnix()) { sh cmd } else { bat cmd }
                        echo "✅ Root dependencies installed"
                        installed = true
                    }

                    if (env.DV_HAS_BACKEND_PKG == 'true') {
                        echo "Installing Backend dependencies..."
                        def lockExists = fileExists('Backend/package-lock.json')
                        def cmd = lockExists ? 'npm ci' : 'npm install'
                        dir('Backend') {
                            if (isUnix()) { sh cmd } else { bat cmd }
                        }
                        echo "✅ Backend dependencies installed"
                        installed = true
                    }

                    if (env.DV_HAS_FRONTEND_PKG == 'true') {
                        echo "Installing Frontend dependencies..."
                        def lockExists = fileExists('Frontend/package-lock.json')
                        def cmd = lockExists ? 'npm ci' : 'npm install'
                        dir('Frontend') {
                            if (isUnix()) { sh cmd } else { bat cmd }
                        }
                        echo "✅ Frontend dependencies installed"
                        installed = true
                    }

                    if (!installed) {
                        echo "ℹ No package.json found — install stage skipped (Dockerfile-only project)."
                    }
                }
            }
        }

        // ── Stage 4: Build ────────────────────────────────────
        // Runs a build script (e.g. Vite, tsc, Next.js) wherever
        // a package.json with a 'build' script is found.
        // Skipped automatically if no build script exists.
        stage('Build') {
            steps {
                echo "=========================================="
                echo " STAGE 4: Build"
                echo "=========================================="

                script {
                    def buildIn = { String dir ->
                        def pkg = readJSON file: "${dir}/package.json"
                        def buildScript = pkg?.scripts?.build ?: ''
                        if (buildScript) {
                            echo "Building ${dir}..."
                            dir(dir) {
                                if (isUnix()) { sh 'npm run build' } else { bat 'npm run build' }
                            }
                            echo "✅ ${dir} build complete"
                        } else {
                            echo "ℹ ${dir}/package.json has no build script — skipped"
                        }
                    }

                    if (env.DV_HAS_ROOT_PKG == 'true') {
                        def pkg = readJSON file: 'package.json'
                        def buildScript = pkg?.scripts?.build ?: ''
                        if (buildScript) {
                            echo "Building root project..."
                            if (isUnix()) { sh 'npm run build' } else { bat 'npm run build' }
                            echo "✅ Root build complete"
                        } else {
                            echo "ℹ Root package.json has no build script — skipped"
                        }
                    }

                    if (env.DV_HAS_BACKEND_PKG == 'true') { buildIn('Backend') }
                    if (env.DV_HAS_FRONTEND_PKG == 'true') { buildIn('Frontend') }
                }
            }
        }


        // ── Stage 5: Docker Build ─────────────────────────────
        // Uses a repo's own Dockerfile when present.
        // If absent, auto-generates one from the root package.json:
        //   - project with 'build' script → multi-stage nginx image
        //   - project without 'build'     → plain Node.js server image
        // Sets DV_DOCKER_BUILT, DV_IMAGE_FULL, DV_APP_PORT for the
        // downstream K8s Deploy stage.
        stage('Docker Build') {
            steps {
                echo "=========================================="
                echo " STAGE 5: Docker Build"
                echo "=========================================="

                script {
                    def dockerBin  = '"C:\\Users\\reddy\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe"'
                    def imageName  = "${env.DV_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    def buildCtx   = '.'

                    // ── 1. Locate or generate a Dockerfile ──────────────
                    if (env.DV_HAS_ROOT_DOCKERFILE == 'true') {
                        buildCtx         = '.'
                        env.DV_APP_PORT  = '3000'
                        echo "Using existing root Dockerfile."

                    } else if (env.DV_HAS_FRONTEND_DOCKERFILE == 'true') {
                        buildCtx         = '.\\Frontend'
                        env.DV_APP_PORT  = '80'
                        echo "Using existing Frontend/Dockerfile."

                    } else if (env.DV_HAS_BACKEND_DOCKERFILE == 'true') {
                        buildCtx         = '.\\Backend'
                        env.DV_APP_PORT  = '3000'
                        echo "Using existing Backend/Dockerfile."

                    } else if (env.DV_HAS_ROOT_PKG == 'true') {
                        echo "No Dockerfile found — auto-generating from root package.json."
                        def pkg           = readJSON file: 'package.json'
                        def hasBuildStep  = (pkg?.scripts?.build ?: '') != ''
                        def mainEntry     = pkg?.main ?: 'index.js'

                        def dockerfile = ''
                        if (hasBuildStep) {
                            // Frontend project: build assets then serve with nginx
                            dockerfile = """FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD [\"nginx\", \"-g\", \"daemon off;\"]
"""
                            env.DV_APP_PORT = '80'
                        } else {
                            // Backend/server Node.js project
                            dockerfile = """FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD [\"node\", \"${mainEntry}\"]
"""
                            env.DV_APP_PORT = '3000'
                        }
                        writeFile file: 'Dockerfile', text: dockerfile
                        echo "✅ Dockerfile auto-generated (port ${env.DV_APP_PORT})."
                        buildCtx = '.'

                    } else {
                        echo "⚠ No Dockerfile and no package.json — Docker build skipped."
                        env.DV_DOCKER_BUILT = 'false'
                        return
                    }

                    // ── 2. Build ─────────────────────────────────────────
                    echo "Building image : ${imageName}"
                    echo "Context        : ${buildCtx}"
                    bat "${dockerBin} info"
                    bat "${dockerBin} build -t ${imageName} ${buildCtx}"

                    env.DV_DOCKER_BUILT = 'true'
                    env.DV_IMAGE_FULL   = imageName
                    echo "✅ Docker image built: ${imageName}"
                }
            }
        }

        // ── Stage 6: Deploy to Kubernetes ────────────────────
        // Loads the Docker image into Minikube and applies a
        // generated Deployment + NodePort Service manifest.
        // Only runs when Docker Build succeeded (DV_DOCKER_BUILT).
        stage('Deploy to Kubernetes') {
            when {
                expression { env.DV_DOCKER_BUILT == 'true' }
            }
            steps {
                echo "=========================================="
                echo " STAGE 6: Deploy to Kubernetes"
                echo "=========================================="

                script {
                    def appName   = env.DV_IMAGE_NAME
                    def imageName = env.DV_IMAGE_FULL
                    def appPort   = env.DV_APP_PORT ?: '3000'

                    // Load the locally-built image into Minikube's registry
                    echo "Loading ${imageName} into Minikube..."
                    bat "minikube image load ${imageName}"

                    // Generate a minimal Deployment + NodePort Service manifest
                    def manifest = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  labels:
    app: ${appName}
    managed-by: deployverse
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: app
        image: ${imageName}
        imagePullPolicy: Never
        ports:
        - containerPort: ${appPort}
---
apiVersion: v1
kind: Service
metadata:
  name: ${appName}
  labels:
    managed-by: deployverse
spec:
  selector:
    app: ${appName}
  ports:
  - port: 80
    targetPort: ${appPort}
  type: NodePort
"""
                    writeFile file: 'dv-deploy.yaml', text: manifest
                    bat "kubectl apply -f dv-deploy.yaml"

                    bat "kubectl rollout status deployment/${appName} --timeout=120s"

                    // Capture NodePort URL
                    def raw = bat(
                        script: "minikube service ${appName} --url 2>nul",
                        returnStdout: true
                    ).trim()
                    def url = raw.split('\n').last().trim()

                    env.DV_DEPLOY_URL = url
                    echo "=========================================="
                    echo " ✅ DEPLOYED: ${appName}"
                    echo "    URL     : ${url}"
                    echo "=========================================="
                }
            }
        }

        // ── Stage 7: Test ─────────────────────────────────────
        // Runs npm test wherever a real test script is found.
        // Uses DV_HAS_* flags — works for any repo structure.
        stage('Test') {
            steps {
                echo "=========================================="
                echo " STAGE 7: Test"
                echo "=========================================="

                script {
                    def hasTests = false

                    def runTestIn = { String dir ->
                        def pkg = readJSON file: "${dir}/package.json"
                        def testScript = pkg?.scripts?.test ?: ''
                        if (testScript && !testScript.contains('no test specified')) {
                            echo "Running tests in ${dir}..."
                            dir(dir) {
                                if (isUnix()) { sh 'npm test' } else { bat 'npm test' }
                            }
                            hasTests = true
                        } else {
                            echo "⚠  ${dir}: No test suite configured."
                        }
                    }

                    if (env.DV_HAS_ROOT_PKG == 'true') {
                        def pkg = readJSON file: 'package.json'
                        def testScript = pkg?.scripts?.test ?: ''
                        if (testScript && !testScript.contains('no test specified')) {
                            echo "Running root tests..."
                            if (isUnix()) { sh 'npm test' } else { bat 'npm test' }
                            hasTests = true
                        } else {
                            echo "⚠  Root: No test suite configured."
                        }
                    }

                    if (env.DV_HAS_BACKEND_PKG == 'true') { runTestIn('Backend') }
                    if (env.DV_HAS_FRONTEND_PKG == 'true') { runTestIn('Frontend') }

                    if (!hasTests) {
                        echo "ℹ  No automated tests found — test stage skipped."
                    }
                }
            }
        }

        // ── Stage 8: Report Result ───────────────────────────
        stage('Report') {
            steps {
                echo "=========================================="
                echo " STAGE 8: Pipeline Complete"
                echo " Build     : #${env.BUILD_NUMBER}"
                echo " Repo      : ${params.REPO_URL}"
                echo " Branch    : ${params.BRANCH}"
                echo " Image     : ${env.DV_IMAGE_FULL  ?: 'not built'}"
                echo " Deployed  : ${env.DV_DEPLOY_URL  ?: 'not deployed'}"
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
