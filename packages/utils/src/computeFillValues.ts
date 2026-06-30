interface RawCountyRow {
  county_fips: string
  county_name: string
  state_abbr: string
  agency_count: number
  senior_population: number
  agencies_per_1k_seniors: number
}

/** Normalizes agency density to a 0.0–1.0 fill scale across all counties.
 *  0.0 = lowest density (care desert). 1.0 = highest density in dataset.
 *  Uses agencies_per_1k_seniors so rural counties aren't penalized for low
 *  raw counts — a county with 2 agencies serving 500 seniors outranks one
 *  with 10 agencies serving 20,000.
 *  Call once at app load after parsing home_care_by_county.csv. */
export function computeFillValues(rows: RawCountyRow[]) {
  const maxDensity = Math.max(...rows.map(r => r.agencies_per_1k_seniors), 0.001)

  return rows.map(r => {
    const fillValue = r.agencies_per_1k_seniors / maxDensity

    return {
      fips:                 r.county_fips,
      name:                 r.county_name,
      state:                r.state_abbr,
      fillValue,
      agencyCount:          r.agency_count,
      agenciesPer1kSeniors: r.agencies_per_1k_seniors,
      seniorPopulation:     r.senior_population,
      tooltip: {
        headline: `${r.county_name}, ${r.state_abbr}`,
        stats: [
          { label: 'Home health agencies',    value: String(r.agency_count) },
          { label: 'Agencies per 1k seniors', value: r.agencies_per_1k_seniors.toFixed(1) },
          { label: 'Senior population',       value: r.senior_population.toLocaleString() },
        ],
        caveat: 'Counts reflect agency billing location, not service area. CMS 2023 data.',
      },
    }
  })
}
