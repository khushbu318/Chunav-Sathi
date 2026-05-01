import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from './store';
import {
  MessageSquare,
  HelpCircle,
  Settings,
  Search,
  MoreVertical,
  Phone,
  Mic,
  Send,
  User,
  Map as MapIcon,
  Calendar,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  MapPin,
  X,
  PhoneOff,
  MicOff,
  Volume2
} from 'lucide-react';
import VoterJourney from './components/VoterJourney';
import { VoiceCall } from './components/VoiceCall';
import FindElectionOffices from './components/features/map';
import ElectionProcess from './components/features/election-process/ElectionProcess';
import './components/features/election-process/ElectionProcess.css';
import ElectionTimeline from './components/features/timeline/ElectionTimeline';
import './components/features/timeline/ElectionTimeline.css';

// --- Components ---

const SidebarRail = ({ activeTab, setTab, onSettings }: any) => (
  <div className="sidebar-rail">
    <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-whatsapp-orange to-whatsapp-yellow flex items-center justify-center text-[15px] cursor-pointer mb-2">
      🗳
    </div>
    <div className="rail-divider"></div>
    <button
      className={`rail-btn ${activeTab === 'chats' ? 'active text-whatsapp-green' : ''}`}
      onClick={() => setTab('chats')}
      title="Chats"
    >
      <MessageSquare size={20} />
      <span className="rail-badge">5</span>
    </button>
    <button
      className={`rail-btn ${activeTab === 'status' ? 'active text-whatsapp-green' : ''}`}
      onClick={() => setTab('status')}
      title="Status — FAQ Stories"
    >
      <HelpCircle size={20} />
    </button>
    <div className="rail-spacer"></div>
    <button className="rail-btn" onClick={onSettings} title="Settings">
      <Settings size={20} />
    </button>
  </div>
);

const ChatItem = ({ id, icon: Icon, colorClass, name, preview, meta, active, onClick, statusGradient, tabType }: any) => {
  const isStatus = tabType === 'status';
  const faqCount = meta?.faqCount || 1;

  return (
    <div
      onClick={() => onClick && onClick(id)}
      className={`chat-item ${active ? 'active' : ''}`}
    >
      <div
        className={`avatar w-11 h-11 relative flex items-center justify-center rounded-full transition-transform duration-200 active:scale-95 shadow-md`}
        style={isStatus ? {
          background: `repeating-conic-gradient(#00a884 0% ${100 / faqCount - 2}%, transparent ${100 / faqCount - 2}% ${100 / faqCount}%)`
        } : {
          background: colorClass,
          boxShadow: `0 4px 12px ${colorClass}40` // Subtle glow in the avatar's color
        }}
      >
        <div className={`w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full flex items-center justify-center ${isStatus ? 'bg-whatsapp-bg border-2 border-whatsapp-bg' : 'bg-white/10 backdrop-blur-[2px]'}`}>
          {typeof Icon === 'string' ? (
            <span className="text-xl drop-shadow-md">{Icon}</span>
          ) : (
            <Icon size={20} className={isStatus ? "text-whatsapp-text" : "text-white drop-shadow-md"} />
          )}
        </div>
      </div>
      <div className="chat-info ml-1">
        <div className="chat-name font-semibold">{name}</div>
        <div className="chat-preview truncate text-whatsapp-subtext">{preview}</div>
      </div>
      <div className="chat-meta">
        <span className="chat-time font-medium">
          {isStatus ? (meta?.faqCount ? `${meta.faqCount} FAQs` : '') : (meta?.time)}
        </span>
        {meta?.badge && !isStatus && <span className="badge scale-110">{meta.badge}</span>}
      </div>
    </div>
  );
};

// --- Feature Panels ---

const HomePanel = ({ onQuickAccess }: any) => (
  <div className="panel-home">
    <div className="home-logo shadow-lg">🗳</div>
    <div className="text-center">
      <div className="text-[22px] font-medium text-whatsapp-text">Chunav Sathi</div>
      <div className="text-[13px] text-whatsapp-subtext mt-1.5 max-w-[300px] leading-relaxed">
        Your trusted guide to India's elections — in your language, your way.
      </div>
    </div>
    <div className="flex gap-2 flex-wrap justify-center">
      <span className="bg-[#0d2e27] text-whatsapp-green px-3 py-1 rounded-full text-xs font-medium border border-whatsapp-green/20">15 languages</span>
      <span className="bg-[#2e2a0d] text-whatsapp-yellow px-3 py-1 rounded-full text-xs font-medium border border-whatsapp-yellow/20">Voice-first</span>
      <span className="bg-[#1a2731] text-whatsapp-subtext px-3 py-1 rounded-full text-xs font-medium border border-whatsapp-border">Gemini AI</span>
    </div>
    <div className="flex gap-3 justify-center flex-wrap mt-2">
      <div className="quick-card" onClick={() => onQuickAccess('journey')}>
        <div className="text-3xl mb-2">🚶</div>
        <div className="text-[13px] text-whatsapp-text font-medium">First Time Voter</div>
        <div className="text-[11px] text-whatsapp-subtext mt-1">Interactive Journey</div>
      </div>
      <div className="quick-card" onClick={() => onQuickAccess('learn')}>
        <div className="text-3xl mb-2">📚</div>
        <div className="text-[13px] text-whatsapp-text font-medium">Election Process</div>
        <div className="text-[11px] text-whatsapp-subtext mt-1">Learn basics</div>
      </div>
      <div className="quick-card" onClick={() => onQuickAccess('chat')}>
        <div className="text-3xl mb-2">🤖</div>
        <div className="text-[13px] text-whatsapp-text font-medium">Ask Anything</div>
        <div className="text-[11px] text-whatsapp-subtext mt-1">AI + voice call</div>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const { activePanel, setActivePanel, selectedLanguage, setLanguage } = useAppStore();
  const [activeTab, setActiveTab] = useState('chats');
  const [showSettings, setShowSettings] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'bot', text: `Namaste! 🙏 Main hoon aapka **Chunav Sathi**. Chunav ke bare mein kuch bhi puchein — text ya voice mein!\n\n(Current Language: ${selectedLanguage})`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const features = [
    { id: 'home', icon: '🗳', colorClass: 'linear-gradient(135deg,#ff6b35,#f7c948)', name: 'Chunav Sathi', preview: 'Your election companion', meta: { time: 'now', badge: 5 } },
    {
      id: 'journey',
      icon: User,
      colorClass: '#27ae60',
      statusGradient: 'linear-gradient(135deg,#27ae60,#f7c948)',
      name: 'First Time Voter Journey',
      preview: 'Interactive Journey',
      statusPreview: 'How to make voter ID · Find booth · Why vote',
      meta: { time: 'Learn', faqCount: 5 }
    },
    {
      id: 'map',
      icon: MapPin,
      colorClass: '#e74c3c',
      statusGradient: 'linear-gradient(135deg,#e74c3c,#00a884)',
      name: 'Find Election Offices & Polling Booths',
      preview: '📍 Powered by Google Maps',
      statusPreview: 'Find nearest polling booth · Election office · Voter registration',
      meta: { time: 'Live', faqCount: 4 }
    },
    {
      id: 'timeline',
      icon: Calendar,
      colorClass: '#8e44ad',
      statusGradient: 'linear-gradient(135deg,#8e44ad,#e74c3c)',
      name: 'Election Timeline',
      preview: '⏳ Countdown to key dates',
      statusPreview: 'MCC dates · Counting day · Get reminders',
      meta: { time: 'Live', faqCount: 4 }
    },
    {
      id: 'learn',
      icon: BookOpen,
      colorClass: '#16a085',
      statusGradient: 'linear-gradient(135deg,#16a085,#2980b9)',
      name: 'Know Your Election Process',
      preview: '📖 Lok Sabha · Rajya Sabha · Panchayat',
      statusPreview: 'MP vs MLA · NOTA · Panchayati Raj',
      meta: { time: 'Learn', faqCount: 5 }
    },
    {
      id: 'chat',
      icon: MessageSquare,
      colorClass: '#c0392b',
      statusGradient: 'linear-gradient(135deg,#c0392b,#e67e22)',
      name: 'Chat with Chunav Sathi',
      preview: '🤖 Ask anything · 📞 Voice call available',
      statusPreview: 'How to use chatbot · Voice call guide',
      meta: { time: 'Bot', faqCount: 4 }
    },
  ];

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { type: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language: selectedLanguage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Failed to connect to Chunav Sathi AI. Please make sure the backend is running.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [storyStep, setStoryStep] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);

  useEffect(() => {
    if (!activeStory || isStoryPaused) return;

    const timer = setInterval(() => {
      setStoryStep((prev) => {
        const feature = features.find(f => f.id === activeStory);
        const maxSteps = feature?.meta?.faqCount || 3;
        if (prev < maxSteps - 1) return prev + 1;
        setActiveStory(null);
        return 0;
      });
    }, 40000); // 40 seconds

    return () => clearInterval(timer);
  }, [activeStory, isStoryPaused]);

  const handleStoryNav = (direction: 'prev' | 'next') => {
    const feature = features.find(f => f.id === activeStory);
    const maxSteps = feature?.meta?.faqCount || 3;

    if (direction === 'next') {
      if (storyStep < maxSteps - 1) setStoryStep(s => s + 1);
      else setActiveStory(null);
    } else {
      if (storyStep > 0) setStoryStep(s => s - 1);
    }
  };

  return (
    <div className="app">
      {/* Far Left Rail */}
      <SidebarRail
        activeTab={activeTab}
        setTab={setActiveTab}
        onSettings={() => setShowSettings(true)}
      />

      {/* Left Panel */}
      <div className="left-panel">
        <div className="left-header">
          <span className="left-header-title">{activeTab === 'chats' ? 'Chunav Sathi' : 'FAQ'}</span>
          <div className="flex gap-1">
            <button className="icon-btn" onClick={() => setShowSettings(true)}>
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {activeTab === 'chats' ? (
          <>
            <div className="search-bar">
              <div className="search-wrap">
                <Search className="search-icon" size={13} />
                <input className="search-input" placeholder="Ask anything to your Chunav Sathi" readOnly />
              </div>
            </div>
            <div className="chat-list">
              {features.map((f) => (
                <ChatItem
                  key={f.id}
                  {...f}
                  active={activePanel === f.id}
                  onClick={setActivePanel}
                  tabType="chats"
                />
              ))}
            </div>
          </>
        ) : (
          <div className="chat-list bg-whatsapp-bg">
            {/* My Status Section - Updated with Info Text */}
            <div className="chat-item" style={{ borderBottom: 'none' }}>
              <div className="relative shrink-0">
                <div className="w-[44px] h-[44px] rounded-full bg-whatsapp-hover flex items-center justify-center text-xl">
                  📖
                </div>
                <div className="absolute bottom-0 right-0 w-[18px] h-[18px] bg-whatsapp-green rounded-full border-2 border-whatsapp-bg flex items-center justify-center text-white text-[12px] font-bold">
                  i
                </div>
              </div>
              <div className="chat-info">
                <div className="chat-name">What is Status here?</div>
                <div className="chat-preview whitespace-normal leading-tight text-xs">
                  Each feature has <strong>FAQ story cards</strong>. Tap any ring to see answers visually.
                </div>
              </div>
            </div>

            <div className="text-[11px] text-whatsapp-subtext uppercase tracking-[0.2em] py-4 font-bold border-y border-whatsapp-border/30 text-center bg-whatsapp-bg/50 backdrop-blur-sm sticky top-0 z-10">Recent updates</div>
            <div className="flex flex-col">
              {features.filter(f => f.id !== 'home').map(f => (
                <ChatItem
                  key={f.id}
                  id={f.id}
                  icon={f.id === 'journey' ? '🚶' : f.id === 'map' ? '🗺' : f.id === 'timeline' ? '📅' : f.id === 'learn' ? '📚' : '🤖'}
                  name={f.name}
                  preview={f.statusPreview}
                  meta={f.meta}
                  statusGradient={f.statusGradient}
                  onClick={() => setActiveStory(f.id)}
                  tabType="status"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="right-bg"></div>

        <AnimatePresence mode="wait">
          {activePanel === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <HomePanel onQuickAccess={setActivePanel} />
            </motion.div>
          ) : (
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="feature-panel"
            >
              <div className="feature-header">
                <div className={`avatar w-9 h-9 text-base`} style={{ background: features.find(f => f.id === activePanel)?.colorClass }}>
                  {(() => {
                    const Icon = features.find(f => f.id === activePanel)?.icon;
                    return typeof Icon === 'string' ? Icon : (Icon ? <Icon size={18} /> : null);
                  })()}
                </div>
                <div className="feature-header-info">
                  <div className="feature-title">{features.find(f => f.id === activePanel)?.name}</div>
                  <div className="feature-sub">
                    {activePanel === 'chat' ? (
                      <span className="flex items-center">
                        Visual-first AI <span className="online-indicator ml-1.5"></span>
                      </span>
                    ) : activePanel === 'journey' ? (
                      <span className="flex items-center text-whatsapp-green font-medium">
                        Interactive Journey <span className="online-indicator ml-1.5 bg-whatsapp-green"></span>
                      </span>
                    ) : 'Interactive election guide'}
                  </div>
                </div>
                <div className="feature-header-actions">
                  {activePanel === 'chat' && (
                    <button className="hdr-btn call-btn" onClick={() => setIsCalling(true)}>
                      <Phone size={19} />
                    </button>
                  )}
                </div>
              </div>

              <div className="feature-body flex flex-col h-full overflow-hidden relative bg-[#0b141a]" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
                {/* WhatsApp Chat Background Pattern */}
                {activePanel === 'chat' && (
                  <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.08]" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r2-1AIf_a8g.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }} />
                )}

                {activePanel === 'chat' ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 z-10">
                      <div className="text-center my-2">
                        <span className="bg-[#1a2731] text-whatsapp-subtext text-[11px] px-3 py-1 rounded-full border border-whatsapp-border">Today</span>
                      </div>
                      {messages.map((m, i) => (
                        <div key={i} className={`msg ${m.type === 'bot' ? 'bot' : 'user'}`}>
                          <div className="msg-bubble">
                            {/* Float the time first so text wraps around it — WhatsApp trick */}
                            <span className="msg-meta">
                              <span className="msg-time">{m.time}</span>
                              {m.type === 'user' && <span className="msg-ticks">✓✓</span>}
                            </span>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ node, ...props }) => <p className="mb-1 last:mb-0 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-1 space-y-0.5" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-1 space-y-0.5" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                              }}
                            >
                              {m.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="msg bot">
                          <div className="msg-bubble">
                            <span className="italic opacity-70 text-sm">Chunav Sathi is typing...</span>
                          </div>
                        </div>
                      )}

                    </div>
                    <div className="chat-input-bar">
                      <button className="w-[34px] h-[34px] rounded-full bg-whatsapp-hover flex items-center justify-center text-[#aebac1] shrink-0">
                        <Mic size={18} />
                      </button>
                      <input
                        className="chat-text-input"
                        placeholder="Message Chunav Sathi..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      />
                      <button
                        className={`send-btn transition-colors duration-200 ${!chatInput.trim() ? 'opacity-50 cursor-not-allowed bg-[#2a3942] text-[#8696a0]' : 'bg-[#00a884] text-white hover:bg-[#06cf9c]'}`}
                        onClick={handleSend}
                        disabled={!chatInput.trim()}
                      >
                        <Send size={16} fill={chatInput.trim() ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </>
                ) : activePanel === 'journey' ? (
                  <VoterJourney />
                ) : activePanel === 'map' ? (
                  <FindElectionOffices />
                ) : activePanel === 'learn' ? (
                  <ElectionProcess />
                ) : activePanel === 'timeline' ? (
                  <ElectionTimeline />
                ) : (
                  <div className="p-4 overflow-y-auto h-full">
                    <div className="bg-[#1a2731] border border-whatsapp-border rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                      <div className="text-5xl mb-4 opacity-50">🚧</div>
                      <h2 className="text-xl text-whatsapp-text font-medium">Under Construction</h2>
                      <p className="text-whatsapp-subtext mt-2 max-w-xs">
                        The {features.find(f => f.id === activePanel)?.name} module is being built with premium aesthetics following the monorepo spec.
                      </p>
                      <button className="mt-6 flex items-center gap-2 bg-whatsapp-green text-white px-6 py-2 rounded-full hover:bg-whatsapp-green/80 transition-colors">
                        Learn More <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Call Overlay */}
      <AnimatePresence>
        {isCalling && (
          <VoiceCall
            onClose={() => setIsCalling(false)}
            selectedLanguage={selectedLanguage}
          />
        )}
      </AnimatePresence>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="story-viewer open"
            onMouseDown={() => setIsStoryPaused(true)}
            onMouseUp={() => setIsStoryPaused(false)}
            onTouchStart={() => setIsStoryPaused(true)}
            onTouchEnd={() => setIsStoryPaused(false)}
          >
            <div className="story-prog">
              {Array.from({ length: features.find(f => f.id === activeStory)?.meta?.faqCount || 3 }).map((_, i) => (
                <div key={i} className={`sp ${i === storyStep ? 'active' : i < storyStep ? 'done' : ''}`}>
                  {i === storyStep && <div className="spf" style={{ animationDuration: isStoryPaused ? '0s' : '40s' }}></div>}
                </div>
              ))}
            </div>
            <div className="story-topbar">
              <div
                className="story-av-sm"
                style={{ background: features.find(f => f.id === activeStory)?.colorClass }}
              >
                {(() => {
                  const Icon = features.find(f => f.id === activeStory)?.icon;
                  return typeof Icon === 'string' ? Icon : (Icon ? <Icon size={16} /> : null);
                })()}
              </div>
              <div className="flex-1">
                <div className="story-name">{features.find(f => f.id === activeStory)?.name}</div>
                <div className="text-[10px] text-white/60">FAQ Card {storyStep + 1}</div>
              </div>
              <button className="s-close" onClick={() => setActiveStory(null)}>
                <X size={22} />
              </button>
            </div>
            <div className="story-body select-none">
              <motion.div
                key={`${activeStory}-${storyStep}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="story-emoji-big scale-125 drop-shadow-lg">
                  {['🚶', '🗺', '📅', '📚', '🤖'][features.findIndex(f => f.id === activeStory) - 1] || '🗳'}
                </div>
                <div className="story-q text-2xl px-4 font-bold">
                  {storyStep === 0 ? 'How do I make my Voter ID?' : storyStep === 1 ? 'Where is my polling booth?' : 'What documents are needed?'}
                </div>
                <div className="story-a backdrop-blur-md bg-white/10 border border-white/10 shadow-2xl">
                  {storyStep === 0
                    ? 'Visit voters.eci.gov.in → Fill Form 6 → Upload Aadhaar + photo → Get card in 7 days.'
                    : 'Use the "My Constituency" tab or visit electoralsearch.eci.gov.in to find your booth.'}
                </div>
              </motion.div>
              <span className="story-pill bg-[#00a884] text-white shadow-lg mt-12 uppercase tracking-widest font-bold text-[10px]">
                {activeStory}
              </span>
            </div>
            <div className="story-nav">
              <div className="snl" onClick={(e) => { e.stopPropagation(); handleStoryNav('prev'); }}></div>
              <div className="snr" onClick={(e) => { e.stopPropagation(); handleStoryNav('next'); }}></div>
            </div>
            {isStoryPaused && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 px-4 py-2 rounded-full text-xs text-white/80 backdrop-blur-sm">
                Paused
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="settings-overlay open"
            onClick={() => setShowSettings(false)}
          >
            <div className="settings-box" onClick={(e) => e.stopPropagation()}>
              <div className="text-lg font-medium text-whatsapp-text mb-4">⚙ Settings</div>
              <div className="mb-5">
                <div className="text-xs text-whatsapp-subtext mb-2">Choose your language</div>
                <div className="flex flex-wrap gap-1.5">
                  {['English', 'हिंदी', 'বাংলা', 'తెలుగు', 'मराठी', 'தமிழ்', 'ગુજરાતી', 'ಕನ್ನಡ'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`lang-chip hover:bg-white/10 ${lang === selectedLanguage ? 'sel' : ''}`}
                    >
                      {lang}
                    </button>
                  ))}
                  <span className="lang-chip bg-[#2e2a0d] border-[#f7c948] text-[#f7c948]">Desi Jugaad 😄</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-xs text-whatsapp-subtext mb-2">Theme</div>
                <div className="flex gap-2">
                  <button className="theme-btn sel">Dark</button>
                  <button className="theme-btn">Light</button>
                  <button className="theme-btn">System</button>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowSettings(false)}>Done</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
