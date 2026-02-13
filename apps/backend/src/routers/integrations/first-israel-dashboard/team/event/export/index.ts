import express, { Response } from 'express';
import { FirstIsraelDashboardEventRequest } from '../../../../../../types/express';
import { getLemsWebpageAsPdf } from './util';

const router = express.Router({ mergeParams: true });

router.get('/rubrics', async (req: FirstIsraelDashboardEventRequest, res: Response) => {
  const pdf = await getLemsWebpageAsPdf(
    `/he/lems/export/${req.teamSlug}/${req.eventSlug}/rubrics`,
    {
      teamSlug: req.teamSlug,
      divsionId: req.divisionId
    }
  );

  res.contentType('application/pdf');
  res.send(pdf);
});

router.get('/scoresheets', async (req: FirstIsraelDashboardEventRequest, res: Response) => {
  const pdf = await getLemsWebpageAsPdf(
    `/he/lems/export/${req.teamSlug}/${req.eventSlug}/scoresheets`,
    {
      teamSlug: req.teamSlug,
      divsionId: req.divisionId
    }
  );

  res.contentType('application/pdf');
  res.send(pdf);
});
export default router;
