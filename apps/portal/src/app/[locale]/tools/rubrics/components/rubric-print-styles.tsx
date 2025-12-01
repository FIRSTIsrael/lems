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

        .judging-timer {
          display: none !important;
        }

        .MuiTableHead-root .MuiTableRow-root:first-child {
          display: none !important;
        }

        .MuiContainer-root {
          padding: 0 !important;
          margin: 0 !important;
          max-width: none !important;
        }

        .rubric-content {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .MuiTable-root {
          width: 90% !important;
          margin: 0 auto !important;
          table-layout: fixed !important;
        }

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

        .MuiPaper-root {
          box-shadow: none !important;
          border: 1px solid #ddd !important;
          border-radius: 0 !important;
        }

        .rubric-section {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .MuiTableCell-root {
          border: 1px solid #ddd !important;
          padding: 3px 4px !important;
          font-size: 8px !important;
          line-height: 1.2 !important;
          vertical-align: top !important;
          overflow: visible !important;
        }

        .MuiTableHead-root .MuiTableCell-root {
          padding: 4px 6px !important;
          font-size: 9px !important;
          font-weight: 600 !important;
        }

        .MuiTableCell-root h6,
        .MuiTableCell-root .MuiTypography-h6 {
          font-size: 9px !important;
          margin: 1px 0 !important;
          font-weight: 600 !important;
        }

        .MuiTableCell-root .MuiTypography-body2,
        .MuiTableCell-root .MuiTypography-body1 {
          font-size: 7px !important;
          line-height: 1.2 !important;
          margin: 0 !important;
        }

        .MuiFab-root {
          display: none !important;
        }

        .MuiTableHead-root {
          position: static !important;
        }

        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
        }

        @page {
          margin: 0.25in;
          size: A4;
        }

        .MuiButton-root {
          display: none !important;
        }

        .MuiTextField-root {
          pointer-events: none !important;
          width: 100% !important;
          margin: 0 !important;
        }

        .MuiTextField-root .MuiInputBase-root {
          border: 1px solid #ddd !important;
          background: transparent !important;
          font-size: 7px !important;
          width: 100% !important;
          min-height: 20px !important;
        }

        .MuiTextField-root input,
        .MuiTextField-root textarea {
          color: #000 !important;
          font-size: 7px !important;
          padding: 2px !important;
          width: 100% !important;
          box-sizing: border-box !important;
          min-height: 18px !important;
        }

        .MuiIconButton-root {
          pointer-events: none !important;
          padding: 2px !important;
        }

        .MuiSvgIcon-root {
          color: #000 !important;
          font-size: 14px !important;
        }

        .MuiIconButton-root .MuiSvgIcon-root {
          color: #000 !important;
        }
      }
    `}</style>
  );
};
