import type { JobDescription, CompensationAnalysis, InterviewQuestions, SuccessPlan } from './deliverable-schemas';

export function generateMarkdown(deliverables: {
  jobDescription?: JobDescription;
  compensation?: CompensationAnalysis;
  interviewQuestions?: InterviewQuestions;
  successPlan?: SuccessPlan;
}): string {
  const sections: string[] = [];

  // Header
  sections.push(`# Recta - AI Powered Organizational Intelligence
## Rekryteringsdeliverables

*Genererat: ${new Date().toLocaleDateString('sv-SE')}*

---

`);

  // Job Description
  if (deliverables.jobDescription) {
    const jd = deliverables.jobDescription;
    sections.push(`# ${jd.role.title}

## Översikt
${jd.overview}

## Ansvarsområden
${jd.responsibilities.map(r => `
### ${r.category}
${r.items.map(item => `- ${item}`).join('\n')}
`).join('\n')}

## Kvalifikationer

### Must-have
${jd.qualifications.mustHave.map(q => `- ${q}`).join('\n')}

### Nice-to-have
${jd.qualifications.niceToHave.map(q => `- ${q}`).join('\n')}

## Kompensation
- **Lön:** ${jd.compensation.baseSalary.min.toLocaleString('sv-SE')} - ${jd.compensation.baseSalary.max.toLocaleString('sv-SE')} ${jd.compensation.baseSalary.currency}
${jd.compensation.equity ? `- **Equity:** ${jd.compensation.equity}` : ''}
${jd.compensation.benefits ? `- **Förmåner:** ${jd.compensation.benefits}` : ''}

## 30-60-90 Day Plan

### 30 Dagar
${jd.successPlan.thirtyDays.map(item => `- ${item}`).join('\n')}

### 60 Dagar
${jd.successPlan.sixtyDays.map(item => `- ${item}`).join('\n')}

### 90 Dagar
${jd.successPlan.ninetyDays.map(item => `- ${item}`).join('\n')}

---
`);
  }

  // Compensation Analysis
  if (deliverables.compensation) {
    const comp = deliverables.compensation;
    sections.push(`# Löneanalys

## Marknadsdata
- **Roll:** ${comp.marketData.role}
- **Plats:** ${comp.marketData.location}
- **Bransch:** ${comp.marketData.industry}

## Benchmarks
- **25:e percentilen:** ${comp.benchmarks.percentile25?.toLocaleString('sv-SE')} SEK
- **Median:** ${comp.benchmarks.median.toLocaleString('sv-SE')} SEK
- **75:e percentilen:** ${comp.benchmarks.percentile75.toLocaleString('sv-SE')} SEK
- **90:e percentilen:** ${comp.benchmarks.percentile90?.toLocaleString('sv-SE')} SEK

## Rekommendation
- **Baslön:** ${comp.recommendation.baseSalary.min.toLocaleString('sv-SE')} - ${comp.recommendation.baseSalary.max.toLocaleString('sv-SE')} SEK
- **Target:** ${comp.recommendation.baseSalary.target.toLocaleString('sv-SE')} SEK
- **Total kostnad:** ${comp.recommendation.totalCost.total.toLocaleString('sv-SE')} SEK

**Positionering:** ${comp.recommendation.positioning}

**Motivering:** ${comp.recommendation.rationale}

---
`);
  }

  // Interview Questions
  if (deliverables.interviewQuestions) {
    const iq = deliverables.interviewQuestions;
    sections.push(`# Intervjufrågor: ${iq.role}

${iq.questions.map(q => `
## ${q.category}

**Fråga:** ${q.question}

**Vad att lyssna efter:**
${q.whatToListenFor.map(w => `- ${w}`).join('\n')}

**Röda flaggor:**
${q.redFlags.map(r => `- ${r}`).join('\n')}

${q.followUps ? `**Följdfrågor:**\n${q.followUps.map(f => `- ${f}`).join('\n')}` : ''}
`).join('\n')}

## Bedömningsvägledning

**Poängkriterier:**
${iq.assessmentGuidance.scoringCriteria.map(s => `- ${s}`).join('\n')}

**Jämförelsetips:**
${iq.assessmentGuidance.comparisonTips.map(t => `- ${t}`).join('\n')}

---
`);
  }

  // Success Plan
  if (deliverables.successPlan) {
    const sp = deliverables.successPlan;
    sections.push(`# Success Plan: ${sp.role}

## Översikt
${sp.overview}

## 30 Dagar
**Fokus:** ${sp.thirtyDays.focus}

**Mål:**
${sp.thirtyDays.objectives.map(o => `- ${o}`).join('\n')}

**Leverabler:**
${sp.thirtyDays.deliverables.map(d => `- ${d}`).join('\n')}

**Nyckelmöten:**
${sp.thirtyDays.keyMeetings.map(m => `- ${m}`).join('\n')}

## 60 Dagar
**Fokus:** ${sp.sixtyDays.focus}

**Mål:**
${sp.sixtyDays.objectives.map(o => `- ${o}`).join('\n')}

**Leverabler:**
${sp.sixtyDays.deliverables.map(d => `- ${d}`).join('\n')}

**Milstolpar:**
${sp.sixtyDays.keyMilestones.map(m => `- ${m}`).join('\n')}

## 90 Dagar
**Fokus:** ${sp.ninetyDays.focus}

**Mål:**
${sp.ninetyDays.objectives.map(o => `- ${o}`).join('\n')}

**Leverabler:**
${sp.ninetyDays.deliverables.map(d => `- ${d}`).join('\n')}

**Framgångsmått:**
${sp.ninetyDays.successMetrics.map(s => `- ${s}`).join('\n')}

## Support Behövs
${sp.supportNeeded.map(s => `- ${s}`).join('\n')}

---

*Genererat av Recta - AI Powered Organizational Intelligence*
`);
  }

  return sections.join('\n');
}

export function downloadMarkdown(markdown: string, filename?: string) {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const defaultFilename = `recta-deliverables-${timestamp}.md`;
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || defaultFilename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: any, filename?: string) {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const defaultFilename = `recta-deliverables-${timestamp}.json`;
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || defaultFilename;
  a.click();
  URL.revokeObjectURL(url);
}

// Advanced PDF export with Recta branding
export async function downloadPDF(deliverables: {
  jobDescription?: JobDescription;
  compensation?: CompensationAnalysis;
  interviewQuestions?: InterviewQuestions;
  successPlan?: SuccessPlan;
}, filename?: string) {
  // Dynamic import to avoid SSR issues
  const jsPDF = (await import('jspdf')).default;
  
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const defaultFilename = `recta-deliverables-${timestamp}.pdf`;
  
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color);
    
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.4) > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.4 + 5;
  };
  
  // Helper function to add section header
  const addSectionHeader = (text: string) => {
    yPosition += 10;
    addWrappedText(text, 14, true, '#1f2937');
    yPosition += 5;
  };
  
  // Helper function to add subsection header
  const addSubsectionHeader = (text: string) => {
    yPosition += 5;
    addWrappedText(text, 12, true, '#374151');
    yPosition += 3;
  };
  
  // Helper function to add bullet list
  const addBulletList = (items: string[]) => {
    items.forEach(item => {
      addWrappedText(`• ${item}`, 9, false, '#4b5563');
    });
  };
  
  // Header with Recta branding
  pdf.setFillColor(30, 58, 138); // Recta blue
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Recta - AI Powered Organizational Intelligence', margin, 16);
  
  pdf.setFontSize(10);
  pdf.text('Rekryteringsdeliverables', margin, 22);
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 40;
  
  // Date
  addWrappedText(`Genererat: ${new Date().toLocaleDateString('sv-SE')}`, 9, false, '#6b7280');
  yPosition += 10;
  
  // Job Description
  if (deliverables.jobDescription) {
    const jd = deliverables.jobDescription;
    
    addSectionHeader(jd.role.title);
    addWrappedText(jd.overview, 10);
    yPosition += 5;
    
    // Responsibilities
    addSubsectionHeader('Ansvarsområden');
    jd.responsibilities.forEach(resp => {
      addWrappedText(resp.category, 10, true, '#374151');
      addBulletList(resp.items);
    });
    
    // Qualifications
    addSubsectionHeader('Kvalifikationer');
    addWrappedText('Must-have:', 10, true);
    addBulletList(jd.qualifications.mustHave);
    addWrappedText('Nice-to-have:', 10, true);
    addBulletList(jd.qualifications.niceToHave);
    
    // Compensation
    addSubsectionHeader('Kompensation');
    addWrappedText(`Lön: ${jd.compensation.baseSalary.min.toLocaleString('sv-SE')} - ${jd.compensation.baseSalary.max.toLocaleString('sv-SE')} ${jd.compensation.baseSalary.currency}`, 10);
    if (jd.compensation.equity) {
      addWrappedText(`Equity: ${jd.compensation.equity}`, 10);
    }
    if (jd.compensation.benefits) {
      addWrappedText(`Förmåner: ${jd.compensation.benefits}`, 10);
    }
    
    // Success Plan
    addSubsectionHeader('30-60-90 Day Plan');
    addWrappedText('30 Dagar:', 10, true);
    addBulletList(jd.successPlan.thirtyDays);
    addWrappedText('60 Dagar:', 10, true);
    addBulletList(jd.successPlan.sixtyDays);
    addWrappedText('90 Dagar:', 10, true);
    addBulletList(jd.successPlan.ninetyDays);
  }
  
  // Compensation Analysis
  if (deliverables.compensation) {
    const comp = deliverables.compensation;
    
    addSectionHeader('Löneanalys');
    
    addSubsectionHeader('Marknadsdata');
    addWrappedText(`Roll: ${comp.marketData.role}`, 10);
    addWrappedText(`Plats: ${comp.marketData.location}`, 10);
    addWrappedText(`Bransch: ${comp.marketData.industry}`, 10);
    
    addSubsectionHeader('Benchmarks');
    addWrappedText(`25:e percentilen: ${comp.benchmarks.percentile25?.toLocaleString('sv-SE')} SEK`, 10);
    addWrappedText(`Median: ${comp.benchmarks.median.toLocaleString('sv-SE')} SEK`, 10);
    addWrappedText(`75:e percentilen: ${comp.benchmarks.percentile75.toLocaleString('sv-SE')} SEK`, 10);
    addWrappedText(`90:e percentilen: ${comp.benchmarks.percentile90?.toLocaleString('sv-SE')} SEK`, 10);
    
    addSubsectionHeader('Rekommendation');
    addWrappedText(`Baslön: ${comp.recommendation.baseSalary.min.toLocaleString('sv-SE')} - ${comp.recommendation.baseSalary.max.toLocaleString('sv-SE')} SEK`, 10);
    addWrappedText(`Target: ${comp.recommendation.baseSalary.target.toLocaleString('sv-SE')} SEK`, 10);
    addWrappedText(`Total kostnad: ${comp.recommendation.totalCost.total.toLocaleString('sv-SE')} SEK`, 10);
    addWrappedText(`Positionering: ${comp.recommendation.positioning}`, 10);
    addWrappedText(`Motivering: ${comp.recommendation.rationale}`, 10);
  }
  
  // Interview Questions
  if (deliverables.interviewQuestions) {
    const iq = deliverables.interviewQuestions;
    
    addSectionHeader(`Intervjufrågor: ${iq.role}`);
    
    iq.questions.forEach(q => {
      addSubsectionHeader(q.category);
      addWrappedText(q.question, 10, true);
      addWrappedText('Vad att lyssna efter:', 9, true);
      addBulletList(q.whatToListenFor);
      addWrappedText('Röda flaggor:', 9, true);
      addBulletList(q.redFlags);
      if (q.followUps) {
        addWrappedText('Följdfrågor:', 9, true);
        addBulletList(q.followUps);
      }
    });
    
    addSubsectionHeader('Bedömningsvägledning');
    addWrappedText('Poängkriterier:', 10, true);
    addBulletList(iq.assessmentGuidance.scoringCriteria);
    addWrappedText('Jämförelsetips:', 10, true);
    addBulletList(iq.assessmentGuidance.comparisonTips);
  }
  
  // Success Plan
  if (deliverables.successPlan) {
    const sp = deliverables.successPlan;
    
    addSectionHeader(`Success Plan: ${sp.role}`);
    addWrappedText(sp.overview, 10);
    
    // 30 Days
    addSubsectionHeader('30 Dagar');
    addWrappedText(`Fokus: ${sp.thirtyDays.focus}`, 10, true);
    addWrappedText('Mål:', 9, true);
    addBulletList(sp.thirtyDays.objectives);
    addWrappedText('Leverabler:', 9, true);
    addBulletList(sp.thirtyDays.deliverables);
    addWrappedText('Nyckelmöten:', 9, true);
    addBulletList(sp.thirtyDays.keyMeetings);
    
    // 60 Days
    addSubsectionHeader('60 Dagar');
    addWrappedText(`Fokus: ${sp.sixtyDays.focus}`, 10, true);
    addWrappedText('Mål:', 9, true);
    addBulletList(sp.sixtyDays.objectives);
    addWrappedText('Leverabler:', 9, true);
    addBulletList(sp.sixtyDays.deliverables);
    addWrappedText('Milstolpar:', 9, true);
    addBulletList(sp.sixtyDays.keyMilestones);
    
    // 90 Days
    addSubsectionHeader('90 Dagar');
    addWrappedText(`Fokus: ${sp.ninetyDays.focus}`, 10, true);
    addWrappedText('Mål:', 9, true);
    addBulletList(sp.ninetyDays.objectives);
    addWrappedText('Leverabler:', 9, true);
    addBulletList(sp.ninetyDays.deliverables);
    addWrappedText('Framgångsmått:', 9, true);
    addBulletList(sp.ninetyDays.successMetrics);
    
    // Support
    addSubsectionHeader('Support Behövs');
    addBulletList(sp.supportNeeded);
  }
  
  // Footer
  yPosition += 20;
  addWrappedText('Genererat av Recta - AI Powered Organizational Intelligence', 8, false, '#6b7280');
  
  // Save the PDF
  pdf.save(filename || defaultFilename);
}
