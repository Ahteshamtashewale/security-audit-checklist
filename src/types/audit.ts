export type AuditDomain =
  | 'auth'
  | 'input_validation'
  | 'security_checks'
  | 'logging'
  | 'awareness';

export type AuditStatus = 'pass' | 'fail' | 'warning' | 'not_applicable' | 'pending';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export interface AuditItem {
  id: string;
  domain: AuditDomain;
  title: string;
  standardRef: string;
  description: string;
  severity: Severity;
  status: AuditStatus;
  verificationSteps: string[];
  evidenceNotes: string;
  remediationGuidance: string;
  remediationCodeSnippet?: string;
  testedInSandbox?: boolean;
  sandboxLabId?: string;
  lastUpdated: string;
}

export interface InternshipProjectMeta {
  targetSystemName: string;
  systemType: string;
  internName: string;
  internId: string;
  internshipTrack: string;
  mentorName: string;
  organization: string;
  scopeDescription: string;
  submissionDate: string;
  submissionStatus: 'draft' | 'ready_for_review' | 'submitted';
  executiveSummary: string;
}

export interface WorkflowMilestone {
  id: string;
  title: string;
  phase: string;
  description: string;
  tasks: string[];
  deliverable: string;
  completed: boolean;
}
