/**
 * Derive the Craft Connect base URL from the environment.
 */
export function getConnectBaseUrl(): string {
 const baseUrl =
         process.env.NEXT_PUBLIC_CRAFT_CONNECT_URL?.trim() ||
         "https://connect.craft.do";
     return baseUrl.replace(/\/+$/, "");
}
