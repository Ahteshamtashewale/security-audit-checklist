import React, { useState } from 'react';
import { Github, GitBranch, Copy, Check, Terminal, ExternalLink, X, ShieldCheck } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('https://github.com/ahteshamtashewale/security-audit-checklist.git');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const gitPushScript = `# 1. Add your GitHub remote repository
git remote add origin ${repoUrl}

# 2. Ensure default branch is main
git branch -M main

# 3. Push code to GitHub
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Github className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Push to Your GitHub Repository</h3>
              <p className="text-[11px] text-slate-400">Git repository is already initialized on branch main</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Git Repository Status */}
        <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Active Branch</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1 mt-0.5">
              <GitBranch className="w-3 h-3" /> main
            </span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Tracked Files</span>
            <span className="text-emerald-400 font-bold mt-0.5 block">21 Files</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Git Status</span>
            <span className="text-white font-bold mt-0.5 block">Committed</span>
          </div>
        </div>

        {/* Step 1: Create repo */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Step 1: Create an empty repository on GitHub</span>
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
            >
              <span>Open github.com/new</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Name it e.g. <code className="text-indigo-300">security-audit-checklist</code>. Leave "Initialize with README" <strong>unchecked</strong> since this repository already has a comprehensive README.md and complete commit history.
          </p>
        </div>

        {/* Step 2: Configure Remote URL */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-white block">Step 2: Enter your GitHub Repository URL</label>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/security-audit-checklist.git"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Step 3: Commands */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Step 3: Run Push Commands</span>
            </span>
            <button
              onClick={() => copyToClipboard(gitPushScript, 'all')}
              className="hover:text-white flex items-center gap-1 text-[11px] text-slate-400"
            >
              {copiedCmd === 'all' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {gitPushScript}
          </pre>
        </div>

        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-200 leading-relaxed">
          <strong>Tip:</strong> If you'd like me to push directly from here, provide your GitHub Personal Access Token (PAT) with repo write permissions and I will execute the push command for you immediately!
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
