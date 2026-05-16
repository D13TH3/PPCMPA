// Mock data for Puerto Princesa MPA System

export interface MPA {
  id: string;
  name: string;
  type: 'core' | 'buffer' | 'multiple-use' | 'fishery-reserve';
  ordinanceNumber: string;
  dateEstablished: string;
  area: number; // in hectares
  coordinates: [number, number][];
  /** When set, map draws multiple disjoint rings as one MPA (e.g. West + East reef tables). First ring mirrors `coordinates`. */
  multiPolygonRings?: [number, number][][];
  barangay: string;
  status: 'active' | 'pending' | 'review';
  ecosystems: {
    mangrove: number;
    seagrass: number;
    coralReef: number;
  };
  /** Short plain-language summary for public map popups */
  publicDescription?: string;
  /** Establishment / management context for citizens */
  publicHistory?: string;
}

export interface Ordinance {
  id: string;
  number: string;
  title: string;
  dateEnacted: string;
  status: 'active' | 'amended' | 'repealed';
  mpaId?: string;
  summary: string;
}

export interface EffectivenessData {
  mpaId: string;
  mpaName: string;
  year: number;
  quarter: number;
  scores: {
    management: number;
    enforcement: number;
    community: number;
    ecological: number;
  };
  overall: number;
}

// Puerto Princesa coordinates: approximately 9.7°N, 118.7°E
// Source references for center points:
// - Puerto Princesa Bay: https://geohack.toolforge.org/geohack.php?pagename=List_of_bays_of_the_Philippines&params=9.7275_N_118.716111_E_region:PH_type:waterbody&title=Puerto+Princesa+Bay
// - Honda Bay: https://geohack.toolforge.org/geohack.php?pagename=List_of_bays_of_the_Philippines&params=9.900556_N_118.782778_E_region:PH_type:waterbody&title=Honda+Bay
// - Ulugan Bay: https://geohack.toolforge.org/geohack.php?pagename=List_of_bays_of_the_Philippines&params=10.085_N_118.796944_E_region:PH_type:waterbody&title=Ulugan+Bay
// - St Paul Bay: https://geohack.toolforge.org/geohack.php?pagename=List_of_bays_of_the_Philippines&params=10.229167_N_118.918333_E_region:PH_type:waterbody&title=Saint+Paul+Bay
// - Puerto Princesa Subterranean River NP: https://geohack.toolforge.org/geohack.php?pagename=List_of_World_Heritage_Sites_in_Southeast_Asia&params=10_10_0_N_118_55_0_E_region:PH_type:landmark&title=Puerto-Princesa+Subterranean+River+National+Park
// - Iwahig River mouth: https://waterwaymap.org/river/Iwahig%20River%20003604469037/
// Note: polygons below are local demo approximations around sourced centers, not legal boundary surveys.
export const mockMPAs: MPA[] = [
  {
    id: 'mpa-1',
    name: 'Puerto Princesa Bay Core Zone',
    type: 'core',
    ordinanceNumber: 'CO-142-2012',
    dateEstablished: '2012-03-15',
    area: 45.8,
    coordinates: [
      [9.7355, 118.7061],
      [9.7355, 118.7261],
      [9.7195, 118.7261],
      [9.7195, 118.7061],
      [9.7355, 118.7061]
    ],
    barangay: 'Puerto Princesa Bay',
    status: 'active',
    ecosystems: {
      mangrove: 12.3,
      seagrass: 18.5,
      coralReef: 15.0
    },
    publicDescription:
      'Nearshore core zone adjoining Puerto Princesa Bay, focused on reef and seagrass protection and small-scale regulated access.',
    publicHistory:
      'Declared to support coastal fisheries recovery and ecotourism; management involves barangay watch and city ENRO monitoring.'
  },
  {
    id: 'mpa-2',
    name: 'Honda Bay Fishery Reserve',
    type: 'fishery-reserve',
    ordinanceNumber: 'CO-089-2010',
    dateEstablished: '2010-08-22',
    area: 78.2,
    coordinates: [
      [9.9106, 118.7728],
      [9.9106, 118.7928],
      [9.8906, 118.7928],
      [9.8906, 118.7728],
      [9.9106, 118.7728]
    ],
    barangay: 'Honda Bay',
    status: 'active',
    ecosystems: {
      mangrove: 28.4,
      seagrass: 32.1,
      coralReef: 17.7
    },
    publicDescription:
      'Eastern Palawan fishery reserve associated with Honda Bay, protecting spawning grounds, coral patches, and island-mangrove corridors.',
    publicHistory:
      'Aligned with city coastal zoning; seasonal closures and gear rules may apply—verify current LGU advisories before fishing or boating.'
  },
  {
    id: 'mpa-3',
    name: 'Tagburos Nearshore Sanctuary',
    type: 'core',
    ordinanceNumber: 'CO-201-2016',
    dateEstablished: '2016-11-05',
    area: 62.5,
    coordinates: [
      [9.8310, 118.7342],
      [9.8310, 118.7542],
      [9.8110, 118.7542],
      [9.8110, 118.7342],
      [9.8310, 118.7342]
    ],
    barangay: 'Tagburos',
    status: 'active',
    ecosystems: {
      mangrove: 15.8,
      seagrass: 25.3,
      coralReef: 21.4
    },
    publicDescription:
      'Nearshore sanctuary north of the city center, combining reef flats and seagrass beds important to fish nurseries and turtles.',
    publicHistory:
      'Established through city ordinance with community stewardship; snorkeling and diving may be regulated—follow posted rules.'
  },
  {
    id: 'mpa-4',
    name: 'Ulugan Bay Buffer Zone',
    type: 'buffer',
    ordinanceNumber: 'CO-178-2014',
    dateEstablished: '2014-06-18',
    area: 95.3,
    coordinates: [
      [10.0950, 118.7869],
      [10.0950, 118.8069],
      [10.0750, 118.8069],
      [10.0750, 118.7869],
      [10.0950, 118.7869]
    ],
    barangay: 'Ulugan',
    status: 'active',
    ecosystems: {
      mangrove: 35.6,
      seagrass: 28.9,
      coralReef: 30.8
    },
    publicDescription:
      'Transitional buffer west of the city facing Ulugan Bay, easing pressure on core habitats while allowing some traditional use.',
    publicHistory:
      'Buffer design supports connectivity between mangrove-fringed bays and offshore reefs; enforcement is coordinated with BFAR and coast guard.'
  },
  {
    id: 'mpa-5',
    name: 'St Paul Bay Multi-Use Area',
    type: 'multiple-use',
    ordinanceNumber: 'CO-234-2018',
    dateEstablished: '2018-04-12',
    area: 112.7,
    coordinates: [
      [10.2392, 118.9083],
      [10.2392, 118.9283],
      [10.2192, 118.9283],
      [10.2192, 118.9083],
      [10.2392, 118.9083]
    ],
    barangay: 'St. Paul',
    status: 'active',
    ecosystems: {
      mangrove: 42.1,
      seagrass: 38.7,
      coralReef: 31.9
    },
    publicDescription:
      'Multi-use marine area near St. Paul Bay, balancing sustainable fishing, tourism, and habitat protection near the UNESCO river corridor.',
    publicHistory:
      'Management emphasizes zoned activities; this demo boundary is approximate—official maps are maintained by the city and PENRO/CENRO.'
  },
  {
    id: 'mpa-6',
    name: 'Iwahig Estuarine Reserve',
    type: 'core',
    ordinanceNumber: 'CO-267-2020',
    dateEstablished: '2020-09-28',
    area: 54.6,
    coordinates: [
      [9.7464, 118.6875],
      [9.7464, 118.7075],
      [9.7264, 118.7075],
      [9.7264, 118.6875],
      [9.7464, 118.6875]
    ],
    barangay: 'Iwahig',
    status: 'active',
    ecosystems: {
      mangrove: 18.2,
      seagrass: 20.5,
      coralReef: 15.9
    },
    publicDescription:
      'Estuarine and mangrove-linked reserve at the Iwahig river mouth, critical for sediment trapping, fisheries connectivity, and biodiversity.',
    publicHistory:
      'Recognized for relatively intact estuary habitat; ordinances address cutting, waste, and illegal structures along the banks and mudflats.'
  }
];

export const mockOrdinances: Ordinance[] = [
  {
    id: 'ord-1',
    number: 'CO-142-2012',
    title: 'Establishing Sta. Lourdes Marine Sanctuary',
    dateEnacted: '2012-03-15',
    status: 'active',
    mpaId: 'mpa-1',
    summary: 'An ordinance establishing the Sta. Lourdes Marine Sanctuary, defining its boundaries, and providing penalties for violations.'
  },
  {
    id: 'ord-2',
    number: 'CO-089-2010',
    title: 'Creating Bacungan Fishery Reserve',
    dateEnacted: '2010-08-22',
    status: 'active',
    mpaId: 'mpa-2',
    summary: 'An ordinance creating a fishery reserve in Barangay Bacungan to protect spawning grounds and juvenile fish habitat.'
  },
  {
    id: 'ord-3',
    number: 'CO-201-2016',
    title: 'Tagburos Marine Sanctuary Establishment',
    dateEnacted: '2016-11-05',
    status: 'active',
    mpaId: 'mpa-3',
    summary: 'Ordinance establishing marine sanctuary in Tagburos with strict no-take zones to preserve coral reef ecosystems.'
  },
  {
    id: 'ord-4',
    number: 'CO-178-2014',
    title: 'Macarascas Buffer Zone Designation',
    dateEnacted: '2014-06-18',
    status: 'active',
    mpaId: 'mpa-4',
    summary: 'Designating buffer zones in Macarascas to provide transitional area between core protection zones and fishing areas.'
  },
  {
    id: 'ord-5',
    number: 'CO-234-2018',
    title: 'Simpocan Multi-Use Marine Area',
    dateEnacted: '2018-04-12',
    status: 'active',
    mpaId: 'mpa-5',
    summary: 'Establishing multi-use area allowing sustainable fishing practices while protecting critical mangrove ecosystems.'
  },
  {
    id: 'ord-6',
    number: 'CO-267-2020',
    title: 'Marufinas Coastal Reserve Creation',
    dateEnacted: '2020-09-28',
    status: 'active',
    mpaId: 'mpa-6',
    summary: 'Creating coastal reserve with enhanced protection measures for sea turtle nesting sites and seagrass meadows.'
  },
  {
    id: 'ord-7',
    number: 'CO-312-2024',
    title: 'Amendment to MPA Management Guidelines',
    dateEnacted: '2024-02-14',
    status: 'active',
    summary: 'Amending previous ordinances to strengthen enforcement mechanisms and community participation requirements.'
  }
];

export const mockEffectivenessData: EffectivenessData[] = [
  {
    mpaId: 'mpa-1',
    mpaName: 'Sta. Lourdes Marine Sanctuary',
    year: 2025,
    quarter: 4,
    scores: {
      management: 85,
      enforcement: 78,
      community: 92,
      ecological: 88
    },
    overall: 85.75
  },
  {
    mpaId: 'mpa-2',
    mpaName: 'Bacungan Fishery Reserve',
    year: 2025,
    quarter: 4,
    scores: {
      management: 82,
      enforcement: 88,
      community: 85,
      ecological: 90
    },
    overall: 86.25
  },
  {
    mpaId: 'mpa-3',
    mpaName: 'Tagburos Marine Sanctuary',
    year: 2025,
    quarter: 4,
    scores: {
      management: 78,
      enforcement: 72,
      community: 80,
      ecological: 85
    },
    overall: 78.75
  },
  {
    mpaId: 'mpa-4',
    mpaName: 'Macarascas Buffer Zone',
    year: 2025,
    quarter: 4,
    scores: {
      management: 88,
      enforcement: 85,
      community: 88,
      ecological: 92
    },
    overall: 88.25
  },
  {
    mpaId: 'mpa-5',
    mpaName: 'Simpocan Multi-Use Area',
    year: 2025,
    quarter: 4,
    scores: {
      management: 75,
      enforcement: 70,
      community: 78,
      ecological: 82
    },
    overall: 76.25
  },
  {
    mpaId: 'mpa-6',
    mpaName: 'Marufinas Coastal Reserve',
    year: 2025,
    quarter: 4,
    scores: {
      management: 90,
      enforcement: 92,
      community: 95,
      ecological: 88
    },
    overall: 91.25
  }
];

// Historical data for trend analysis
export const historicalEffectiveness: EffectivenessData[] = [
  ...mockEffectivenessData.map(data => ({
    ...data,
    quarter: 3,
    scores: {
      management: data.scores.management - 3,
      enforcement: data.scores.enforcement - 2,
      community: data.scores.community - 4,
      ecological: data.scores.ecological - 1
    },
    overall: data.overall - 2.5
  })),
  ...mockEffectivenessData.map(data => ({
    ...data,
    quarter: 2,
    scores: {
      management: data.scores.management - 5,
      enforcement: data.scores.enforcement - 4,
      community: data.scores.community - 6,
      ecological: data.scores.ecological - 3
    },
    overall: data.overall - 4.5
  }))
];
