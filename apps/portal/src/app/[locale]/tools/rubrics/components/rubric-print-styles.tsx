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
          margin: 0.5in;
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
          position: relative !important;
          left: 0 !important;
          right: 0 !important;
          width: 80% !important;
          margin-left: 10% !important;
          margin-right: 10% !important;
        }

        .MuiTable-root .MuiTableCell-root {
          border: 1px solid #333 !important;
          padding: 8px !important;
          font-size: 11px !important;
          line-height: 1.3 !important;
          vertical-align: top !important;
        }

        .MuiTableHead-root .MuiTableCell-root {
          background-color: #f5f5f5 !important;
          padding: 8px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          text-align: center !important;
        }

        .MuiTableCell-root .MuiTypography-h6 {
          font-size: 12px !important;
          margin: 2px 0 !important;
          font-weight: 600 !important;
        }

        .MuiTableCell-root .MuiTypography-body1,
        .MuiTableCell-root .MuiTypography-body2 {
          font-size: 11px !important;
          line-height: 1.3 !important;
          margin: 1px 0 !important;
        }

        .MuiTextField-root {
          pointer-events: none !important;
          margin: 2px 0 !important;
        }

        .MuiTextField-root input,
        .MuiTextField-root textarea {
          font-size: 10px !important;
          padding: 4px !important;
          min-height: 20px !important;
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
