/** Returns up to maxResults adjacent counties that have at least 1 home care agency.
 *  Used when the family's county is a care desert — surfaces the nearest non-desert options.
 *
 *  @param fips         FIPS of the desert county
 *  @param adjacency    Pre-indexed { [fips]: adjacentFips[] } — built from county-adjacency.csv
 *  @param countyByFips Pre-indexed { [fips]: CountyFeature } — built from computeFillValues()
 *  @param maxResults   Max results to return (default 5) */
export function getNearestCountiesWithAgencies(
  fips: string,
  adjacency: Record<string, string[]>,
  countyByFips: Record<string, { agencyCount?: number; [key: string]: unknown }>,
  maxResults = 5,
) {
  const adjacent = adjacency[fips] ?? []
  return adjacent
    .map(f => countyByFips[f])
    .filter((c): c is CountyFeature => !!c && (c.agencyCount ?? 0) > 0)
    .slice(0, maxResults)
}
