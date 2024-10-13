import React, { useEffect, createContext, forwardRef, useImperativeHandle, useMemo } from 'react';
import { ObjectId, WithId } from 'mongodb';
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd';
import {
  JudgingDeliberation,
  Award,
  Team,
  Rubric,
  Scoresheet,
  JudgingCategory,
  JudgingRoom,
  JudgingSession,
  CoreValuesForm,
  CoreValuesAwards,
  AwardNames,
  DeliberationAnomaly
} from '@lems/types';
import {
  DeliberationStateAndActions,
  useDeliberationState
} from '../../hooks/use-deliberation-state';
import { DeliberationTeam, useDeliberationTeams } from '../../hooks/use-deliberation-teams';
import LockOverlay from '../../components/general/lock-overlay';

export interface DeliberationContextType {
  deliberation: WithId<JudgingDeliberation>;
  teams: Array<DeliberationTeam>;
  eligibleTeams: Array<ObjectId>;
  selectedTeams: Array<ObjectId>;
  availableTeams: Array<ObjectId>;
  suggestedTeam: DeliberationTeam | null;
  picklistLimits: { [key in AwardNames]?: number };
  anomalies?: Array<DeliberationAnomaly>;
  categoryRanks?: { [key in JudgingCategory]: Array<ObjectId> };
  compareContextProps: {
    cvForms: Array<WithId<CoreValuesForm>>;
    rubrics: Array<WithId<Rubric<JudgingCategory>>>;
    scoresheets: Array<WithId<Scoresheet>>;
  };
  start: () => void;
  lock: () => void;
  setPicklist: (award: AwardNames, list: Array<ObjectId>) => void;
  appendToPicklist: (award: AwardNames, teamId: ObjectId) => void;
  updateTeamAwards?: (
    teamId: ObjectId,
    rubricId: ObjectId,
    awards: { [key in CoreValuesAwards]: boolean }
  ) => void;
  calculateAnomalies?: (
    teams: Array<DeliberationTeam>,
    category: JudgingCategory,
    picklist: Array<ObjectId>
  ) => Array<DeliberationAnomaly>;
  endStage?: () => void;
}

export const DeliberationContext = createContext<DeliberationContextType>(null as any);

interface DeliberationProps {
  initialState: WithId<JudgingDeliberation>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  onChange: (value: Partial<JudgingDeliberation>) => void;
  checkEligibility: (team: WithId<Team>, teams: Array<DeliberationTeam>) => boolean;
  suggestTeam?: (
    teams: Array<DeliberationTeam>,
    category?: JudgingCategory
  ) => DeliberationTeam | null;
  updateTeamAwards?: (
    teamId: ObjectId,
    rubricId: ObjectId,
    awards: { [key in CoreValuesAwards]: boolean }
  ) => void;
  calculateAnomalies?: (
    teams: Array<DeliberationTeam>,
    category: JudgingCategory,
    picklist: Array<ObjectId>
  ) => Array<DeliberationAnomaly>;
  onStart?: (state: WithId<JudgingDeliberation>) => void;
  onLock?: (state: WithId<JudgingDeliberation>) => void;
  endStage?: (
    state: WithId<JudgingDeliberation>,
    eligibleTeams: Array<DeliberationTeam>,
    allTeams: Array<DeliberationTeam>
  ) => void;
  awards?: Array<WithId<Award>>;
  roomScores?: Array<any>;
  categoryRanks?: { [key in JudgingCategory]: Array<ObjectId> };
  robotConsistency?: Array<any>;
  anomalies?: Array<DeliberationAnomaly>;
  children?: React.ReactNode;
}

export const Deliberation = forwardRef<DeliberationRef, DeliberationProps>(
  (
    {
      initialState,
      teams: allTeams,
      sessions,
      rooms,
      rubrics,
      scoresheets,
      cvForms,
      onChange,
      onStart,
      onLock,
      checkEligibility,
      suggestTeam,
      endStage,
      updateTeamAwards,
      calculateAnomalies,
      awards = [],
      roomScores = [],
      anomalies = [],
      categoryRanks,
      robotConsistency,
      children
    },
    ref
  ) => {
    const teams = useDeliberationTeams(
      allTeams,
      sessions,
      rooms,
      rubrics,
      scoresheets,
      cvForms,
      roomScores,
      categoryRanks,
      robotConsistency
    );

    // limit is the number of awards with the same name for each award name
    const picklistLimits: { [key in AwardNames]?: number } = awards.reduce(
      (acc, award) => {
        if (!acc[award.name]) acc[award.name] = 0;
        acc[award.name]! += 1;
        return acc;
      },
      {} as { [key in AwardNames]?: number }
    );

    const lockWithAnomalies = (state: WithId<JudgingDeliberation>) => {
      const lockState = { ...state };
      if (state.category && calculateAnomalies) {
        lockState.anomalies = calculateAnomalies(
          teams,
          state.category,
          state.awards[state.category] || []
        );
      }
      onLock?.(lockState);
    };

    const { stage, status, state, ...actions } = useDeliberationState(initialState, {
      onStart,
      onLock: lockWithAnomalies
    });

    useImperativeHandle(ref, () => ({ sync: actions.sync, stage, status }), [
      actions.sync,
      stage,
      status
    ]);

    useEffect(() => {
      const { _id, divisionId, ...rest } = state;
      onChange(rest);
    }, [state]);

    const handleDragEnd: OnDragEndResponder = result => {
      if (!result.destination) return;
      const { source: _source, destination: _dest } = result;
      const destination = { name: _dest.droppableId, index: _dest.index };
      const source = { name: _source.droppableId, index: _source.index };
      const teamId = result.draggableId.split(':')[1];
      const params = { source, destination, teamId };

      if (destination.name === 'trash') {
        if (source.name === 'team-pool') return;
        actions.removeTeam(params);
        return;
      }

      switch (source.name) {
        case 'team-pool':
          actions.addTeam(params);
          break;
        case destination.name:
          actions.reorder(params);
          break;
        default:
          actions.moveTeam(params);
          break;
      }
    };

    const teamWonAward = (team: WithId<Team>) =>
      awards.find(
        award =>
          typeof award.winner !== 'string' &&
          award.name !== 'robot-performance' &&
          award.name !== 'advancement' &&
          award.winner?._id === team._id
      );

    const ineligibleTeams = teams
      .filter(
        team =>
          !team.registered ||
          state.disqualifications.includes(team._id) ||
          teamWonAward(team) ||
          !!rubrics.find(r => r.teamId === team._id && ['empty', 'in-progress'].includes(r.status))
      )
      .map(team => team._id);

    const eligibleTeams = useMemo(
      () =>
        teams
          .filter(team => !ineligibleTeams.includes(team._id) && checkEligibility(team, teams))
          .map(team => team._id),
      [state, awards]
    );

    const selectedTeams = [...new Set(Object.values(state.awards).flat(1))];
    const availableTeams = eligibleTeams.filter(teamId => !selectedTeams.includes(teamId));

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <DeliberationContext.Provider
          value={{
            deliberation: state,
            teams,
            eligibleTeams,
            selectedTeams,
            availableTeams,
            start: actions.start,
            lock: actions.lock,
            setPicklist: actions.replace,
            appendToPicklist: (award: AwardNames, teamId: ObjectId) =>
              actions.addTeam({
                teamId: String(teamId),
                source: { name: award, index: 0 },
                destination: { name: award, index: state.awards[award]?.length || 0 }
              }),
            suggestedTeam: suggestTeam
              ? suggestTeam(
                  teams.filter(t => availableTeams.includes(t._id)),
                  state.category
                )
              : null,
            updateTeamAwards,
            calculateAnomalies,
            compareContextProps: { cvForms, rubrics, scoresheets },
            picklistLimits,
            anomalies,
            categoryRanks,
            endStage: () =>
              endStage?.(
                state,
                teams.filter(t => eligibleTeams.includes(t._id)),
                teams
              )
          }}
        >
          {state.status === 'completed' && <LockOverlay />}
          {children}
        </DeliberationContext.Provider>
      </DragDropContext>
    );
  }
);

export type DeliberationRef = Pick<DeliberationStateAndActions, 'sync' | 'stage' | 'status'>;
