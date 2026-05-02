export interface Location {
  id: string;
  name: string;
  type: 'polling_booth' | 'election_office' | 'vrc';
  address: string;
  phone: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

// Comprehensive location database for Indian cities
export const LOCATIONS_DATABASE: Location[] = [
  // NOIDA - Uttar Pradesh
  { id: 'pb-noida-001', name: 'Polling Booth - Sector 21', type: 'polling_booth', address: 'Government School, Sector 21, Noida', phone: '+91-120-4141-7859', area: 'Sector 21', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', lat: 28.5921, lng: 77.0463 },
  { id: 'pb-noida-002', name: 'Polling Booth - Sector 10', type: 'polling_booth', address: 'Private School Campus, Sector 10, Noida', phone: '+91-120-4242-5123', area: 'Sector 10', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', lat: 28.5749, lng: 77.3627 },
  { id: 'pb-noida-003', name: 'Polling Booth - Sector 50', type: 'polling_booth', address: 'Central School, Sector 50, Noida', phone: '+91-120-4343-2145', area: 'Sector 50', city: 'Noida', state: 'Uttar Pradesh', pincode: '201307', lat: 28.5680, lng: 77.3589 },
  { id: 'pb-noida-004', name: 'Polling Booth - Sector 62', type: 'polling_booth', address: 'Community Hall, Sector 62, Noida', phone: '+91-120-4444-8765', area: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201309', lat: 28.5520, lng: 77.3948 },
  { id: 'eo-noida-001', name: 'District Election Office - Noida', type: 'election_office', address: 'Gautam Buddh Nagar District Office, Noida', phone: '+91-120-4141-0011', area: 'Civil Lines', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', lat: 28.6139, lng: 77.209 },
  { id: 'vrc-noida-001', name: 'Voter Registration Centre - Noida', type: 'vrc', address: 'Community Center, Sector 18, Noida', phone: '+91-120-4141-4422', area: 'Sector 18', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', lat: 28.5894, lng: 77.3704 },

  // DELHI
  { id: 'pb-delhi-001', name: 'Polling Booth - Connaught Place', type: 'polling_booth', address: 'Government School, Connaught Place, Delhi', phone: '+91-11-4141-1234', area: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001', lat: 28.6328, lng: 77.1896 },
  { id: 'pb-delhi-002', name: 'Polling Booth - Lajpat Nagar', type: 'polling_booth', address: 'Central School, Lajpat Nagar, Delhi', phone: '+91-11-4242-5678', area: 'Lajpat Nagar', city: 'Delhi', state: 'Delhi', pincode: '110024', lat: 28.5657, lng: 77.2500 },
  { id: 'pb-delhi-003', name: 'Polling Booth - Dwarka', type: 'polling_booth', address: 'Community School, Sector 13, Dwarka, Delhi', phone: '+91-11-4343-9012', area: 'Dwarka', city: 'Delhi', state: 'Delhi', pincode: '110075', lat: 28.5921, lng: 77.0463 },
  { id: 'eo-delhi-001', name: 'State Election Office - Delhi', type: 'election_office', address: 'Election Commission Office, Bungalow Road, Delhi', phone: '+91-11-4141-4141', area: 'New Delhi', city: 'Delhi', state: 'Delhi', pincode: '110001', lat: 28.6329, lng: 77.2197 },
  { id: 'vrc-delhi-001', name: 'Voter Registration Centre - Delhi', type: 'vrc', address: 'Registration Office, Rajendra Place, Delhi', phone: '+91-11-4242-4242', area: 'Rajendra Place', city: 'Delhi', state: 'Delhi', pincode: '110008', lat: 28.5921, lng: 77.1897 },

  // BANGALORE - Karnataka
  { id: 'pb-bangalore-001', name: 'Polling Booth - Indiranagar', type: 'polling_booth', address: 'Government School, Indiranagar, Bangalore', phone: '+91-80-4141-1111', area: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038', lat: 13.0827, lng: 77.6412 },
  { id: 'pb-bangalore-002', name: 'Polling Booth - Koramangala', type: 'polling_booth', address: 'Central School, Koramangala, Bangalore', phone: '+91-80-4242-2222', area: 'Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', lat: 12.9352, lng: 77.6245 },
  { id: 'pb-bangalore-003', name: 'Polling Booth - Whitefield', type: 'polling_booth', address: 'Community Hall, Whitefield, Bangalore', phone: '+91-80-4343-3333', area: 'Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066', lat: 13.0196, lng: 77.7499 },
  { id: 'eo-bangalore-001', name: 'State Election Office - Bangalore', type: 'election_office', address: 'Election Commission Office, Vidhana Soudha, Bangalore', phone: '+91-80-4141-5555', area: 'Vidhana Soudha', city: 'Bangalore', state: 'Karnataka', pincode: '560001', lat: 13.1879, lng: 77.5937 },
  { id: 'vrc-bangalore-001', name: 'Voter Registration Centre - Bangalore', type: 'vrc', address: 'Registration Office, MG Road, Bangalore', phone: '+91-80-4242-6666', area: 'MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', lat: 13.1874, lng: 77.5988 },

  // MUMBAI - Maharashtra
  { id: 'pb-mumbai-001', name: 'Polling Booth - Bandra', type: 'polling_booth', address: 'Government School, Bandra, Mumbai', phone: '+91-22-4141-7777', area: 'Bandra', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', lat: 19.0596, lng: 72.8295 },
  { id: 'pb-mumbai-002', name: 'Polling Booth - Andheri', type: 'polling_booth', address: 'Central School, Andheri, Mumbai', phone: '+91-22-4242-8888', area: 'Andheri', city: 'Mumbai', state: 'Maharashtra', pincode: '400058', lat: 19.1136, lng: 72.8697 },
  { id: 'pb-mumbai-003', name: 'Polling Booth - Downtown', type: 'polling_booth', address: 'Community Hall, Fort, Mumbai', phone: '+91-22-4343-9999', area: 'Fort', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', lat: 18.9676, lng: 72.8194 },
  { id: 'eo-mumbai-001', name: 'State Election Office - Mumbai', type: 'election_office', address: 'Election Commission Office, South Mumbai', phone: '+91-22-4141-1010', area: 'South Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400020', lat: 18.9220, lng: 72.8347 },
  { id: 'vrc-mumbai-001', name: 'Voter Registration Centre - Mumbai', type: 'vrc', address: 'Registration Office, Dadar, Mumbai', phone: '+91-22-4242-1111', area: 'Dadar', city: 'Mumbai', state: 'Maharashtra', pincode: '400014', lat: 19.0176, lng: 72.8479 },

  // HYDERABAD - Telangana
  { id: 'pb-hyderabad-001', name: 'Polling Booth - Hitech City', type: 'polling_booth', address: 'Government School, Hitech City, Hyderabad', phone: '+91-40-4141-1212', area: 'Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', lat: 17.3604, lng: 78.3497 },
  { id: 'pb-hyderabad-002', name: 'Polling Booth - Banjara Hills', type: 'polling_booth', address: 'Central School, Banjara Hills, Hyderabad', phone: '+91-40-4242-1313', area: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', lat: 17.3850, lng: 78.4867 },
  { id: 'eo-hyderabad-001', name: 'State Election Office - Hyderabad', type: 'election_office', address: 'Election Commission Office, Secretariat, Hyderabad', phone: '+91-40-4141-1414', area: 'Secretariat', city: 'Hyderabad', state: 'Telangana', pincode: '500022', lat: 17.3629, lng: 78.4754 },
  { id: 'vrc-hyderabad-001', name: 'Voter Registration Centre - Hyderabad', type: 'vrc', address: 'Registration Office, Charminar, Hyderabad', phone: '+91-40-4242-1515', area: 'Charminar', city: 'Hyderabad', state: 'Telangana', pincode: '500002', lat: 17.3629, lng: 78.4754 },

  // PUNE - Maharashtra
  { id: 'pb-pune-001', name: 'Polling Booth - Viman Nagar', type: 'polling_booth', address: 'Government School, Viman Nagar, Pune', phone: '+91-20-4141-2020', area: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411014', lat: 18.5521, lng: 73.9104 },
  { id: 'pb-pune-002', name: 'Polling Booth - Kalyani Nagar', type: 'polling_booth', address: 'Central School, Kalyani Nagar, Pune', phone: '+91-20-4242-2121', area: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006', lat: 18.5295, lng: 73.9089 },
  { id: 'eo-pune-001', name: 'State Election Office - Pune', type: 'election_office', address: 'Election Commission Office, Camp, Pune', phone: '+91-20-4141-2222', area: 'Camp', city: 'Pune', state: 'Maharashtra', pincode: '411001', lat: 18.5204, lng: 73.8567 },
  { id: 'vrc-pune-001', name: 'Voter Registration Centre - Pune', type: 'vrc', address: 'Registration Office, Deccan, Pune', phone: '+91-20-4242-2323', area: 'Deccan', city: 'Pune', state: 'Maharashtra', pincode: '411004', lat: 18.5089, lng: 73.8529 },

  // JAIPUR - Rajasthan
  { id: 'pb-jaipur-001', name: 'Polling Booth - City Palace', type: 'polling_booth', address: 'Government School, Near City Palace, Jaipur', phone: '+91-141-4141-3030', area: 'City Palace', city: 'Jaipur', state: 'Rajasthan', pincode: '302002', lat: 26.9312, lng: 75.8262 },
  { id: 'pb-jaipur-002', name: 'Polling Booth - Lal Nagar', type: 'polling_booth', address: 'Central School, Lal Nagar, Jaipur', phone: '+91-141-4242-3131', area: 'Lal Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302015', lat: 26.8842, lng: 75.7946 },
  { id: 'eo-jaipur-001', name: 'State Election Office - Jaipur', type: 'election_office', address: 'Election Commission Office, Secretariat, Jaipur', phone: '+91-141-4141-3232', area: 'Secretariat', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', lat: 26.9048, lng: 75.8245 },

  // KOLKATA - West Bengal
  { id: 'pb-kolkata-001', name: 'Polling Booth - Salt Lake', type: 'polling_booth', address: 'Government School, Salt Lake, Kolkata', phone: '+91-33-4141-4040', area: 'Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091', lat: 22.5726, lng: 88.4270 },
  { id: 'pb-kolkata-002', name: 'Polling Booth - Ballygunge', type: 'polling_booth', address: 'Central School, Ballygunge, Kolkata', phone: '+91-33-4242-4141', area: 'Ballygunge', city: 'Kolkata', state: 'West Bengal', pincode: '700019', lat: 22.5430, lng: 88.3839 },
  { id: 'eo-kolkata-001', name: 'State Election Office - Kolkata', type: 'election_office', address: 'Election Commission Office, Victoria Memorial, Kolkata', phone: '+91-33-4141-4242', area: 'Victoria', city: 'Kolkata', state: 'West Bengal', pincode: '700071', lat: 22.5441, lng: 88.3489 },

  // AHMEDABAD - Gujarat
  { id: 'pb-ahmedabad-001', name: 'Polling Booth - Satellite', type: 'polling_booth', address: 'Government School, Satellite, Ahmedabad', phone: '+91-79-4141-5050', area: 'Satellite', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', lat: 23.0225, lng: 72.5714 },
  { id: 'pb-ahmedabad-002', name: 'Polling Booth - Bodakdev', type: 'polling_booth', address: 'Central School, Bodakdev, Ahmedabad', phone: '+91-79-4242-5151', area: 'Bodakdev', city: 'Ahmedabad', state: 'Gujarat', pincode: '380054', lat: 23.0370, lng: 72.5247 },
  { id: 'eo-ahmedabad-001', name: 'State Election Office - Ahmedabad', type: 'election_office', address: 'Election Commission Office, Paldi, Ahmedabad', phone: '+91-79-4141-5252', area: 'Paldi', city: 'Ahmedabad', state: 'Gujarat', pincode: '380007', lat: 23.1815, lng: 72.6369 },
];

// Search function
export const searchLocations = (query: string): Location[] => {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();

  return LOCATIONS_DATABASE.filter((location) => {
    // Search in multiple fields
    return (
      location.name.toLowerCase().includes(searchTerm) ||
      location.address.toLowerCase().includes(searchTerm) ||
      location.area.toLowerCase().includes(searchTerm) ||
      location.city.toLowerCase().includes(searchTerm) ||
      location.pincode.includes(searchTerm) ||
      location.state.toLowerCase().includes(searchTerm)
    );
  });
};

// Get Google Maps URL
export const getGoogleMapsUrl = (location: Location): string => {
  return `https://www.google.com/maps/search/${encodeURIComponent(location.name)}/@${location.lat},${location.lng},15z`;
};

// Get Google Maps directions URL
export const getGoogleMapsDirectionsUrl = (location: Location): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&destination_place_id=${encodeURIComponent(location.address)}`;
};
