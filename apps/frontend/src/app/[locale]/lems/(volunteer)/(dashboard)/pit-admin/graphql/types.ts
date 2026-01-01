export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  arrived: boolean;
}

export interface TeamEvent {
  teamId: string;
}
