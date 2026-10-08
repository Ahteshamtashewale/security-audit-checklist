import React from 'react';
import { AuditItem, AuditDomain } from '../types/audit';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

interface MetricsViewProps {
  items: AuditItem[];
  onNavigateToDomain: (domain: AuditDomain) => void;
  onOpenReportModal: () => void;
}

export const MetricsView: React.FC<MetricsViewProps> = ({
  items,
  onNavigateToDomain,
  onOpenReportModal,
}) => {
  const domains: { key: AuditDomain; label: string; desc: string }[] = [
    { key: 'auth', label: 'Authentication Concepts', desc: 'MFA, password entropy, JWT, session lifecycle, rate limiting' },
    { key: 'input_validation', label: 'Input Validation', desc: 'SQL injection, XSS encoding, file uploads, schema bounds' },
    { key: 'security_checks', label: 'Security Checks & Hardening', desc: 'CSP, CORS policies, TLS encryption, secure cookies' },
    { key: 'logging', label: 'Logging & Monitoring', desc: 'Audit trails, secret redaction, SIEM triggers, time sync' },
    { key: 'awareness', label: 'Security Awareness & Culture', desc: 'Phishing drills, incident escalation, password managers' },
  ];

  // Calculate scores per domain
  const domainMetrics = domains.map((d) => {
    const domainItems = items.filter((i) => i.domain === d.key);
    const pass = domainItems.filter((i) => i.status === 'pass').length;
    const fail = domainItems.filter((i) => i.status === 'fail').length;
    const warn = domainItems.filter((i) => i.status === 'warning').length;
    const total = domainItems.length || 1;
    // Score formula: pass=100%, warn=50%, fail=0%
    const score = Math.round(((pass * 100 + warn * 50) / (total * 100)) * 100);
    return {
      ...d,
      total: domainItems.length,
      pass,
      fail,
      warn,
      score,
    };
  });

  // Overall posture score
  const totalPass = items.filter((i) => i.status === 'pass').length;
  const totalWarn = items.filter((i) => i.status === 'warning').length;
  const totalFail = items.filter((i) => i.status === 'fail').length;
  const overallScore = Math.round(((totalPass * 100 + totalWarn * 50) / (items.length * 100)) * 100) || 0;

  // Severities of failed or warning items
  const failedItems = items.filter((i) => i.status === 'fail' || i.status === 'warning');
  const criticalDefects = failedItems.filter((i) => i.severity === 'critical');
  const highDefects = failedItems.filter((i) => i.severity === 'high');
  const mediumDefects = failedItems.filter((i) => i.severity === 'medium');

  return (
    <div className="space-y-6">
      {/* Executive Posture Headline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Security Posture Evaluation</span>
              <span aria-hidden="true">·</span>
              <span>CVSSv3 & CIS Assessment Model</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Enterprise Security Health & Risk Scorecard
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Weighted calculation reflecting 29 verified controls across application authentication, input defense, defensive infrastructure headers, data logging sanitization, and organizational human factors.
            </p>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Overall Posture Rating</span>
              <span
                className={`text-4xl font-black font-mono tracking-tight tabular-nums ${
                  overallScore >= 80
                    ? 'text-emerald-400'
                    : overallScore >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {overallScore}%
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {overallScore >= 80 ? 'Grade: A (Production Ready)' : overallScore >= 60 ? 'Grade: B (Conditional Approval)' : 'Grade: F (High Risk Action Needed)'}
              </span>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div className="text-emerald-400 font-semibold">{totalPass} Controls Passed</div>
              <div className="text-amber-400">{totalWarn} Warnings</div>
              <div className="text-rose-400">{totalFail} Deficiencies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainMetrics.map((domain) => (
          <div
            key={domain.key}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{domain.label}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{domain.desc}</p>
              </div>
              <span
                className={`text-lg font-black font-mono tabular-nums ${
                  domain.score >= 80 ? 'text-emerald-400' : domain.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {domain.score}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  domain.score >= 80 ? 'bg-emerald-500' : domain.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${domain.score}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="font-mono text-[11px]">
                {domain.pass} Pass · {domain.fail} Fail · {domain.warn} Warn
              </span>

              <button
                onClick={() => onNavigateToDomain(domain.key)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] font-semibold"
              >
                <span>View Controls</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Severity Summary Tile */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Vulnerability Severity Distribution</h3>
          <p className="text-[11px] text-slate-400">Identified issues categorized by CVSS severity rating:</p>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-rose-400 font-semibold">Critical Severity</span>
              <span className="font-mono font-bold text-white tabular-nums">{criticalDefects.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-orange-400 font-semibold">High Severity</span>
              <span className="font-mono font-bold text-white tabular-nums">{highDefects.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-amber-400 font-semibold">Medium Severity</span>
              <span className="font-mono font-bold text-white tabular-nums">{mediumDefects.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Action Items (Failed / Warning list) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Top Identified Vulnerabilities & Priority Remediations</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {failedItems.length} Issues Requiring Action
          </span>
        </div>

        <div className="space-y-2.5">
          {failedItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-mono font-bold text-indigo-400">{item.id}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold uppercase text-[10px] ${
                      item.severity === 'critical'
                        ? 'text-rose-400'
                        : item.severity === 'high'
                        ? 'text-orange-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500">{item.standardRef}</span>
                </div>
                <div className="font-semibold text-white">{item.title}</div>
                <div className="text-slate-400 text-[11px]">{item.evidenceNotes || item.remediationGuidance}</div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                    item.status === 'fail'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Generate Executive Audit Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
