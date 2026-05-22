# DevSecOps Preparation and Security Hardening

Last updated: 2026-05-22

## Scope

This audit covers:

- `backend`
- `frontend`
- `web`
- `filemanager`

The repository is prepared for GitHub Actions simulation before migration to Azure DevOps or AWS CI/CD.

## Audit Result

| Area | Severity | Finding | Status |
| --- | --- | --- | --- |
| Backend dependency | Critical | `sanitize-html <= 2.17.3` XSS advisory | Fixed by updating to `^2.17.4` |
| Backend transitive dependency | High | `protobufjs`, `fast-uri`, `fast-xml-builder` vulnerable transitive versions | Fixed with safe npm overrides and lockfile refresh |
| Frontend/Web dependency | High | `next 16.2.4` affected by multiple Next.js advisories | Fixed by updating to `16.2.6` |
| Frontend dependency | High | `xlsx 0.18.5` has unresolved advisories in npm audit | Fixed by replacing client-side export with `exceljs` |
| Filemanager/backend upload | High | MIME and extension were validated independently, allowing mismatch | Fixed by enforcing MIME-extension pairing |
| Backend upload scanner | High | ClamAV scan used shell interpolation for file paths | Fixed by switching to `execFile` argument array |
| Filemanager object keys | High | Folder/key normalization was inconsistent across list/delete/signed-url flows | Fixed with centralized S3 key/folder normalization |
| Filemanager health endpoint | Medium | Health response exposed bucket name | Fixed by returning only boolean configuration state |
| Secrets/local data | High | Real `.env` files exist locally and production-like SQL/CSV exports are present in the working tree | `.env` files are ignored and redacted from docs; SQL/CSV dumps should be removed from repository history before enterprise onboarding |
| Docker | Medium | Images used non-root users but lacked OS package refresh in several stages | Improved with `apk upgrade --no-cache`, non-root runtime retained |
| Lint baseline | Medium | Existing lint backlog across backend/frontend/web would block immediate CI adoption | CI runs lint as non-blocking; backlog remains a follow-up hardening item |
| Test baseline | Medium | Existing backend Jest suite currently has failing assertions and coverage threshold failures | CI runs tests as non-blocking until test fixtures/coverage are repaired |

After the dependency fixes, `npm audit` reports `0 vulnerabilities` in all four app folders.

## Changes Applied

- Updated npm manifests and lockfiles for `backend`, `frontend`, `web`, and `filemanager`.
- Replaced vulnerable `xlsx` usage in CMS export with `exceljs` and a small safe CSV writer.
- Added upload filename hardening, MIME-extension pair validation, and file signature checks where feasible.
- Hardened S3 key/folder normalization in `filemanager`.
- Added safer Docker build defaults and disabled Next telemetry in container builds.
- Strengthened `.gitignore` for local env folders, root data dumps, scan outputs, SBOMs, and SARIF files.
- Added GitHub Actions:
  - `.github/workflows/ci-build.yml`
  - `.github/workflows/security-scan.yml`
  - `.github/workflows/trivy-scan.yml`
  - `.github/dependabot.yml`

## How to Run Locally

Run dependency audits:

```bash
cd backend && npm audit --audit-level=high
cd ../frontend && npm audit --audit-level=high
cd ../web && npm audit --audit-level=high
cd ../filemanager && npm audit --audit-level=high
```

Run builds:

```bash
cd backend && npm ci && npx prisma generate && npm run build
cd ../frontend && npm ci && npm run build
cd ../web && npm ci && npm run build
cd ../filemanager && npm ci && npm run build
```

Run Trivy locally with Docker if Trivy is not installed:

```bash
docker run --rm -v "$PWD:/repo" aquasec/trivy:latest fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL /repo/backend
docker run --rm -v "$PWD:/repo" aquasec/trivy:latest fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL /repo/frontend
docker run --rm -v "$PWD:/repo" aquasec/trivy:latest fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL /repo/web
docker run --rm -v "$PWD:/repo" aquasec/trivy:latest fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL /repo/filemanager
```

Build and scan container images:

```bash
docker build -t linknet-backend:local backend
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL linknet-backend:local
```

## GitHub Actions Simulation

Use a private GitHub repository first, then run:

- `General CI`: install, lint, test if present, build.
- `Security Scan`: npm audit, Gitleaks, Dependency Review, CodeQL.
- `Trivy Scan`: filesystem, IaC/config, and container scans.

For Dependabot, review generated PRs weekly and merge security patches after CI passes.

## Branch and Repository Strategy

Recommended near-term approach: keep a monorepo while the four apps still share contracts, Prisma models, docs, and migration scripts.

Recommended branch naming:

- `main`: production-ready only.
- `develop`: integrated staging branch.
- `backend/develop`, `frontend/develop`, `web/develop`, `filemanager/develop`: service-specific integration branches if Azure/AWS deployments need separate approvals.
- `feature/<service>/<ticket-or-topic>`: feature work.
- `release/<service>/<version>`: release candidates.
- `hotfix/<service>/<ticket-or-topic>`: urgent production fixes.

Recommended deployment flow:

1. Feature branch opens PR to the service branch or `develop`.
2. GitHub Actions runs CI and security scans.
3. Staging deploys from `develop` or service-specific develop branch.
4. Production deploys from `main` using tagged releases.
5. Azure/AWS pipelines should use path filters so changes in one service do not redeploy unrelated services.

Move to multi-repo only when release cadence, permissions, or ownership boundaries are fully independent. If split later, keep shared contracts in a versioned package or artifact.

## Secret Management

Do not commit real `.env` files. Use:

- GitHub Actions secrets for simulation.
- Azure Key Vault with Managed Identity for Azure.
- AWS Secrets Manager or SSM Parameter Store with IAM role/OIDC for AWS.
- IRSA or workload identity for S3 access instead of static `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

Production secrets that must live in a vault:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FILEMANAGER_API_KEY`
- `LINKNET_MEDIA_TOKEN_SALT`
- SMTP credentials
- Azure client secret if service principal auth is unavoidable
- External enterprise API credentials
- GA4 service account JSON/private key

## Production Readiness Notes

Backend:

- Keep `RATE_LIMIT_ENABLED=true` in production.
- Enforce `DATABASE_URL` TLS with `sslmode=require` or `verify-full`.
- Keep `PRESIGNED_UPLOAD_ENABLED=false` unless quarantine, async scanning, and lifecycle cleanup are implemented.
- Use structured logs and avoid response bodies containing internal exception details.

Frontend/Web:

- Only expose `NEXT_PUBLIC_*` values that are safe for browsers.
- Keep CSP headers enabled and review any new third-party script before adding it.
- Avoid `NEXT_PUBLIC_AUTH_ENABLED=false` in production. The frontend config already blocks this.

Filemanager:

- Keep service internal-only behind backend gateway or private network.
- Use API key auth for service-to-service calls.
- Restrict uploads to approved MIME-extension pairs.
- Add ClamAV or cloud malware scanning for production file ingestion.
- Store direct-to-S3 uploads in quarantine before public promotion.

## Residual Risk and Required Follow-up

- Root SQL/CSV/XLSX exports and `app_docs` are currently tracked. They may contain production-like data or password hashes. Remove them from future commits, rotate any exposed credentials, and purge history with an approved tool such as `git filter-repo` or BFG before pushing to enterprise repositories.
- Local `.env` files exist but are ignored. Verify they have never been pushed to any remote.
- CodeQL and Trivy results should be reviewed in GitHub Security tab after the first run because enterprise scanners can surface environment-specific false positives.
- Existing lint debt is still present in `backend`, `frontend`, and `web`. The CI workflow runs lint but marks that step non-blocking so build and security gates can be adopted immediately. Make lint blocking again after the existing React/TypeScript lint backlog is cleaned up.
- Existing backend Jest debt is still present: the current run has failing data-integrity/news assertions and global coverage threshold failures. The CI workflow runs tests but marks that step non-blocking until fixtures and coverage are corrected.
