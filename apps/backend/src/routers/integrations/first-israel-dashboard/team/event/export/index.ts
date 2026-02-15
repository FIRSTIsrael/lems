import express, { Response } from 'express';
import { FirstIsraelDashboardEventRequest } from '../../../../../../types/express';
import { getLemsWebpageAsPdf } from './util';

const router = express.Router({ mergeParams: true });

router.get('/rubrics', async (req: FirstIsraelDashboardEventRequest, res: Response) => {
  try {
    const pdf = await getLemsWebpageAsPdf(
      `/he/lems/export/${req.teamSlug}/${req.eventSlug}/rubrics`,
      {
        teamSlug: req.teamSlug,
        divsionId: req.divisionId
      }
    );

    res.contentType('application/pdf');
    res.send(pdf);
  } catch (error) {
    console.error(
      `[Export] Failed to generate rubrics PDF for team ${req.teamSlug} event ${req.eventSlug}:`,
      error instanceof Error ? error.message : String(error)
    );
    res.status(500).json({
      error: 'Failed to generate rubrics export PDF',
      details:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred. Check that all rubrics are approved and data is complete.'
    });
  }
});

router.get('/scoresheets', async (req: FirstIsraelDashboardEventRequest, res: Response) => {
  try {
    const pdf = await getLemsWebpageAsPdf(
      `/he/lems/export/${req.teamSlug}/${req.eventSlug}/scoresheets`,
      {
        teamSlug: req.teamSlug,
        divsionId: req.divisionId
      }
    );

    res.contentType('application/pdf');
    res.send(pdf);
  } catch (error) {
    console.error(
      `[Export] Failed to generate scoresheets PDF for team ${req.teamSlug} event ${req.eventSlug}:`,
      error instanceof Error ? error.message : String(error)
    );
    res.status(500).json({
      error: 'Failed to generate scoresheets export PDF',
      details:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred. Check that all scoresheets are submitted and data is complete.'
    });
  }
});
export default router;
