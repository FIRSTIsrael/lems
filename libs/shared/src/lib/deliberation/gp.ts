const DEFAULT_GP_VALUE = 3;

/** Missing GP defaults to 3; no-show + setting on forces 0. */
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
