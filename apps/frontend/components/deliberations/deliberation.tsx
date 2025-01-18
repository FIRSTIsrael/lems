import React, {
  useEffect,
  createContext,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback
} from 'react';
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
import { getDefaultPicklistLimit } from '../../lib/utils/math';

export interface DeliberationContextType {
  deliberation: WithId<JudgingDeliberation>;
  teams: Array<DeliberationTeam>;
  awards: Array<WithId<Award>>;
  eligibleTeams: Array<ObjectId>;
  selectedTeams: Array<ObjectId>;
  availableTeams: Array<ObjectId>;
  additionalTeams: Array<WithId<Team>>;
  suggestedTeam: DeliberationTeam | null;
  picklistLimits: { [key in AwardNames]?: number };
  anomalies?: Array<DeliberationAnomaly>;
  categoryRanks?: { [key in JudgingCategory]: Array<ObjectId> };
  compareContextProps: {
    cvForms: Array<WithId<CoreValuesForm>>;
    rubrics: Array<WithId<Rubric<JudgingCategory>>>;
    scoresheets: Array<WithId<Scoresheet>>;
    rooms: Array<WithId<JudgingRoom>>;
    sessions: Array<WithId<JudgingSession>>;
    awards: Array<WithId<Award>>;
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
  onAddTeam: (team: WithId<Team>) => void;
  disqualifyTeam: (team: WithId<Team>) => void;
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
  checkEligibility: (
    team: WithId<Team>,
    teams: Array<DeliberationTeam>,
    disqualifications: Array<ObjectId>
  ) => boolean;
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
  awards: Array<WithId<Award>>;
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
      awards,
      onChange,
      onStart,
      onLock,
      checkEligibility,
      suggestTeam,
      endStage,
      updateTeamAwards,
      calculateAnomalies,
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

    const picklistLimits: { [key in AwardNames]?: number } = awards.reduce(
      (acc, award) => {
        // Category deliberations always return the default limit.
        // Don't calculate the limit for the category being deliberated.
        if (award.name === initialState.category) return acc;

        if (!acc[award.name]) acc[award.name] = 0;
        // Literally defined as 0 in the line above...
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

    const { stage, status, state, ...actions } = useDeliberationState(
      initialState,
      getDefaultPicklistLimit(allTeams.length),
      {
        onStart,
        onLock: lockWithAnomalies,
        picklistLimits
      }
    );

    useImperativeHandle(ref, () => ({ sync: actions.sync, stage, status }), [
      actions.sync,
      stage,
      status
    ]);

    useEffect(() => {
      const { _id, divisionId, ...rest } = state;
      onChange(rest);
    }, [onChange, state]);

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

    const teamWonAward = useCallback(
      (team: WithId<Team>) =>
        awards.find(
          award =>
            typeof award.winner !== 'string' &&
            award.name !== 'robot-performance' &&
            award.name !== 'advancement' &&
            award.winner?._id === team._id
        ),
      [awards]
    );

    const ineligibleTeams = useMemo(
      () =>
        teams
          .filter(
            team =>
              !team.registered ||
              state.disqualifications.includes(team._id) ||
              teamWonAward(team) ||
              !!rubrics.find(
                r => r.teamId === team._id && ['empty', 'in-progress'].includes(r.status)
              )
          )
          .map(team => team._id),
      [rubrics, state.disqualifications, teamWonAward, teams]
    );

    const eligibleTeams = useMemo(() => {
      // HACK: For some reason, if checkEligibility is not called once before actually using it, it will not work,
      // and return the 2nd team twice, eliminating the 1st team from the list of eligible teams.
      // Since this is a terrible idea to just throw out the best team from champions award, we call it once here.
      checkEligibility(teams[0], teams, state.disqualifications);

      return teams
        .filter(
          team =>
            !ineligibleTeams.includes(team._id) &&
            (checkEligibility(team, teams, state.disqualifications) ||
              state.manualEligibility?.includes(team._id))
        )
        .map(team => team._id);
    }, [
      teams,
      ineligibleTeams,
      checkEligibility,
      state.disqualifications,
      state.manualEligibility
    ]);

    const selectedTeams = [...new Set(Object.values(state.awards).flat(1))];
    const availableTeams = eligibleTeams.filter(teamId => !selectedTeams.includes(teamId));
    const additionalTeams = teams.filter(
      team => !(ineligibleTeams.includes(team._id) || eligibleTeams.includes(team._id))
    );

    const onAddTeam = (team: WithId<Team>) => {
      const updatedAddtionalTeams = [...(state.manualEligibility || []), team._id];
      onChange({ manualEligibility: updatedAddtionalTeams });
    };

    const disqualifyTeam = (team: WithId<Team>) => {
      if (!state.isFinalDeliberation) return; // DQs for category deliberations are handled by the JA UI
      const updatedDisqualification = [...(state.disqualifications || []), team._id];
      const updatedAwards = Object.entries(state.awards).reduce(
        (acc, [awardName, picklist]) => {
          acc[awardName as AwardNames] = picklist.includes(team._id)
            ? picklist.filter(id => id !== team._id)
            : [...picklist];
          return acc;
        },
        {} as { [key in AwardNames]: Array<ObjectId> }
      );
      onChange({ disqualifications: updatedDisqualification, awards: updatedAwards });
    };

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <DeliberationContext.Provider
          value={{
            deliberation: state,
            teams,
            awards,
            eligibleTeams,
            selectedTeams,
            availableTeams,
            additionalTeams,
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
            onAddTeam,
            disqualifyTeam,
            compareContextProps: { cvForms, rubrics, scoresheets, rooms, sessions, awards },
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

Deliberation.displayName = 'Deliberation';

export type DeliberationRef = Pick<DeliberationStateAndActions, 'sync' | 'stage' | 'status'>;
