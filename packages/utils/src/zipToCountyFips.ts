/** Resolves a ZIP code string to a 5-digit county FIPS code.
 *  Returns null if ZIP is not found in the crosswalk.
 *  ZIPs spanning multiple counties resolve to the primary county per the crosswalk file.
 *
 *  @param zip       Raw ZIP input (may have whitespace)
 *  @param crosswalk Pre-indexed object { [zip]: fips } — build once at app load from zip-county-crosswalk.csv */
export function zipToCountyFips(
  zip: string,
  crosswalk: Record<string, string>,
): string | null {
  return crosswalk[zip.trim()] ?? null
}
