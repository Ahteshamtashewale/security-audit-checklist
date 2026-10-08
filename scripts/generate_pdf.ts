import fs from 'fs';
import path from 'path';
import { generateProjectPdf } from '../src/utils/pdfGenerator';
import { INITIAL_PROJECT_META, INITIAL_AUDIT_ITEMS } from '../src/data/defaultAuditData';

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const doc = generateProjectPdf(INITIAL_PROJECT_META, INITIAL_AUDIT_ITEMS);
  const pdfOutput = doc.output('arraybuffer');

  const outputPath = path.join(publicDir, 'Security_Audit_Project_Report.pdf');
  fs.writeFileSync(outputPath, Buffer.from(pdfOutput));

  console.log('Successfully generated PDF at:', outputPath);
}

main().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
