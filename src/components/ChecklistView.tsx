import React, { useState } from 'react';
import { AuditItem, AuditDomain, AuditStatus, Severity } from '../types/audit';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  FlaskConical,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface ChecklistViewProps {
  items: AuditItem[];
  onUpdateItemStatus: (id: string, status: AuditStatus) => void;
  onUpdateItemNotes: (id: string, notes: string) => void;
  onLaunchSandbox: (domain: AuditDomain, labId?: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  items,
  onUpdateItemStatus,
  onUpdateItemNotes,
  onLaunchSandbox,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<AuditDomain | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AuditStatus | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(items[0]?.id || null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const domainLabels: Record<AuditDomain, string> = {
    auth: 'Authentication',
    input_validation: 'Input Validation',
    security_checks: 'Security Checks',
    logging: 'Logging',
    awareness: 'Awareness',
  };

  const filteredItems = items.filter((item) => {
    if (selectedDomain !== 'all' && item.domain !== selectedDomain) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.standardRef.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const passCount = items.filter((i) => i.status === 'pass').length;
  const failCount = items.filter((i) => i.status === 'fail').length;
  const warnCount = items.filter((i) => i.status === 'warning').length;
  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const compliancePercent = Math.round((passCount / items.length) * 100) || 0;

  const handleCopyCode = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Bar & Progress Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Security Audit Checklist</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>29 Evaluated Controls</span>
              <span aria-hidden="true">·</span>
              <span>OWASP ASVS 4.0 & NIST 800-63B Baseline</span>
              <span aria-hidden="true">·</span>
              <span>Virtual Internship Assessment</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Baseline Compliance</span>
              <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                {compliancePercent}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="font-bold">{passCount}</span> Pass
              </div>
              <div className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <span className="font-bold">{failCount}</span> Fail
              </div>
              <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <span className="font-bold">{warnCount}</span> Warn
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
                <span className="font-bold">{pendingCount}</span> Pending
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mt-4 flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(passCount / items.length) * 100}%` }}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(warnCount / items.length) * 100}%` }}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-300"
            style={{ width: `${(failCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Domain Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedDomain === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Domains ({items.length})
          </button>
          {(['auth', 'input_validation', 'security_checks', 'logging', 'awareness'] as AuditDomain[]).map(
            (domain) => {
              const count = items.filter((i) => i.domain === domain).length;
              return (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedDomain === domain
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {domainLabels[domain]} ({count})
                </button>
              );
            }
          )}
        </div>

        {/* Secondary Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, control title, or standard (e.g. NIST, OWASP, SQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="warning">Warning</option>
              <option value="pending">Pending</option>
              <option value="not_applicable">Not Applicable</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No Matching Audit Controls Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, domain filter, or status selections above.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-xl transition-all duration-150 ${
                  isExpanded ? 'border-indigo-500/40 shadow-sm' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span className="font-mono font-bold text-indigo-400">{item.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{domainLabels[item.domain]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{item.standardRef}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold uppercase text-[10px] ${
                          item.severity === 'critical'
                            ? 'text-rose-400'
                            : item.severity === 'high'
                            ? 'text-orange-400'
                            : item.severity === 'medium'
                            ? 'text-amber-400'
                            : 'text-sky-400'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  {/* Status Selector & Expand Toggle */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateItemStatus(item.id, e.target.value as AuditStatus)}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition-colors ${
                        item.status === 'pass'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : item.status === 'fail'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : item.status === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : item.status === 'not_applicable'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                      <option value="warning">Warning</option>
                      <option value="pending">Pending</option>
                      <option value="not_applicable">N/A</option>
                    </select>

                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs">
                    {/* Control Description */}
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Requirement & Scope:</span>
                      <p className="text-slate-400 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Step-by-Step Verification Procedure */}
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <span className="font-semibold text-white block">Audit Verification Steps:</span>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300">
                        {item.verificationSteps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Assessor Evidence & Observations Log */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">Assessor Findings & Audit Evidence:</span>
                        <span className="text-[11px] text-slate-500">Auto-saved to dossier</span>
                      </div>
                      <textarea
                        rows={3}
                        value={item.evidenceNotes}
                        onChange={(e) => onUpdateItemNotes(item.id, e.target.value)}
                        placeholder="Document observations, test payloads, endpoints verified, or failure evidence..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Remediation Guidance */}
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg space-y-2">
                      <span className="font-semibold text-indigo-300 block">Recommended Engineering Remediation:</span>
                      <p className="text-slate-300 leading-relaxed">{item.remediationGuidance}</p>

                      {item.remediationCodeSnippet && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <FileCode className="w-3 h-3" /> Secure Implementation Snippet
                            </span>
                            <button
                              onClick={() => handleCopyCode(item.id, item.remediationCodeSnippet!)}
                              className="hover:text-white flex items-center gap-1"
                            >
                              {copiedCodeId === item.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Snippet</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto whitespace-pre-wrap">
                            {item.remediationCodeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Sandbox Launcher */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Last assessed: <span className="font-mono text-slate-400">{item.lastUpdated}</span>
                      </span>

                      {item.sandboxLabId && (
                        <button
                          onClick={() => onLaunchSandbox(item.domain, item.sandboxLabId)}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Test in Live Sandbox</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
