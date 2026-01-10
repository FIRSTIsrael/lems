import { Response } from 'express';
import db from '../../../../../lib/database';
import { AdminDivisionRequest } from '../../../../../types/express';

export async function exportRubrics(req: AdminDivisionRequest, res: Response) {
  try {
    const divisionId = req.divisionId;
    const judgingCategory = req.query.category as string;

    if (!judgingCategory) {
      res.status(400).json({ error: 'Judging category is required' });
      return;
    }

    const rubrics = await db.rubrics.byDivision(divisionId).getAll();
    const filteredRubrics = rubrics.filter(r => r.category === judgingCategory);

    if (filteredRubrics.length === 0) {
      res.status(404).json({ error: 'No rubrics found for this category' });
      return;
    }

    res.contentType('application/pdf');
    res.set('Content-Disposition', `attachment; filename=rubrics-${judgingCategory}.pdf`);
    res.json({ message: 'PDF export would be generated here' });
  } catch (error) {
    console.error('Error exporting rubrics:', error);
    res.status(500).json({ error: 'Failed to export rubrics' });
  }
}
