# MapEngine Interface Contract — Care Compass Platform

Version 1.0 · June 29, 2026

This document is the authority on the shared `MapEngine` component interface.
**No changes to this contract or `MapEngine.types.ts` without sign-off from both Jillian and Lee.**

---

## Change Protocol

1. Identify the needed change. Document it here under "Proposed Changes" before writing any code.
2. Post in the shared channel with a link to this file and a description of the change.
3. Wait a minimum of 2 hours for the other builder to review and object.
4. If no objection: implement the change, update this file, update `MapEngine.types.ts`, commit.
5. If objection: discuss and resolve before implementation. Do not merge unilaterally.

**The data adapts to fit the contract. The contract does not adapt to fit the data.**

---

## Component Location

```
packages/ui/MapEngine.tsx       — component implementation
packages/ui/MapEngine.types.ts  — interface definitions (source of truth)
packages/ui/MapEngine.css       — scoped styles
packages/ui/index.ts            — barrel export
```

Import in either app:
```ts
import { MapEngine } from 'ui'
import type { MapEngineProps, CountyFeature, ColorScale } from 'ui'
```

---

## TypeScript Interface

```typescript
interface MapEngineProps {
  mode: 'static' | 'live'
  counties: CountyFeature[]
  focusedCountyFips: string | null
  onCountyClick: (fips: string) => void
  overlayPins?: OverlayPin[]
  colorScale: ColorScale
  panelContent?: ReactNode
  isLoading?: boolean
  dataSource: 'static' | 'live'
  disclaimerText?: string
}

interface CountyFeature {
  fips: string
  name: string
  state: string
  fillValue: number           // 0.0–1.0: 0.0 = worst, 1.0 = best

  // Door 1 only (undefined in Door 2)
  agencyCount?: number
  agenciesPer1kSeniors?: number
  seniorPopulation?: number

  // Door 2 only (undefined in Door 1)
  unassignedCount?: number
  totalClients?: number
}

interface OverlayPin {
  id: string
  lat: number
  lng: number
  type: 'caregiver' | 'demand-signal'
  label?: string
  countyFips?: string
}

interface ColorScaleEntry {
  label: string    // Text shown in legend alongside the swatch
  color: string    // Hex fill color
  minValue: number // fillValue >= this → this entry applies (highest wins)
}

interface ColorScale {
  entries: ColorScaleEntry[]  // Sorted highest minValue first
  getColor: (fillValue: number) => string
}
```

---

## fillValue Convention

`fillValue` is normalized 0.0–1.0 and means the same thing in both doors:
- **0.0 = worst / most urgent** (care desert or fully unassigned county)
- **1.0 = best / fully served** (maximum agencies or fully assigned county)

Door 1 derives fillValue:
```ts
fillValue = agencyCount / maxAgencyCountInDataset
// 0 agencies → 0.0 (desert). Max agencies → 1.0.
```

Door 2 derives fillValue:
```ts
fillValue = 1 - (unassignedCount / totalClients)
// All unassigned → 0.0 (urgent). All assigned → 1.0 (done).
```

Both doors pass the same `ColorScale` that maps low fillValue → red, high → green.

---

## Data Shapes by Door

### Door 1 — Static path (apps/compass)

Source: `packages/utils/assets/home_care_by_county.csv`

```ts
// After parsing CSV and calling computeFillValues():
const counties: CountyFeature[] = computeFillValues(parsedRows)
// Each row → { fips, name, state, fillValue, agencyCount, agenciesPer1kSeniors, seniorPopulation }

// Build lookup objects once at app load:
const countyByFips = Object.fromEntries(counties.map(c => [c.fips, c]))
const crosswalk: Record<string, string> = buildCrosswalkFromCsv(zipCrosswalkRows)
const adjacency: Record<string, string[]> = buildAdjacencyFromCsv(adjacencyRows)
```

### Door 2 — Live path (apps/console)

Source: Supabase `public.client_profiles`

```sql
SELECT
  cp.county_fips                                                    AS fips,
  cp.county_name                                                    AS name,
  cp.state_abbr                                                     AS state,
  COUNT(*) FILTER (WHERE cp.assigned_caregiver_id IS NULL)          AS unassigned_count,
  COUNT(*)                                                          AS total_clients
FROM public.client_profiles cp
GROUP BY cp.county_fips, cp.county_name, cp.state_abbr
ORDER BY unassigned_count DESC;
```

Transform to CountyFeature[] before passing to MapEngine:
```ts
const counties: CountyFeature[] = rows.map(row => ({
  fips:            row.fips,
  name:            row.name,
  state:           row.state,
  fillValue:       row.total_clients > 0
                     ? 1 - (row.unassigned_count / row.total_clients)
                     : 1,
  unassignedCount: row.unassigned_count,
  totalClients:    row.total_clients,
}))
```

---

## Shared Utility Signatures (packages/utils)

```typescript
// ZIP → county FIPS (returns null if not found)
function zipToCountyFips(
  zip: string,
  crosswalk: Record<string, string>
): string | null

// Normalize CSV rows to CountyFeature[] with computed fillValue
function computeFillValues(rows: RawCountyRow[]): CountyFeature[]

// Adjacent counties with agencies for desert county logic
function getNearestCountiesWithAgencies(
  fips: string,
  adjacency: Record<string, string[]>,
  countyByFips: Record<string, CountyFeature>,
  maxResults?: number
): CountyFeature[]
```

---

## Ownership

| File | Owner | Change rules |
|---|---|---|
| `MapEngine.types.ts` | Both | 2-hour sign-off window required |
| `MapEngine.tsx` | Both | Post in channel before changing |
| `MapEngine.css` | Both | Minor style changes OK; layout changes need discussion |
| `packages/utils/src/*` | Both | Changes that affect Door 1 need Lee sign-off; Door 2 need Jillian |

---

## Proposed Changes

*Add entries here before implementing. Remove after merge.*

*(none)*
