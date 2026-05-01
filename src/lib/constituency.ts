import type { ConstituencyInfo } from '../types/constituency';

/**
 * Utility to fetch and parse JSON with error handling
 */
export async function fetchJson<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

/**
 * Filter constituencies by search query (name or PIN code)
 */
export function searchConstituencies(
  constituencies: ConstituencyInfo[],
  query: string
): ConstituencyInfo[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return constituencies.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get constituency by ID
 */
export function getConstituencyById(
  constituencies: ConstituencyInfo[],
  id: string
): ConstituencyInfo | undefined {
  return constituencies.find((c) => c.id === id);
}

/**
 * Get all constituencies for a state
 */
export function getConstituenciesByState(
  constituencies: ConstituencyInfo[],
  state: string
): ConstituencyInfo[] {
  return constituencies.filter((c) => c.state === state);
}

/**
 * Format vote count with abbreviations (e.g., 1.2M, 45K)
 */
export function formatVotes(votes: number): string {
  if (votes >= 1000000) {
    return (votes / 1000000).toFixed(1) + 'M';
  }
  if (votes >= 1000) {
    return (votes / 1000).toFixed(1) + 'K';
  }
  return votes.toString();
}

/**
 * Calculate color opacity based on vote share
 */
export function getPartyOpacity(voteShare: number): number {
  // voteShare from 20 to 60 maps to opacity 0.3 to 0.9
  return Math.min(0.9, Math.max(0.3, (voteShare - 20) / 40 + 0.3));
}

/**
 * Format vote share percentage
 */
export function formatVoteShare(voteShare: number): string {
  return voteShare.toFixed(1) + '%';
}

/**
 * Format election date in readable format
 */
export function formatElectionDate(dateString?: string): string {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Build voter portal URL with constituency pre-filled
 */
export function getVoterPortalUrl(constituencyId: string): string {
  return `https://voterportal.eci.gov.in?constituency=${constituencyId}`;
}
