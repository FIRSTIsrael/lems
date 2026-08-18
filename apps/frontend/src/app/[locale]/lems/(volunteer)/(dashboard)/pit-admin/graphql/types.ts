export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  arrived: boolean;
  logoUrl: string | null;
}

export interface TeamEvent {
  teamId: string;
}
