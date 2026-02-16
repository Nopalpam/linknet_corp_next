# File Scanning Implementation Guide
## Control: MBSS2.0-ApplicationCoding-003
## Domain: Data Validation
## Control: Scanning of files used for development before upload/transfer

---

## Overview

This document describes the comprehensive file scanning mechanisms implemented to ensure all files (source code, assets, dependencies, archives) are scanned for malware or malicious code **BEFORE** being uploaded or transferred.

---

## 1. Automated Security Scanning Pipeline

### 1.1 GitHub Actions Workflow

**Location**: `.github/workflows/security-scan.yml`

Automated security scanning runs on:
- Every push to `main`, `develop`, `staging` branches
- Every pull request
- Daily scheduled scan at 2 AM UTC
- Manual trigger (workflow_dispatch)

#### Scan Jobs:

**A. Dependency Vulnerability Scanning**
- Tool: `npm audit`
- Scans: Backend and Frontend dependencies
- Severity Level: Blocks on CRITICAL and HIGH vulnerabilities
- Output: JSON report uploaded as artifact (30-day retention)

**B. CodeQL Security Analysis**
- Tool: GitHub CodeQL
- Scans: JavaScript and TypeScript code
- Queries: Security and quality rules
- Output: Results in GitHub Security tab

**C. Docker Image Scanning**
- Tool: Trivy (Aqua Security)
- Scans: Docker images for vulnerabilities
- Severity: CRITICAL, HIGH, MEDIUM
- Output: SARIF format uploaded to GitHub Security

**D. Secret Detection**
- Tool: TruffleHog
- Scans: Repository for exposed secrets, API keys, passwords
- Output: Verified secrets only

**E. SAST (Static Application Security Testing)**
- Tool: Semgrep
- Scans: OWASP Top 10, Node.js, TypeScript, React security issues
- Output: SARIF format uploaded to GitHub Security

**F. License Compliance Check**
- Tool: license-checker
- Scans: Production dependencies
- Fails on: GPL, AGPL, LGPL licenses
- Output: JSON license report (90-day retention)

### 1.2 Dependabot Configuration

**Location**: `.github/dependabot.yml`

Automatic dependency updates:
- **Schedule**: Weekly (Monday 9 AM UTC)
- **Scope**: Backend, Frontend, Root workspace, Docker base images
- **Security**: Prioritizes security updates
- **Pull Requests**: Auto-creates PRs for vulnerable dependencies
- **Reviewers**: Assigned to security team

---

## 2. Pre-Commit Security Checks

### 2.1 Pre-commit Hooks

**Location**: `.pre-commit-config.yaml`, `.husky/pre-commit`

Enforced checks before committing code:

**A. File Integrity Checks**
- Trailing whitespace removal
- End-of-file-fixer
- Check for large files (>5MB warning)
- Detect merge conflicts

**B. Secret Detection**
- Detect private keys
- Detect AWS credentials
- Scan for hardcoded passwords/tokens
- Tool: detect-secrets

**C. Code Quality**
- ESLint (Backend and Frontend)
- TypeScript type checking
- Prettier formatting

**D. Security Scanning**
- npm audit (HIGH severity threshold)
- Runs on package-lock.json changes
- Blocks commit if vulnerabilities found

**E. Docker Security**
- Hadolint for Dockerfile linting
- Best practices enforcement

### 2.2 Setup Instructions

```bash
# Install dependencies
npm install

# Setup pre-commit hooks
npm run prepare

# Install pre-commit framework (Python)
pip install pre-commit

# Install pre-commit hooks
pre-commit install --install-hooks

# Test hooks manually
pre-commit run --all-files
```

---

## 3. File Upload Scanning

### 3.1 FileUploadScanner Service

**Location**: `backend/src/services/file-upload-scanner.service.ts`

Real-time scanning of user-uploaded files before storage.

#### Security Checks:

**A. File Validation**
- File size limits (100MB max)
- Empty file detection
- File accessibility verification

**B. Extension Validation**
- Blocks dangerous extensions (.exe, .dll, .bat, .cmd, .sh, .ps1, etc.)
- Detects double extensions (file.pdf.exe)
- Whitelist-based approach

**C. MIME Type Validation**
- Strict whitelist of allowed MIME types
- Images, documents, archives, videos only
- Prevents MIME type spoofing

**D. File Hash Calculation**
- SHA-256 hash for integrity checking
- Duplicate detection
- Audit trail

**E. ClamAV Antivirus Scanning** (Optional)
- Real-time virus/malware detection
- Runs if ClamAV installed
- Graceful fallback if not available

**F. Content Analysis**
- Magic number validation (file signature)
- Embedded script detection in images/PDFs
- JavaScript/malicious code pattern matching

**G. Security Event Logging**
- All scan failures logged to audit system
- High-severity security events
- Timestamped with file metadata

### 3.2 Usage Example

```typescript
import { fileUploadScanner } from '@/services/file-upload-scanner.service';

// In file upload middleware
const scanResult = await fileUploadScanner.scanFile(
  file.path,
  file.originalname,
  file.mimetype
);

if (!scanResult.safe) {
  throw new Error(`Security threat detected: ${scanResult.threats?.join(', ')}`);
}

// Proceed with upload to cloud storage
```

### 3.3 ClamAV Installation (Production)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Start ClamAV daemon
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon
```

---

## 4. Continuous Monitoring

### 4.1 GitHub Security Features Enabled

- **Dependabot alerts**: Automatic vulnerability notifications
- **Code scanning alerts**: CodeQL findings
- **Secret scanning**: Repository-wide secret detection
- **Security advisories**: Private vulnerability reporting

### 4.2 Security Dashboard

Access security findings:
- GitHub Repository → Security tab
- Dependabot alerts
- Code scanning alerts
- Secret scanning alerts

---

## 5. Deployment Pipeline Security

### 5.1 Container Image Scanning (Azure Pipeline)

**Before deployment:**

```bash
# Build image
docker build -t linknetcorp-backend:latest ./backend

# Scan with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image \
  --severity HIGH,CRITICAL \
  --exit-code 1 \
  linknetcorp-backend:latest

# Push only if scan passes
docker push <registry>/linknetcorp-backend:latest
```

### 5.2 Kubernetes Admission Control (Future Enhancement)

Consider implementing:
- OPA (Open Policy Agent) for policy enforcement
- Pod Security Policies
- Network policies
- Image pull policies (signed images only)

---

## 6. Compliance Evidence

### 6.1 Scan Artifacts

All scans produce artifacts retained for audit:

- **npm audit reports**: 30 days
- **Trivy scan results**: 30 days
- **License reports**: 90 days
- **CodeQL results**: Permanent (GitHub Security)
- **Dependabot PRs**: Audit trail maintained

### 6.2 Access Logs

File upload scans logged to:
- `log_activities` database table
- Application logs (`backend/logs/`)
- Security event stream (HIGH severity)

---

## 7. Maintenance & Updates

### 7.1 Weekly Tasks

- Review Dependabot PRs
- Merge security updates
- Update virus definitions (ClamAV)

### 7.2 Monthly Tasks

- Review security scan results
- Update security policies
- Audit file upload logs
- Review license compliance

### 7.3 Quarterly Tasks

- Security audit of entire pipeline
- Update scanning tools
- Review and update whitelists
- Penetration testing

---

## 8. Incident Response

### 8.1 If Malware Detected

1. **Block**: File upload rejected immediately
2. **Alert**: Security team notified
3. **Log**: Event logged with full details
4. **Investigate**: Review source and user
5. **Remediate**: Remove any related files

### 8.2 If Vulnerability Found

1. **Assess**: Review severity and impact
2. **Patch**: Apply security update via Dependabot
3. **Test**: Run full test suite
4. **Deploy**: Emergency deployment if critical
5. **Document**: Update security log

---

## 9. Testing

### 9.1 Test Security Pipeline

```bash
# Test pre-commit hooks
pre-commit run --all-files

# Test dependency scanning
npm run security:audit

# Test file upload scanner
npm test -- file-upload-scanner.service.test.ts

# Trigger GitHub Actions manually
git push origin feature/test-security
```

### 9.2 Test File Upload Scanner

```bash
# Test malicious file detection
curl -X POST http://localhost:5000/api/filemanager/upload \
  -F "file=@malicious.exe" \
  -H "Authorization: Bearer <token>"

# Expected: 400 Bad Request - Dangerous file extension
```

---

## 10. Documentation References

- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Semgrep Rules](https://semgrep.dev/docs/)
- [ClamAV Documentation](https://www.clamav.net/documents)

---

## Conclusion

This implementation provides **defense-in-depth** for file scanning:

✅ **Pre-commit**: Scans code before repository upload  
✅ **CI/CD**: Automated scans on every change  
✅ **Dependencies**: Continuous vulnerability monitoring  
✅ **Container**: Image scanning before deployment  
✅ **File Upload**: Real-time malware detection  
✅ **Secret Detection**: Prevents credential exposure  

**Compliance Status**: ✅ **COMPLIANT** with MBSS2.0-ApplicationCoding-003
