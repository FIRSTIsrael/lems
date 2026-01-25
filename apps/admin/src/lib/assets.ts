const ADMIN_ASSETS_BASE_PATH = '/admin/assets';

/**
 * Get the full URL path for an admin asset
 * @param assetName - The name or relative path of the asset (e.g., 'FIRST-Logo.svg')
 * @returns The full asset URL path
 */
export function getAsset(assetName: string): string {
  return `${ADMIN_ASSETS_BASE_PATH}/${assetName}`;
}
