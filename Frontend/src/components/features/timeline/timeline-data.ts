/**
 * Reference election timeline data used for the UI.
 *
 * These dates are bundled with the app and are not fetched live from ECI.
 * Users should verify critical timelines on official ECI or State Election
 * Commission websites before relying on them.
 *
 * NOTE: This is a reference timeline showing typical milestones.
 * Actual dates vary by election and must be confirmed with official sources.
 */

export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  eventType: 'notification' | 'nomination' | 'withdrawal' | 'polling' | 'counting' | 'result' | 'mcc' | 'campaign' | 'scrutiny' | 'state-election' | 'municipal' | 'panchayat' | 'key-date';
  title: string;
  description: string;
  details: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  phase?: number;
  icon: string;
  color: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  timelineLabel?: string; // T-45 to T-60 days before polling
  sources: {
    label: string;
    url: string;
  }[];
}

export const electionTimelineData: TimelineEvent[] = [
  {
    id: 'schedule-announced',
    date: '2026-01-20',
    eventType: 'notification',
    title: 'Election Schedule Announced',
    description: 'The Election Commission announces dates for all phases. Model Code of Conduct comes into immediate effect.',
    details: 'Election schedule announcement marks the official beginning of the election process. The Model Code of Conduct is immediately enforced across the nation, restricting government officials and politicians from using government resources for campaigning.',
    status: 'upcoming',
    icon: '📅',
    color: 'from-red-600 to-red-500',
    importance: 'critical',
    timelineLabel: 'T-45 to T-60 days before polling',
    sources: [
      { label: 'ECI Official Website', url: 'https://eci.gov.in' },
      { label: 'Model Code of Conduct', url: 'https://eci.gov.in/election-code-of-conduct' }
    ]
  },
  {
    id: 'nomination-start',
    date: '2026-02-17',
    eventType: 'nomination',
    title: 'Nomination Filing Begins',
    description: 'Candidates can start filing nomination papers with Returning Officers',
    details: 'Nomination filing period begins. Candidates must submit nomination papers along with required documents including citizenship proof, age verification, and financial statements.',
    status: 'upcoming',
    icon: '📝',
    color: 'from-blue-600 to-blue-500',
    importance: 'high',
    timelineLabel: 'T-28 to T-35 days before polling',
    sources: [
      { label: 'ECI Nomination Guidelines', url: 'https://eci.gov.in/candidate-guidelines' }
    ]
  },
  {
    id: 'nomination-end',
    date: '2026-02-24',
    eventType: 'nomination',
    title: 'Last Date for Nominations',
    description: 'Final day to file nomination papers. Check with your local Returning Officer for exact deadline and location.',
    details: 'This is the final deadline for all candidates to file their nomination papers. After this date, no new nominations are accepted.',
    status: 'upcoming',
    icon: '⏳',
    color: 'from-orange-600 to-orange-500',
    importance: 'critical',
    timelineLabel: 'T-25 to T-28 days before polling',
    sources: [
      { label: 'Election Conduct Rules', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'nomination-scrutiny',
    date: '2026-02-25',
    eventType: 'scrutiny',
    title: 'Scrutiny of Nominations',
    description: 'Electoral officers examine all nominations for compliance and validity',
    details: 'Detailed scrutiny of all submitted nominations is conducted by electoral officers, checking eligibility criteria and document completeness. Invalid nominations are rejected with reasons provided.',
    status: 'upcoming',
    icon: '🔍',
    color: 'from-cyan-600 to-cyan-500',
    importance: 'medium',
    timelineLabel: 'T-24 to T-26 days before polling',
    sources: [
      { label: 'Conduct of Elections Rules', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'withdrawal-start',
    date: '2026-02-26',
    eventType: 'withdrawal',
    title: 'Withdrawal of Candidature Begins',
    description: 'Candidates can withdraw their nominations after scrutiny is completed',
    details: 'After scrutiny, candidates who wish to withdraw from the race can do so during this period. Once withdrawn, a candidate cannot contest from the same seat in that election.',
    status: 'upcoming',
    icon: '❌',
    color: 'from-rose-600 to-rose-500',
    importance: 'medium',
    timelineLabel: 'T-23 to T-25 days before polling',
    sources: [
      { label: 'Election Rules', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'withdrawal-end',
    date: '2026-02-27',
    eventType: 'withdrawal',
    title: 'Last Date for Withdrawal',
    description: 'Final day for candidates to withdraw nominations',
    details: 'After this deadline, the list of candidates is finalized and cannot be changed. The final candidate list is published and disseminated.',
    status: 'upcoming',
    icon: '📌',
    color: 'from-pink-600 to-pink-500',
    importance: 'critical',
    timelineLabel: 'T-22 to T-24 days before polling',
    sources: [
      { label: 'Election Rules 1961', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'campaign-peak',
    date: '2026-02-28',
    eventType: 'campaign',
    title: 'Campaign Period Active',
    description: 'Political parties and candidates conduct active campaigns with rallies, canvassing, and media engagement',
    details: 'This period sees intensive campaigning through public rallies, door-to-door canvassing, media advertisements, and social media outreach. All campaign activities must comply with Model Code of Conduct and expenditure limits.',
    status: 'upcoming',
    icon: '📣',
    color: 'from-indigo-600 to-indigo-500',
    importance: 'medium',
    timelineLabel: 'T-10 to T-20 days before polling',
    sources: [
      { label: 'Model Code of Conduct', url: 'https://eci.gov.in/election-code-of-conduct' }
    ]
  },
  {
    id: 'phase1-polling',
    date: '2026-03-11',
    eventType: 'polling',
    title: 'Phase 1 Polling',
    description: 'Voting begins in Phase 1 constituencies',
    details: 'First phase of polling. Polling booths operate from 7:00 AM to 6:00 PM. Voting is done using EVMs (Electronic Voting Machines) with VVPAT (Voter Verified Paper Audit Trail). Election observers and security personnel are stationed at each booth.',
    status: 'upcoming',
    phase: 1,
    icon: '🗳️',
    color: 'from-green-600 to-green-500',
    importance: 'high',
    sources: [
      { label: 'ECI Polling Guidelines', url: 'https://eci.gov.in/polling-guidelines' }
    ]
  },
  {
    id: 'phase2-polling',
    date: '2026-03-18',
    eventType: 'polling',
    title: 'Phase 2 Polling',
    description: 'Voting in Phase 2 constituencies',
    details: 'Second phase of polling. Voting procedures same as Phase 1 - EVMs with VVPAT, 7 AM to 6 PM.',
    status: 'upcoming',
    phase: 2,
    icon: '🗳️',
    color: 'from-green-600 to-green-500',
    importance: 'high',
    sources: [
      { label: 'ECI Polling Guidelines', url: 'https://eci.gov.in/polling-guidelines' }
    ]
  },
  {
    id: 'phase3-polling',
    date: '2026-03-25',
    eventType: 'polling',
    title: 'Phase 3 Polling',
    description: 'Voting in Phase 3 constituencies',
    details: 'Third phase of polling. Standard voting procedures and timings apply.',
    status: 'upcoming',
    phase: 3,
    icon: '🗳️',
    color: 'from-green-600 to-green-500',
    importance: 'high',
    sources: [
      { label: 'ECI Polling Guidelines', url: 'https://eci.gov.in/polling-guidelines' }
    ]
  },
  {
    id: 'phase4-polling',
    date: '2026-04-01',
    eventType: 'polling',
    title: 'Phase 4 Polling',
    description: 'Voting in Phase 4 constituencies',
    details: 'Fourth phase of polling.',
    status: 'upcoming',
    phase: 4,
    icon: '🗳️',
    color: 'from-green-600 to-green-500',
    importance: 'high',
    sources: [
      { label: 'ECI Polling Guidelines', url: 'https://eci.gov.in/polling-guidelines' }
    ]
  },
  {
    id: 'phase5-polling',
    date: '2026-04-08',
    eventType: 'polling',
    title: 'Phase 5 Polling',
    description: 'Voting in Phase 5 constituencies',
    details: 'Fifth phase of polling.',
    status: 'upcoming',
    phase: 5,
    icon: '🗳️',
    color: 'from-green-600 to-green-500',
    importance: 'high',
    sources: [
      { label: 'ECI Polling Guidelines', url: 'https://eci.gov.in/polling-guidelines' }
    ]
  },
  {
    id: 'phase6-polling',
    date: '2026-04-15',
    eventType: 'polling',
    title: 'Phase 6 Polling',
    description: 'Voting in Phase 6 constituencies',
    details: 'Sixth phase of polling.',
    status: 'upcoming',
    phase: 6,
    icon: '🗳️',
    color: 'from-green-600 to-green-500',
    importance: 'high',
    sources: [
      { label: 'ECI Polling Guidelines', url: 'https://eci.gov.in/polling-guidelines' }
    ]
  },
  {
    id: 'phase7-polling',
    date: '2026-04-22',
    eventType: 'polling',
    title: 'Phase 7 Polling (Final)',
    description: 'Final phase of voting across remaining constituencies',
    details: 'Last phase of polling. After this date, all voting is completed and vote counting commences.',
    status: 'upcoming',
    phase: 7,
    icon: '🗳️',
    color: 'from-green-600 to-green-500',
    importance: 'high',
    sources: [
      { label: 'ECI Polling Guidelines', url: 'https://eci.gov.in/polling-guidelines' }
    ]
  },
  {
    id: 'counting-day',
    date: '2026-04-25',
    eventType: 'counting',
    title: 'Counting Day & Results',
    description: 'Votes are counted at designated centres. Results are declared as counting progresses.',
    details: 'Counting begins at 8:00 AM. VVPAT verification is conducted for 5 randomly selected EVMs per constituency. Then EVM votes are counted and results declared constituency-wise. Victory margins and vote shares are announced.',
    status: 'upcoming',
    icon: '📊',
    color: 'from-yellow-600 to-yellow-500',
    importance: 'high',
    timelineLabel: 'T+2 to T+5 days after final polling phase',
    sources: [
      { label: 'Counting Procedures', url: 'https://eci.gov.in/counting-procedure' }
    ]
  },
  {
    id: 'state-assembly-2026',
    date: '2026-06-01',
    eventType: 'state-election',
    title: 'State Assembly Elections 2026',
    description: 'State assembly elections scheduled for 2026 as per 5-year electoral cycle',
    details: 'Multiple states hold Legislative Assembly elections following their 5-year election cycles. Exact dates are announced by respective State Election Commissions. Check official sources for your state.',
    status: 'upcoming',
    icon: '🏛️',
    color: 'from-purple-600 to-purple-500',
    importance: 'high',
    timelineLabel: '2026 (dates to be announced)',
    sources: [
      { label: 'State Election Commission', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'panchayat-elections',
    date: '2026-07-01',
    eventType: 'panchayat',
    title: 'Panchayat Elections',
    description: 'Rural local body (Panchayat) elections scheduled for several states in 2026',
    details: 'Panchayat elections follow 5-year cycles and are scheduled state-by-state. Contact your State Election Commission for specific dates and voter registration information.',
    status: 'upcoming',
    icon: '🏘️',
    color: 'from-cyan-600 to-cyan-500',
    importance: 'high',
    timelineLabel: '2026 (state-specific dates)',
    sources: [
      { label: 'State Election Commission', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'municipal-elections',
    date: '2026-08-01',
    eventType: 'municipal',
    title: 'Municipal Elections 2026',
    description: 'Urban local body elections in cities and municipal corporations scheduled for 2026',
    details: 'Municipal and city council elections are held following 5-year cycles. Check your city municipal corporation or State Election Commission website for schedules and details.',
    status: 'upcoming',
    icon: '🏙️',
    color: 'from-orange-600 to-orange-500',
    importance: 'medium',
    timelineLabel: '2026 (city-specific dates)',
    sources: [
      { label: 'Municipal Corporation', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'national-voters-day',
    date: '2026-01-25',
    eventType: 'key-date',
    title: 'National Voters\' Day',
    description: 'Celebrated annually on January 25 to honor voters and encourage democratic participation',
    details: 'National Voters\' Day commemorates the establishment of the Election Commission of India. This day celebrates voter rights and encourages new voters to register and participate in the democratic process.',
    status: 'upcoming',
    icon: '🎉',
    color: 'from-green-600 to-green-500',
    importance: 'low',
    timelineLabel: '2026-01-25',
    sources: [
      { label: 'ECI National Voters Day', url: 'https://eci.gov.in/nvd' }
    ]
  }
];

export const phaseInfo = [
  { phase: 1, constituencies: 91, states: 'Multiple states including Northeast' },
  { phase: 2, constituencies: 97, states: 'Eastern & Central regions' },
  { phase: 3, constituencies: 116, states: 'Northern & Central India' },
  { phase: 4, constituencies: 91, states: 'Western & Central India' },
  { phase: 5, constituencies: 66, states: 'Southern regions' },
  { phase: 6, constituencies: 71, states: 'Southern & Eastern states' },
  { phase: 7, constituencies: 71, states: 'Remaining constituencies' }
];

/**
 * Get days remaining until a specific date
 */
export function getDaysRemaining(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get the next polling phase
 */
export function getNextPollingPhase(): TimelineEvent | null {
  const pollingEvents = electionTimelineData.filter(e => e.eventType === 'polling');
  const nextEvent = pollingEvents.find(e => getDaysRemaining(e.date) > 0);
  return nextEvent || null;
}

/**
 * Get current election phase
 */
export function getCurrentPhase(): number {
  const nextPhase = getNextPollingPhase();
  if (!nextPhase) return 0;
  return (nextPhase.phase || 1) - 1; // If last phase upcoming, current is 6
}

/**
 * Format date for display
 */
export function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get status based on date
 */
export function getEventStatus(dateString: string): 'completed' | 'ongoing' | 'upcoming' {
  const daysRemaining = getDaysRemaining(dateString);
  if (daysRemaining < 0) return 'completed';
  if (daysRemaining === 0) return 'ongoing';
  return 'upcoming';
}

export function getTimelineEvents(): TimelineEvent[] {
  return electionTimelineData.map((event) => ({
    ...event,
    status: getEventStatus(event.date),
  }));
}
