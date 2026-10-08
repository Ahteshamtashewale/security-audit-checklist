import React from 'react';
import { WorkflowMilestone } from '../types/audit';
import { CheckCircle2, Circle, ArrowRight, BookOpen, ShieldCheck, FileCheck, Award, Layers } from 'lucide-react';

interface WorkflowViewProps {
  milestones: WorkflowMilestone[];
  onToggleMilestone: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  milestones,
  onToggleMilestone,
  onNavigateTab,
}) => {
  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="space-y-6">
      {/* Workflow Orientation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Virtual Internship Security Audit Workflow
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Standard operating procedure for performing a rigorous cybersecurity application audit. Follow these five documented phases to transition from initial threat scoping to final signed project submission.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-w-[200px] text-right">
            <span className="text-xs text-slate-500 block">Milestones Completed</span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-indigo-400 tabular-nums">
                {completedCount}
              </span>
              <span className="text-sm font-mono text-slate-500">/ {milestones.length}</span>
              <span className="text-xs text-slate-400 ml-2">({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Phases Detailed Cards */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          return (
            <div
              key={milestone.id}
              className={`bg-slate-900 border rounded-xl p-5 transition-all ${
                milestone.completed
                  ? 'border-indigo-500/30 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-indigo-400 font-bold">{milestone.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-300">{milestone.phase}</span>
                  </div>

                  <h3 className="text-base font-semibold text-white">{milestone.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{milestone.description}</p>

                  {/* Tasks List */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Core Internship Tasks:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {milestone.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <span className="text-indigo-400 font-mono mt-0.5 shrink-0">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverable Badge */}
                  <div className="pt-2 flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Milestone Deliverable:</span>
                    <span className="font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                      {milestone.deliverable}
                    </span>
                  </div>
                </div>

                {/* Completion Toggle */}
                <div className="sm:self-start shrink-0">
                  <button
                    onClick={() => onToggleMilestone(milestone.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      milestone.completed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {milestone.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Methodology Reference & Standards Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Industry Compliance Baseline References</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">OWASP ASVS 4.0</span>
            <p className="text-slate-400 leading-relaxed">
              Application Security Verification Standard. Provides a basis for testing web application technical security controls including Level 1 (opportunistic) and Level 2 (standard).
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">NIST SP 800-63B</span>
            <p className="text-slate-400 leading-relaxed">
              Digital Identity Guidelines for Authentication and Lifecycle Management. Governs password entropy, truncation bans, and out-of-band MFA authentication standards.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">CIS Critical Security Controls</span>
            <p className="text-slate-400 leading-relaxed">
              Prioritized set of defensive actions covering Access Control Management (Control 6), Audit Log Management (Control 8), and Security Awareness Training (Control 14).
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigateTab('submission')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <span>Proceed to Project Submission Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
