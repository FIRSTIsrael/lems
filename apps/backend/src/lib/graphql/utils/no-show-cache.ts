import db from '../../database';

/**
 * Request-scoped cache for `getRankingNoShows()`.
 *
 * `Team.scoresheets` and `Field.scoresheets` resolvers both need the
 * division-wide no-show set to compute `Scoresheet.isNoShow`. Without this
 * cache, a query like `teams { scoresheets { isNoShow } }` would trigger one
 * `getRankingNoShows()` DB call per team (N+1) instead of once per division.
 *
 * Create one instance per GraphQL request (see `GraphQLContext`) so the
 * underlying query is deduplicated across all resolvers for that request,
 * without caching across requests (which could serve stale no-show data).
 */
export function createNoShowCache() {
  const cache = new Map<string, Promise<Set<string>>>();

  return {
    get(divisionId: string): Promise<Set<string>> {
      let pending = cache.get(divisionId);
      if (!pending) {
        pending = db.robotGameMatches.byDivision(divisionId).getRankingNoShows();
        cache.set(divisionId, pending);
      }
      return pending;
    }
  };
}

export type NoShowCache = ReturnType<typeof createNoShowCache>;
