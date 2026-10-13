# Jenkins — DeployVerse Setup Guide

## Quick Start

```bat
cd E:\Deployverse\Jenkins
start-jenkins.bat
```

Then open: http://localhost:8080

## First-Time Setup

1. Get the initial admin password:
   - Check the terminal output for: `Jenkins initial setup is required...`
   - Or read: `Jenkins\home\secrets\initialAdminPassword`

2. In the browser:
   - Paste the password
   - Choose "Install suggested plugins"
   - Create your admin user
   - Set URL to: http://localhost:8080

## Required Plugins (install if not in suggested)

- Git Plugin
- Pipeline
- Pipeline: Stage View
- Credentials Binding

## Jenkins Home Location

```
E:\Deployverse\Jenkins\home\
```

This directory is gitignored — Jenkins data stays local.

## Stopping Jenkins

Press `Ctrl+C` in the terminal running start-jenkins.bat.

## Jenkins WAR Version

Download latest LTS from: https://www.jenkins.io/download/
Place as: `E:\Deployverse\Jenkins\jenkins.war`
