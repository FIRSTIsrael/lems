'use client';

import { useReducer, useMemo } from 'react';
import { SlideId } from '../components/deck';
import clamp from '../utils/clamp';

export const GOTO_FINAL_STEP = -Infinity;

export type DeckView = {
  slideId?: SlideId;
  slideIndex: number;
  stepIndex: number;
};
export type DeckState = {
  initialized: boolean;
  navigationDirection: number;
  activeView: DeckView;
  pendingView: DeckView;
};

export const initialDeckState: DeckState = {
  initialized: false,
  navigationDirection: 0,
  pendingView: {
    slideIndex: 0,
    stepIndex: 0
  },
  activeView: {
    slideIndex: 0,
    stepIndex: 0
  }
};

type ReducerActions =
  | { type: 'INITIALIZE_TO'; payload: Partial<DeckView> }
  | { type: 'SKIP_TO'; payload: Partial<DeckView> }
  | { type: 'STEP_FORWARD'; payload?: undefined }
  | { type: 'STEP_BACKWARD'; payload?: undefined }
  | { type: 'ADVANCE_SLIDE'; payload?: undefined }
  | { type: 'REGRESS_SLIDE'; payload?: Pick<DeckView, 'stepIndex'> }
  | { type: 'COMMIT_TRANSITION'; payload?: DeckView }
  | { type: 'CANCEL_TRANSITION'; payload?: undefined };

function deckReducer(state: DeckState, { type, payload = {} }: ReducerActions) {
  switch (type) {
    case 'INITIALIZE_TO':
      return {
        navigationDirection: 0,
        activeView: { ...state.activeView, ...payload },
        pendingView: { ...state.pendingView, ...payload },
        initialized: true
      };
    case 'SKIP_TO': {
      const navDir =
        'slideIndex' in payload && payload.slideIndex != null
          ? clamp(payload.slideIndex - state.activeView.slideIndex, -1, 1)
          : state.navigationDirection;
      return {
        ...state,
        navigationDirection: navDir,
        pendingView: { ...state.pendingView, ...payload }
      };
    }
    case 'STEP_FORWARD':
      return {
        ...state,
        navigationDirection: 1,
        pendingView: { ...state.pendingView, stepIndex: state.pendingView.stepIndex + 1 }
      };
    case 'STEP_BACKWARD':
      return {
        ...state,
        navigationDirection: -1,
        pendingView: { ...state.pendingView, stepIndex: state.pendingView.stepIndex - 1 }
      };
    case 'ADVANCE_SLIDE':
      return {
        ...state,
        navigationDirection: 1,
        pendingView: {
          ...state.pendingView,
          stepIndex: 0,
          slideIndex: state.pendingView.slideIndex + 1
        }
      };
    case 'REGRESS_SLIDE':
      return {
        ...state,
        navigationDirection: -1,
        pendingView: {
          ...state.pendingView,
          stepIndex: payload?.stepIndex ?? GOTO_FINAL_STEP,
          slideIndex: state.pendingView.slideIndex - 1
        }
      };
    case 'COMMIT_TRANSITION': {
      const newPendingView = { ...state.pendingView, ...payload };
      return {
        ...state,
        pendingView: newPendingView,
        activeView: { ...state.activeView, ...newPendingView }
      };
    }
    case 'CANCEL_TRANSITION':
      return {
        ...state,
        pendingView: { ...state.pendingView, ...state.activeView }
      };
    default:
      return state;
  }
}

export default function useDeckState(userProvidedInitialState: DeckView) {
  const [{ initialized, navigationDirection, pendingView, activeView }, dispatch] = useReducer(
    deckReducer,
    {
      initialized: initialDeckState.initialized,
      navigationDirection: initialDeckState.navigationDirection,
      pendingView: {
        ...initialDeckState.pendingView,
        ...userProvidedInitialState
      },
      activeView: {
        ...initialDeckState.activeView,
        ...userProvidedInitialState
      }
    }
  );
  const actions = useMemo(
    () => ({
      initializeTo: (payload: Partial<DeckView>) => dispatch({ type: 'INITIALIZE_TO', payload }),
      skipTo: (payload: Partial<DeckView>) => dispatch({ type: 'SKIP_TO', payload }),
      stepForward: () => dispatch({ type: 'STEP_FORWARD' }),
      stepBackward: () => dispatch({ type: 'STEP_BACKWARD' }),
      advanceSlide: () => dispatch({ type: 'ADVANCE_SLIDE' }),
      regressSlide: (payload?: Pick<DeckView, 'stepIndex'>) =>
        dispatch({ type: 'REGRESS_SLIDE', payload }),
      commitTransition: (payload?: DeckView) => dispatch({ type: 'COMMIT_TRANSITION', payload }),
      cancelTransition: () => dispatch({ type: 'CANCEL_TRANSITION' })
    }),
    [dispatch]
  );

  return {
    initialized,
    navigationDirection,
    pendingView,
    activeView,
    ...actions
  };
}

export type DeckStateAndActions = ReturnType<typeof useDeckState>;
