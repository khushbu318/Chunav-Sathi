import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Search,
  MapPin,
  CheckCircle2,
  UserCheck,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const stages = [
  {
    id: "id-creation",
    title: "1. Voter ID Creation",
    icon: <UserPlus className="text-whatsapp-green" size={32} />,
    desc: "The journey starts with registration. Any citizen above 18 can apply.",
    points: [
      "Visit voters.eci.gov.in or use Voter Helpline App.",
      "Fill Form 6 with details and upload documents.",
      "A Booth Level Officer (BLO) verifies your home.",
      "Get your digital e-EPIC and physical Voter ID.",
    ],
    animation: "form",
  },
  {
    id: "list-check",
    title: "2. Check Name & Find Booth",
    icon: <Search className="text-whatsapp-yellow" size={32} />,
    desc: "Before election day, verify your entry and find where to go.",
    points: [
      "Search your name at electoralsearch.eci.gov.in.",
      "Confirm your Part Number and Serial Number.",
      "Find your exact Polling Station address.",
      "Check the timing (usually 7 AM to 6 PM).",
    ],
    animation: "search",
  },
  {
    id: "booth-process",
    title: "3. Inside the Polling Station",
    icon: <ShieldCheck className="text-blue-400" size={32} />,
    desc: "Enter the polling station and follow the officer guidance.",
    points: [
      "Visit your assigned Polling Station.",
      "Officer 1: Get your voter slip after verification.",
      "Officer 2: Help you with the exact room for voting.",
      "Officer 3: In the room, check your name in the list & ID proof.",
    ],
    animation: "check",
  },
  {
    id: "voting-evm",
    title: "4. Casting the Vote",
    icon: <Smartphone className="text-whatsapp-green" size={32} />,
    desc: "Go behind the secret compartment where the EVM is kept.",
    points: [
      "Look for your preferred candidate and their symbol.",
      "Press the BLUE button next to the name.",
      "Wait for the BEEP sound and see the red light.",
      "Check the VVPAT glass for the printed slip.",
    ],
    animation: "evm",
  },
  {
    id: "inked",
    title: "5. Proud Citizen",
    icon: <CheckCircle2 className="text-whatsapp-green" size={40} />,
    desc: "You have successfully participated in the democratic process!",
    points: [
      "Officer will apply indelible ink to your finger.",
      "Your ink is a mark of honor for the next few days.",
      "Democracy is strengthened by your one vote.",
    ],
    animation: "success",
  },
];

export default function VoterJourney() {
  const [currentStep, setCurrentStep] = useState(0);
  const [voted, setVoted] = useState(false);

  const handleNext = () => {
    if (currentStep < stages.length - 1) {
      if (currentStep === 3 && !voted) return; // Must vote first
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="w-full h-full bg-[#111b21] flex flex-col overflow-hidden voter-journey-container">
      {/* Animated Visual Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden visual-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.1, x: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="w-full max-w-md flex flex-col items-center justify-center gap-4 visual-container"
          >
            {/* Visual Representation */}
            <div className="relative w-34 h-34 flex items-center justify-center w-full">
              <motion.div
                animate={{ scale: [0, 0.05, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-whatsapp-green/5 rounded-full blur-1xl"
              />

              {stages[currentStep].animation === "form" && (
                <div className="relative flex items-center justify-center journey-icon-wrapper">
                  <div className="journey-icon-glow" />
                  <div className="journey-icon-ring" />
                  <motion.img
                    src="https://img.icons8.com/?size=200&id=bD2nhh9PAWxs&format=png&color=00a884"
                    alt="Registration"
                    className="w-22 h-22 object-contain brightness-150 drop-shadow-[0_0_20px_rgba(0,168,132,0.2)] journey-icon-inner"
                    animate={{
                      y: [0, -8, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              )}

              {stages[currentStep].animation === "search" && (
                <div className="flex flex-col items-center gap-4 journey-icon-wrapper">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="p-8 bg-whatsapp-yellow/10 rounded-full border border-whatsapp-yellow/20"
                  >
                    <Search size={64} className="text-whatsapp-yellow" />
                  </motion.div>
                  <div className="flex gap-2">
                    <MapPin className="text-whatsapp-subtext" size={16} />
                    <span className="text-xs text-whatsapp-subtext">
                      Part No: 154 | Booth: 12
                    </span>
                  </div>
                </div>
              )}

              {stages[currentStep].animation === "check" && (
                <div className="grid grid-cols-1 gap-4 w-full">
                  {[
                    {
                      icon: UserCheck,
                      label: "Officer 1: Voter Slip Issued",
                      color: "text-blue-400",
                    },
                    {
                      icon: ClipboardCheck,
                      label: "Officer 2: Room Guidance",
                      color: "text-whatsapp-yellow",
                    },
                    {
                      icon: ShieldCheck,
                      label: "Officer 3: ID & List Verified",
                      color: "text-whatsapp-green",
                    },
                  ].map((item, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.4 }}
                      key={idx}
                      className="bg-white/5 border border-white/10 px-5 py-3.5 rounded-3xl flex items-center gap-4 backdrop-blur-sm shadow-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex-nowrap w-full box-border justify-center inline-flex"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-all duration-300 hover:bg-white/10 border border-white/10">
                        <item.icon className={item.color} size={22} />
                      </div>
                      <span className="text-sm text-whatsapp-text font-semibold  whitespace-nowrap">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {stages[currentStep].animation === "evm" && (
                <div className="relative evm-container">
                  {!voted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 w-max bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full border border-blue-600/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                    >
                      Click the blue button to vote!
                    </motion.div>
                  )}
                  <div className="evm-inner">
                    <div className="evm-display">
                      {voted ? "VOTE RECORDED ✓" : "READY TO VOTE"}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                        <div className="w-8 h-8 bg-whatsapp-green/20 rounded-full" />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setVoted(true);
                            const audio = new Audio(
                              "https://www.soundjay.com/buttons/beep-07.wav",
                            );
                            audio.play().catch(() => {});
                          }}
                          className={`stage-evm-button transition-all duration-300 ${voted ? "voted" : ""}`}
                        />
                      </div>
                      <div className="flex items-center justify-between bg-white/5 p-2 rounded opacity-40">
                        <div className="w-8 h-8 bg-white/10 rounded-full" />
                        <div className="w-10 h-6 rounded bg-blue-600/50" />
                      </div>
                    </div>
                  </div>
                  {voted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -top-2 -right-2 bg-whatsapp-green text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg"
                    >
                      VOTED ✓
                    </motion.div>
                  )}
                </div>
              )}

              {stages[currentStep].animation === "success" && (
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="flex flex-col items-center gap-10 journey-icon-wrapper"
                >
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* External Finger Icon */}
                    <img
                      src="https://img.icons8.com/?size=200&id=W2EU0bSBDtcP&format=png&color=00a884"
                      alt="Index Finger"
                      className="w-40 h-40 object-contain brightness-200 drop-shadow-[0_0_20px_rgba(0,168,132,0.3)] journey-icon-inner"
                    />
                    {/* Ink Animation: blue ink appears with a draw effect */}
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                      style={{ originY: 0 }}
                      className="absolute top-[18.5%] left-[40.2%] -translate-x-1/2 w-2 h-7 z-20 ink-animation"
                    >
                      {/* Ink core */}
                      <div className="w-full h-full bg-blue-700 rounded-full shadow-[0_0_10px_2px_rgba(30,64,175,0.5)] border-2 border-blue-300 ink-core" />
                      {/* Ink shine */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-2 w-1 h-3 bg-blue-200/60 rounded-full blur-[1px] opacity-70" />
                    </motion.div>
                    {/* Success Glow */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-whatsapp-green/20 rounded-full blur-3xl -z-10"
                    />
                  </div>
                  <div className="text-center">
                    {/* <h3 className="text-3xl font-black text-whatsapp-green drop-shadow-xl tracking-widest uppercase">PROUD VOTER</h3> */}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Text Content */}
            <div className="text-center w-full max-w-lg flex flex-col gap-2">
              <div>
                <h2 className="step-title">{stages[currentStep].title}</h2>
                <p className="step-description">{stages[currentStep].desc}</p>
              </div>
              <div className="info-card">
                {stages[currentStep].points.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="point-item"
                  >
                    <div className="point-icon">
                      <CheckCircle2 size={18} className="text-whatsapp-green" />
                    </div>
                    <span className="point-text">{p}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="bg-[#202c33]/95 backdrop-blur-2xl border-t border-whatsapp-border/50 p-6 flex justify-center">
        <div className="flex items-center gap-8 w-full max-w-2xl justify-center relative">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`nav-button nav-button-prev transition-all duration-300 ${
              currentStep === 0 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <ChevronLeft size={22} className="shrink-0" />
            <span className="flex-1 text-center">Back</span>
          </button>

          <div className="flex gap-4">
            {stages.map((_, i) => (
              <motion.div
                key={i}
                animate={
                  i === currentStep ? { scale: [1, 1.2, 1] } : { scale: 1 }
                }
                transition={{
                  duration: 1.2,
                  repeat: i === currentStep ? Infinity : 0,
                }}
                className={`progress-indicator ${i === currentStep ? "active" : "inactive"}`}
                style={{
                  width: i === currentStep ? "48px" : "10px",
                  height: "10px",
                }}
              />
            ))}
          </div>

          {/* <button 
            onClick={handleNext}
            disabled={currentStep === stages.length - 1 || (currentStep === 3 && !voted)}
            className={`nav-button nav-button-next transition-all duration-300 ${
              currentStep === stages.length - 1 || (currentStep === 3 && !voted) 
                ? 'opacity-0 pointer-events-none' 
                : ''
            }`}
          >
            <span className="flex-1 text-center">{currentStep === 3 && !voted ? 'Cast Vote' : currentStep === stages.length - 1 ? 'Finish' : 'Continue'}</span>
            <ChevronRight size={22} className="shrink-0" />
          </button> */}

          <div className="relative group">
            {/* Tooltip — shows only on step 3 before voting */}
            {currentStep === 3 && !voted && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-[#1a2731] border border-whatsapp-green/30 text-whatsapp-green text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
              >
                
              </motion.div>
            )}

            <button
              onClick={handleNext}
              disabled={
                currentStep === stages.length - 1 ||
                (currentStep === 3 && !voted)
              }
              className={`nav-button nav-button-next transition-all duration-300 ${
                currentStep === stages.length - 1
                  ? "opacity-0 pointer-events-none"
                  : ""
              }`}
            >
              <span className="flex-1 text-center">
                {currentStep === 3 && !voted
                  ? "Cast Your Vote By Clicking EVM Blue Button"
                  : currentStep === stages.length - 1
                    ? "Finish"
                    : "Continue"}
              </span>
              <ChevronRight size={22} className="shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
