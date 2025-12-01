'use client';

export const RubricPrintStyles = () => {
  return (
    <style jsx global>{`
      @media print {
        /* Hide the app bar/navigation */
        .MuiAppBar-root {
          display: none !important;
        }

        /* Hide the rubric header with controls */
        .rubric-header {
          display: none !important;
        }

        /* Hide the judging timer */
        .judging-timer {
          display: none !important;
        }

        /* Hide the category navigation row in the table */
        .MuiTableHead-root .MuiTableRow-root:first-child {
          display: none !important;
        }

        /* Remove padding/margins for full-width print */
        .MuiContainer-root {
          padding: 0 !important;
          margin: 0 !important;
          max-width: none !important;
        }

        /* Ensure rubric content uses full page width */
        .rubric-content {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Optimize table layout for print */
        .MuiTable-root {
          width: 90% !important;
          margin: 0 auto !important;
          table-layout: fixed !important;
        }

        /* Control column widths for equal distribution */
        .MuiTable-root .MuiTableCell-root:first-child {
          width: 25% !important;
          max-width: 25% !important;
        }

        .MuiTable-root .MuiTableCell-root:nth-child(2) {
          width: 25% !important;
          max-width: 25% !important;
        }

        .MuiTable-root .MuiTableCell-root:nth-child(3) {
          width: 25% !important;
          max-width: 25% !important;
        }

        .MuiTable-root .MuiTableCell-root:nth-child(4) {
          width: 25% !important;
          max-width: 25% !important;
        }

        /* Remove box shadows and borders for cleaner print */
        .MuiPaper-root {
          box-shadow: none !important;
          border: 1px solid #ddd !important;
          border-radius: 0 !important;
        }

        /* Ensure proper page breaks for sections */
        .rubric-section {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Optimize table cells for print - balanced size */
        .MuiTableCell-root {
          border: 1px solid #ddd !important;
          padding: 6px 8px !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
          vertical-align: top !important;
          overflow: visible !important;
        }

        /* Make header cells readable */
        .MuiTableHead-root .MuiTableCell-root {
          padding: 8px 10px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }

        /* Section headers */
        .MuiTableCell-root h6,
        .MuiTableCell-root .MuiTypography-h6 {
          font-size: 12px !important;
          margin: 2px 0 !important;
          font-weight: 600 !important;
        }

        /* Body text */
        .MuiTableCell-root .MuiTypography-body2,
        .MuiTableCell-root .MuiTypography-body1 {
          font-size: 10px !important;
          line-height: 1.4 !important;
          margin: 1px 0 !important;
        }

        /* Hide any floating elements */
        .MuiFab-root {
          display: none !important;
        }

        /* Remove sticky positioning for print */
        .MuiTableHead-root {
          position: static !important;
        }

        /* Optimize typography for print */
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
        }

        /* Balanced margins for readability */
        @page {
          margin: 0.4in;
          size: A4;
        }

        /* Hide most interactive elements but keep rubric selection buttons */
        .MuiButton-root {
          display: none !important;
        }

        /* Show text fields but make them non-interactive and display their values */
        .MuiTextField-root {
          pointer-events: none !important;
          width: 100% !important;
          margin: 0 !important;
        }

        /* Style text field inputs for print - maintain table layout */
        .MuiTextField-root .MuiInputBase-root {
          border: 1px solid #ddd !important;
          background: transparent !important;
          font-size: 10px !important;
          width: 100% !important;
          min-height: auto !important;
        }

        /* Show the actual input text */
        .MuiTextField-root input,
        .MuiTextField-root textarea {
          color: #000 !important;
          font-size: 10px !important;
          padding: 4px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Keep IconButtons visible but make them non-interactive for rubric selections */
        .MuiIconButton-root {
          pointer-events: none !important;
          padding: 4px !important;
        }

        /* Ensure all icons in rubric are visible */
        .MuiSvgIcon-root {
          color: #000 !important;
          font-size: 18px !important;
        }

        /* Make sure checked icons are clearly visible */
        .MuiIconButton-root .MuiSvgIcon-root {
          color: #000 !important;
        }
      }
    `}</style>
  );
};
