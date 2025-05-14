import { ObjectId } from 'mongodb';

// TODO: get season ID from crud through the FLL event when qierying a team, add to the team registration object

export interface TeamRegistration {
  teamId?: ObjectId; // TODO: MAKE THIS NOT OPTIONAL LATER
  divisionId: ObjectId;
  arrived: boolean;
  profileDocumentUrl?: string;

  //TODO: REMOVE LATER
  name: string;
  number: number;
  affiliation: {
    name: string;
    city: string;
  };
}
