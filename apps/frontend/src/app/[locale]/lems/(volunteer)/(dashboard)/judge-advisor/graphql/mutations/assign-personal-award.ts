import { gql, TypedDocumentNode } from '@apollo/client';

interface AssignPersonalAwardVars {
  awardId: string;
  winnerName: string;
  divisionId: string;
}

interface AssignPersonalAwardData {
  assignPersonalAward: {
    awardId: string;
    winnerName: string;
  };
}

export const ASSIGN_PERSONAL_AWARD: TypedDocumentNode<
  AssignPersonalAwardData,
  AssignPersonalAwardVars
> = gql`
  mutation AssignPersonalAward($awardId: String!, $winnerName: String!, $divisionId: String!) {
    assignPersonalAward(awardId: $awardId, winnerName: $winnerName, divisionId: $divisionId) {
      awardId
      winnerName
    }
  }
`;
