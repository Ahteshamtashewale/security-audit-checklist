import React, { useState } from 'react';
import { InternshipProjectMeta, AuditItem } from '../types/audit';
import { X, Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Check } from 'lucide-react';
import { downloadProjectPdf } from '../utils/pdfGenerator';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: InternshipProjectMeta;
  items: AuditItem[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  meta,
  items,
}) => {
  if (!isOpen) return null;

  const [downloading, setDownloading] = useState(false);

  const passCount = items.filter((i) => i.status === 'pass').length;
  const failCount = items.filter((i) => i.status === 'fail').length;
  const warnCount = items.filter((i) => i.status === 'warning').length;
  const total = items.length;
  const complianceRate = Math.round((passCount / total) * 100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      downloadProjectPdf(meta, items);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top bar controls */}
        <div className="no-print bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">Executive Security Audit Dossier</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Generating PDF...' : 'Download Project PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Audit Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200 text-xs leading-relaxed bg-slate-900">
          {/* Header block */}
          <div className="border-b border-slate-800 pb-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold tracking-wider text-xs uppercase">
                Application Security Audit & Verification Report
              </span>
              <span className="font-mono text-slate-500 text-[11px]">{meta.submissionDate}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{meta.targetSystemName}</h1>
            <p className="text-slate-400 text-xs">{meta.scopeDescription}</p>
          </div>

          {/* Intern Metadata & Reviewer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Intern Auditor</span>
              <span className="font-semibold text-white">{meta.internName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Student / Intern ID</span>
              <span className="font-mono text-indigo-300 font-semibold">{meta.internId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Faculty / Mentor</span>
              <span className="font-semibold text-white">{meta.mentorName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Baseline Posture</span>
              <span className="font-mono font-bold text-emerald-400">{complianceRate}% Pass</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Executive Audit Summary</h2>
            <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {meta.executiveSummary}
            </p>
          </div>

          {/* Core Posture Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Controls Passed</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {passCount} / {total}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Identified Failures</span>
              <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">{failCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Hardening Warnings</span>
              <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">{warnCount}</span>
            </div>
          </div>

          {/* Detailed Findings Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Control Verification Matrix (29 Security Criteria)
            </h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-mono text-[11px]">
                    <th className="p-3">Control ID</th>
                    <th className="p-3">Title & Standard</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Auditor Findings / Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-mono font-bold text-indigo-400 whitespace-nowrap">{item.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.standardRef}</div>
                      </td>
                      <td className="p-3 font-mono uppercase text-[10px]">
                        <span
                          className={
                            item.severity === 'critical'
                              ? 'text-rose-400'
                              : item.severity === 'high'
                              ? 'text-orange-400'
                              : 'text-amber-400'
                          }
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                            item.status === 'pass'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : item.status === 'fail'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 max-w-xs break-words">
                        {item.evidenceNotes || item.remediationGuidance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              <span>Certified under OWASP ASVS 4.0 & NIST SP 800-63B Framework Standards</span>
            </div>
            <div className="font-mono text-slate-400">
              Audit Seal Verification ID: SEC-HASH-{meta.internId.slice(0, 8)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
