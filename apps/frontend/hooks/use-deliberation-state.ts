import { useReducer, useMemo } from 'react';
import { WithId, ObjectId } from 'mongodb';
import {
  JudgingDeliberation,
  AwardNames,
  PRELIMINARY_DELIBERATION_PICKLIST_LENGTH
} from '@lems/types';
import { reorder } from '@lems/utils/arrays';
import { fullMatch } from '@lems/utils/objects';

type DeliberationAwards = { [key in AwardNames]?: Array<ObjectId> };

interface ReducerActionParams {
  source: { name: string; index: number };
  destination: { name: string; index: number };
  teamId: string;
}

type ReducerActions =
  | { type: 'START' }
  | { type: 'LOCK' }
  | { type: 'SYNC'; newState: WithId<JudgingDeliberation> }
  | { type: 'REPLACE'; params: { award: AwardNames; list: Array<ObjectId> } }
  | { type: 'REORDER'; params: ReducerActionParams }
  | { type: 'ADD_TEAM'; params: ReducerActionParams }
  | { type: 'MOVE_TEAM'; params: ReducerActionParams }
  | { type: 'REMOVE_TEAM'; params: ReducerActionParams };

export interface DeliberationConfig {
  picklistLimits?: { [key in AwardNames]?: number };
  onStart?: (state: WithId<JudgingDeliberation>) => void;
  onLock?: (state: WithId<JudgingDeliberation>) => void;
}

export const useDeliberationState = (
  initialState: WithId<JudgingDeliberation>,
  config: DeliberationConfig
) => {
  const getPicklistLimit = (name: AwardNames) =>
    config.picklistLimits?.[name] ?? PRELIMINARY_DELIBERATION_PICKLIST_LENGTH;

  const deliberationReducer = (state: WithId<JudgingDeliberation>, action: ReducerActions) => {
    if (action.type === 'START') {
      if (config.onStart) config.onStart(state);
      return state;
    }
    if (action.type === 'LOCK') {
      if (config.onLock) config.onLock(state);
      return state;
    }
    if (action.type === 'SYNC') {
      if (fullMatch(state, action.newState)) return state;
      return action.newState;
    }
    if (action.type === 'REPLACE') {
      return { ...state, awards: { ...state.awards, [action.params.award]: action.params.list } };
    }

    const { awards } = state;
    const updateAwards = (updatedAwards: DeliberationAwards) => ({
      ...state,
      awards: { ...state.awards, ...updatedAwards }
    });
    const { source: _source, destination: _destination, teamId: _teamId } = action.params;
    const source = _source as unknown as { name: AwardNames; index: number };
    const destination = _destination as unknown as { name: AwardNames; index: number };
    const teamId = _teamId as unknown as ObjectId;

    switch (action.type) {
      case 'REORDER': {
        // console.log(source, destination);
        const copy = [...awards[destination.name]!];
        return updateAwards({ [destination.name]: reorder(copy, source.index, destination.index) });
      }
      case 'ADD_TEAM': {
        const copy = [...(awards[destination.name] ?? [])];
        if (copy.includes(teamId)) return state;
        if (copy.length >= getPicklistLimit(destination.name)) return state;
        copy.splice(destination.index, 0, teamId);
        return updateAwards({ [destination.name]: copy });
      }
      case 'REMOVE_TEAM': {
        const copy = [...awards[source.name]!];
        return updateAwards({ [source.name]: copy.filter(id => id !== teamId) });
      }
      case 'MOVE_TEAM': {
        const sourceCopy = [...awards[source.name]!];
        const destinationCopy = [...awards[destination.name]!];
        if (destinationCopy.includes(teamId)) return state;
        if (destinationCopy.length >= getPicklistLimit(destination.name)) return state;
        destinationCopy.splice(destination.index, 0, teamId);
        return updateAwards({
          [source.name]: sourceCopy.filter(id => id !== teamId),
          [destination.name]: destinationCopy
        });
      }
    }
  };

  const [_state, dispatch] = useReducer(deliberationReducer, initialState);
  const actions = useMemo(
    () => ({
      start: () => dispatch({ type: 'START' }),
      lock: () => dispatch({ type: 'LOCK' }),
      sync: (newState: WithId<JudgingDeliberation>) => dispatch({ type: 'SYNC', newState }),
      replace: (award: AwardNames, list: Array<ObjectId>) =>
        dispatch({ type: 'REPLACE', params: { award, list } }),
      reorder: (params: ReducerActionParams) => dispatch({ type: 'REORDER', params }),
      addTeam: (params: ReducerActionParams) => dispatch({ type: 'ADD_TEAM', params }),
      moveTeam: (params: ReducerActionParams) => dispatch({ type: 'MOVE_TEAM', params }),
      removeTeam: (params: ReducerActionParams) => dispatch({ type: 'REMOVE_TEAM', params })
    }),
    [dispatch]
  );

  return { state: _state, status: _state.status, stage: _state.stage, ...actions };
};

export type DeliberationStateAndActions = ReturnType<typeof useDeliberationState>;
