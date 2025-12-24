export interface HomepageEvent {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isFullySetUp: boolean;
  location: string;
  region: string;
  seasonId: string;
}

export type GetEventsQuery = {
  events: HomepageEvent[];
};

export type GetEventsQueryVariables = {
  fullySetUp?: boolean;
  startAfter?: string;
  startBefore?: string;
  endAfter?: string;
  endBefore?: string;
};
