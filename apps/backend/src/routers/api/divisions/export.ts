import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import { Parser, FieldInfo } from '@json2csv/plainjs';
import * as db from '@lems/database';
import { JudgingCategory } from '@lems/types';
import { rubricsSchemas, RubricSchemaSection, RubricsSchema } from '@lems/season';
import { compareScoreArrays } from '@lems/utils/arrays';

const router = express.Router({ mergeParams: true });

router.get(
  '/rubrics/:judgingCategory',
  asyncHandler(async (req: Request, res: Response) => {
    const teams = await db.getDivisionTeams(new ObjectId(req.params.divisionId));
    const rubrics = (await db.getDivisionRubrics(new ObjectId(req.params.divisionId))).filter(
      rubric => rubric.category === req.params.judgingCategory
    );
    const scoresheets = (
      await db.getDivisionScoresheets(new ObjectId(req.params.divisionId))
    ).filter(scoresheet => scoresheet.stage === 'ranking');
    const schema: RubricsSchema<JudgingCategory> = rubricsSchemas[req.params.judgingCategory];
    if (!schema) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    const getGpScores = (teamId: ObjectId) =>
      Object.fromEntries(
        scoresheets
          .filter(scoresheet => scoresheet.teamId.toString() === teamId.toString())
          .map(scoresheet => [`gp-${scoresheet.round}`, scoresheet.data?.gp?.value])
      );

    const csvData = rubrics.map(rubric => {
      const values = rubric.data?.values;
      const team = teams.find(t => t._id.toString() === rubric.teamId.toString());

      if (!values) return { teamNumber: team?.number };
      Object.entries(values).forEach(([key, entry]) => {
        values[key] = entry.value;
      });

      return {
        teamNumber: team?.number,
        ...values,
        ...(req.params.judgingCategory === 'core-values' && {
          ...getGpScores(team._id),
          ...rubric.data.awards
        })
      };
    });

    res.set('Content-Disposition', `attachment; filename=${req.params.judgingCategory}.csv`);
    res.set('Content-Type', 'text/csv');

    let fields: Array<string | FieldInfo<object, unknown>> = [
      { label: 'מספר קבוצה', value: 'teamNumber' }
    ];

    fields = fields.concat(
      schema.sections.flatMap((section: RubricSchemaSection<JudgingCategory>) =>
        section.fields.map(field => ({
          label: field.title,
          value: field.id
        }))
      )
    );

    if (req.params.judgingCategory === 'core-values') {
      const rankingRounds = [
        ...new Set(scoresheets.filter(s => s.stage === 'ranking').flatMap(s => s.round))
      ];
      const gpFields = rankingRounds.map(round => ({
        label: `${round} מקצועיות אדיבה`,
        value: row => row[`gp-${round}`]
      }));
      fields = fields.concat(gpFields);

      const awardFields = schema.awards.map(award => ({ label: award.title, value: award.id }));
      fields = fields.concat(awardFields);
    }

    const parser = new Parser({ fields });
    res.send(`\ufeff${parser.parse(csvData)}`);
  })
);

router.get(
  '/scores',
  asyncHandler(async (req: Request, res: Response) => {
    const teams = await db.getDivisionTeams(new ObjectId(req.params.divisionId));
    const scoresheets = (
      await db.getDivisionScoresheets(new ObjectId(req.params.divisionId))
    ).filter(scoresheet => scoresheet.stage === 'ranking');

    const csvData = teams.map(team => {
      const teamScoresheets = scoresheets.filter(
        scoresheet => scoresheet.teamId.toString() === team._id.toString()
      );

      const scores = Object.fromEntries(
        teamScoresheets.map(scoresheet => [`round-${scoresheet.round}`, scoresheet.data?.score])
      );

      const highestScore = Math.max(...Object.values(scores).map(score => score || 0));

      return {
        teamNumber: team?.number,
        highestScore,
        ...scores
      };
    });

    const flattenScores = row => {
      return Object.keys(row)
        .filter(key => key.startsWith('round-'))
        .map(key => row[key]);
    };

    csvData.sort((a, b) => compareScoreArrays(flattenScores(a), flattenScores(b)));

    res.set('Content-Disposition', `attachment; filename=scores.csv`);
    res.set('Content-Type', 'text/csv');

    let fields: Array<string | FieldInfo<object, unknown>> = [
      { label: 'מספר קבוצה', value: 'teamNumber' },
      { label: 'ניקוד גבוה ביותר', value: 'highestScore' }
    ];

    const rankingRounds = [
      ...new Set(scoresheets.filter(s => s.stage === 'ranking').flatMap(s => s.round))
    ];

    const scoreFields = rankingRounds.map(round => ({
      label: `${round} מקצה`,
      value: row => row[`round-${round}`]
    }));
    fields = fields.concat(scoreFields);

    const parser = new Parser({ fields });
    res.send(`\ufeff${parser.parse(csvData)}`);
  })
);

export default router;
