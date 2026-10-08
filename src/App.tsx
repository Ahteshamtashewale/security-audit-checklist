/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChecklistView } from './components/ChecklistView';
import { SandboxView } from './components/SandboxView';
import { WorkflowView } from './components/WorkflowView';
import { MetricsView } from './components/MetricsView';
import { SubmissionView } from './components/SubmissionView';
import { AuditReportModal } from './components/AuditReportModal';
import { GitHubModal } from './components/GitHubModal';
import { downloadProjectPdf } from './utils/pdfGenerator';
import {
  INITIAL_AUDIT_ITEMS,
  INITIAL_PROJECT_META,
  WORKFLOW_MILESTONES,
} from './data/defaultAuditData';
import { AuditItem, AuditStatus, AuditDomain, InternshipProjectMeta, WorkflowMilestone } from './types/audit';
import { CheckCircle2, Shield, AlertCircle } from 'lucide-react';

const STORAGE_KEY_ITEMS = 'sec_audit_items_v2';
const STORAGE_KEY_META = 'sec_audit_meta_v2';
const STORAGE_KEY_MILESTONES = 'sec_audit_milestones_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('checklist');
  const [items, setItems] = useState<AuditItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_ITEMS;
  });

  const [meta, setMeta] = useState<InternshipProjectMeta>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_META);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROJECT_META;
  });

  const [milestones, setMilestones] = useState<WorkflowMilestone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MILESTONES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return WORKFLOW_MILESTONES;
  });

  const [initialSandboxLab, setInitialSandboxLab] = useState<string>('auth');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
  }, [meta]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MILESTONES, JSON.stringify(milestones));
  }, [milestones]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateItemStatus = (id: string, status: AuditStatus) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  const handleUpdateItemNotes = (id: string, evidenceNotes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              evidenceNotes,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  const handleLaunchSandbox = (domain: AuditDomain, labId?: string) => {
    setInitialSandboxLab(domain);
    setCurrentTab('sandbox');
  };

  const handleRecordSandboxEvidence = (auditItemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === auditItemId) {
          const combined = item.evidenceNotes
            ? `${item.evidenceNotes}\n[Sandbox Evidence]: ${notes}`
            : `[Sandbox Evidence]: ${notes}`;
          return {
            ...item,
            evidenceNotes: combined,
            testedInSandbox: true,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
    showToast(`Test evidence recorded and attached to control ${auditItemId}!`);
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset checklist and project data to default internship starter?')) {
      setItems(INITIAL_AUDIT_ITEMS);
      setMeta(INITIAL_PROJECT_META);
      setMilestones(WORKFLOW_MILESTONES);
      localStorage.removeItem(STORAGE_KEY_ITEMS);
      localStorage.removeItem(STORAGE_KEY_META);
      localStorage.removeItem(STORAGE_KEY_MILESTONES);
      showToast('Project reset to initial internship assessment baseline.');
    }
  };

  const handleImportData = (imported: any) => {
    if (imported.auditItems && Array.isArray(imported.auditItems)) {
      setItems(imported.auditItems);
    }
    if (imported.projectMetadata) {
      setMeta(imported.projectMetadata);
    }
    showToast('Successfully imported project dossier!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onDownloadPdf={() => downloadProjectPdf(meta, items)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'checklist' && (
          <ChecklistView
            items={items}
            onUpdateItemStatus={handleUpdateItemStatus}
            onUpdateItemNotes={handleUpdateItemNotes}
            onLaunchSandbox={handleLaunchSandbox}
          />
        )}

        {currentTab === 'sandbox' && (
          <SandboxView
            initialLab={initialSandboxLab}
            onRecordEvidence={handleRecordSandboxEvidence}
          />
        )}

        {currentTab === 'workflow' && (
          <WorkflowView
            milestones={milestones}
            onToggleMilestone={handleToggleMilestone}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'posture' && (
          <MetricsView
            items={items}
            onNavigateToDomain={(domain) => {
              setCurrentTab('checklist');
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {currentTab === 'submission' && (
          <SubmissionView
            meta={meta}
            onUpdateMeta={setMeta}
            items={items}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Full-Screen Printable Report Modal */}
      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        meta={meta}
        items={items}
      />

      {/* GitHub Repository Modal */}
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </div>
  );
}
