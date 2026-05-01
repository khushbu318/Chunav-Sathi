import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Landmark,
  Map as MapIcon,
  Home,
  Scale,
  Users,
  Calendar,
  CheckCircle,
  BarChart3,
  AlertCircle,
  Zap,
  Target,
  BookOpen,
  Shield,
  Clock,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

interface Content {
  title: string;
  description: string;
  details: string[];
}

const ElectionProcess: React.FC = () => {
  const [activeSection, setActiveSection] = useState('chambers');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const sections: Section[] = [
    {
      id: 'chambers',
      title: 'Chambers of Parliament',
      icon: <Landmark size={20} />,
      color: '#ff6b35',
      gradient: 'linear-gradient(135deg, #ff6b35, #f7c948)',
    },
    {
      id: 'elections',
      title: 'Types of Elections',
      icon: <MapIcon size={20} />,
      color: '#2980b9',
      gradient: 'linear-gradient(135deg, #2980b9, #00a884)',
    },
    {
      id: 'local',
      title: 'Local Bodies',
      icon: <Home size={20} />,
      color: '#16a085',
      gradient: 'linear-gradient(135deg, #16a085, #2980b9)',
    },
    {
      id: 'voting',
      title: 'Voting Rights & Process',
      icon: <CheckCircle size={20} />,
      color: '#8e44ad',
      gradient: 'linear-gradient(135deg, #8e44ad, #e74c3c)',
    },
    {
      id: 'voting-methods',
      title: 'Voting Methods',
      icon: <Zap size={20} />,
      color: '#27ae60',
      gradient: 'linear-gradient(135deg, #27ae60, #f7c948)',
    },
    {
      id: 'structure',
      title: 'Electoral System',
      icon: <Scale size={20} />,
      color: '#c0392b',
      gradient: 'linear-gradient(135deg, #c0392b, #e67e22)',
    },
  ];

  const content: Record<string, any> = {
    chambers: [
      {
        title: 'Lok Sabha (Lower House)',
        icon: '🏛️',
        details: [
          'People\'s House - Direct election by citizens',
          '543 elected members + 2 nominated',
          '5-year term (or dissolution)',
          'Leads the government formation',
          'Budget approval & Bills passed here first',
        ],
      },
      {
        title: 'Rajya Sabha (Upper House)',
        icon: '👥',
        details: [
          'Council of States - Indirect election',
          '245 members (233 elected + 12 nominated)',
          '6-year term - 1/3 retire every 2 years',
          'Represents state interests',
          'Reviews laws & ensures federal structure',
        ],
      },
    ],
    elections: [
      {
        title: 'General Elections',
        icon: '🗳️',
        details: [
          'Every 5 years nationwide',
          'Elects new Lok Sabha',
          '543 directly elected members',
          'Conducted in phases across India',
          'Forms the new government',
        ],
      },
      {
        title: 'By-elections',
        icon: '🔄',
        details: [
          'Fill vacant seats mid-term',
          'Held in single constituencies',
          'Called when seat becomes vacant',
          'Same eligibility rules apply',
          'Don\'t affect term length',
        ],
      },
      {
        title: 'Mid-term Elections',
        icon: '⚡',
        details: [
          'When parliament dissolved early',
          'Rare occurrence in history',
          'Happens if government loses majority',
          'Full 5-year elections conducted',
          'Resets the 5-year cycle',
        ],
      },
    ],
    local: [
      {
        title: 'Gram Panchayat (Village)',
        icon: '🌾',
        details: [
          'Lowest tier of local government',
          'Handles village development',
          '5 members (plus reserved seats)',
          '5-year term like national elections',
          'Manages agriculture, water, roads',
        ],
      },
      {
        title: 'Nagar Palika (City)',
        icon: '🏙️',
        details: [
          'Urban local body',
          'Elected by ward voters',
          'Varies in size by city population',
          'Manages municipal services',
          'Health, sanitation, roads, lighting',
        ],
      },
      {
        title: 'District Panchayat',
        icon: '📍',
        details: [
          'Intermediate rural governance',
          'Coordination between villages',
          'Elected from Gram Panchayat members',
          'Block development oversight',
          'Resource distribution management',
        ],
      },
    ],
    voting: [
      {
        title: 'Who Can Vote?',
        icon: '✅',
        details: [
          'Must be Indian citizen',
          'Age 18 years or above',
          'Should be a registered voter',
          'Mentally sound (per constitution)',
          'Not serving criminal sentence',
        ],
      },
      {
        title: 'Who Cannot Vote?',
        icon: '❌',
        details: [
          'Non-citizens (NRI\'s cannot)',
          'Below 18 years of age',
          'Persons of unsound mind',
          'Those convicted (under certain laws)',
          'Disqualified by election law',
        ],
      },
      {
        title: 'Voting Process',
        icon: '📋',
        details: [
          '1. Register as voter (free)',
          '2. Get voter ID or use any ID',
          '3. Go to assigned polling booth',
          '4. Verify your name on list',
          '5. Cast your vote (paper or EVM)',
        ],
      },
    ],
    voting_methods: [
      {
        method: 'EVM & VVPAT',
        icon: '🖱️',
        usedBy: 'General Public',
        medium: 'Electronic Machine',
        details: [
          'Press button next to candidate name',
          'VVPAT prints verification record',
          'Results stored electronically',
          'One vote per candidate',
          'Used in most elections nationwide',
        ],
      },
      {
        method: 'Postal Ballot',
        icon: '📮',
        usedBy: 'Army, Election Staff',
        medium: 'Paper / Mail',
        details: [
          'For military and poll workers',
          'Ballot sent to registered address',
          'Vote and mail back by post',
          'Special provisions under law',
          'Counted during official counting day',
        ],
      },
      {
        method: 'Home Voting',
        icon: '🏠',
        usedBy: 'Elderly (85+), PwD',
        medium: 'Paper (at home)',
        details: [
          'Voting officials visit home',
          'For elderly citizens above 85 years',
          'For persons with disabilities',
          'Paper ballot used',
          'Special election commission provision',
        ],
      },
      {
        method: 'Proxy Voting',
        icon: '👤',
        usedBy: 'Service Personnel',
        medium: 'Assigned Person',
        details: [
          'Authorized person votes on behalf',
          'For military and election staff',
          'Power of attorney required',
          'Same voting rules apply',
          'Ensures service personnel participation',
        ],
      },
    ],
    structure: [
      {
        title: 'First Past The Post (FPTP)',
        icon: '🏁',
        details: [
          'Candidate with most votes wins',
          'Not necessarily majority needed',
          'Used in Lok Sabha & State elections',
          'Winner-take-all system',
          'Creates strong local representative',
        ],
      },
      {
        title: 'Proportional Representation',
        icon: '⚖️',
        details: [
          'Rajya Sabha members elected this way',
          'Votes proportional to party strength',
          'Multi-member constituencies',
          'Broader representation',
          'Used in state councils',
        ],
      },
      {
        title: 'Reserved Seats',
        icon: '🛡️',
        details: [
          'SC/ST communities guaranteed seats',
          'Approximately 85 seats for SC',
          'Approximately 47 seats for ST',
          'Ensures representation',
          'Based on population distribution',
        ],
      },
    ],
  };

  const toggleExpand = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const renderSectionContent = () => {
    const contentKey = activeSection === 'voting-methods' ? 'voting_methods' : activeSection;
    const cards = content[contentKey] || [];
    const isVotingMethods = activeSection === 'voting-methods';

    if (isVotingMethods) {
      return (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="voting-methods-table-container"
        >
          <table className="voting-methods-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Used By</th>
                <th>Medium</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card: any, idx: number) => {
                const rowId = `voting-method-${idx}`;
                const isExpanded = expandedCards.has(rowId);
                return (
                  <React.Fragment key={rowId}>
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => toggleExpand(rowId)}
                      className={`voting-method-row ${isExpanded ? 'expanded' : ''}`}
                    >
                      <td className="method-cell">
                        <div className="method-content">
                          <span className="method-icon">{card.icon}</span>
                          <span className="method-name">{card.method}</span>
                        </div>
                      </td>
                      <td className="used-by-cell">{card.usedBy}</td>
                      <td className="medium-cell">
                        <div className="medium-badge">{card.medium}</div>
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="voting-method-details-row"
                        >
                          <td colSpan={3}>
                            <div className="voting-method-details">
                              {card.details.map((detail: string, detailIdx: number) => (
                                <motion.div
                                  key={detailIdx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: detailIdx * 0.05 }}
                                  className="voting-detail-item"
                                >
                                  <div className="voting-detail-bullet" />
                                  {detail}
                                </motion.div>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        {cards.map((card: any, idx: number) => {
          const cardId = `${activeSection}-${idx}`;
          const isExpanded = expandedCards.has(cardId);

          return (
            <motion.div
              key={cardId}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggleExpand(cardId)}
              className="group cursor-pointer"
            >
              <div className="election-card">
                <div className="election-card-header">
                  <div className="election-card-icon">{card.icon}</div>
                  <div className="election-card-title">{card.title}</div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="election-card-chevron"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="election-card-content">
                        {card.details.map((detail: string, detailIdx: number) => (
                          <motion.div
                            key={detailIdx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: detailIdx * 0.05 }}
                            className="election-detail"
                          >
                            <div className="election-detail-bullet" />
                            {detail}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className="election-process-container">
      {/* Header */}
      {/* <div className="election-process-header">
        <div className="election-process-title">
          <BookOpen size={20} className="text-whatsapp-green" />
          <div>
            <div className="text-14px font-semibold text-whatsapp-text">Know Your Election Process</div>
            <div className="text-11px text-whatsapp-subtext mt-0.5">Interactive guide to Indian elections</div>
          </div>
        </div>
      </div> */}

      {/* Section Tabs */}
      <div className="election-process-tabs">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`election-tab ${activeSection === section.id ? 'active' : ''}`}
            style={
              activeSection === section.id
                ? { background: section.gradient, color: 'white' }
                : {}
            }
          >
            <div className="election-tab-icon">{section.icon}</div>
            <div className="election-tab-label">{section.title}</div>
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      <div className="election-process-content">
        <AnimatePresence mode="wait">
          {renderSectionContent()}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="election-process-footer">
        <AlertCircle size={14} className="text-whatsapp-yellow" />
        <span>Tap any card to learn more</span>
      </div>
    </div>
  );
};

export default ElectionProcess;
