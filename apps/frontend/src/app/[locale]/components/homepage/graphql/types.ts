export interface HomepageEvent {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isFullySetUp: boolean;
  region: string;
  seasonName: string;
  official: boolean;
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
