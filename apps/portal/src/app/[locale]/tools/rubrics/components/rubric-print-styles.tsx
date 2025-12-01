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

       
    `}</style>
  );
};
