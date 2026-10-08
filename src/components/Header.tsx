import React from 'react';
import { ShieldCheck, Download, RefreshCw, FileText, Github, FileDown } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onDownloadPdf?: () => void;
  onOpenGitHubModal: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenReportModal,
  onDownloadPdf,
  onOpenGitHubModal,
  onResetData,
}) => {
  const navItems = [
    { id: 'checklist', label: 'Audit Checklist' },
    { id: 'sandbox', label: 'Testing Sandbox' },
    { id: 'workflow', label: 'Workflow Guide' },
    { id: 'posture', label: 'Security Posture' },
    { id: 'submission', label: 'Project Submission' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Zone (Single text element wordmark with shield icon) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            SecAudit Studio
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap text-sm ${
                  isActive
                    ? 'text-white border-b-2 border-indigo-500 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              title="Download Project PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Project PDF</span>
            </button>
          )}
          <button
            onClick={onOpenGitHubModal}
            title="Push to GitHub repository"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </button>
          <button
            onClick={onResetData}
            title="Reset audit checklist or reload defaults"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-900/90 py-2 px-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
                isActive ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
