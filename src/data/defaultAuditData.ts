import { AuditItem, InternshipProjectMeta, WorkflowMilestone } from '../types/audit';

export const INITIAL_PROJECT_META: InternshipProjectMeta = {
  targetSystemName: 'ApexPay Core Payment & Customer Portal v3.2',
  systemType: 'Financial Web Application & Cloud REST Microservices',
  internName: 'Alex Mercer',
  internId: 'CYBER-INT-2026-884',
  internshipTrack: 'Cybersecurity Virtual Internship — Application Security & Audit Track',
  mentorName: 'Dr. Sarah Vance, CISSP',
  organization: 'Apex Cyber Defense Institute / FinTech Security Lab',
  scopeDescription: 'Full-scope application security assessment evaluating customer authentication, payment API input handling, defensive HTTP infrastructure headers, audit logging compliance, and employee security awareness posture.',
  submissionDate: new Date().toISOString().split('T')[0],
  submissionStatus: 'draft',
  executiveSummary: 'This audit assessment evaluates the target system against OWASP ASVS 4.0, NIST SP 800-63B, and CIS Controls. Several critical authentication and input validation hardening steps are required prior to production authorization.',
};

export const INITIAL_AUDIT_ITEMS: AuditItem[] = [
  // 1. AUTHENTICATION CONCEPTS
  {
    id: 'AUTH-01',
    domain: 'auth',
    title: 'Password Entropy & Complexity Policy Enforcement',
    standardRef: 'NIST SP 800-63B §5.1.1 / OWASP ASVS V2.1',
    description: 'Enforce minimum 12-character length, test against breached credential lists, avoid arbitrary composition rules, and compute entropy.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Attempt registration with common dictionary passwords (e.g., "Password123!", "qwerty123456").',
      'Verify that system accepts spaces and emojis in passphrase entries.',
      'Check if client and server enforce at least 12 characters minimum length.',
      'Ensure the system checks against HaveIBeenPwned or equivalent compromised credential blocklists.',
    ],
    evidenceNotes: 'Tested signup endpoint with a 14-character passphrase. System rejected weak dictionary words correctly.',
    remediationGuidance: 'Adopt zxcvbn or k-anonymity HIBP API checks. Eliminate forced 90-day periodic rotations unless breach suspected.',
    remediationCodeSnippet: `// Server-side NIST SP 800-63B password validation
export function validatePasswordPolicy(password: string): { valid: boolean; reason?: string } {
  if (password.length < 12) return { valid: false, reason: "Minimum 12 characters required." };
  if (isCommonPassword(password)) return { valid: false, reason: "Password found in common breach list." };
  return { valid: true };
}`,
    testedInSandbox: true,
    sandboxLabId: 'auth_entropy',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AUTH-02',
    domain: 'auth',
    title: 'Multi-Factor Authentication (MFA / TOTP) Enforcement',
    standardRef: 'OWASP ASVS V2.8 / CIS Control 6.3',
    description: 'Mandatory Time-based One-Time Password (TOTP RFC 6238) or FIDO2 WebAuthn for privileged and administrative roles.',
    severity: 'critical',
    status: 'warning',
    verificationSteps: [
      'Inspect login flow for administrative accounts to confirm MFA prompt occurs.',
      'Test replay attacks with previous 30-second TOTP tokens to verify strict window invalidation.',
      'Check rate limiting on the 6-digit verification submission endpoint.',
    ],
    evidenceNotes: 'MFA is implemented for billing admins but currently optional for standard customer accounts.',
    remediationGuidance: 'Enforce MFA by default across all privileged dashboards; provide backup recovery codes stored as hashed entries.',
    remediationCodeSnippet: `// Verify TOTP with strict single-use window
import { authenticator } from 'otplib';

export function verifyAdminMfa(secret: string, token: string, lastUsedToken: string): boolean {
  if (token === lastUsedToken) throw new Error("Replay token detected");
  authenticator.options = { window: 1 }; // Allow max +/- 30s drift
  return authenticator.verify({ token, secret });
}`,
    testedInSandbox: true,
    sandboxLabId: 'auth_totp',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AUTH-03',
    domain: 'auth',
    title: 'Brute Force Protection & Credential Stuffing Throttling',
    standardRef: 'OWASP ASVS V2.2 / CWE-307',
    description: 'Account lockout or progressive exponential backoff delay after 5 consecutive failed login attempts from an IP or target user.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Script 10 sequential invalid credential attempts targeting a single test email.',
      'Confirm HTTP 429 Too Many Requests response is returned with Retry-After header.',
      'Check that responses do not leak user enumeration differences (e.g. "User does not exist" vs "Incorrect password").',
    ],
    evidenceNotes: 'Tested burst of 7 attempts; 429 response triggered after attempt 5 with generic message "Invalid credentials".',
    remediationGuidance: 'Implement Redis sliding window rate limiter paired with Cloudflare Turnstile or CAPTCHA on consecutive failures.',
    remediationCodeSnippet: `// Sliding window login rate limiter
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 failed login attempts per window
  message: { error: "Too many failed attempts. Try again in 15 minutes." },
  standardHeaders: true,
});`,
    testedInSandbox: true,
    sandboxLabId: 'auth_rate_limit',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AUTH-04',
    domain: 'auth',
    title: 'Cryptographic Password Hashing (Argon2id or bcrypt)',
    standardRef: 'CWE-916 / OWASP Password Storage Cheat Sheet',
    description: 'All passwords stored using memory-hard Argon2id or bcrypt with cost factor >= 12 and unique cryptographically secure salt.',
    severity: 'critical',
    status: 'pass',
    verificationSteps: [
      'Inspect database schema and ORM user entity definitions.',
      'Confirm no plaintext or weak hashes (MD5, SHA1, unsalted SHA256) are utilized.',
      'Verify cost parameters are calibrated to take ~250ms–500ms per verification.',
    ],
    evidenceNotes: 'Database confirms password column stores `$argon2id$v=19$m=65536,t=3,p=4$` hashes with unique salts.',
    remediationGuidance: 'Maintain Argon2id as primary hashing algorithm with calibrated parameters.',
    remediationCodeSnippet: `import argon2 from 'argon2';

export async function hashPassword(plainText: string): Promise<string> {
  return await argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 4
  });
}`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AUTH-05',
    domain: 'auth',
    title: 'JWT Token Security, Expiration & Algorithm Strictness',
    standardRef: 'RFC 7519 / OWASP ASVS V3.5 / CWE-347',
    description: 'Prevent alg: "none" signature bypass attacks, verify signature with strong secret, and enforce short access token lifetime (<= 15 min).',
    severity: 'critical',
    status: 'fail',
    verificationSteps: [
      'Craft a test JWT with "alg": "none" in the header and submit to protected endpoint.',
      'Test token past "exp" expiration timestamp to confirm rejection.',
      'Verify token secret has at least 256 bits of entropy and is loaded via environment variables.',
    ],
    evidenceNotes: 'VULNERABILITY: Legacy endpoint `/api/v1/session/verify` accepted tokens when header alg was modified to "none"!',
    remediationGuidance: 'Explicitly pin algorithms parameter to ["HS256"] or ["RS256"] in `jwt.verify()` and disallow unsigned tokens.',
    remediationCodeSnippet: `// Safe JWT verification with explicit algorithm whitelist
import jwt from 'jsonwebtoken';

export function verifyAuthToken(token: string, secretKey: string) {
  return jwt.verify(token, secretKey, {
    algorithms: ['HS256'], // Explicitly prohibits 'none' or algorithm confusion
    maxAge: '15m'
  });
}`,
    testedInSandbox: true,
    sandboxLabId: 'auth_jwt',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AUTH-06',
    domain: 'auth',
    title: 'Role-Based Access Control (RBAC) & Privileged Authorization',
    standardRef: 'CIS Control 6.8 / OWASP ASVS V4.1',
    description: 'Enforce server-side role validation on every endpoint to prevent Insecure Direct Object References (IDOR) and privilege escalation.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Attempt to access `/api/admin/users` using a standard customer role token.',
      'Verify server checks ownership of resource ID params (e.g. `/api/orders/:id`).',
      'Confirm unauthorized attempts return HTTP 403 Forbidden, not HTTP 200 with hidden UI.',
    ],
    evidenceNotes: 'Tested role guards across API controller middlewares; server correctly denies customer tokens with 403.',
    remediationGuidance: 'Maintain centralized declarative policy authorization middleware with strict least-privilege checks.',
    remediationCodeSnippet: `export function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient privileges." });
    }
    next();
  };
}`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AUTH-07',
    domain: 'auth',
    title: 'Secure Session Invalidation on Logout',
    standardRef: 'OWASP ASVS V3.3 / CWE-613',
    description: 'Both client tokens and server-side session stores/refresh tokens must be immediately revoked upon user logout.',
    severity: 'medium',
    status: 'pass',
    verificationSteps: [
      'Save active JWT token and session cookies.',
      'Click Logout button.',
      'Replay the saved token to a protected endpoint and verify server rejects it as revoked.',
    ],
    evidenceNotes: 'Server maintains a Redis token revocation blocklist with TTL matching JWT expiration.',
    remediationGuidance: 'Store refresh tokens in HttpOnly secure cookies and revoke the token family on logout or password reset.',
    remediationCodeSnippet: `export async function handleLogout(tokenJti: string, remainingTtlSeconds: number) {
  await redisClient.set(\`blacklist:\${tokenJti}\`, "revoked", "EX", remainingTtlSeconds);
}`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },

  // 2. INPUT VALIDATION
  {
    id: 'INPUT-01',
    domain: 'input_validation',
    title: 'Parameterized Queries for SQL / NoSQL Injection Prevention',
    standardRef: 'OWASP Top 10 A03 / CWE-89',
    description: 'All database queries must use prepared statements or parameter binding; dynamic string interpolation is strictly prohibited.',
    severity: 'critical',
    status: 'fail',
    verificationSteps: [
      'Inject SQL metacharacters (e.g. "\' OR 1=1 --", "\'; DROP TABLE users; --") into search and filter fields.',
      'Review codebase for raw string template literals inside query methods.',
      'Inspect ORM queries to confirm parameter binding is utilized.',
    ],
    evidenceNotes: 'VULNERABILITY: Product search endpoint `/api/catalog/search?q=` concatenates raw query string into SQL LIKE clause.',
    remediationGuidance: 'Replace all string concatenations with parameterized placeholder parameters `($1, $2)` or ORM query builders.',
    remediationCodeSnippet: `// ❌ VULNERABLE: db.query("SELECT * FROM catalog WHERE name LIKE '%" + req.query.q + "%'");
// ✅ SECURE: Parameterized Query
const query = "SELECT * FROM catalog WHERE name ILIKE $1";
const values = [\`%\${searchQuery}%\`];
const results = await db.query(query, values);`,
    testedInSandbox: true,
    sandboxLabId: 'input_sqli',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'INPUT-02',
    domain: 'input_validation',
    title: 'Context-Aware Output Encoding & XSS Sanitization',
    standardRef: 'OWASP Top 10 A03 / CWE-79 / ASVS V5.3',
    description: 'User-controlled inputs must be contextualized and sanitized using HTML entity encoding before rendering in the DOM.',
    severity: 'high',
    status: 'warning',
    verificationSteps: [
      'Submit payloads containing `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` in profile name and bio fields.',
      'Check if markup is safely rendered as escaped plain text `&lt;script&gt;`.',
      'Verify no unsafe React APIs (`dangerouslySetInnerHTML`) are used with unsanitized user content.',
    ],
    evidenceNotes: 'Profile bio field sanitizes basic script tags but was susceptible to SVG onload vectors.',
    remediationGuidance: 'Use DOMPurify on client and sanitize-html on server with strict tag/attribute allowlists.',
    remediationCodeSnippet: `import DOMPurify from 'dompurify';

export function sanitizeUserInput(rawHtml: string): string {
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'target']
  });
}`,
    testedInSandbox: true,
    sandboxLabId: 'input_xss',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'INPUT-03',
    domain: 'input_validation',
    title: 'Strict Schema & Allowlist Validation for Request Payloads',
    standardRef: 'OWASP ASVS V5.1 / CWE-20',
    description: 'Enforce server-side schema validation (Zod / Joi) for all JSON payloads to prevent mass assignment and malformed payloads.',
    severity: 'medium',
    status: 'pass',
    verificationSteps: [
      'Send unexpected fields in POST payload (e.g. `{"isAdmin": true, "balance": 99999}`).',
      'Verify server rejects payload or strips unexpected keys.',
      'Test boundary values (negative numbers, overflow integers, 100,000 character strings).',
    ],
    evidenceNotes: 'API uses Zod schema validation; extra keys are rejected with 422 Unprocessable Entity.',
    remediationGuidance: 'Define strict Zod schemas with `.strict()` modifier preventing unexpected keys.',
    remediationCodeSnippet: `import { z } from 'zod';

const UpdateUserSchema = z.object({
  fullName: z.string().min(2).max(64),
  email: z.string().email(),
  phone: z.string().regex(/^\\+?[0-9]{10,15}$/).optional()
}).strict(); // Disallows unexpected fields`,
    testedInSandbox: true,
    sandboxLabId: 'input_schema',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'INPUT-04',
    domain: 'input_validation',
    title: 'File Upload MIME & Content-Type Verification',
    standardRef: 'CWE-434 / OWASP File Upload Cheat Sheet',
    description: 'Verify uploaded files using magic number byte inspection, file size bounds, random renaming, and non-executable storage.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Upload `.php`, `.exe`, `.svg` files disguised with `.jpg` extensions.',
      'Check if server inspects file magic bytes rather than trusting `Content-Type` header.',
      'Confirm files are stored on isolated cloud object storage (S3 bucket) without direct execution permissions.',
    ],
    evidenceNotes: 'Avatar upload endpoint validates file magic headers via file-type library and writes to AWS S3 with generated UUID filenames.',
    remediationGuidance: 'Enforce magic byte inspection, strip EXIF metadata, and store outside the web root.',
    remediationCodeSnippet: `import { fileTypeFromBuffer } from 'file-type';

export async function validateUploadedImage(buffer: Buffer) {
  const type = await fileTypeFromBuffer(buffer);
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
  if (!type || !allowedMime.includes(type.mime)) {
    throw new Error("Invalid or spoofed file content detected.");
  }
}`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'INPUT-05',
    domain: 'input_validation',
    title: 'Server-Side Request Forgery (SSRF) Prevention',
    standardRef: 'OWASP Top 10 A10 / CWE-918',
    description: 'Validate and restrict outgoing requests from webhook/URL fetch features to prevent internal network scanning and cloud metadata access.',
    severity: 'critical',
    status: 'pass',
    verificationSteps: [
      'Test webhook URL field with AWS metadata endpoint `http://169.254.169.254/latest/meta-data/`.',
      'Test internal loopback addresses `http://127.0.0.1:8080/admin` and private IP subnets `10.0.0.0/8`.',
      'Verify DNS rebinding protections and IP blocklists are active.',
    ],
    evidenceNotes: 'Webhook registration validates destination against private IP ranges (RFC 1918) and cloud metadata CIDR blocks.',
    remediationGuidance: 'Validate resolved IP addresses against private and link-local ranges before initiating HTTP fetch.',
    remediationCodeSnippet: `import ipRangeCheck from 'ip-range-check';
import dns from 'dns/promises';

export async function validateSafeOutboundUrl(targetUrl: string) {
  const parsed = new URL(targetUrl);
  const resolved = await dns.lookup(parsed.hostname);
  const privateRanges = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '127.0.0.0/8', '169.254.0.0/16'];
  if (ipRangeCheck(resolved.address, privateRanges)) {
    throw new Error("Forbidden outbound destination.");
  }
}`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'INPUT-06',
    domain: 'input_validation',
    title: 'Regular Expression Denial of Service (ReDoS) Defense',
    standardRef: 'CWE-1333 / OWASP ASVS V5.1',
    description: 'Ensure regular expressions for email, phone, or pattern validation do not suffer from catastrophic backtracking.',
    severity: 'low',
    status: 'pass',
    verificationSteps: [
      'Audit custom regex patterns for nested quantifiers (e.g. `(a+)+$`).',
      'Test regex with 50,000 repeating characters to measure CPU evaluation duration.',
      'Verify timeouts or safe linear regex engines are utilized.',
    ],
    evidenceNotes: 'Tested regex expressions with safe-regex utility. All validation routines complete in <2ms.',
    remediationGuidance: 'Avoid nested quantifiers and use standard libraries or RE2 syntax.',
    remediationCodeSnippet: `// Use linear-time evaluation or strict bounded expressions
export const SafeEmailRegex = /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\\.[a-zA-Z]{2,10}$/;`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },

  // 3. SECURITY CHECKS (HARDENING & INFRASTRUCTURE)
  {
    id: 'SEC-01',
    domain: 'security_checks',
    title: 'Content Security Policy (CSP) & Defense Headers',
    standardRef: 'OWASP Secure Headers Project / CIS Control 9.2',
    description: 'Enforce strict Content-Security-Policy, HSTS, X-Content-Type-Options: nosniff, and frame protection against clickjacking.',
    severity: 'high',
    status: 'fail',
    verificationSteps: [
      'Inspect HTTP response headers using curl or browser network devtools.',
      'Check for presence and strictness of Content-Security-Policy (no unsafe-inline or unsafe-eval).',
      'Verify Strict-Transport-Security has max-age >= 31536000 and includeSubDomains.',
      'Confirm X-Frame-Options: DENY or frame-ancestors \'none\' to prevent clickjacking.',
    ],
    evidenceNotes: 'VULNERABILITY: Server is currently missing Content-Security-Policy and HSTS response headers in API responses!',
    remediationGuidance: 'Add Helmet middleware to Express configuration with hardened CSP directives.',
    remediationCodeSnippet: `// Hardened Helmet configuration
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));`,
    testedInSandbox: true,
    sandboxLabId: 'sec_headers',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'SEC-02',
    domain: 'security_checks',
    title: 'Cross-Origin Resource Sharing (CORS) Configuration',
    standardRef: 'OWASP ASVS V14.4 / CWE-942',
    description: 'Ensure Access-Control-Allow-Origin does not reflect arbitrary Origin headers or use wildcard `*` with credentials enabled.',
    severity: 'critical',
    status: 'pass',
    verificationSteps: [
      'Send request with spoofed `Origin: https://evil-attacker.com`.',
      'Verify server does not reflect the untrusted origin.',
      'Check that `Access-Control-Allow-Credentials: true` is only paired with explicit trusted domain allowlist.',
    ],
    evidenceNotes: 'Tested origin reflection with curl; server strictly rejects origins outside https://*.apexpay.internal.',
    remediationGuidance: 'Enforce an exact array of approved frontend origins.',
    remediationCodeSnippet: `import cors from 'cors';

const allowedOrigins = ['https://portal.apexpay.com', 'https://admin.apexpay.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Disallowed by CORS policy"));
  },
  credentials: true
}));`,
    testedInSandbox: true,
    sandboxLabId: 'sec_cors',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'SEC-03',
    domain: 'security_checks',
    title: 'HTTPS / TLS 1.3 Strict Enforcement & Ciphers',
    standardRef: 'CIS Control 3.10 / NIST SP 800-52r2',
    description: 'Enforce HTTPS everywhere with HTTP-to-HTTPS 301 redirects; reject deprecated TLS 1.0 and 1.1 protocol versions.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Initiate plaintext HTTP connection to port 80; confirm immediate 301/308 redirect to HTTPS.',
      'Audit SSL cipher suite configuration to ensure Perfect Forward Secrecy (PFS) ciphers.',
      'Verify certificate expiration and validity chain.',
    ],
    evidenceNotes: 'Reverse proxy listener enforces TLS 1.3 / TLS 1.2 with ECDHE ciphers and automatic HSTS redirects.',
    remediationGuidance: 'Configure cloud load balancer to reject TLS versions older than 1.2.',
    remediationCodeSnippet: `// NGINX SSL Hardening
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'SEC-04',
    domain: 'security_checks',
    title: 'Sensitive Data at Rest Encryption (AES-256-GCM)',
    standardRef: 'NIST SP 800-111 / PCI-DSS 3.4',
    description: 'Ensure PII, customer banking credentials, and sensitive tokens are encrypted at the field level with AES-256-GCM.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Inspect database direct records for credit card tokens and tax identifiers.',
      'Confirm ciphertext is stored alongside IV / authentication tag.',
      'Verify encryption keys are managed through AWS KMS or HashiCorp Vault, not hardcoded in source code.',
    ],
    evidenceNotes: 'Sensitive table columns store AES-GCM ciphertext encrypted with KMS envelope key.',
    remediationGuidance: 'Utilize authenticated AES-GCM mode with a unique 12-byte initialization vector per record.',
    remediationCodeSnippet: `import crypto from 'crypto';

export function encryptField(plainText: string, keyBuffer: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  let enc = cipher.update(plainText, 'utf8', 'hex');
  enc += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { ciphertext: enc, iv: iv.toString('hex'), tag };
}`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'SEC-05',
    domain: 'security_checks',
    title: 'Cookie Security Attributes (HttpOnly, Secure, SameSite)',
    standardRef: 'OWASP ASVS V3.4 / CWE-1004',
    description: 'Session and authentication cookies must enforce `HttpOnly` to prevent XSS theft, `Secure` for HTTPS, and `SameSite=Strict/Lax` against CSRF.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Inspect `Set-Cookie` header in login response.',
      'Confirm `HttpOnly` flag prevents `document.cookie` JavaScript access.',
      'Confirm `Secure` flag prevents transmission over unencrypted HTTP.',
      'Confirm `SameSite=Strict` or `Lax` prevents cross-site request forgery.',
    ],
    evidenceNotes: 'Tested session cookie flags: Set-Cookie: session_id=...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600.',
    remediationGuidance: 'Configure cookie options consistently in express-session or cookie parser.',
    remediationCodeSnippet: `res.cookie('auth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
  path: '/'
});`,
    testedInSandbox: true,
    sandboxLabId: 'sec_cookies',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'SEC-06',
    domain: 'security_checks',
    title: 'API Rate Limiting & Denial-of-Service Mitigations',
    standardRef: 'OWASP API Security Top 10 API4 / CIS 9.4',
    description: 'Apply token-bucket or sliding-window rate limiters across all public API endpoints to protect backend compute resources.',
    severity: 'medium',
    status: 'pass',
    verificationSteps: [
      'Execute high-volume automated requests (100 req/sec) using load test tool.',
      'Confirm 429 response is issued with headers `X-RateLimit-Limit` and `X-RateLimit-Remaining`.',
      'Verify health check endpoints are shielded from unauthenticated resource exhaustion.',
    ],
    evidenceNotes: 'Global rate limiter enforces 100 req/min per IP on standard endpoints and 10 req/min on auth endpoints.',
    remediationGuidance: 'Configure Redis-backed distributed rate limiting at gateway layer.',
    remediationCodeSnippet: `app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true
}));`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },

  // 4. LOGGING & MONITORING
  {
    id: 'LOG-01',
    domain: 'logging',
    title: 'Security Event Audit Trail & Non-Repudiation',
    standardRef: 'CIS Control 8.5 / NIST SP 800-92 / OWASP A09',
    description: 'Record all authentication successes/failures, password resets, privilege changes, and data export events with actor ID, timestamp, and IP.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Perform user role change and password reset in test environment.',
      'Query security event log repository to verify all relevant event fields exist.',
      'Confirm timestamp uses ISO 8601 UTC format.',
    ],
    evidenceNotes: 'Audit service logs JSON structured events with event_type, actor_id, target_id, ip_address, and timestamp.',
    remediationGuidance: 'Emit structured JSON logs to centralized security logging pipeline (ELK / CloudWatch / Datadog).',
    remediationCodeSnippet: `export function logSecurityEvent(event: {
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'ROLE_CHANGE' | 'DATA_EXPORT';
  actorId: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}) {
  logger.info({
    timestamp: new Date().toISOString(),
    channel: 'security_audit',
    ...event
  });
}`,
    testedInSandbox: true,
    sandboxLabId: 'log_events',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'LOG-02',
    domain: 'logging',
    title: 'PII, Passwords & Secret Redaction in Logs',
    standardRef: 'CWE-532 / GDPR Art. 32 / PCI-DSS 3.4',
    description: 'Ensure logs never capture plaintext passwords, credit card numbers, SSNs, API tokens, or session secrets in query params or bodies.',
    severity: 'critical',
    status: 'fail',
    verificationSteps: [
      'Submit authentication and payment transactions.',
      'Inspect application logs (stdout and file outputs).',
      'Search log files for patterns matching passwords, `bearer`, `cvv`, or PAN numbers.',
    ],
    evidenceNotes: 'VULNERABILITY: Debug logger in `/api/auth/login` was printing full `req.body` including `password` field!',
    remediationGuidance: 'Implement automatic regex-based masking middleware that redacts sensitive keys before serialization.',
    remediationCodeSnippet: `// Automatic log sanitizer middleware
const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'cvv', 'ssn', 'cardNumber'];

export function sanitizeLogObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogObject(sanitized[key]);
    }
  }
  return sanitized;
}`,
    testedInSandbox: true,
    sandboxLabId: 'log_redaction',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'LOG-03',
    domain: 'logging',
    title: 'Centralized Append-Only Log Storage & Tamper Resistance',
    standardRef: 'NIST SP 800-92 §4.2 / CIS Control 8.2',
    description: 'Logs must be shipped in real-time to write-once/append-only storage to prevent attackers from wiping traces during compromise.',
    severity: 'high',
    status: 'warning',
    verificationSteps: [
      'Verify server logs are shipped via FluentBit/Logstash to external storage rather than local ephemeral disk.',
      'Check IAM permissions to ensure application server roles cannot delete or modify log buckets.',
      'Confirm S3 Object Lock or write-once compliance policy is activated.',
    ],
    evidenceNotes: 'Logs are pushed to AWS CloudWatch, but retention policy is set to 30 days without WORM compliance lock.',
    remediationGuidance: 'Enable S3 Object Lock in Governance mode with 365-day minimum compliance retention.',
    remediationCodeSnippet: `// AWS S3 Object Lock Terraform snippet
resource "aws_s3_bucket_object_lock_configuration" "audit_logs" {
  bucket = aws_s3_bucket.security_logs.id
  rule {
    default_retention {
      mode  = "COMPLIANCE"
      days  = 365
    }
  }
}`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'LOG-04',
    domain: 'logging',
    title: 'Automated Alerting Triggers for High-Risk Anomalies',
    standardRef: 'OWASP A09 / CIS Control 8.11',
    description: 'Trigger immediate alerts (Slack / PagerDuty / SIEM) on abnormal spikes in 401/403 responses, admin privilege grants, or mass exports.',
    severity: 'medium',
    status: 'pass',
    verificationSteps: [
      'Simulate 50 unauthorized requests in 1 minute.',
      'Verify alert rule fires in SIEM/monitoring dashboard.',
      'Check mean time to alert notification (< 2 minutes).',
    ],
    evidenceNotes: 'Datadog metric monitor alerts the on-call engineer when 4xx error rate exceeds 5% of total traffic.',
    remediationGuidance: 'Configure alert thresholds for account lockout bursts, mass data downloads, and off-hours admin logins.',
    remediationCodeSnippet: `// Example SIEM alert condition
sum(rate(http_requests_total{status=~"401|403"}[5m])) > 20`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'LOG-05',
    domain: 'logging',
    title: 'Time Synchronization via Network Time Protocol (NTP)',
    standardRef: 'CIS Control 8.4 / ISO 27001 A.12.4.4',
    description: 'All application containers and database nodes must synchronize time against certified NTP sources for reliable forensic correlation.',
    severity: 'low',
    status: 'pass',
    verificationSteps: [
      'Verify `chrony` or `systemd-timesyncd` is active across all cluster hosts.',
      'Compare server clock drift against public NTP stratum servers (< 50ms drift).',
    ],
    evidenceNotes: 'Kubernetes nodes sync with AWS Time Sync Service (169.254.169.123); drift is < 2ms.',
    remediationGuidance: 'Maintain automated time sync daemon monitoring across all infrastructure nodes.',
    remediationCodeSnippet: `chronyc tracking | grep "System time"`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },

  // 5. SECURITY AWARENESS & CULTURE
  {
    id: 'AWR-01',
    domain: 'awareness',
    title: 'Phishing Awareness Simulation & Training Curriculum',
    standardRef: 'CIS Control 14.1 / NIST SP 800-50',
    description: 'Mandatory quarterly simulated phishing campaigns and interactive training on spotting spear-phishing, spoofed domains, and urgency triggers.',
    severity: 'medium',
    status: 'warning',
    verificationSteps: [
      'Review training completion rate logs across engineering and product staff.',
      'Inspect simulated phishing campaign results (click rate and report rate).',
      'Verify remedial training is automatically assigned to employees who click test payloads.',
    ],
    evidenceNotes: '78% of staff completed annual training, but simulated phishing click rate is currently 14% (target < 5%).',
    remediationGuidance: 'Increase phishing simulation frequency to bi-monthly; introduce instant micro-learning feedback on click.',
    remediationCodeSnippet: `// Policy KPI: Phishing click-to-report ratio
Target: Click rate < 5%, Report rate > 75% within 1 hour of simulated campaign launch.`,
    testedInSandbox: true,
    sandboxLabId: 'awr_phishing',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AWR-02',
    domain: 'awareness',
    title: 'Incident Reporting Channel & 24/7 Security Escalation',
    standardRef: 'NIST SP 800-61r2 / CIS Control 17.1',
    description: 'A prominent, frictionless one-click reporting button in email clients and Slack for suspected security events, lost devices, or phishing.',
    severity: 'high',
    status: 'pass',
    verificationSteps: [
      'Test the "Report Phishing" button in corporate email client.',
      'Confirm automated ticket creation and notification to SOC triage queue.',
      'Verify emergency hotline phone number and anonymous reporting channel exist.',
    ],
    evidenceNotes: 'Tested "Report Phish" Outlook add-in; alert appeared in SOC Slack channel `#security-incidents` within 15 seconds.',
    remediationGuidance: 'Ensure 24/7 on-call rotation schedule is posted in team handbook with clear incident severity tiers.',
    remediationCodeSnippet: `Slack /report-incident bot integrated with Jira Service Management & PagerDuty.`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AWR-03',
    domain: 'awareness',
    title: 'Enterprise Password Manager Hygiene & 2FA Enforcement',
    standardRef: 'CISA Guidance / CIS Control 14.4',
    description: 'Mandatory enterprise password manager (e.g. 1Password / Bitwarden) with zero password reuse and biometric master unlocks.',
    severity: 'medium',
    status: 'pass',
    verificationSteps: [
      'Audit MDM password manager deployment across corporate laptops.',
      'Check for browser autofill credential dumping risks.',
      'Ensure master passwords use minimum 16 characters or hardware security keys.',
    ],
    evidenceNotes: '100% of corporate workstations enrolled in 1Password Enterprise via Jamf/InTune MDM profile.',
    remediationGuidance: 'Disable built-in browser password saving via corporate browser group policies.',
    remediationCodeSnippet: `// Chrome Enterprise Policy:
PasswordManagerEnabled: false
BrowserSignin: 1`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AWR-04',
    domain: 'awareness',
    title: 'Social Engineering & Customer Support Verification Protocol',
    standardRef: 'ISO 27001 A.7.2.2 / OWASP Security Culture',
    description: 'Strict out-of-band verification procedures before performing customer password resets, email changes, or wire transactions.',
    severity: 'high',
    status: 'warning',
    verificationSteps: [
      'Conduct simulated support social engineering test requesting email change.',
      'Confirm support agent enforces out-of-band push authorization or government ID verification.',
      'Verify staff cannot bypass protocol even under claimed urgent executive pressure.',
    ],
    evidenceNotes: 'One support agent accepted verbal caller verification during test. Formal out-of-band PIN prompt is required.',
    remediationGuidance: 'Enforce mandatory automated in-app push verification prompt before agent can edit sensitive customer attributes.',
    remediationCodeSnippet: `// In-App Support Verification Protocol
1. Agent clicks "Request Customer Verification" in CRM.
2. Push notification with 6-digit random code sent to customer registered mobile device.
3. Customer approves notification or reads back code.
4. CRM unlock button enables sensitive edits.`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
  {
    id: 'AWR-05',
    domain: 'awareness',
    title: 'Clean Desk, Screen Lock & Removable Media Policy',
    standardRef: 'CIS Control 14.7 / ISO 27001 A.11.2.9',
    description: 'Workstations must enforce 5-minute inactivity auto-lock, encrypted storage, and USB mass-storage write restrictions.',
    severity: 'low',
    status: 'pass',
    verificationSteps: [
      'Inspect MDM configuration profiles for screensaver lock timer.',
      'Confirm BitLocker / FileVault disk encryption is forced on 100% of endpoints.',
      'Test insertion of unapproved USB flash drives.',
    ],
    evidenceNotes: 'MDM enforces 5-minute inactivity lock, FileVault disk encryption, and blocks unauthorized USB storage.',
    remediationGuidance: 'Continue quarterly physical office security walkthrough audits.',
    remediationCodeSnippet: `MDM Configuration Profile: ScreenSaverIdleTime = 300, FileVault = Enabled`,
    testedInSandbox: false,
    lastUpdated: '2026-10-08',
  },
];

export const WORKFLOW_MILESTONES: WorkflowMilestone[] = [
  {
    id: 'M1',
    phase: 'Phase 1: Orientation & Scope Definition',
    title: 'Target Architecture & Scope Boundary Definition',
    description: 'Identify the target system components, network boundaries, authentication entry points, and applicable regulatory frameworks (OWASP ASVS, NIST, CIS).',
    tasks: [
      'Document target system specifications (APIs, databases, web clients)',
      'Establish rules of engagement and testing boundaries',
      'Select audit standards baseline (OWASP ASVS 4.0, NIST SP 800-63B)',
    ],
    deliverable: 'Approved Scope Statement & Target Inventory Matrix',
    completed: true,
  },
  {
    id: 'M2',
    phase: 'Phase 2: Systematic Checklist Execution',
    title: 'Comprehensive Domain Audit Assessment',
    description: 'Systematically evaluate all 29 audit criteria across the 5 core cybersecurity domains: Authentication, Input Validation, Security Checks, Logging, and Awareness.',
    tasks: [
      'Inspect authentication flows, token handling, and password policies',
      'Audit input sanitization, parameterized queries, and file handling',
      'Verify infrastructure security headers, TLS configuration, and CORS rules',
      'Examine audit logging formats, PII redaction, and log storage',
      'Evaluate organizational security awareness and training protocols',
    ],
    deliverable: 'Populated Audit Checklist with Statuses and Evidence Notes',
    completed: true,
  },
  {
    id: 'M3',
    phase: 'Phase 3: Practical Testing & Sandbox Verification',
    title: 'Hands-On Vulnerability Testing & Verification Lab',
    description: 'Conduct empirical sandbox experiments to test password entropy, simulate TOTP MFA drift, analyze JWT signature flaws, execute SQLi/XSS tests, and audit live logs.',
    tasks: [
      'Run Password Entropy Calculator & NIST compliance checks',
      'Simulate TOTP code generation & replay window validation',
      'Test JWT alg:none vulnerability and role tampering',
      'Demonstrate SQL injection prevention via parameterized queries',
      'Evaluate HTTP security headers & calculate defensive posture score',
      'Execute live log sanitization to redact PII and API credentials',
      'Complete the interactive phishing inspection challenge',
    ],
    deliverable: 'Recorded Sandbox Test Evidence & Empirical Proof Logs',
    completed: true,
  },
  {
    id: 'M4',
    phase: 'Phase 4: Risk Scoring & Threat Analysis',
    title: 'Severity Categorization & Remediation Prioritization',
    description: 'Quantify identified vulnerabilities using CVSS principles, aggregate domain scores, and formulate actionable code and architectural remediation plans.',
    tasks: [
      'Review identified Critical and High severity findings',
      'Calculate weighted domain compliance percentage scores',
      'Draft step-by-step code remediation recommendations for developers',
    ],
    deliverable: 'Risk Scorecard & Actionable Remediation Roadmap',
    completed: true,
  },
  {
    id: 'M5',
    phase: 'Phase 5: Project Submission & Certification',
    title: 'Formal Internship Deliverable Submission & Verification',
    description: 'Compile the complete virtual internship project package, generate executive audit documentation, sign the compliance verification dossier, and export final reports.',
    tasks: [
      'Complete Intern Profile & Mentor sign-off credentials',
      'Review generated Executive Audit Report & Posture Breakdown',
      'Export signed project dossier (JSON & Markdown formats)',
      'Generate verifiable Internship Completion Certificate artifact',
    ],
    deliverable: 'Final Submitted Security Audit Dossier & Verification Badge',
    completed: false,
  },
];
