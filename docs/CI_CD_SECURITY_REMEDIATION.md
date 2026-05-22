# CI/CD and Security Remediation Runbook

Last updated: 2026-05-22

## Objective

Stabilize repository CI/CD and security scanning so that GitHub Actions, Azure pipeline jobs, dependency audits, and container scanning can run with predictable results and without false setup issues.

## Root Causes Identified

1. Azure pipelines under `web/` were executing from the repository root instead of the `web` application directory.
2. Azure develop pipeline built Docker from a nonexistent root Dockerfile path instead of `web/Dockerfile`.
3. GitHub Actions CI used path-like values in `branches` filters and relied on matrix expressions in `defaults.run`, which made workflow behavior fragile and misleading.
4. CodeQL attempted an unnecessary root-level autobuild in a multi-app JavaScript/TypeScript repository that has no root package manifest.
5. Trivy scheduled scans were blocking the same way as PR and push scans, making backlog cleanup noisy and slowing remediation.
6. Backend dependencies had avoidable drift: Prisma CLI/client mismatch, vulnerable `@azure/identity` range, and an alpha `json2csv` dependency.
7. Filemanager still had a direct vulnerable `uuid` line.
8. Local DevSecOps enforcement in `.pre-commit-config.yaml` depended on `bash -c`, which is not portable for Windows contributors.
9. Backend CORS development fallback allowed any `http://localhost:*` origin instead of a small explicit loopback set.
10. Backend antivirus scanning failed open when ClamAV was unavailable, including the active in-memory upload path.
11. Historical secret exposure still exists in git history for ignored `.env` files. This is the largest remaining blocker for a clean secret scan and cannot be solved only by ignore rules.

## Changes Applied In This Pass

### Azure Pipelines

- Updated `web/azure-pipelines.yml` to:
  - use `Node 22.x`
  - run `npm ci`, `npm run lint`, and `npm run build` inside the `web` directory
  - publish the `web` application directory instead of the whole repository
- Added `web/.artifactignore` to reduce artifact bloat and keep env files and caches out of published artifacts.
- Updated `web/azure-pipelines-develop.yml` to:
  - run install, lint, and build inside the `web` directory
  - build Docker from `web/Dockerfile` with `web` as the build context
  - keep image scan and ECR push aligned to the built web image

### GitHub Actions

- Updated `.github/workflows/ci-build.yml` to:
  - replace incorrect branch filters for application paths with `paths`
  - move `working-directory` to the step level instead of matrix-driven `defaults.run`
  - stop masking lint and test failures with `continue-on-error`
- Updated `.github/workflows/security-scan.yml` to:
  - replace incorrect branch filters with `paths`
  - move npm audit job `working-directory` to the step level
  - remove CodeQL autobuild from the root of the repository
- Updated `.github/workflows/trivy-scan.yml` to:
  - use path filters for relevant applications and workflows
  - make scheduled scans report-oriented while keeping PR/push scans blocking
  - skip generated build output directories during config scan

### Dependency Stabilization

- Updated `backend/package.json` and lockfile to:
  - align `@prisma/client` with Prisma CLI `5.22.0`
  - patch `@azure/identity` to `^4.13.1`
  - replace `json2csv` alpha with stable `^5.0.7`
  - update direct `uuid` usage to `^11.1.1`
- Updated `filemanager/package.json` and lockfile to move `uuid` to `^11.1.1`.

### Application Security Hardening

- Tightened backend development CORS fallback in `backend/src/server.ts` to explicit loopback origins.
- Updated backend upload scanning in `backend/src/services/file-upload-scanner.service.ts` so antivirus policy applies to the active `scanBuffer` path and defaults to fail closed in production unless explicitly overridden.
- Documented the antivirus control in `backend/.env.example` with `ANTIVIRUS_REQUIRED`.

### Local DevSecOps Enforcement

- Updated `.pre-commit-config.yaml` to replace `bash -c` hooks with `npm --prefix ...` / `npm --prefix ... exec ...` so lint, audit, and typecheck hooks are cross-platform.

## Current Dependency Audit Status

As validated locally during this remediation pass:

- `backend`: 2 moderate remaining
  - `bull`
  - transitive `uuid` under `bull`
- `frontend`: 2 moderate remaining
  - `exceljs`
  - transitive `uuid` via `exceljs`
- `web`: 0 vulnerabilities
- `filemanager`: 0 vulnerabilities

No high or critical npm audit findings were observed in the validated Node applications during this pass.

## Remaining Mandatory Actions

### 1. Secret Rotation and Git History Cleanup

The repository has historical commits that referenced ignored `.env` files. Because the current secret workflow performs a deep checkout, secret scanning can still fail on history even if the files are not currently tracked.

Required owner actions:

1. Rotate all secrets ever stored in those `.env` files.
2. Rewrite git history to purge the exposed files.
3. Force-push the cleaned history and coordinate branch reset with collaborators.

Recommended tools:

- `git filter-repo` or BFG Repo-Cleaner for history rewrite
- standard credential rotation in each provider before publishing cleaned history

Do not mark Gitleaks clean until both rotation and history cleanup are complete.

### 2. Bull Queue Advisory

`backend` still carries a moderate advisory through `bull`. Removing it cleanly likely requires one of these:

1. migration from `bull` to `bullmq`
2. confirmation that the risk is acceptable in current runtime usage
3. a compensating control and explicit risk documentation

### 3. Frontend Excel Export Advisory

`frontend` still carries a moderate advisory chain through `exceljs`. Current npm metadata does not expose an obvious non-breaking upgrade path. This needs one of:

1. replacement of the export library
2. feature-level isolation if the package is not essential in production paths
3. temporary documented acceptance until an upstream fix lands

## Local Validation Commands

Run these from the repository root unless noted otherwise.

### Dependency Audit

```powershell
Set-Location backend; npm audit --audit-level=high --json
Set-Location ../frontend; npm audit --audit-level=high --json
Set-Location ../web; npm audit --audit-level=high --json
Set-Location ../filemanager; npm audit --audit-level=high --json
```

### Lockfile Refresh Without Reinstalling Local Modules

Useful when native modules are locked on Windows.

```powershell
Set-Location backend; npm install --package-lock-only --ignore-scripts
Set-Location ../filemanager; npm install --package-lock-only --ignore-scripts
```

### Web Pipeline Checks

```powershell
Set-Location web
npm ci
npm run lint
npm run build
```

If Docker is available:

```powershell
Set-Location ..
docker build -f web/Dockerfile web
```

### Backend and File Upload Security Checks

```powershell
Set-Location backend
npm run lint
npm test -- --runInBand
```

Production expectation:

- `ANTIVIRUS_REQUIRED=true`
- ClamAV installed in the runtime image or host

### Pre-commit Hooks

```powershell
pre-commit run --all-files
```

## Workflow Verification Checklist

### GitHub Actions

1. Trigger `ci-build.yml` from a branch that changes `backend`, `frontend`, `web`, or `filemanager`.
2. Confirm each matrix job installs, lints, tests if present, and builds inside its own app directory.
3. Trigger `security-scan.yml` and confirm npm audit jobs run per app and CodeQL skips root autobuild.
4. Trigger `trivy-scan.yml` and confirm scheduled runs are report-oriented while PR/push runs remain blocking.

### Azure Pipelines

1. Run `web/azure-pipelines.yml` and verify `npm ci`, lint, build, and artifact publish all execute under `web`.
2. Run `web/azure-pipelines-develop.yml` and verify Docker build uses `web/Dockerfile` and `web` build context.
3. Confirm artifact output no longer includes env files, node_modules, or `.next/cache`.

## Maintenance Guidance

1. Keep GitHub Actions, Azure pipeline runtime, and Docker base images aligned to the same major Node line.
2. Treat ignored local `.env` files as local-only. Never rely on ignore rules as a substitute for history cleanup.
3. Prefer `npm --prefix <app>` commands in cross-platform automation rather than shell-specific `cd && ...` wrappers.
4. For every new scanner gate, separate backlog reporting from regression blocking until the baseline is clean.
5. Re-run audit and scan validation after every dependency update PR, not only on scheduled scans.
6. Keep `.env.example` templates complete enough for setup but free from live values.