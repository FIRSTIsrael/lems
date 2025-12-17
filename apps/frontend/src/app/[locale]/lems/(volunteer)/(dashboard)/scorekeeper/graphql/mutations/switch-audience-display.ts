import { gql, TypedDocumentNode } from '@apollo/client';
import type { AudienceDisplayScreen, MatchEvent } from '../types';

interface SwitchAudienceDisplayMutationData {
  switchAudienceDisplay: MatchEvent;
}

interface SwitchAudienceDisplayMutationVars {
  divisionId: string;
  newDisplay: AudienceDisplayScreen;
}

export const SWITCH_AUDIENCE_DISPLAY_MUTATION: TypedDocumentNode<
  SwitchAudienceDisplayMutationData,
  SwitchAudienceDisplayMutationVars
> = gql`
  mutation SwitchAudienceDisplay($divisionId: String!, $newDisplay: AudienceDisplayScreen!) {
    switchActiveDisplay(divisionId: $divisionId, newDisplay: $newDisplay) {
      activeDisplay
      version
    }
  }
`;
