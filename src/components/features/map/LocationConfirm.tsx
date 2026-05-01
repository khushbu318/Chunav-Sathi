import { motion } from 'framer-motion';
import { Check, AlertCircle, ChevronLeft } from 'lucide-react';

interface LocationConfirmProps {
  location: {
    state: string;
    district: string;
    pincode: string;
  };
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

export default function LocationConfirm({
  location,
  onConfirm,
  onEdit,
  isLoading = false
}: LocationConfirmProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Success Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-whatsapp-green/10 border-2 border-whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check size={40} className="text-whatsapp-green" />
          </motion.div>

          <h2 className="text-2xl font-bold text-whatsapp-text mb-2">Is this your area?</h2>
          <p className="text-whatsapp-subtext text-sm">
            We found your location based on your pincode
          </p>
        </div>

        {/* Location Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-whatsapp-hover border border-whatsapp-border rounded-lg p-6 mb-6"
        >
          <div className="space-y-4">
            {/* Pincode */}
            <div className="flex items-center justify-between pb-4 border-b border-whatsapp-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-whatsapp-green/10 flex items-center justify-center text-whatsapp-green font-bold">
                  📮
                </div>
                <div>
                  <div className="text-whatsapp-subtext text-xs uppercase tracking-wide">Pincode</div>
                  <div className="text-whatsapp-text font-semibold">{location.pincode}</div>
                </div>
              </div>
            </div>

            {/* State */}
            <div className="flex items-center justify-between pb-4 border-b border-whatsapp-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                  🏛️
                </div>
                <div>
                  <div className="text-whatsapp-subtext text-xs uppercase tracking-wide">State</div>
                  <div className="text-whatsapp-text font-semibold">{location.state}</div>
                </div>
              </div>
            </div>

            {/* District */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                  🗺️
                </div>
                <div>
                  <div className="text-whatsapp-subtext text-xs uppercase tracking-wide">District</div>
                  <div className="text-whatsapp-text font-semibold">{location.district}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300 text-xs leading-relaxed">
            This information helps us show you your MP, election results, and voting booth location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-whatsapp-green text-white font-semibold rounded-lg hover:bg-whatsapp-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} />
            <span>Yes, This is Correct</span>
          </button>

          <button
            onClick={onEdit}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-whatsapp-hover border border-whatsapp-border text-whatsapp-text font-semibold rounded-lg hover:bg-whatsapp-border/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} />
            <span>Change Pincode</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
