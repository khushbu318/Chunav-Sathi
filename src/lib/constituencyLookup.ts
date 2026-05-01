// Lean constituency lookup using free APIs - no backend needed

export interface PincodeLocation {
  state: string;
  district: string;
  taluk?: string;
}

export interface ConstituencyLookupResult {
  pincode: string;
  state: string;
  district: string;
  lsConstituency: string;
  vsConstituency?: string;
}

export interface MPDetails {
  name: string;
  party: string;
  photoUrl?: string;
  WikidataId?: string;
}

export interface ConstituencyData {
  name: string;
  state: string;
  mpName: string;
  mpParty: string;
  mpPhotoUrl?: string;
  turnout?: number;
  margin?: number;
  votes?: number;
  voteShare?: number;
}

/**
 * Step 1: Resolve pincode to state/district using postalpincode.in API
 * Free, no auth required
 */
export async function resolvePostalcode(pincode: string): Promise<PincodeLocation> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (!data[0] || !data[0].PostOffice || data[0].PostOffice.length === 0) {
      throw new Error('Pincode not found');
    }

    const postal = data[0].PostOffice[0];
    return {
      state: postal.State,
      district: postal.District,
      taluk: postal.Division
    };
  } catch (error) {
    console.error('Postalpincode API error:', error);
    throw new Error('Failed to resolve pincode. Please check and try again.');
  }
}

/**
 * Step 2: Lookup constituency from local pincode map
 * Loads bundled JSON file - instant lookup, no network
 */
export async function lookupConstituency(
  pincode: string,
  pincodeMap: Record<string, any>
): Promise<ConstituencyLookupResult | null> {
  try {
    const entry = pincodeMap[pincode];
    if (!entry) return null;

    return {
      pincode,
      state: entry.state || entry.STATE || '',
      district: entry.district || entry.DISTRICT || '',
      lsConstituency: entry.ls_constituency || entry.LOK_SABHA_CONSTITUENCY || '',
      vsConstituency: entry.vs_constituency || entry.VIDHAN_SABHA_CONSTITUENCY
    };
  } catch (error) {
    console.error('Constituency lookup error:', error);
    return null;
  }
}

/**
 * Step 3: Query Wikidata for MP details using SPARQL
 * Free, no API key needed, returns live data
 * Example: Get MP for constituency "Mumbai South"
 */
export async function fetchMPDataFromWikidata(
  constituencyName: string
): Promise<MPDetails | null> {
  try {
    // SPARQL query to find MP for a Lok Sabha constituency
    const query = `
      SELECT ?mp ?mpLabel ?party ?partyLabel ?photo WHERE {
        ?constituency wdt:P31 wd:Q44731786 .
        ?constituency rdfs:label "${constituencyName}"@en .
        ?mp wdt:P39 ?position .
        ?position wdt:P279 wd:Q17275659 .
        ?mp wdt:P102 ?party .
        OPTIONAL { ?mp wdt:P18 ?photo }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
      }
      LIMIT 1
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);
    const data: any = await response.json();

    if (!data.results || data.results.bindings.length === 0) {
      return null;
    }

    const binding = data.results.bindings[0];
    return {
      name: binding.mpLabel?.value || 'Unknown',
      party: binding.partyLabel?.value || 'Unknown',
      photoUrl: binding.photo?.value,
      WikidataId: binding.mp?.value?.split('/').pop()
    };
  } catch (error) {
    console.error('Wikidata API error:', error);
    return null;
  }
}

/**
 * Complete lookup flow with fallback:
 * 1. User enters pincode
 * 2. Try local lookup first (instant, from bundled pincodeMap)
 * 3. If not found, use postalpincode.in API to get state/district
 * 4. Find constituency in that state from all_constituencies
 * 5. Get MP details from Wikidata (cached)
 */
export async function fullConstituencyLookup(
  pincode: string,
  pincodeMap: Record<string, any>,
  allConstituencies?: Record<string, any>[]
): Promise<ConstituencyData | null> {
  try {
    let lookupResult: ConstituencyLookupResult | null = null;

    // Step 1: Try local pincode map first (instant, no network)
    lookupResult = await lookupConstituency(pincode, pincodeMap);

    // Step 2: If not found, use postalpincode.in to resolve and find by state
    if (!lookupResult) {
      try {
        const postalLocation = await resolvePostalcode(pincode);
        console.log('Resolved from postalpincode.in API:', postalLocation);

        // If we have all_constituencies, try to find one in this state
        if (allConstituencies && allConstituencies.length > 0) {
          // Find first constituency in the resolved state
          const stateCode = getStateCodeFromName(postalLocation.state);
          const matchingConstituency = allConstituencies.find(
            (c: any) => c.state === stateCode
          );

          if (matchingConstituency) {
            lookupResult = {
              pincode,
              state: postalLocation.state,
              district: postalLocation.district,
              lsConstituency: matchingConstituency.name,
              vsConstituency: matchingConstituency.vs_constituency
            };
            console.log('Found constituency by state fallback:', lookupResult);
          }
        }
      } catch (err) {
        console.warn('Postalpincode API fallback failed:', err);
        // Continue - will return null if still not found
      }
    }

    if (!lookupResult) {
      return null;
    }

    // Step 3: Get MP data from Wikidata (cached)
    let mpData: MPDetails | null = null;
    if (lookupResult.lsConstituency) {
      try {
        mpData = await fetchMPDataCached(lookupResult.lsConstituency);
      } catch (err) {
        console.warn('Wikidata fetch failed:', err);
      }
    }

    return {
      name: lookupResult.lsConstituency,
      state: lookupResult.state,
      mpName: mpData?.name || 'Not available',
      mpParty: mpData?.party || 'Not available',
      mpPhotoUrl: mpData?.photoUrl
    };
  } catch (error) {
    console.error('Full lookup error:', error);
    return null;
  }
}

/**
 * Map state names to state codes for lookup
 */
const STATE_NAME_TO_CODE: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CT',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OR',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UT',
  'West Bengal': 'WB',
  'Delhi': 'DL',
  'Puducherry': 'PY',
  'Chandigarh': 'CH',
  'Andaman and Nicobar Islands': 'AN',
  'Dadar and Nagar Haveli': 'DN',
  'Daman and Diu': 'DD',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD',
  'Jammu and Kashmir': 'JK'
};

/**
 * Convert state name to state code
 */
export function getStateCodeFromName(stateName: string): string {
  return STATE_NAME_TO_CODE[stateName] || stateName.substring(0, 2).toUpperCase();
}

/**
 * Cache Wikidata results to avoid duplicate API calls
 */
const wikipediaCache = new Map<string, MPDetails>();

export async function fetchMPDataCached(constituencyName: string): Promise<MPDetails | null> {
  if (wikipediaCache.has(constituencyName)) {
    return wikipediaCache.get(constituencyName) || null;
  }

  const result = await fetchMPDataFromWikidata(constituencyName);
  if (result) {
    wikipediaCache.set(constituencyName, result);
  }
  return result;
}
