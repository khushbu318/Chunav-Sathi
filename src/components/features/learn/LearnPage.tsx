import React from 'react';
import { ChevronRight, Landmark, Map as MapIcon, Home, Scale } from 'lucide-react';

const LearnCard = ({ icon: Icon, title, sub }: any) => (
  <div className="bg-whatsapp-panel hover:bg-whatsapp-hover border border-whatsapp-border rounded-xl p-4 mb-3 cursor-pointer transition-colors flex items-center gap-4">
    <div className="w-11 h-11 bg-whatsapp-bg rounded-xl flex items-center justify-center shrink-0">
      <Icon size={24} className="text-whatsapp-subtext" />
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-whatsapp-text">{title}</div>
      <div className="text-[12px] text-whatsapp-subtext mt-0.5">{sub}</div>
    </div>
    <ChevronRight size={18} className="text-whatsapp-subtext" />
  </div>
);

export default function LearnPage() {
  return (
    <div className="space-y-4">
      <div className="text-[12px] text-whatsapp-subtext mb-2">Unit 1 — How India votes</div>
      
      <LearnCard 
        icon={Landmark} 
        title="Lok Sabha — The People's House" 
        sub="543 seats · 5-year term · Direct election" 
      />
      <LearnCard 
        icon={Landmark} 
        title="Rajya Sabha — The Upper House" 
        sub="245 seats · Permanent · Indirect election" 
      />
      <LearnCard 
        icon={MapIcon} 
        title="State elections — Vidhan Sabha" 
        sub="MLAs · State legislature · Every 5 years" 
      />
      <LearnCard 
        icon={Home} 
        title="Local body — Panchayat & Municipal" 
        sub="Gram Panchayat · Nagar Palika · Ward" 
      />
      <LearnCard 
        icon={Scale} 
        title="Election Commission of India" 
        sub="Who runs elections? Model Code of Conduct" 
      />
    </div>
  );
}
