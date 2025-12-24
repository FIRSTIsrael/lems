import { gql, type TypedDocumentNode } from '@apollo/client';
import { ScoresheetClauseValue } from '@lems/shared/scoresheet';

type MissionClauseMutationResult = {
  updateScoresheetMissionClause: {
    scoresheetId: string;
    missionId: string;
    clauseIndex: number;
    clauseValue: boolean | string | number | null;
  };
};

type MissionClauseMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  value: ScoresheetClauseValue;
};

export const UPDATE_SCORESHEET_MISSION_CLAUSE_MUTATION: TypedDocumentNode<
  MissionClauseMutationResult,
  MissionClauseMutationVariables
> = gql`
  mutation UpdateScoresheetMissionClause(
    $divisionId: String!
    $scoresheetId: String!
    $missionId: String!
    $clauseIndex: Int!
    $value: JSON!
  ) {
    updateScoresheetMissionClause(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      missionId: $missionId
      clauseIndex: $clauseIndex
      value: $value
    ) {
      scoresheetId
      missionId
      clauseIndex
      clauseValue
    }
  }
`;
