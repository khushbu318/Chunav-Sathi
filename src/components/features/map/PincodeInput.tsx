import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader, MapPin } from 'lucide-react';

interface PincodeInputProps {
  onSubmit: (pincode: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function PincodeInput({ onSubmit, isLoading = false, error }: PincodeInputProps) {
  const [pincode, setPincode] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = pincode.trim();

    // Validate: Indian pincodes are 6 digits
    if (!trimmed) {
      setValidationError('Please enter a pincode');
      return;
    }

    if (!/^\d{6}$/.test(trimmed)) {
      setValidationError('Please enter a valid 6-digit pincode');
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-whatsapp-text mb-2">Find Your Constituency</h1>
          <p className="text-whatsapp-subtext text-sm">
            Enter your pincode to discover your MP, election results, and voting information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-whatsapp-green">
              <MapPin size={20} />
            </div>
            <input
              type="number"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                setValidationError('');
              }}
              placeholder="Enter your 6-digit pincode"
              className="w-full pl-12 pr-4 py-3 bg-whatsapp-hover border border-whatsapp-border rounded-lg text-whatsapp-text placeholder-whatsapp-subtext focus:outline-none focus:border-whatsapp-green focus:ring-1 focus:ring-whatsapp-green text-center text-lg tracking-widest"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          {/* Error Messages */}
          {validationError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{validationError}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !pincode.trim()}
            className="w-full py-3 px-4 bg-whatsapp-green text-white font-semibold rounded-lg hover:bg-whatsapp-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Looking up...</span>
              </>
            ) : (
              <>
                <span>Find My Constituency</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-whatsapp-hover border border-whatsapp-border rounded-lg">
          <p className="text-whatsapp-subtext text-xs leading-relaxed">
            <strong className="text-whatsapp-green">📍 Not sure?</strong> You can find your pincode on your postal delivery letter or online at <span className="text-whatsapp-green">India Post</span>.
          </p>
        </div>

        {/* Example Pincodes */}
        <div className="mt-6 p-4 bg-[#0d2e27] rounded-lg border border-whatsapp-green/20">
          <p className="text-whatsapp-subtext text-xs mb-3 font-medium">Try these pincodes:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { pin: '400001', city: 'Mumbai' },
              { pin: '110001', city: 'Delhi' },
              { pin: '560001', city: 'Bangalore' },
              { pin: '700001', city: 'Kolkata' }
            ].map((item) => (
              <button
                key={item.pin}
                onClick={() => {
                  setPincode(item.pin);
                  setValidationError('');
                }}
                className="text-xs px-3 py-2 bg-whatsapp-green/10 text-whatsapp-green border border-whatsapp-green/30 rounded hover:bg-whatsapp-green/20 transition-colors"
              >
                {item.pin} ({item.city})
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
