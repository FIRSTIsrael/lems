export interface EventDetails {
  id: string;
  slug: string;
  name: string;
  isFullySetUp: boolean;
}

export type GetEventBySlugQueryResult = {
  event: EventDetails | null;
};

export type GetEventBySlugQueryVariables = {
  slug: string;
};
