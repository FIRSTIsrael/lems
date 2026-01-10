import express, { Response } from 'express';
import { Parser, FieldInfo } from '@json2csv/plainjs';
import db from '../../../../../lib/database';
import { AdminDivisionRequest } from '../../../../../types/express';
import { exportRubrics } from './rubrics';

const router = express.Router({ mergeParams: true });

router.get('/scores', async (req: AdminDivisionRequest, res: Response) => {
  try {
    const divisionId = req.divisionId;

    const teams = await db.teams.byDivisionId(divisionId).getAll();
    const scoresheets = await db.scoresheets.byDivision(divisionId).getAll();
    const rankingScores = scoresheets.filter(s => s.stage === 'RANKING');

    const csvData = teams.map(team => {
      const teamScoresheets = rankingScores.filter(
        scoresheet => scoresheet.teamId === team.id
      );

      const scores = Object.fromEntries(
        teamScoresheets.map(scoresheet => [`round-${scoresheet.round}`, scoresheet.data?.score || 0])
      );

      const highestScore = Math.max(...Object.values(scores).map(score => score || 0));

      return {
        teamNumber: team.number,
        highestScore,
        ...scores
      };
    });

    const flattenScores = row => {
      return Object.keys(row)
        .filter(key => key.startsWith('round-'))
        .map(key => row[key]);
    };

    csvData.sort((a, b) => {
      const aScores = flattenScores(a);
      const bScores = flattenScores(b);
      for (let i = 0; i < Math.max(aScores.length, bScores.length); i++) {
        const aScore = aScores[i] || 0;
        const bScore = bScores[i] || 0;
        if (bScore !== aScore) return bScore - aScore;
      }
      return 0;
    });

    res.set('Content-Disposition', `attachment; filename=scores.csv`);
    res.set('Content-Type', 'text/csv');

    let fields: Array<string | FieldInfo<object, unknown>> = [
      { label: 'Team Number', value: 'teamNumber' },
      { label: 'Highest Score', value: 'highestScore' }
    ];

    const rankingRounds = [
      ...new Set(rankingScores.flatMap(s => s.round))
    ];

    const scoreFields = rankingRounds.map(round => ({
      label: `Round ${round}`,
      value: row => row[`round-${round}`]
    }));
    fields = fields.concat(scoreFields);

    const parser = new Parser({ fields });
    res.send(`\ufeff${parser.parse(csvData)}`);
  } catch (error) {
    console.error('Error exporting scores:', error);
    res.status(500).json({ error: 'Failed to export scores' });
  }
});

router.get('/rubrics', exportRubrics);

export default router;
