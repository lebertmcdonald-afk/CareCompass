import type { ReactNode } from 'react'

/** One county rendered on the map. Shared shape for Door 1 (static) and Door 2 (live).
 *  Door-specific optional fields are only populated by the door that owns them.
 *  Full documentation: MapEngine_Interface_Contract.md */
export interface CountyFeature {
  fips: string      // 5-digit FIPS code (e.g. "04013" = Maricopa County AZ)
  name: string      // County name (e.g. "Maricopa County")
  state: string     // State abbreviation (e.g. "AZ")
  fillValue: number // 0.0–1.0: 0.0 = worst (desert / fully unassigned), 1.0 = best (well-served / fully assigned)

  // Door 1 fields — static CSV path (undefined in Door 2)
  agencyCount?: number
  agenciesPer1kSeniors?: number
  seniorPopulation?: number

  // Door 2 fields — Supabase live path (undefined in Door 1)
  unassignedCount?: number
  totalClients?: number
}

/** A pin overlaid on the map — demand signals from Door 1 or caregiver locations in Door 2. */
export interface OverlayPin {
  id: string
  lat: number
  lng: number
  type: 'caregiver' | 'demand-signal'
  label?: string
  countyFips?: string
}

/** One band in the color legend. Entries are evaluated highest minValue first. */
export interface ColorScaleEntry {
  label: string    // Human-readable label shown in the always-visible legend
  color: string    // Hex fill color for counties in this band
  minValue: number // Counties with fillValue >= this value fall into this band
}

/** Color scale used by MapEngine to fill counties and render the legend.
 *  entries must be sorted highest minValue first. */
export interface ColorScale {
  entries: ColorScaleEntry[]
  getColor: (fillValue: number) => string
}

export type MapMode = 'static' | 'live'
export type DataSource = 'static' | 'live'

/** Props for the shared MapEngine component.
 *  This interface is the single source of truth — changes require sign-off from both builders.
 *  Full contract: MapEngine_Interface_Contract.md */
export interface MapEngineProps {
  mode: MapMode
  counties: CountyFeature[]
  focusedCountyFips: string | null
  onCountyClick: (fips: string) => void
  overlayPins?: OverlayPin[]
  colorScale: ColorScale
  panelContent?: ReactNode
  isLoading?: boolean
  dataSource: DataSource
  disclaimerText?: string
}
