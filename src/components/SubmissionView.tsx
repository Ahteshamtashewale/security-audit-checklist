import React, { useState } from 'react';
import { InternshipProjectMeta, AuditItem } from '../types/audit';
import {
  Award,
  CheckCircle2,
  Download,
  Copy,
  Printer,
  FileCheck,
  ShieldCheck,
  Send,
  Upload,
  User,
  Building,
  Key,
  Check,
  Github,
  FileDown,
} from 'lucide-react';
import { downloadProjectPdf } from '../utils/pdfGenerator';

interface SubmissionViewProps {
  meta: InternshipProjectMeta;
  onUpdateMeta: (meta: InternshipProjectMeta) => void;
  items: AuditItem[];
  onOpenReportModal: () => void;
  onOpenGitHubModal?: () => void;
  onImportData: (importedData: any) => void;
}

export const SubmissionView: React.FC<SubmissionViewProps> = ({
  meta,
  onUpdateMeta,
  items,
  onOpenReportModal,
  onOpenGitHubModal,
  onImportData,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(meta.submissionStatus === 'submitted');
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const passCount = items.filter((i) => i.status === 'pass').length;
  const failCount = items.filter((i) => i.status === 'fail').length;
  const warnCount = items.filter((i) => i.status === 'warning').length;
  const totalItems = items.length;
  const complianceRate = Math.round((passCount / totalItems) * 100);

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    try {
      downloadProjectPdf(meta, items);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1200);
    }
  };

  // Compute a deterministic verification hash for the certificate
  const verificationHash = `SEC-${meta.internId.replace(/[^a-zA-Z0-9]/g, '')}-${btoa(
    meta.internName + meta.targetSystemName
  ).slice(0, 16).toUpperCase()}`;

  const generateMarkdownReport = () => {
    return `# CYBERSECURITY AUDIT REPORT & VIRTUAL INTERNSHIP PROJECT SUBMISSION
**Project:** ${meta.targetSystemName}
**Intern Auditor:** ${meta.internName} (${meta.internId})
**Organization / Lab:** ${meta.organization}
**Faculty / Mentor Reviewer:** ${meta.mentorName}
**Assessment Date:** ${meta.submissionDate}
**Verification Seal Hash:** ${verificationHash}

---

## 1. Executive Summary
${meta.executiveSummary}

- **Baseline Compliance:** ${complianceRate}% (${passCount}/${totalItems} Controls Passed)
- **Identified Deficiencies (Failures):** ${failCount}
- **Warnings / Hardening Recommendations:** ${warnCount}

---

## 2. Core Audit Findings by Domain

### A. Authentication Concepts
${items
  .filter((i) => i.domain === 'auth')
  .map(
    (i) =>
      `- [${i.status.toUpperCase()}] **${i.id}: ${i.title}** (${i.standardRef}) - Severity: ${i.severity.toUpperCase()}\n  *Evidence:* ${i.evidenceNotes || 'None recorded'}\n  *Remediation:* ${i.remediationGuidance}`
  )
  .join('\n\n')}

### B. Input Validation
${items
  .filter((i) => i.domain === 'input_validation')
  .map(
    (i) =>
      `- [${i.status.toUpperCase()}] **${i.id}: ${i.title}** (${i.standardRef}) - Severity: ${i.severity.toUpperCase()}\n  *Evidence:* ${i.evidenceNotes || 'None recorded'}\n  *Remediation:* ${i.remediationGuidance}`
  )
  .join('\n\n')}

### C. Security Checks & Hardening
${items
  .filter((i) => i.domain === 'security_checks')
  .map(
    (i) =>
      `- [${i.status.toUpperCase()}] **${i.id}: ${i.title}** (${i.standardRef}) - Severity: ${i.severity.toUpperCase()}\n  *Evidence:* ${i.evidenceNotes || 'None recorded'}\n  *Remediation:* ${i.remediationGuidance}`
  )
  .join('\n\n')}

### D. Logging & Monitoring
${items
  .filter((i) => i.domain === 'logging')
  .map(
    (i) =>
      `- [${i.status.toUpperCase()}] **${i.id}: ${i.title}** (${i.standardRef}) - Severity: ${i.severity.toUpperCase()}\n  *Evidence:* ${i.evidenceNotes || 'None recorded'}\n  *Remediation:* ${i.remediationGuidance}`
  )
  .join('\n\n')}

### E. Security Awareness & Culture
${items
  .filter((i) => i.domain === 'awareness')
  .map(
    (i) =>
      `- [${i.status.toUpperCase()}] **${i.id}: ${i.title}** (${i.standardRef}) - Severity: ${i.severity.toUpperCase()}\n  *Evidence:* ${i.evidenceNotes || 'None recorded'}\n  *Remediation:* ${i.remediationGuidance}`
  )
  .join('\n\n')}

---
*Report certified by virtual internship project framework compliant with OWASP ASVS 4.0 and NIST SP 800-63B.*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataPackage = {
      projectMetadata: meta,
      auditItems: items,
      exportedAt: new Date().toISOString(),
      complianceRate,
      verificationHash,
    };
    const blob = new Blob([JSON.stringify(dataPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-submission-${meta.internId.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitProject = () => {
    const updated = { ...meta, submissionStatus: 'submitted' as const };
    onUpdateMeta(updated);
    setSubmissionSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Submission Portal Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Virtual Internship Milestone 5</span>
              <span aria-hidden="true">·</span>
              <span>Project Deliverable & Verification</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Virtual Internship Project Submission Portal
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Complete your auditor credentials, verify project scope documentation, and submit the final security assessment deliverable for academic evaluation and certificate generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download Project PDF'}</span>
            </button>
            {onOpenGitHubModal && (
              <button
                onClick={onOpenGitHubModal}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Push to GitHub</span>
              </button>
            )}
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Dossier</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Intern & Project Credential Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Auditor & System Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Intern Full Name</label>
              <input
                type="text"
                value={meta.internName}
                onChange={(e) => onUpdateMeta({ ...meta, internName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Intern Student ID</label>
              <input
                type="text"
                value={meta.internId}
                onChange={(e) => onUpdateMeta({ ...meta, internId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Target System Name</label>
              <input
                type="text"
                value={meta.targetSystemName}
                onChange={(e) => onUpdateMeta({ ...meta, targetSystemName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Faculty / Mentor Reviewer</label>
              <input
                type="text"
                value={meta.mentorName}
                onChange={(e) => onUpdateMeta({ ...meta, mentorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-400 font-medium">Organization / Lab</label>
              <input
                type="text"
                value={meta.organization}
                onChange={(e) => onUpdateMeta({ ...meta, organization: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-400 font-medium">Executive Audit Summary & Verdict</label>
              <textarea
                rows={4}
                value={meta.executiveSummary}
                onChange={(e) => onUpdateMeta({ ...meta, executiveSummary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submission Action */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Status:{' '}
              <span
                className={`font-semibold uppercase text-[11px] ${
                  submissionSuccess ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {submissionSuccess ? 'Submitted & Verified' : 'Draft / Ready for Submission'}
              </span>
            </div>

            <button
              onClick={handleSubmitProject}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submissionSuccess ? 'Re-Submit & Sign Dossier' : 'Submit Final Audit Dossier'}</span>
            </button>
          </div>
        </div>

        {/* Verification Certificate Artifact Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden space-y-4 shadow-lg shadow-indigo-950/20">
            {/* Background geometric emblem */}
            <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
              <ShieldCheck className="w-56 h-56 text-indigo-400" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400 font-semibold block">
                  Cybersecurity Virtual Internship
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">Certificate of Security Audit</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2 text-xs border-y border-slate-800/80 py-4">
              <p className="text-slate-300">
                This certifies that <strong className="text-white">{meta.internName}</strong> has completed a rigorous, practical application security audit of <strong className="text-white">{meta.targetSystemName}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Intern ID</span>
                  <span className="text-indigo-300 font-bold">{meta.internId}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Compliance Rate</span>
                  <span className="text-emerald-400 font-bold">{complianceRate}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Controls Verified</span>
                  <span className="text-white font-bold">{totalItems} Total</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Faculty Reviewer</span>
                  <span className="text-slate-300 truncate block">{meta.mentorName}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-mono text-slate-400">
              <span className="text-slate-500 block">Cryptographic Verification Signature:</span>
              <span className="text-indigo-400 break-all">{verificationHash}</span>
            </div>

            {submissionSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Officially Submitted & Verified on {meta.submissionDate}</span>
              </div>
            )}
          </div>

          {/* Quick Deliverable Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full sm:w-1/3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="w-full sm:w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Copied!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="w-full sm:w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>View & Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Import Saved Security Audit JSON</h3>
            <p className="text-xs text-slate-400">
              Paste the exported JSON submission package to restore full audit checklist items, assessor evidence notes, and project metadata.
            </p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON content here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(importJsonText);
                    onImportData(parsed);
                    setShowImportModal(false);
                    setImportJsonText('');
                  } catch (err: any) {
                    alert('Invalid JSON: ' + err.message);
                  }
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Load Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
