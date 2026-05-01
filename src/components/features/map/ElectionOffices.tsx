import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, ExternalLink, Loader, MapPin, Star, Clock, Navigation, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { searchLocations, getPlaceDetails, getGoogleMapsUrl, getGoogleMapsDirectionsUrl, getStaticMapUrl, isGoogleMapsEnabled, type SearchResult } from './googlePlacesSearch';
import './ElectionOffices.css';

interface ElectionOfficesProps {
  searchQuery?: string;
}

const ElectionOffices: React.FC<ElectionOfficesProps> = ({ searchQuery: initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [placeDetails, setPlaceDetails] = useState<Record<string, SearchResult>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  // Auto-search if initial query provided
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (query: string, lat?: number, lng?: number) => {
    setSearchQuery(query);
    setHasSearched(true);
    setIsSearching(true);
    setSearchError('');
    setExpandedCard(null);
    setPlaceDetails({});

    try {
      const searchResults = await searchLocations(query, lat, lng);
      setResults(searchResults);
      if (searchResults.length === 0) {
        setSearchError('No election locations found for that query. Try a different area or pincode.');
      }
    } catch (error) {
      setSearchError('Unable to search locations right now. Please try again later.');
      setResults([]);
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by this browser.');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handleSearch('near me', latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setSearchError('Unable to get your location. Please check your browser permissions.');
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const toggleCardExpansion = async (placeId: string) => {
    if (expandedCard === placeId) {
      setExpandedCard(null);
      return;
    }

    setExpandedCard(placeId);

    // Load place details if not already loaded
    if (!placeDetails[placeId] && !loadingDetails.has(placeId)) {
      setLoadingDetails(prev => new Set(prev).add(placeId));
      try {
        const details = await getPlaceDetails(placeId);
        setPlaceDetails(prev => ({ ...prev, [placeId]: details }));
      } catch (error) {
        console.error('Failed to load place details:', error);
      } finally {
        setLoadingDetails(prev => {
          const newSet = new Set(prev);
          newSet.delete(placeId);
          return newSet;
        });
      }
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'polling_booth':
        return 'Polling Booth';
      case 'election_office':
        return 'Election Office';
      default:
        return 'Location';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'polling_booth':
        return '🗳';
      case 'election_office':
        return '🏛';
      default:
        return '📍';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} fill="#ffd700" color="#ffd700" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} fill="#ffd700" color="#ffd700" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    return stars;
  };

  const LoadingSkeleton = () => (
    <motion.div className="eo-result-item eo-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="eo-result-icon eo-skeleton-icon">📍</div>
      <div className="eo-result-details">
        <div className="eo-skeleton-text eo-skeleton-title"></div>
        <div className="eo-skeleton-text eo-skeleton-subtitle"></div>
        <div className="eo-skeleton-text eo-skeleton-address"></div>
      </div>
      <div className="eo-maps-button eo-skeleton-button"></div>
    </motion.div>
  );

  return (
    <div className="election-offices-container">
      {/* Header */}
      <motion.div
        className="eo-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="eo-header-content">
          <h1 className="eo-header-title">📍 Find Election Offices & Polling Booths</h1>
          <p className="eo-header-subtitle">Powered by Google Maps search</p>
          <p className="eo-header-desc">
            Search for polling booths, election offices, or voter registration centers by pincode, area, or city name.
          </p>
        </div>
      </motion.div>

      {/* Search Box */}
      <motion.div
        className="eo-search-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="eo-search-wrapper">
          <Search size={18} className="eo-search-icon" />
          <input
            type="text"
            placeholder="Enter pincode, area, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="eo-search-input"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            disabled={isSearching}
            className="eo-search-btn"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="eo-geolocation-wrapper">
          <button
            onClick={handleGeolocation}
            disabled={isSearching}
            className="eo-geolocation-btn"
          >
            <MapPin size={16} />
            Use my location
          </button>
        </div>

        <p className="eo-search-hint">
          Try searching: "Noida", "201301", "Sector 21", "Delhi", "Bangalore", etc.
        </p>
        {!isGoogleMapsEnabled && (
          <p className="eo-search-warning">
            Google Maps API key not configured. Search will use a demo fallback dataset instead.
          </p>
        )}
        <p className="eo-helpline">
          <a href="https://www.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="eo-link">
            ECI Electoral Search ↗
          </a>
          {' or call Voter Helpline: '}
          <strong>1950</strong>
        </p>
      </motion.div>

      {/* Results Section */}
      <motion.div
        className="eo-results-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {searchError && (
          <div className="eo-search-error">
            <AlertCircle size={16} />
            {searchError}
          </div>
        )}
        {!hasSearched ? (
          <div className="eo-empty-state">
            <div className="eo-empty-icon">🔍</div>
            <h2 className="eo-empty-title">Start Searching</h2>
            <p className="eo-empty-text">Enter a location to find nearby election offices and polling booths</p>
          </div>
        ) : isSearching ? (
          <div className="eo-loading-state">
            <Loader size={32} className="eo-loader" />
            <p className="eo-loading-text">Searching locations...</p>
            {[...Array(3)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="eo-empty-state">
            <div className="eo-empty-icon">❌</div>
            <h2 className="eo-empty-title">No Results Found</h2>
            <p className="eo-empty-text">Try searching with a different location or check the spelling</p>
          </div>
        ) : (
          <div className="eo-results-container">
            <motion.div className="eo-results-header">
              <h3>Found {results.length} location{results.length !== 1 ? 's' : ''}</h3>
              <p className="eo-results-subtitle">Tap any location to view details or open in Google Maps</p>
            </motion.div>

            <AnimatePresence>
              {results.map((location, index) => {
                const isExpanded = expandedCard === location.place_id;
                const details = placeDetails[location.place_id];
                const isLoadingDetails = loadingDetails.has(location.place_id);

                return (
                  <motion.div
                    key={location.place_id}
                    className={`eo-result-item ${isExpanded ? 'eo-expanded' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    {/* Type Icon */}
                    <div className="eo-result-icon">
                      <span className="eo-type-emoji">{getTypeIcon(location.type)}</span>
                    </div>

                    {/* Location Details */}
                    <div className="eo-result-details">
                      <div className="eo-result-header-row">
                        <div>
                          <h4 className="eo-result-name">{location.name}</h4>
                          <p className="eo-result-type">{getTypeLabel(location.type)}</p>
                        </div>
                        <div className="eo-result-meta-row">
                          {location.distance_km > 0 && (
                            <span className="eo-distance-badge">
                              📍 {location.distance_km} km
                            </span>
                          )}
                          {location.rating && (
                            <div className="eo-rating">
                              {renderStars(location.rating)}
                              <span className="eo-rating-text">{location.rating}</span>
                            </div>
                          )}
                          {location.open_now !== undefined && (
                            <div className={`eo-status ${location.open_now ? 'open' : 'closed'}`}>
                              {location.open_now ? <CheckCircle size={14} /> : <Clock size={14} />}
                              <span>{location.open_now ? 'Open' : 'Closed'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="eo-result-address">
                        📍 {location.address}
                      </p>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            className="eo-expanded-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isLoadingDetails ? (
                              <div className="eo-details-loading">
                                <Loader size={16} className="eo-loader-small" />
                                Loading details...
                              </div>
                            ) : details ? (
                              <div className="eo-details-content">
                                {/* Static Map */}
                                <div className="eo-static-map">
                                  <img
                                    src={getStaticMapUrl(details)}
                                    alt={`Map of ${details.name}`}
                                    loading="lazy"
                                  />
                                </div>

                                {/* Contact Info */}
                                {details.phone && (
                                  <div className="eo-detail-item">
                                    <Phone size={14} />
                                    <a href={`tel:${details.phone}`} className="eo-phone-link">
                                      {details.phone}
                                    </a>
                                  </div>
                                )}

                                {/* Hours */}
                                {details.hours && details.hours.length > 0 && (
                                  <div className="eo-detail-item">
                                    <Clock size={14} />
                                    <div className="eo-hours">
                                      <div className="eo-hours-title">Hours:</div>
                                      {details.hours.slice(0, 3).map((hour, idx) => (
                                        <div key={idx} className="eo-hour-item">{hour}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Directions Button */}
                                <motion.a
                                  href={getGoogleMapsDirectionsUrl(details)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="eo-directions-btn"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Navigation size={16} />
                                  Get Directions
                                </motion.a>
                              </div>
                            ) : (
                              <div className="eo-details-error">
                                Failed to load additional details
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="eo-action-buttons">
                      <motion.button
                        onClick={() => toggleCardExpansion(location.place_id)}
                        className="eo-expand-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={isExpanded ? "Collapse details" : "View details"}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </motion.button>

                      <motion.a
                        href={getGoogleMapsUrl(location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eo-maps-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Open in Google Maps"
                      >
                        <ExternalLink size={18} />
                        <span>Maps</span>
                      </motion.a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ElectionOffices;
