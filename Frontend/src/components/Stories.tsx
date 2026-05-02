import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// FAQ Data Structure
interface FAQ {
  question: string;
  answer: string;
}

interface StoryTopic {
  id: string;
  name: string;
  emoji: string;
  colorClass: string;
  faqs: FAQ[];
}

const storyData: StoryTopic[] = [
  {
    id: 'journey',
    name: 'First Time Voter Journey',
    emoji: '🚶',
    colorClass: '#27ae60',
    faqs: [
      {
        question: 'How do I make my Voter ID?',
        answer: 'Visit voters.eci.gov.in → Fill Form 6 online → Upload Aadhaar card + passport photo → A Booth Level Officer visits your home to verify → Get your e-EPIC (digital Voter ID) within 7 working days. It\'s completely free.'
      },
      {
        question: 'How do I find my polling booth?',
        answer: 'Go to electoralsearch.eci.gov.in → Enter your name or EPIC number → Your exact polling station address, room number, and part number appear instantly. Save the address before election day.'
      },
      {
        question: 'What documents do I carry on voting day?',
        answer: 'Your Voter ID card (EPIC) is primary. If you don\'t have it, any ONE of these works: Aadhaar card, Passport, Driving Licence, PAN card, MNREGA job card, Bank passbook with photo. 12 documents are officially accepted.'
      },
      {
        question: 'What should I NOT do at the polling booth?',
        answer: 'Do NOT carry your mobile phone inside the voting compartment. Do NOT wear any party symbol or political slogan on your clothes. Do NOT take photos inside. Do NOT tell anyone who you voted for — your vote is secret by law.'
      },
      {
        question: 'What happens after I press the EVM button?',
        answer: 'You hear a beep sound and a red light blinks on the EVM next to your candidate\'s name. A VVPAT machine beside the EVM prints a slip showing your candidate\'s name and symbol — visible for 7 seconds behind a glass window. This confirms your vote was recorded correctly.'
      }
    ]
  },
  {
    id: 'map',
    name: 'My Constituency',
    emoji: '🗺',
    colorClass: '#e74c3c',
    faqs: [
      {
        question: 'How do I find my MP\'s name and party?',
        answer: 'Open My Constituency → enter your pincode or city → your Lok Sabha constituency name, current MP name, party, and vote margin from the last election are shown instantly. No login required.'
      },
      {
        question: 'What is the difference between Lok Sabha and Vidhan Sabha constituency?',
        answer: 'Lok Sabha constituency elects your MP who goes to Parliament in Delhi. Vidhan Sabha constituency elects your MLA who goes to the State Assembly. One Lok Sabha constituency usually contains 6 to 8 Vidhan Sabha constituencies inside it.'
      },
      {
        question: 'How do I find election offices and polling booths near me?',
        answer: 'Enter your pincode or area name in the search bar → the app uses Google Maps to show all nearby polling booths and election offices with their address, distance, and an "Open in Maps" button to get directions.'
      },
      {
        question: 'What is voter turnout and why does it matter?',
        answer: 'Voter turnout is the percentage of registered voters who actually voted. India\'s 2024 Lok Sabha average was 65.7%. Low turnout means a small group of people decide the government for everyone. Your single vote can change the result — many constituencies are won by under 500 votes.'
      },
      {
        question: 'Can I vote if I moved to a new city?',
        answer: 'You can only vote where you are registered. If you moved, update your address by filing Form 8A at voters.eci.gov.in before the voter list revision deadline. Until then you must travel to your registered constituency to vote or apply for postal ballot if eligible.'
      }
    ]
  },
  {
    id: 'timeline',
    name: 'Election Timeline',
    emoji: '📅',
    colorClass: '#8e44ad',
    faqs: [
      {
        question: 'What is the Model Code of Conduct (MCC)?',
        answer: 'MCC is a set of rules by the Election Commission that kicks in from the day elections are announced. During MCC: no new government schemes can be launched, no transfers of key officials without EC approval, no use of government resources for campaigning. It ends on the day results are declared.'
      },
      {
        question: 'How many phases does a Lok Sabha election have and why?',
        answer: 'Lok Sabha 2024 had 7 phases spread over 44 days. Multiple phases exist because India has over 1 million polling booths and limited security forces. Security personnel move from one phase area to the next, ensuring free and fair elections across 543 constituencies.'
      },
      {
        question: 'What happens on counting day?',
        answer: 'All EVMs are brought to a counting centre in each constituency. Counting starts at 8 AM. Results are declared constituency by constituency throughout the day. The candidate with the highest votes wins — even if it is just 1 vote more than the second candidate (FPTP system).'
      },
      {
        question: 'How long does the entire election process take from announcement to result?',
        answer: 'Lok Sabha 2024 took 82 days from announcement (March 16) to result (June 4). This includes: nomination period, campaigning period, voting phases, and counting. State elections are usually completed faster in 30 to 45 days.'
      },
      {
        question: 'When does the new government take oath after results?',
        answer: 'After results, the winning party or coalition has to prove majority in the Lok Sabha. The President invites the leader to form the government. The Prime Minister and Cabinet take oath typically within 10 to 15 days of the result date at Rashtrapati Bhavan.'
      }
    ]
  },
  {
    id: 'learn',
    name: 'Know Your Election Process',
    emoji: '📚',
    colorClass: '#16a085',
    faqs: [
      {
        question: 'What is the difference between an MP and an MLA?',
        answer: 'MP (Member of Parliament) represents a Lok Sabha constituency at the national level in New Delhi. MLA (Member of Legislative Assembly) represents a Vidhan Sabha constituency at the state level. MPs make national laws. MLAs make state laws. Both are directly elected by voters every 5 years.'
      },
      {
        question: 'What is NOTA and does it actually make a difference?',
        answer: 'NOTA (None Of The Above) was introduced in 2013 by the Supreme Court. It lets you reject all candidates. However currently in India, even if NOTA gets the most votes, the candidate with the next highest votes still wins. NOTA has no power to trigger re-election yet — but it sends a strong political message.'
      },
      {
        question: 'How is the Prime Minister chosen?',
        answer: 'Indians do not directly vote for the Prime Minister. You vote for your local MP candidate. After results, the party or coalition with majority (272+ seats out of 543) forms the government. That party\'s leader becomes Prime Minister and is appointed by the President of India.'
      },
      {
        question: 'What is the difference between Rajya Sabha and Lok Sabha?',
        answer: 'Lok Sabha (Lower House) has 543 elected members, directly elected by citizens, maximum 5-year term, can be dissolved. Rajya Sabha (Upper House) has 245 members, indirectly elected by state legislatures, is a permanent house that never dissolves, members serve 6-year terms with 1/3 retiring every 2 years.'
      },
      {
        question: 'What is the Election Commission of India and what power does it have?',
        answer: 'ECI is an independent constitutional body established in 1950 under Article 324. It has complete control over conducting elections — announces dates, enforces MCC, transfers officials, can cancel polling in specific booths if booth capturing occurs, disqualifies candidates for violations, and controls all election expenses. No government can interfere with ECI decisions.'
      }
    ]
  },
  {
    id: 'chat',
    name: 'Chat with Chunav Sathi — How to Use Guide',
    emoji: '🤖',
    colorClass: '#c0392b',
    faqs: [
      {
        question: 'What can I ask Chunav Sathi?',
        answer: 'You can ask anything about Indian elections — how to register to vote, how EVM works, what NOTA means, difference between MP and MLA, how results are counted, what Model Code of Conduct is, candidate eligibility rules, how to file a complaint against a candidate, RTI about elections — anything at all. Chunav Sathi is trained on official ECI documents and election laws.'
      },
      {
        question: 'How do I use the voice call feature?',
        answer: 'Tap the green 📞 call icon in the top right corner of the Chat panel. A call screen opens. Speak your question naturally in your language. Chunav Sathi listens, understands, and speaks the answer back to you. A live transcript of the full conversation appears on screen simultaneously so you can read along. Tap the red 📵 button to end the call anytime.'
      },
      {
        question: 'Which languages can I ask questions in?',
        answer: 'You can type or speak in Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, or Bhojpuri. Chunav Sathi automatically detects your language and responds in the same language. Change your preferred language anytime from the ⚙ Settings menu in the top left.'
      },
      {
        question: 'Why does Chunav Sathi answer with cards and visuals instead of long text?',
        answer: 'Long text is hard to read and understand. Chunav Sathi gives you visual answers — step-by-step cards, comparison charts, infographics, and timelines — because election processes are easier to understand when you can see them. Every answer is designed to be understood in under 30 seconds without reading paragraphs.'
      },
      {
        question: 'Is the information given by Chunav Sathi accurate and official?',
        answer: 'Yes. Chunav Sathi is built on a knowledge base of official ECI documents, the Representation of the People Act 1950 and 1951, Election Commission orders, and verified government sources. It does not give opinions on candidates or parties. If you ask about a specific candidate or party, Chunav Sathi will only share publicly available official data — never opinions or recommendations.'
      }
    ]
  }
];

interface StoriesProps {
  activeStory: string | null;
  onClose: () => void;
}

export const Stories: React.FC<StoriesProps> = ({ activeStory, onClose }) => {
  const [storyStep, setStoryStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentTopic = storyData.find(topic => topic.id === activeStory);

  useEffect(() => {
    if (!activeStory || !currentTopic || isPaused) return;

    const timer = setInterval(() => {
      setStoryStep((prev) => {
        if (prev < currentTopic.faqs.length - 1) {
          return prev + 1;
        } else {
          onClose();
          return 0;
        }
      });
    }, 40000); // 40 seconds per FAQ

    return () => clearInterval(timer);
  }, [activeStory, currentTopic, isPaused, onClose]);

  useEffect(() => {
    // Reset step when story changes
    setStoryStep(0);
  }, [activeStory]);

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!currentTopic) return;

    if (direction === 'next') {
      if (storyStep < currentTopic.faqs.length - 1) {
        setStoryStep(s => s + 1);
      } else {
        onClose();
      }
    } else {
      if (storyStep > 0) {
        setStoryStep(s => s - 1);
      }
    }
  };

  if (!currentTopic) return null;

  const currentFaq = currentTopic.faqs[storyStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="story-viewer open"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="story-prog">
          {currentTopic.faqs.map((_, i) => (
            <div key={i} className={`sp ${i === storyStep ? 'active' : i < storyStep ? 'done' : ''}`}>
              {i === storyStep && (
                <div
                  className="spf"
                  style={{ animationDuration: isPaused ? '0s' : '40s' }}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Top Bar */}
        <div className="story-topbar">
          <div
            className="story-av-sm"
            style={{ background: currentTopic.colorClass }}
          >
            {currentTopic.emoji}
          </div>
          <div className="flex-1">
            <div className="story-name">{currentTopic.name}</div>
            <div className="text-[10px] text-white/60">
              FAQ Card {storyStep + 1} of {currentTopic.faqs.length}
            </div>
          </div>
          <button className="s-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Story Content */}
        <div className="story-body select-none">
          <motion.div
            key={`${activeStory}-${storyStep}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="story-emoji-big scale-125 drop-shadow-lg">
              {currentTopic.emoji}
            </div>
            <div className="story-q text-2xl px-4 font-bold">
              {currentFaq.question}
            </div>
            <div className="story-a backdrop-blur-md bg-white/10 border border-white/10 shadow-2xl">
              {currentFaq.answer}
            </div>
          </motion.div>
          <span className="story-pill bg-[#00a884] text-white shadow-lg mt-12 uppercase tracking-widest font-bold text-[10px]">
            {currentTopic.id}
          </span>
        </div>

        {/* Navigation Areas */}
        <div className="story-nav">
          <div
            className="snl"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation('prev');
            }}
          ></div>
          <div
            className="snr"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation('next');
            }}
          ></div>
        </div>

        {/* Pause Indicator */}
        {isPaused && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 px-4 py-2 rounded-full text-xs text-white/80 backdrop-blur-sm">
            Paused
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Stories;