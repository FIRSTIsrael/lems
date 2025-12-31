import { gql, TypedDocumentNode } from '@apollo/client';
import { QueryData, QueryVars } from './types';

export const GET_FIELD_SCHEDULE: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetFieldSchedule($divisionId: String!) {
    division(id: $divisionId) {
      id
      teams {
        id
        number
        name
        affiliation
        city
        region
        arrived
      }
      tables {
        id
        name
      }
      agendaEvents {
        id
        start
        end
        title
        visibility
      }
      field {
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          called
          participants {
            id
            team {
              id
              number
              name
            }
            table {
              id
              name
            }
            present
            queued
            ready
          }
        }
      }
    }
  }
`;

export function parseFieldScheduleData(data: QueryData) {
  return {
    teams: data.division.teams,
    tables: data.division.tables,
    matches: data.division.field.matches,
    agendaEvents: data.division.agendaEvents.filter(
      event => event.visibility === 'field' || event.visibility === 'public'
    )
  };
}
