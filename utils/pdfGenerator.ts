import { useState } from 'react';

export interface ContentIdea {
  id: string;
  inspiration_id: string;
  title: string;
  description: string;
  hook?: string;
  visual_style?: string;
  content_angle?: string;
  target_audience?: string;
  predicted_performance_score?: number;
  rationale?: string;
  content_type?: string;
  platform?: string;
  tags?: string[] | Record<string, unknown> | null;
  is_starred?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PDFOptions {
  filename?: string;
  logoUrl?: string;
  includeScore?: boolean;
  includeRationale?: boolean;
  includeTags?: boolean;
}

/**
 * Generates a PDF from a content idea object
 * @param idea - The content idea object
 * @param options - Optional configuration
 * @returns Promise that resolves when PDF is generated
 */
export const generateContentIdeaPDF = async (
  idea: ContentIdea,
  options: PDFOptions = {}
): Promise<boolean> => {
  const {
    filename = `content-idea-${idea?.title?.replace(/[^a-z0-9]/gi, '_') || 'untitled'}.pdf`,
    logoUrl = '/Final Round AI.svg',
    includeScore = true,
    includeRationale = true,
    includeTags = true,
  } = options;

  // Load html2pdf if not already loaded
  if (!(window as unknown as { html2pdf?: unknown }).html2pdf) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  // Wait for library to initialize
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  if (!(window as unknown as { html2pdf?: unknown }).html2pdf) {
    throw new Error('html2pdf library failed to load');
  }

  // Generate the PDF content HTML
  const pdfContent = `
    <style>
      * {
        color: #1a1a1a !important;
        background: #fff !important;
        border-color: #d1d5db !important;
      }
      .pdf-badge-platform {
        background: #f3f4f6 !important;
        color: #374151 !important;
        border-color: #d1d5db !important;
      }
      .pdf-badge-content-type {
        background: #e5e7eb !important;
        color: #374151 !important;
        border-color: #d1d5db !important;
      }
      .pdf-badge-tag {
        background: #fef3c7 !important;
        color: #d97706 !important;
        border-color: #f59e0b !important;
      }
      .pdf-muted {
        color: #6b7280 !important;
      }
      .pdf-accent {
        color: #0ea5e9 !important;
        border-color: #0ea5e9 !important;
        background: #f0f9ff !important;
      }
    </style>
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; background: #fff; color: #1a1a1a; line-height: 1.6; min-height: 1000px;">
      <!-- Logo on its own line -->

        <img src="${logoUrl}" alt="Final Round AI Logo" style=" margin-bottom: 24px; margin-top: 8px;" />

      <!-- Header with Title and Score -->
      <div style="display: flex; align-items: center; margin-bottom: 24px; gap: 12px;">
        <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #1a1a1a; flex: 1;">${idea.title || 'Untitled Content Idea'}</h1>
        ${includeScore && idea.predicted_performance_score !== undefined ? `
          <div class="pdf-accent" style="background: #f0f9ff; border: 2px solid #0ea5e9; padding: 12px 16px; border-radius: 12px; text-align: center; min-width: 80px;">
            <div style="font-size: 24px; font-weight: bold; color: #0ea5e9; line-height: 1;">${idea.predicted_performance_score}</div>
            <div style="font-size: 12px; font-weight: 600; color: #0ea5e9; margin-top: 4px;">Score</div>
          </div>
        ` : ''}
      </div>
      <!-- Platform and Content Type Badges -->
      <div style="margin-bottom: 20px;">
        ${idea.platform ? `<span class="pdf-badge-platform" style="display: inline-block; padding: 6px 12px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-weight: 500; margin-right: 8px; text-transform: capitalize;">${idea.platform}</span>` : ''}
        ${idea.content_type ? `<span class="pdf-badge-content-type" style="display: inline-block; padding: 6px 12px; background: #e5e7eb; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-weight: 500;">${idea.content_type}</span>` : ''}
      </div>
      <!-- Created Date -->
      <div class="pdf-muted" style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
        Created: ${idea.created_at ? new Date(idea.created_at).toLocaleString() : 'N/A'}
      </div>
      <!-- Description -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">Description:</div>
        <div style="font-size: 15px; color: #374151; line-height: 1.6;">${idea.description || 'No description provided'}</div>
      </div>
      <!-- Hook and Visual Style Box -->
      ${(idea.hook || idea.visual_style) ? `
        <div style="background: #fffcf4; border: 2px dashed #d1d5db; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          ${idea.hook ? `
            <div style="margin-bottom: ${idea.visual_style ? '12px' : '0'};">
              <span style="font-size: 15px; color: #374151; margin-left: 8px;"><b>Hook:</b> ${idea.hook}</span>
            </div>
          ` : ''}
          ${idea.visual_style ? `
            <div>
              <span style="font-size: 15px; color: #374151; margin-left: 8px;"><b>Visual Style:</b> ${idea.visual_style}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
      <!-- Content Angle -->
      ${idea.content_angle ? `
        <div style="margin-bottom: 16px;">
          <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">Content Angle:</span>
          <span style="font-size: 15px; color: #374151; margin-left: 8px;">${idea.content_angle}</span>
        </div>
      ` : ''}
      <!-- Target Audience -->
      ${idea.target_audience ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">Audience:</div>
          <div style="font-size: 15px; color: #374151; line-height: 1.6;">${idea.target_audience}</div>
        </div>
      ` : ''}
      <!-- Rationale -->
      ${includeRationale && idea.rationale ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">Rationale:</div>
          <div style="font-size: 15px; color: #374151; line-height: 1.6;">${idea.rationale}</div>
        </div>
      ` : ''}
      <!-- Tags -->
      ${includeTags && idea.tags && Array.isArray(idea.tags) && idea.tags.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">Tags:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${(idea.tags as string[]).map(tag => `
              <span class="pdf-badge-tag" style="display: inline-block; padding: 4px 8px; background: #fef3c7; color: #d97706; border: 1px solid #f59e0b; border-radius: 4px; font-size: 12px; font-weight: 500;">
                ${typeof tag === 'string' ? (tag.startsWith('#') ? tag : `#${tag}`) : ''}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        Generated by Final Round AI
      </div>
    </div>
  `;

  // Create temporary element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = pdfContent;

  // PDF generation options
  const pdfOptions = {
    margin: [0.7, 0.5, 0.7, 0.5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'portrait',
    },
  };

  // Generate and download PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (window as any).html2pdf().set(pdfOptions).from(tempDiv).save();
  return true;
};

/**
 * Hook for using PDF generation in React components
 * @returns Object with generatePDF function and loading state
 */
export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async (idea: ContentIdea, options: PDFOptions = {}) => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateContentIdeaPDF(idea, options);
      return true;
    } catch (err) {
      console.error('PDF generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePDF, isGenerating, error };
}; 