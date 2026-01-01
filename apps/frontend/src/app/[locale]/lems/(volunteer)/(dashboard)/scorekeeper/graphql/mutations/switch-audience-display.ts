import { gql, TypedDocumentNode } from '@apollo/client';
import type { AudienceDisplayScreen } from '../types';

interface SwitchAudienceDisplayEvent {
  divisionId: string;
}

interface SwitchAudienceDisplayMutationData {
  switchAudienceDisplay: SwitchAudienceDisplayEvent;
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
    }
  }
`;
