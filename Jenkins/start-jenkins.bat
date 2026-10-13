@echo off
REM ============================================================
REM  DeployVerse — Jenkins Startup Script
REM  Runs Jenkins on http://localhost:8080
REM  Jenkins home: Jenkins\home\
REM  Press Ctrl+C to stop Jenkins
REM ============================================================

SET JENKINS_HOME=%~dp0home
SET JAVA_OPTS=-Xmx512m -Xms256m

echo ============================================================
echo  DeployVerse Jenkins Server
echo  URL      : http://localhost:8080
echo  Home     : %JENKINS_HOME%
echo  Press Ctrl+C to stop
echo ============================================================
echo.

java %JAVA_OPTS% -jar "%~dp0jenkins.war" --httpPort=8080

pause
