# Security Audit Checklist & Virtual Internship Workbench

A practical, production-grade cybersecurity application audit platform and virtual internship project workbench built to assess web applications and cloud APIs against industry standards like **OWASP ASVS 4.0**, **NIST SP 800-63B**, and **CIS Critical Security Controls**.

---

## 🎯 Project Overview & Objective

This project serves as a comprehensive virtual internship project demonstrating hands-on cybersecurity concepts, systematic control audits, empirical sandbox testing, and formal project reporting.

### Core Key Features
- **1. Authentication Concepts**: MFA / TOTP verification (RFC 6238), password entropy calculation, brute-force rate limiting with exponential backoff (CWE-307), memory-hard Argon2id hashing, and JWT algorithm validation (`alg: "none"` bypass defense).
- **2. Input Validation**: Parameterized SQL queries vs. string concatenation (CWE-89), context-aware HTML entity encoding for XSS defense (CWE-79), strict JSON schema allowlists against mass assignment, and safe file upload magic-byte verification.
- **3. Security Checks & Hardening**: Defensive HTTP response headers (Content-Security-Policy, HSTS, X-Content-Type-Options, X-Frame-Options), strict CORS origin controls, TLS 1.3 enforcement, AES-256-GCM data encryption, and cookie security flags (`HttpOnly`, `Secure`, `SameSite=Strict`).
- **4. Logging & Monitoring**: Structured audit trails (CIS Control 8.5), real-time regex-based PII, password, and credit card PAN redaction in logs (CWE-532), append-only tamper-resistant storage, and SIEM threshold alerting.
- **5. Security Awareness & Culture**: Interactive phishing email inspection challenges, one-click security escalation channels, password manager hygiene, and social engineering countermeasure protocols.

---

## 🧪 Interactive Testing Sandbox Labs

The platform includes a real-time hands-on testing laboratory for verifying security controls:
1. **Password Entropy & NIST 800-63B Calculator**: Measures character pool space, information entropy ($H = L \times \log_2(N)$), offline cracking time, and checks against common dictionary attack lists.
2. **RFC 6238 TOTP MFA Engine**: Generates live 6-digit tokens with an animated 30-second window countdown and replay-prevention verification.
3. **JWT Security Analyzer**: Tests signature validation, detects expired claims, and simulates `alg: "none"` exploit payloads.
4. **Brute Force Simulator**: Demonstrates progressive failure tracking, lockout thresholds, and HTTP 429 Too Many Requests responses.
5. **SQL Injection Playground**: Side-by-side comparison of vulnerable dynamic query execution versus AST-safe parameterized prepared statements.
6. **XSS Sanitizer**: Real-time evaluation of raw DOM reflection hazards versus safe HTML entity encoding.
7. **HTTP Security Headers Evaluator**: Audits server response headers and computes an instant defensive posture grade (A+ through F).
8. **Live PII & Credential Log Sanitizer**: Live regex redactor that masks passwords, API tokens, credit cards, and SSNs from server logs.
9. **Phishing Inspection Challenge**: Interactive email client where auditors identify spoofed domains, coercive psychological pressure, and suspicious attachments.

---

## 📋 5-Phase Internship Workflow

- **Phase 1: Orientation & Scope Definition** — Target architecture inventory and rules of engagement.
- **Phase 2: Systematic Checklist Execution** — Auditing 29 individual security controls across 5 core domains.
- **Phase 3: Practical Testing & Sandbox Verification** — Empirical lab testing with direct evidence attachment.
- **Phase 4: Risk Scoring & Threat Analysis** — Weighted compliance scoring and CVSS severity distribution.
- **Phase 5: Project Submission & Certification** — Formal sign-off, verifiable certificate generation, and dossier export.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or pnpm or bun

### Installation
```bash
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd security-audit-checklist

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack & Standards
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons & Motion**: Lucide React, Motion
- **Compliance Baselines**: OWASP ASVS 4.0, NIST SP 800-63B, CIS Controls v8, CWE Top 25

---

## 📄 License
Apache-2.0
