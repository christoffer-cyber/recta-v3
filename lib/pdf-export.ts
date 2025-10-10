import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
}

/**
 * Export HTML element to PDF
 */
export async function exportToPDF(
  elementId: string,
  options: ExportOptions
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title page if provided
    if (options.title) {
      pdf.setFontSize(24);
      pdf.text(options.title, 20, 40);
      
      if (options.subtitle) {
        pdf.setFontSize(14);
        pdf.setTextColor(100);
        pdf.text(options.subtitle, 20, 55);
      }
      
      // Add Recta branding
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text('Skapad med Recta', 20, 280);
      pdf.text(new Date().toLocaleDateString('sv-SE'), 20, 285);
      
      pdf.addPage();
    }

    // Add content
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(options.filename);
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Export text content as formatted PDF
 */
export async function exportTextToPDF(
  content: string,
  options: ExportOptions
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  // Add title
  if (options.title) {
    pdf.setFontSize(20);
    pdf.text(options.title, margin, 30);
  }
  
  // Add subtitle
  if (options.subtitle) {
    pdf.setFontSize(12);
    pdf.setTextColor(100);
    pdf.text(options.subtitle, margin, 40);
  }
  
  // Add content
  pdf.setFontSize(11);
  pdf.setTextColor(0);
  
  const lines = pdf.splitTextToSize(content, maxWidth);
  let y = options.subtitle ? 55 : 45;
  
  lines.forEach((line: string) => {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += 7;
  });
  
  // Footer
  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(
      `Skapad med Recta • ${new Date().toLocaleDateString('sv-SE')}`,
      margin,
      pageHeight - 10
    );
    pdf.text(
      `Sida ${i} av ${pageCount}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
  }
  
  pdf.save(options.filename);
}

