import { motion } from 'framer-motion';
import { ExternalLink, Loader, ChevronLeft, AlertCircle, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface ConstituencyResultProps {
  data: {
    name: string;
    state: string;
    mpName: string;
    mpParty: string;
    mpPhotoUrl?: string;
    turnout?: number;
    margin?: number;
    votes?: number;
    voteShare?: number;
  };
  onEdit: () => void;
  isLoadingMP?: boolean;
}

const PARTY_COLORS: Record<string, string> = {
  'Bharatiya Janata Party': '#FF6F00',
  'BJP': '#FF6F00',
  'Indian National Congress': '#1565C0',
  'INC': '#1565C0',
  'Shiv Sena': '#F39C12',
  'DMK': '#FFD700',
  'Trinamool Congress': '#1E88E5',
  'AAP': '#0097A7',
  'CPI(M)': '#FF0000',
  'JDU': '#FFB81C'
};

export default function ConstituencyResult({
  data,
  onEdit,
  isLoadingMP = false
}: ConstituencyResultProps) {
  const partyColor = PARTY_COLORS[data.mpParty] || '#808080';

  return (
    <div className="flex flex-col min-h-[90vh] px-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <h1 className="text-2xl font-bold text-whatsapp-text">Your Constituency</h1>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-whatsapp-hover rounded-lg transition-colors"
            title="Change pincode"
          >
            <ChevronLeft size={20} className="text-whatsapp-subtext" />
          </button>
        </div>

        {/* Constituency Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-whatsapp-green/5 to-whatsapp-green/10 border border-whatsapp-green/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-whatsapp-subtext uppercase tracking-wide mb-2">
                Lok Sabha Constituency
              </div>
              <h2 className="text-3xl font-bold text-whatsapp-text">{data.name}</h2>
              <p className="text-whatsapp-subtext mt-2">📍 {data.state}</p>
            </div>
            <div className="text-4xl">🏛️</div>
          </div>
        </motion.div>

        {/* MP Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-whatsapp-hover border border-whatsapp-border rounded-2xl p-6 mb-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full" style={{ background: `${partyColor}20` }}></div>

          <div className="relative">
            <div className="text-sm text-whatsapp-subtext uppercase tracking-wide mb-4">
              Member of Parliament
            </div>

            {isLoadingMP ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="animate-spin text-whatsapp-green mr-2" />
                <span className="text-whatsapp-subtext">Fetching MP details from Wikidata...</span>
              </div>
            ) : (
              <div className="flex items-start gap-6 mb-6">
                {/* MP Photo or Avatar */}
                {data.mpPhotoUrl ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={data.mpPhotoUrl}
                    alt={data.mpName}
                    className="w-24 h-24 rounded-full object-cover border-4"
                    style={{ borderColor: partyColor }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-whatsapp-text mb-1">{data.mpName}</h3>

                  {/* Party Badge */}
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: partyColor }}
                    ></div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: `${partyColor}20`, color: partyColor }}
                    >
                      {data.mpParty}
                    </span>
                  </div>

                  <p className="text-whatsapp-subtext text-sm">
                    ✓ Verified from Wikidata (live, always updated)
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        {data.turnout !== undefined && data.margin !== undefined && data.voteShare !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            {/* Voter Turnout */}
            <div className="bg-whatsapp-hover border border-whatsapp-border rounded-lg p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Users size={20} />
              </div>
              <div>
                <div className="text-whatsapp-subtext text-xs uppercase tracking-wide">Voter Turnout</div>
                <div className="text-xl font-bold text-whatsapp-text">{data.turnout}%</div>
              </div>
            </div>

            {/* Vote Share */}
            <div className="bg-whatsapp-hover border border-whatsapp-border rounded-lg p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="text-whatsapp-subtext text-xs uppercase tracking-wide">Vote Share</div>
                <div className="text-xl font-bold text-whatsapp-text">{data.voteShare}%</div>
              </div>
            </div>

            {/* Winning Margin */}
            <div className="bg-whatsapp-hover border border-whatsapp-border rounded-lg p-4 flex items-center gap-3 col-span-2">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-whatsapp-subtext text-xs uppercase tracking-wide">Winning Margin</div>
                <div className="text-xl font-bold text-whatsapp-text">{data.margin?.toLocaleString()} votes</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <div className="space-y-3 mt-8">
          {/* Find Booth Button */}
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            href={`https://electoralsearch.eci.gov.in/`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-4 bg-whatsapp-green text-white font-semibold rounded-lg hover:bg-whatsapp-green/90 transition-all flex items-center justify-center gap-2 group"
          >
            <span>🗳️ Find Your Voting Booth</span>
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Election Results Button */}
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            href={`https://results.eci.gov.in/`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-4 bg-whatsapp-hover text-whatsapp-text font-semibold rounded-lg border border-whatsapp-border hover:bg-whatsapp-border/50 transition-all flex items-center justify-center gap-2 group"
          >
            <span>📊 View Election Results</span>
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Change Pincode */}
          <button
            onClick={onEdit}
            className="w-full py-3 px-4 bg-whatsapp-hover text-whatsapp-text font-semibold rounded-lg border border-whatsapp-border hover:bg-whatsapp-border/50 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} />
            <span>Search Another Area</span>
          </button>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3"
        >
          <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300 text-xs leading-relaxed">
            MP information is live from Wikidata. Election results data is from official ECI sources. All data is updated in real-time.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
