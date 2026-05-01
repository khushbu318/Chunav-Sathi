export interface ConstituencyInfo {
  id: string;
  name: string;
  state: string;
  stateName?: string;    // Full state name
  mpName: string;
  mpParty: string;
  mpPhotoUrl?: string;
  votes: number;
  voteShare: number;   // percent, e.g. 48.3
  margin: number;      // vote difference vs runner‑up
  turnout: number;     // percent
  phase: number;       // election phase 1‑7
  pinCode?: string;    // Postal code
  nextElectionDate?: string; // ISO date
  boothUrl?: string;   // pre‑filled ECI portal URL
}

export type PartyKey =
  | 'BJP'
  | 'INC'
  | 'SP'
  | 'BSP'
  | 'TMC'
  | 'AAP'
  | 'CPI'
  | 'CPM'
  | 'AITC'
  | 'JDU'
  | 'SHS'
  | 'NCP'
  | 'RJD'
  | 'YSR'
  | 'TDP'
  | 'DMK'
  | 'ADMK'
  | 'BRS'
  | 'SS'
  | 'NOTA'
  | 'IND'
  | 'OTHER';

export const PARTY_COLORS: Record<string, string> = {
  BJP:   '#FF6F00',
  INC:   '#1565C0',
  SP:    '#E53935',
  BSP:   '#1B5E20',
  TMC:   '#1E88E5',
  AITC:  '#1E88E5',
  AAP:   '#0097A7',
  CPI:   '#B71C1C',
  CPM:   '#C62828',
  JDU:   '#F9A825',
  SHS:   '#FF8F00',
  NCP:   '#00897B',
  RJD:   '#6A1B9A',
  YSR:   '#0288D1',
  TDP:   '#FFD600',
  DMK:   '#D50000',
  ADMK:  '#00C853',
  BRS:   '#E91E63',
  SS:    '#FF6D00',
  IND:   '#607D8B',
  OTHER: '#455A64',
  NOTA:  '#78909C',
};

export interface StateInfo {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  zoom: number;
}

export const STATES: StateInfo[] = [
  { id: 'AP', name: 'Andhra Pradesh',        center: { lat: 15.9129, lng: 79.7400 }, zoom: 7 },
  { id: 'AR', name: 'Arunachal Pradesh',     center: { lat: 28.2180, lng: 94.7278 }, zoom: 7 },
  { id: 'AS', name: 'Assam',                 center: { lat: 26.2006, lng: 92.9376 }, zoom: 7 },
  { id: 'BR', name: 'Bihar',                 center: { lat: 25.0961, lng: 85.3131 }, zoom: 7 },
  { id: 'CG', name: 'Chhattisgarh',          center: { lat: 21.2787, lng: 81.8661 }, zoom: 7 },
  { id: 'GA', name: 'Goa',                   center: { lat: 15.2993, lng: 74.1240 }, zoom: 9 },
  { id: 'GJ', name: 'Gujarat',               center: { lat: 22.2587, lng: 71.1924 }, zoom: 7 },
  { id: 'HR', name: 'Haryana',               center: { lat: 29.0588, lng: 76.0856 }, zoom: 8 },
  { id: 'HP', name: 'Himachal Pradesh',      center: { lat: 31.1048, lng: 77.1734 }, zoom: 8 },
  { id: 'JH', name: 'Jharkhand',             center: { lat: 23.6102, lng: 85.2799 }, zoom: 7 },
  { id: 'KA', name: 'Karnataka',             center: { lat: 15.3173, lng: 75.7139 }, zoom: 7 },
  { id: 'KL', name: 'Kerala',                center: { lat: 10.8505, lng: 76.2711 }, zoom: 7 },
  { id: 'MP', name: 'Madhya Pradesh',        center: { lat: 22.9734, lng: 78.6569 }, zoom: 7 },
  { id: 'MH', name: 'Maharashtra',           center: { lat: 19.7515, lng: 75.7139 }, zoom: 7 },
  { id: 'MN', name: 'Manipur',               center: { lat: 24.6637, lng: 93.9063 }, zoom: 8 },
  { id: 'ML', name: 'Meghalaya',             center: { lat: 25.4670, lng: 91.3662 }, zoom: 8 },
  { id: 'MZ', name: 'Mizoram',               center: { lat: 23.1645, lng: 92.9376 }, zoom: 8 },
  { id: 'NL', name: 'Nagaland',              center: { lat: 26.1584, lng: 94.5624 }, zoom: 8 },
  { id: 'OD', name: 'Odisha',                center: { lat: 20.9517, lng: 85.0985 }, zoom: 7 },
  { id: 'PB', name: 'Punjab',                center: { lat: 31.1471, lng: 75.3412 }, zoom: 8 },
  { id: 'RJ', name: 'Rajasthan',             center: { lat: 27.0238, lng: 74.2179 }, zoom: 7 },
  { id: 'SK', name: 'Sikkim',                center: { lat: 27.5330, lng: 88.5122 }, zoom: 9 },
  { id: 'TN', name: 'Tamil Nadu',            center: { lat: 11.1271, lng: 78.6569 }, zoom: 7 },
  { id: 'TG', name: 'Telangana',             center: { lat: 18.1124, lng: 79.0193 }, zoom: 7 },
  { id: 'TR', name: 'Tripura',               center: { lat: 23.9408, lng: 91.9882 }, zoom: 8 },
  { id: 'UP', name: 'Uttar Pradesh',         center: { lat: 26.8467, lng: 80.9462 }, zoom: 7 },
  { id: 'UK', name: 'Uttarakhand',           center: { lat: 30.0668, lng: 79.0193 }, zoom: 8 },
  { id: 'WB', name: 'West Bengal',           center: { lat: 22.9868, lng: 87.8550 }, zoom: 7 },
  { id: 'DL', name: 'Delhi',                 center: { lat: 28.7041, lng: 77.1025 }, zoom: 10 },
  { id: 'JK', name: 'Jammu & Kashmir',       center: { lat: 33.7782, lng: 76.5762 }, zoom: 7 },
  { id: 'LA', name: 'Ladakh',                center: { lat: 34.1526, lng: 77.5770 }, zoom: 7 },
];
