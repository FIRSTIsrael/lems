'use client';

export const RubricPrintStyles = () => {
  return (
    <style jsx global>{`
      @media print {
        .MuiAppBar-root {
          display: none !important;
        }

        .rubric-header {
          display: none !important;
        }

        .MuiTableHead-root .MuiTableRow-root:first-child {
          display: none !important;
        }

        /* Control column widths for better proportions */
        .MuiTable-root .MuiTableCell-root:first-child {
          width: 50% !important;
          max-width: 50% !important;
        }

        .MuiTable-root .MuiTableCell-root:nth-child(2) {
          width: 17% !important;
          max-width: 17% !important;
        }

        .MuiTable-root .MuiTableCell-root:nth-child(3) {
          width: 17% !important;
          max-width: 17% !important;
        }

        .MuiTable-root .MuiTableCell-root:nth-child(4) {
          width: 16% !important;
          max-width: 16% !important;
        }

        /* Remove box shadows and borders for cleaner print */
        .MuiPaper-root {
          box-shadow: none !important;
          border: 1px solid #ddd !important;
          border-radius: 0 !important;
        }

        /* Prevent page breaks and make content more compact */
        .MuiTable-root,
        .MuiTableBody-root,
        .MuiTableRow-root {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        /* Optimize table cells for print - more compact */
        .MuiTableCell-root {
          border: 1px solid #ddd !important;
          padding: 3px 5px !important;
          font-size: 9px !important;
          line-height: 1.2 !important;
          vertical-align: top !important;
          overflow: visible !important;
        }

        /* Make header cells more compact */
        .MuiTableHead-root .MuiTableCell-root {
          padding: 4px 6px !important;
          font-size: 10px !important;
          font-weight: 600 !important;
        }

        /* Section headers - more compact */
        .MuiTableCell-root h6,
        .MuiTableCell-root .MuiTypography-h6 {
          font-size: 10px !important;
          margin: 1px 0 !important;
          font-weight: 600 !important;
        }

        /* Body text - more compact */
        .MuiTableCell-root .MuiTypography-body2,
        .MuiTableCell-root .MuiTypography-body1 {
          font-size: 8px !important;
          line-height: 1.2 !important;
          margin: 0 !important;
        }

        /* Hide any floating elements */
        .MuiFab-root {
          display: none !important;
        }

        /* Remove sticky positioning for print */
        .MuiTableHead-root {
          position: static !important;
        }

        /* Optimize typography for print - more compact */
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-size: 9px !important;
          line-height: 1.2 !important;
        }

        /* Smaller margins to fit more content */
        @page {
          margin: 0.25in;
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
