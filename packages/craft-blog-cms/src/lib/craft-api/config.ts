/**
 * Derive the Craft Connect base URL from the environment.
 */
export function getConnectBaseUrl(): string {
  return process.env['NEXT_PUBLIC_CRAFT_CONNECT_URL'] || 'https://connect.craft.do'
}
