'use client';

export const ScorerPrintStyles = () => {
  return (
    <style jsx global>{`
      @media print {
        /* Hide app bar */
        .MuiAppBar-root {
          display: none !important;
        }

        /* Hide timer FAB */
        .MuiFab-root {
          display: none !important;
        }

        /* Hide score floater specifically by class */
        .score-floater,
        .score-floater *,
        [class*='score-floater'] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* Hide ALL Slide components (score floater uses Slide) */
        .MuiSlide-root,
        .MuiSlide-enter,
        .MuiSlide-enter-active,
        .MuiSlide-enter-done {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* Hide any fixed positioned elements */
        *[style*='position: fixed'],
        *[style*='position:fixed'] {
          display: none !important;
        }

        /* Hide score floater Stack specifically */
        .MuiStack-root[style*='position: fixed'],
        .MuiStack-root[style*='position:fixed'],
        .MuiPaper-root[style*='position: fixed'],
        .MuiPaper-root[style*='position:fixed'] {
          display: none !important;
        }

        /* Hide elements with z-index (all floating elements) */
        *[style*='z-index'],
        *[style*='zIndex'] {
          display: none !important;
        }

        /* Nuclear option - hide anything with bottom positioning */
        *[style*='bottom: 10'],
        *[style*='bottom:10'],
        *[style*='bottom: 16'],
        *[style*='bottom:16'] {
          display: none !important;
        }

        /* Ensure proper page margins */
        @page {
          margin: 0.5in;
        }

        /* Prevent page breaks in missions */
        .MuiPaper-root {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `}</style>
  );
};
