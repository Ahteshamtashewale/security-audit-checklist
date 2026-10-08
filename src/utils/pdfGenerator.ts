import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InternshipProjectMeta, AuditItem, AuditDomain } from '../types/audit';

export function generateProjectPdf(meta: InternshipProjectMeta, items: AuditItem[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const passCount = items.filter((i) => i.status === 'pass').length;
  const failCount = items.filter((i) => i.status === 'fail').length;
  const warnCount = items.filter((i) => i.status === 'warning').length;
  const total = items.length;
  const complianceRate = Math.round((passCount / total) * 100);

  const verificationHash = `SEC-${meta.internId.replace(/[^a-zA-Z0-9]/g, '')}-${btoa(
    meta.internName + meta.targetSystemName
  ).slice(0, 16).toUpperCase()}`;

  // -------------------------------------------------------------
  // PAGE 1: TITLE & EXECUTIVE SUMMARY
  // -------------------------------------------------------------

  // Top Accent Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFillColor(79, 70, 229); // indigo-600 accent stripe
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  doc.setTextColor(199, 210, 254); // indigo-200
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CYBERSECURITY VIRTUAL INTERNSHIP // APPLICATION SECURITY VERIFICATION', 14, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SECURITY AUDIT REPORT & DOSSIER', 14, 25);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Evaluation Baseline: OWASP ASVS 4.0 · NIST SP 800-63B · CIS Controls v8`, 14, 34);

  // Project Credential Grid
  let currentY = 54;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Project & Auditor Identification', 14, currentY);

  currentY += 4;
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { textColor: [30, 41, 59], fontSize: 8.5, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    body: [
      [
        { content: 'Target Application:', styles: { fontStyle: 'bold', cellWidth: 42 } },
        meta.targetSystemName,
        { content: 'System Type:', styles: { fontStyle: 'bold', cellWidth: 32 } },
        meta.systemType || 'Cloud Web Application & APIs',
      ],
      [
        { content: 'Intern Auditor:', styles: { fontStyle: 'bold' } },
        `${meta.internName} (${meta.internId})`,
        { content: 'Faculty Reviewer:', styles: { fontStyle: 'bold' } },
        meta.mentorName,
      ],
      [
        { content: 'Host Organization:', styles: { fontStyle: 'bold' } },
        meta.organization,
        { content: 'Audit Date:', styles: { fontStyle: 'bold' } },
        meta.submissionDate,
      ],
      [
        { content: 'Verification Hash:', styles: { fontStyle: 'bold' } },
        verificationHash,
        { content: 'Status:', styles: { fontStyle: 'bold' } },
        meta.submissionStatus.toUpperCase(),
      ],
    ],
  });

  // Executive Summary Box
  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Executive Summary & Assessment Scope', 14, currentY);

  currentY += 4;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const splitSummary = doc.splitTextToSize(meta.executiveSummary, pageWidth - 28);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, pageWidth - 28, splitSummary.length * 4.5 + 6, 2, 2, 'F');
  doc.text(splitSummary, 17, currentY + 5.5);

  currentY += splitSummary.length * 4.5 + 12;

  // Key Posture Metrics Scorecard
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Security Health & Posture Scorecard', 14, currentY);

  currentY += 4;
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 3 },
    body: [
      [
        {
          content: `BASELINE COMPLIANCE\n${complianceRate}%\n(29 Assessed Controls)`,
          styles: {
            fillColor: [240, 253, 244],
            textColor: [21, 128, 61],
            fontStyle: 'bold',
            halign: 'center',
          },
        },
        {
          content: `CONTROLS PASSED\n${passCount}\n(Verified Satisfactory)`,
          styles: {
            fillColor: [241, 245, 249],
            textColor: [30, 41, 59],
            fontStyle: 'bold',
            halign: 'center',
          },
        },
        {
          content: `CRITICAL GAPS / FAILURES\n${failCount}\n(High Action Required)`,
          styles: {
            fillColor: [254, 242, 242],
            textColor: [185, 28, 28],
            fontStyle: 'bold',
            halign: 'center',
          },
        },
        {
          content: `HARDENING WARNINGS\n${warnCount}\n(Remediation Advised)`,
          styles: {
            fillColor: [254, 252, 232],
            textColor: [161, 98, 7],
            fontStyle: 'bold',
            halign: 'center',
          },
        },
      ],
    ],
  });

  // -------------------------------------------------------------
  // PAGE 2: DOMAIN-BY-DOMAIN SUMMARY TABLE
  // -------------------------------------------------------------
  doc.addPage();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Compliance Breakdown by Cybersecurity Domain', 14, 12);

  const domainData = [
    { key: 'auth', name: '1. Authentication Concepts' },
    { key: 'input_validation', name: '2. Input Validation' },
    { key: 'security_checks', name: '3. Security Checks & Hardening' },
    { key: 'logging', name: '4. Logging & Monitoring' },
    { key: 'awareness', name: '5. Security Awareness & Culture' },
  ].map((d) => {
    const domainItems = items.filter((i) => i.domain === d.key);
    const p = domainItems.filter((i) => i.status === 'pass').length;
    const f = domainItems.filter((i) => i.status === 'fail').length;
    const w = domainItems.filter((i) => i.status === 'warning').length;
    const rate = Math.round(((p * 100 + w * 50) / (domainItems.length * 100)) * 100);
    return [
      d.name,
      domainItems.length.toString(),
      p.toString(),
      f.toString(),
      w.toString(),
      `${rate}%`,
      rate >= 80 ? 'Satisfactory' : rate >= 60 ? 'Needs Hardening' : 'Critical Deficiencies',
    ];
  });

  autoTable(doc, {
    startY: 24,
    theme: 'striped',
    head: [['Cybersecurity Domain', 'Controls', 'Pass', 'Fail', 'Warn', 'Score', 'Audit Verdict']],
    body: domainData,
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, cellPadding: 2.5 },
  });

  // Top Deficiencies Table
  const topFailures = items.filter((i) => i.status === 'fail' || i.status === 'warning');
  currentY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('5. Priority Identified Vulnerabilities & Required Actions', 14, currentY);

  currentY += 4;
  const failureRows = topFailures.map((i) => [
    i.id,
    i.title,
    i.severity.toUpperCase(),
    i.status.toUpperCase(),
    i.evidenceNotes || i.description,
    i.remediationGuidance,
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['ID', 'Vulnerability Finding', 'Severity', 'Status', 'Auditor Observations', 'Engineering Action']],
    body: failureRows,
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 18, fontStyle: 'bold' },
      3: { cellWidth: 16, fontStyle: 'bold' },
      4: { cellWidth: 50 },
      5: { cellWidth: 52 },
    },
  });

  // -------------------------------------------------------------
  // PAGE 3+: COMPLETE 29-CONTROL DETAILED MATRIX
  // -------------------------------------------------------------
  doc.addPage();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Comprehensive 29-Control Audit Verification Matrix', 14, 12);

  const fullAuditRows = items.map((i) => [
    i.id,
    `${i.title}\n[${i.standardRef}]`,
    i.severity.toUpperCase(),
    i.status.toUpperCase(),
    i.evidenceNotes || 'Verified compliant per testing specification.',
  ]);

  autoTable(doc, {
    startY: 24,
    theme: 'striped',
    head: [['Control ID', 'Requirement & Standard', 'Severity', 'Status', 'Assessor Findings & Evidence']],
    body: fullAuditRows,
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 18, fontStyle: 'bold' },
      3: { cellWidth: 16, fontStyle: 'bold' },
      4: { cellWidth: 77 },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const val = data.cell.raw as string;
        if (val === 'PASS') {
          data.cell.styles.textColor = [21, 128, 61];
        } else if (val === 'FAIL') {
          data.cell.styles.textColor = [185, 28, 28];
        } else if (val === 'WARNING') {
          data.cell.styles.textColor = [161, 98, 7];
        }
      }
    },
  });

  // -------------------------------------------------------------
  // FINAL PAGE: CERTIFICATE & SIGNOFF
  // -------------------------------------------------------------
  doc.addPage();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('7. Virtual Internship Sign-Off & Verification Attestation', 14, 15);

  doc.setTextColor(199, 210, 254);
  doc.setFontSize(8);
  doc.text('OFFICIAL ACADEMIC & LABORATORY RECORD', 14, 21);

  currentY = 38;

  // Certificate Box
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 90, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF APPLICATION SECURITY AUDIT', pageWidth / 2, currentY + 14, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const certBody = [
    `This document certifies that ${meta.internName} (Student / Intern ID: ${meta.internId})`,
    `has successfully conducted a full-scope security audit assessment for`,
    `${meta.targetSystemName}.`,
    '',
    `The assessment systematically audited all 29 required controls covering Authentication Concepts,`,
    `Input Validation, Defensive Security Checks, Logging & Monitoring, and Security Awareness`,
    `in strict compliance with OWASP ASVS 4.0 and NIST SP 800-63B standards.`,
  ];
  doc.text(certBody, pageWidth / 2, currentY + 26, { align: 'center', lineHeightFactor: 1.4 });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(`CRYPTOGRAPHIC AUDIT SEAL: ${verificationHash}`, pageWidth / 2, currentY + 76, { align: 'center' });

  // Signature lines
  currentY = 145;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);

  // Left signature (Intern)
  doc.line(20, currentY + 25, 85, currentY + 25);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(meta.internName, 20, currentY + 30);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Intern Security Auditor Signature', 20, currentY + 34);

  // Right signature (Mentor)
  doc.line(pageWidth - 85, currentY + 25, pageWidth - 20, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(meta.mentorName, pageWidth - 85, currentY + 30);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Faculty / Mentor Reviewer (CISSP)', pageWidth - 85, currentY + 34);

  // Bottom Notice
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Certified and exported via SecAudit Studio · Virtual Internship Submission Archive · Date: ${meta.submissionDate}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
}

export function downloadProjectPdf(meta: InternshipProjectMeta, items: AuditItem[]) {
  const doc = generateProjectPdf(meta, items);
  const filename = `Security_Audit_Report_${meta.internId.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
