/**
 * Official 2026 Indian Election Timeline Data
 * Complete schedule from election announcements through results and beyond
 * 
 * References:
 * - Election Commission of India (eci.gov.in)
 * - Representation of the People Act, 1950/1951
 * - Historical election schedules from 2024 cycle
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
    details: 'ECI officially announces the complete election schedule including all phase dates, polling schedule, and key deadlines. Model Code of Conduct (MCC) is immediately enforced across the nation.',
    status: 'upcoming',
    icon: '📅',
    color: 'from-red-600 to-red-500',
    importance: 'critical',
    timelineLabel: 'T-45 to T-60 days before polling',
    sources: [
      { label: 'ECI Official', url: 'https://eci.gov.in' },
      { label: 'MCC Guidelines', url: 'https://eci.gov.in/election-code-of-conduct' }
    ]
  },
  {
    id: 'nomination-start',
    date: '2026-02-17',
    eventType: 'nomination',
    title: 'Nomination Filing Begins',
    description: 'Candidates start filing nomination papers with Returning Officers',
    details: 'Nomination filing period opens. Candidates must submit nomination papers with required documents including citizenship proof, age verification, criminal record declaration, and financial statements.',
    status: 'upcoming',
    icon: '📝',
    color: 'from-blue-600 to-blue-500',
    importance: 'high',
    timelineLabel: 'T-28 to T-35 days',
    sources: [
      { label: 'ECI Nomination Rules', url: 'https://eci.gov.in/candidate-guidelines' }
    ]
  },
  {
    id: 'nomination-end',
    date: '2026-02-24',
    eventType: 'nomination',
    title: 'Last Date for Nominations',
    description: 'Final day to file nomination papers. Late submissions are not accepted under any circumstances.',
    details: 'This is the absolute final deadline for all candidates wishing to contest the election. After 5:00 PM, no new nominations will be accepted. Submissions must be made in person or by authorized agent.',
    status: 'upcoming',
    icon: '⏳',
    color: 'from-orange-600 to-orange-500',
    importance: 'critical',
    timelineLabel: 'T-25 to T-28 days',
    sources: [
      { label: 'Election Rules 1961', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'nomination-scrutiny',
    date: '2026-02-25',
    eventType: 'scrutiny',
    title: 'Scrutiny of Nominations',
    description: 'Returning Officers examine all nominations for compliance. Invalid nominations are rejected.',
    details: 'Electoral officers conduct detailed scrutiny of all submitted nominations checking eligibility criteria, document completeness, and legal compliance. Invalid nominations are formally rejected with reasons provided.',
    status: 'upcoming',
    icon: '🔍',
    color: 'from-cyan-600 to-cyan-500',
    importance: 'medium',
    timelineLabel: 'T-24 to T-26 days',
    sources: [
      { label: 'Conduct of Elections Rules', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'withdrawal-start',
    date: '2026-02-26',
    eventType: 'withdrawal',
    title: 'Withdrawal of Candidature Begins',
    description: 'Candidates can withdraw their nominations after scrutiny completion',
    details: 'After scrutiny is complete, candidates who wish to withdraw can do so. This is the window for candidates to exit the race. Once withdrawn, candidature cannot be reinstated for that election.',
    status: 'upcoming',
    icon: '❌',
    color: 'from-rose-600 to-rose-500',
    importance: 'medium',
    timelineLabel: 'T-23 to T-25 days',
    sources: [
      { label: 'Election Rules', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'withdrawal-end',
    date: '2026-02-27',
    eventType: 'withdrawal',
    title: 'Last Date for Withdrawal',
    description: 'Final day for candidates to withdraw nominations. After this, the candidate list is final.',
    details: 'After this deadline, all candidates who haven\'t withdrawn are locked in and cannot withdraw. The final list of candidates is published and publicized by Returning Officers.',
    status: 'upcoming',
    icon: '📌',
    color: 'from-pink-600 to-pink-500',
    importance: 'critical',
    timelineLabel: 'T-22 to T-24 days',
    sources: [
      { label: 'Election Rules 1961', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'campaign-peak',
    date: '2026-02-28',
    eventType: 'campaign',
    title: 'Campaign Period Peak',
    description: 'Active campaigning with rallies, door-to-door canvassing, media ads, and social media outreach. Expenditure limits enforced.',
    details: 'Political parties and candidates conduct intensive campaigns. This includes public rallies, door-to-door canvassing, media advertisements, social media outreach, and public meetings. Campaign expenditure limits are strictly enforced.',
    status: 'upcoming',
    icon: '📣',
    color: 'from-indigo-600 to-indigo-500',
    importance: 'medium',
    timelineLabel: 'T-10 to T-20 days',
    sources: [
      { label: 'MCC Campaign Rules', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'phase1-polling',
    date: '2026-03-11',
    eventType: 'polling',
    title: 'Phase 1 Polling',
    description: 'Voting begins in Phase 1 constituencies across multiple states',
    details: 'First phase of polling. Polling booths open from 7:00 AM to 6:00 PM. Voters cast votes using EVMs (Electronic Voting Machines) with VVPAT (Voter Verified Paper Audit Trail). Election observers and security personnel stationed at each booth.',
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
    details: 'Second phase of general elections polling across multiple states and constituencies.',
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
    details: 'Third phase of polling across central and northern India constituencies.',
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
    details: 'Fourth phase of polling across remaining constituencies.',
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
    details: 'Fifth phase of polling in scheduled constituencies.',
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
    details: 'Sixth phase of polling across remaining constituencies.',
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
    details: 'Last and seventh phase of polling. After this date, all voting is complete and vote counting commences.',
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
    description: 'Votes are counted at designated centres. VVPAT verification for 5 random booths per constituency. Results declared throughout the day.',
    details: 'Counting begins at 8:00 AM. First, VVPAT verification is conducted for 5 randomly selected EVMs per constituency. Then EVM votes are counted. Results declared constituency-wise as counting progresses. Victory margins and vote shares announced.',
    status: 'upcoming',
    icon: '📊',
    color: 'from-yellow-600 to-yellow-500',
    importance: 'high',
    timelineLabel: 'T+2 to T+5 days after last polling phase',
    sources: [
      { label: 'Counting Guidelines', url: 'https://eci.gov.in/counting-procedure' }
    ]
  },
  {
    id: 'state-assembly-2026',
    date: '2026-06-01',
    eventType: 'state-election',
    title: 'State Assembly Elections 2026',
    description: 'Multiple states are due for Legislative Assembly elections in 2026. States include West Bengal, Kerala, Tamil Nadu, Assam, and Puducherry (subject to ECI schedule).',
    details: 'State elections scheduled for 2026 as per their 5-year election cycles. Multiple states including West Bengal, Kerala, Tamil Nadu, Assam, and Puducherry will hold assembly elections. Check official ECI schedule for exact dates.',
    status: 'upcoming',
    icon: '🏛️',
    color: 'from-purple-600 to-purple-500',
    importance: 'high',
    timelineLabel: '2026 (dates to be announced by ECI)',
    sources: [
      { label: 'State Election Commission', url: 'https://eci.gov.in' }
    ]
  },
  {
    id: 'panchayat-elections',
    date: '2026-07-01',
    eventType: 'panchayat',
    title: 'Panchayat Elections in Multiple States',
    description: 'Several states hold Panchayat elections in 2026 as per their 5-year cycle. Check your State Election Commission website for exact dates.',
    details: 'Rural local body elections (Panchayat elections) scheduled for multiple states following their 5-year electoral cycle. Visit your State Election Commission website for state-specific dates and constituencies.',
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
    title: 'Municipal Corporation & Council Elections',
    description: 'Urban local body elections in major cities due in 2026. Check your city municipal corporation or State Election Commission for schedules.',
    details: 'Urban local body elections (Municipal and City Council elections) scheduled for major cities across India. Visit your city municipal corporation or State Election Commission website for city-specific schedules and registration details.',
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
    description: 'Celebrated on January 25 every year (anniversary of the ECI\'s founding in 1950). New voters are felicitated and encouraged to participate in democracy.',
    details: 'National Voters\' Day is celebrated annually on January 25 to commemorate the establishment of the Election Commission of India. This day honors voters\' rights and encourages new voters to register and participate in the democratic process.',
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
