import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import ElectionOffices from './ElectionOffices';

export default function FindElectionOffices() {
  const [showMap, setShowMap] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (searchInput.trim()) {
      setShowMap(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full h-full bg-whatsapp-bg">
      <AnimatePresence mode="wait">
        {!showMap ? (
          <motion.div
            key="input-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-whatsapp-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-whatsapp-green" />
                </div>
                <h1 className="text-2xl font-bold text-whatsapp-text mb-2">
                  Find Election Offices
                </h1>
                <p className="text-whatsapp-subtext">
                  Locate polling booths and election offices near you
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-whatsapp-subtext">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter pincode, area or city..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-whatsapp-panel text-whatsapp-text placeholder-whatsapp-subtext pl-12 pr-4 py-3 rounded-full border border-whatsapp-border focus:outline-none focus:border-whatsapp-green transition-colors"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  disabled={!searchInput.trim()}
                  className="w-full bg-whatsapp-green text-white font-semibold py-3 rounded-full hover:bg-whatsapp-green/90 disabled:bg-whatsapp-subtext/30 disabled:cursor-not-allowed transition-colors"
                >
                  Find Locations
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 pt-6 border-t border-whatsapp-border"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">Polling</span>
                  <div>
                    <p className="font-medium text-whatsapp-text text-sm">Polling Booths</p>
                    <p className="text-whatsapp-subtext text-xs">Where you will vote</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">Office</span>
                  <div>
                    <p className="font-medium text-whatsapp-text text-sm">Election Offices</p>
                    <p className="text-whatsapp-subtext text-xs">Official election offices near you</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">Help</span>
                  <div>
                    <p className="font-medium text-whatsapp-text text-sm">Voter Registration</p>
                    <p className="text-whatsapp-subtext text-xs">Get help with registration services</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-xs text-whatsapp-subtext pt-4"
              >
                <p>Need help? Call Voter Helpline: <strong className="text-whatsapp-text">1950</strong></p>
                <p className="mt-2">
                  <a href="https://www.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="text-whatsapp-green hover:underline">
                    Visit ECI election help pages &rarr;
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="map-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowMap(false);
                setSearchInput('');
              }}
              className="absolute top-4 left-4 z-20 bg-whatsapp-green text-white p-2 rounded-full hover:bg-whatsapp-green/90 transition-colors shadow-lg"
              title="Go back"
            >
              <span aria-hidden="true">&larr;</span>
            </motion.button>

            <ElectionOffices searchQuery={searchInput} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
