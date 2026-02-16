# Security Scanning Setup Guide
## Quick Start - MBSS2.0-ApplicationCoding-003 Compliance

This guide helps you set up and activate all security scanning controls.

---

## 1. Enable GitHub Security Features

### GitHub Repository Settings

1. Go to **Repository → Settings → Security**

2. **Enable Dependabot**:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Dependabot version updates

3. **Enable Code Scanning**:
   - ✅ CodeQL analysis (already configured in workflow)
   - ✅ Secret scanning
   - ✅ Push protection (prevents secret commits)

4. **Enable Branch Protection**:
   - Repository → Settings → Branches
   - Add rule for `main` branch:
     - ✅ Require pull request reviews
     - ✅ Require status checks to pass (select: security-scan)
     - ✅ Require conversation resolution

### GitHub Actions Secrets

Set up required secrets for workflows:
```
Repository → Settings → Secrets and variables → Actions

Required secrets:
- REVALIDATE_SECRET (for ISR revalidation)
```

---

## 2. Install Pre-commit Hooks

### Backend Setup

```bash
cd backend

# Install dependencies (if not done)
npm install

# Install Husky and setup hooks
npm install --save-dev husky@^8.0.3
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"

# Test hooks
npm run lint
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup hooks
npx husky install
```

### Root Workspace Setup

```bash
# At project root
npm install

# Setup Husky
npm run prepare

# Install pre-commit framework (requires Python)
pip install pre-commit

# Install pre-commit hooks
pre-commit install --install-hooks

# Test all hooks
pre-commit run --all-files
```

**If you don't have Python**: The Node.js Husky hooks will still work, but skip the `pre-commit` framework steps.

---

## 3. Install ClamAV (Optional - for File Upload Scanning)

### Development (Windows with WAMP)

**Option A: WSL (Ubuntu)**
```bash
# In WSL
sudo apt-get update
sudo apt-get install clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Start daemon
sudo systemctl start clamav-daemon
```

**Option B: Windows Native**
Download ClamAV for Windows: https://www.clamav.net/downloads

### Production (Linux/Azure)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Start and enable daemon
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon

# Verify
clamscan --version
```

**Note**: File upload scanner will work without ClamAV (with warning), but full malware detection requires it.

---

## 4. Verify Setup

### Test CI/CD Pipeline

```bash
# Push to trigger workflow
git add .
git commit -m "test: trigger security scan"
git push origin develop

# Check workflow
# Go to: Repository → Actions → Security Scanning
```

### Test Pre-commit Hooks

```bash
# Create test file
echo "password = 'test123'" > test.js

# Try to commit (should fail)
git add test.js
git commit -m "test"

# Expected: ❌ Secret detection hook fails
```

### Test Dependency Scanning

```bash
# Backend
cd backend
npm audit

# Should show vulnerability summary
# Fix high/critical issues:
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

### Test File Upload Scanner

```bash
# Start backend
cd backend
npm run dev

# Test upload endpoint with curl
curl -X POST http://localhost:5000/api/filemanager/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"

# Check backend logs for scan results
```

---

## 5. Daily Operations

### For Developers

**Before Committing**:
1. Pre-commit hooks run automatically
2. Fix any linting/security issues
3. Commit proceeds if all checks pass

**Common Issues**:
```bash
# Linting errors
npm run lint:fix

# Security vulnerabilities
npm audit fix

# TypeScript errors
npx tsc --noEmit

# Large files
# Use Git LFS or compress
```

### For Security Team

**Daily**:
- Review GitHub Security alerts
- Check CI/CD scan results

**Weekly**:
- Review Dependabot PRs
- Merge security updates
- Update virus definitions (ClamAV)

**Monthly**:
- Audit file upload logs
- Review security dashboard
- Update security policies

---

## 6. Troubleshooting

### Pre-commit hooks not running

```bash
# Reinstall hooks
npx husky install
pre-commit install --install-hooks

# Check git hooks
ls -la .git/hooks/
```

### GitHub Actions workflow failing

- Check workflow logs: Repository → Actions → Failed workflow
- Common issues:
  - npm audit finding HIGH/CRITICAL vulnerabilities → Run `npm audit fix`
  - Docker build failing → Check Dockerfile syntax
  - Secrets detected → Remove secrets, add to .gitignore

### ClamAV not found

```bash
# Check installation
which clamscan

# If not found, install or scanner will skip virus check (with warning)
```

### False positives in secret detection

Add to `.secrets.baseline`:
```bash
detect-secrets scan > .secrets.baseline
git add .secrets.baseline
git commit -m "chore: update secrets baseline"
```

---

## 7. Compliance Checklist

Before going to production, verify:

- [ ] GitHub Dependabot enabled
- [ ] GitHub Secret scanning enabled
- [ ] Branch protection rules configured
- [ ] Pre-commit hooks installed on all dev machines
- [ ] ClamAV installed on production servers
- [ ] CI/CD security workflow running successfully
- [ ] All HIGH/CRITICAL vulnerabilities fixed
- [ ] Security alerts configured
- [ ] Team trained on security procedures
- [ ] Incident response plan documented

---

## 8. Quick Commands Reference

```bash
# Security scanning
npm run security:scan          # Run all security checks
npm run security:audit         # Audit dependencies
npm run security:fix           # Fix vulnerabilities

# Pre-commit
pre-commit run --all-files     # Test all hooks
pre-commit autoupdate          # Update hook versions

# GitHub CLI (if installed)
gh workflow run security-scan.yml  # Trigger security scan
gh pr checks                       # Check PR status

# Docker security
docker build -t app:latest .
trivy image app:latest         # Scan image
```

---

## 9. Resources

**Documentation**:
- [FILE_SCANNING_IMPLEMENTATION.md](FILE_SCANNING_IMPLEMENTATION.md) - Complete implementation guide
- [SECURITY_CONTROL_ASSESSMENT_MBSS2.0-ApplicationCoding-003.md](SECURITY_CONTROL_ASSESSMENT_MBSS2.0-ApplicationCoding-003.md) - Assessment report

**External Links**:
- [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot)
- [Pre-commit Framework](https://pre-commit.com/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [ClamAV Documentation](https://www.clamav.net/documents)

---

## Need Help?

**Issues with setup**: Check logs and error messages  
**Security questions**: Contact security team  
**False positives**: Update baseline configurations  
**Performance concerns**: Adjust hook configuration  

---

**Last Updated**: February 16, 2026  
**Version**: 1.0
