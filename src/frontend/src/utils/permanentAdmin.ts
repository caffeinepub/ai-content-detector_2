/** Principal IDs that are always treated as admin, regardless of backend state. */
export const PERMANENT_ADMIN_PRINCIPALS: string[] = [
  "sfn6c-3cli6-35i3k-nw2vh-tglj4-jimy5-aijmf-xt5dk-u2wi6-agvj6-lae",
];

export function isPermanentAdmin(
  principalId: string | undefined | null,
): boolean {
  if (!principalId) return false;
  return PERMANENT_ADMIN_PRINCIPALS.includes(principalId);
}
