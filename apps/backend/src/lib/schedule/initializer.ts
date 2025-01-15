import { WithId } from 'mongodb';
import { Division, FllEvent } from '@lems/types';
import * as db from '@lems/database';
import { getDivisionUsers } from './division-users';
import { getDivisionRubrics } from './division-rubrics';
import { getInitialDivisionState, getDefaultDeliberations } from './parser';
import { getDivisionScoresheets } from './division-scoresheets';

export const initializeDivision = async (
  division: WithId<Division>,
  event: WithId<FllEvent>,
  isStaggered = true
) => {
  const dbTeams = await db.getDivisionTeams(division._id);
  const dbTables = await db.getDivisionTables(division._id);
  const dbRooms = await db.getDivisionRooms(division._id);
  const dbMatches = await db.getDivisionMatches(division._id.toString());

  console.log('📄 Generating rubrics');
  const rubrics = getDivisionRubrics(division, dbTeams);
  if (!(await db.addRubrics(rubrics)).acknowledged) throw new Error('Could not create rubrics!');
  console.log('✅ Generated rubrics');

  console.log('📄 Generating scoresheets');
  const scoresheets = getDivisionScoresheets(division, dbTeams, dbMatches);
  if (!(await db.addScoresheets(scoresheets)).acknowledged)
    throw new Error('Could not create scoresheets!');
  console.log('✅ Generated scoresheets!');

  console.log('👤 Generating division users');
  const users = getDivisionUsers(event, division, dbTables, dbRooms);
  if (!(await db.addUsers(users)).acknowledged) throw new Error('Could not create users!');
  console.log('✅ Generated division users');

  console.log('📄 Generating deliberations');
  const deliberations = getDefaultDeliberations(division);
  if (!(await db.addJudgingDeliberations(deliberations)).acknowledged)
    throw new Error('Could not create deliberations!');
  console.log('✅ Generated deliberations');

  console.log('🔐 Creating division state');
  if (!(await db.addDivisionState(getInitialDivisionState(division))).acknowledged)
    throw new Error('Could not create division state!');
  console.log('✅ Created division state');

  await db.updateDivision({ _id: division._id }, { hasState: true, staggered: isStaggered });
};
