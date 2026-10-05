const DEFAULT_GP_VALUE = 3;

/**
 * Computes the effective Gracious Professionalism (GP) score for a team,
 * accounting for no-show status and the event's "zero GP for no-shows" setting.
 *
 * - Missing/undefined/null GP values default to 3.
 * - If the team is a no-show and the setting is enabled, GP is forced to 0.
 * - If the team is a no-show but the setting is disabled, the default/explicit GP value is used.
 * - Otherwise, the explicit GP value is used as-is.
 */
export function getEffectiveGp(
  gpValue: number | undefined | null,
  isNoShow: boolean,
  zeroForNoShows: boolean
): number {
  if (isNoShow && zeroForNoShows) {
    return 0;
  }

  return gpValue ?? DEFAULT_GP_VALUE;
}
