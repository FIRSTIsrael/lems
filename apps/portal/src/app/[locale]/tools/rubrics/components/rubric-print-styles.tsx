'use client';

export const RubricPrintStyles = () => {
  return (
    <style jsx global>{`
      @media print {
        .MuiAppBar-root,
        .rubric-header,
        .judging-timer,
        .MuiFab-root,
        .MuiButton-root {
          display: none !important;
        }

        .MuiTableHead-root .MuiTableRow-root:first-child {
          display: none !important;
        }

        @page {
          margin: 0.25in;
          size: A4;
        }

        .MuiContainer-root,
        .rubric-content {
          padding: 0 !important;
          margin: 0 !important;
          max-width: none !important;
          width: 100% !important;
        }

        .MuiTable-root {
          width: 90% !important;
          margin: 0 auto !important;
          table-layout: fixed !important;
        }

        .MuiTable-root .MuiTableCell-root {
          width: 25% !important;
          border: 1px solid #ddd !important;
          padding: 3px 4px !important;
          font-size: 8px !important;
          line-height: 1.2 !important;
          vertical-align: top !important;
        }

        .MuiTableHead-root .MuiTableCell-root {
          padding: 4px 6px !important;
          font-size: 9px !important;
          font-weight: 600 !important;
          position: static !important;
        }

        .MuiTableCell-root .MuiTypography-h6 {
          font-size: 9px !important;
          margin: 1px 0 !important;
          font-weight: 600 !important;
        }

        .MuiTableCell-root .MuiTypography-body1,
        .MuiTableCell-root .MuiTypography-body2 {
          font-size: 7px !important;
          line-height: 1.2 !important;
          margin: 0 !important;
        }

        .MuiTextField-root {
          pointer-events: none !important;
          margin: 0 !important;
        }

        .MuiTextField-root input,
        .MuiTextField-root textarea {
          font-size: 7px !important;
          padding: 2px !important;
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

        .MuiPaper-root {
          box-shadow: none !important;
          border-radius: 0 !important;
        }
      }
    `}</style>
  );
};
