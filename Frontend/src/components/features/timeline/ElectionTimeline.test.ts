import { describe, it, expect } from 'vitest';
import {
  electionTimelineData,
  getCurrentPhase,
  getDaysRemaining,
  getEventStatus,
  getNextPollingPhase,
  getTimelineEvents,
  formatDateDisplay,
} from './timeline-data';

describe('timeline data', () => {
  it('contains events with the required shape', () => {
    expect(electionTimelineData.length).toBeGreaterThan(0);

    electionTimelineData.forEach((event) => {
      expect(event.id).toBeTruthy();
      expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(event.title.length).toBeGreaterThan(5);
      expect(event.description.length).toBeGreaterThan(5);
      expect(event.details.length).toBeGreaterThan(20);
      expect(event.sources.length).toBeGreaterThan(0);
    });
  });

  it('uses only supported event types', () => {
    const validTypes = [
      'notification',
      'nomination',
      'withdrawal',
      'polling',
      'counting',
      'result',
      'mcc',
      'campaign',
      'scrutiny',
      'state-election',
      'municipal',
      'panchayat',
      'key-date',
    ];

    electionTimelineData.forEach((event) => {
      expect(validTypes).toContain(event.eventType);
    });
  });

  it('keeps polling phases in chronological order', () => {
    const phases = electionTimelineData
      .filter((event) => event.phase)
      .sort((a, b) => a.phase! - b.phase!)
      .map((event) => new Date(event.date).getTime());

    for (let i = 1; i < phases.length; i += 1) {
      expect(phases[i]).toBeGreaterThanOrEqual(phases[i - 1]);
    }
  });
});

describe('timeline utilities', () => {
  it('calculates days remaining for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateString = futureDate.toISOString().split('T')[0];

    const days = getDaysRemaining(dateString);
    expect(days).toBeGreaterThanOrEqual(9);
    expect(days).toBeLessThanOrEqual(10);
  });

  it('returns completed for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const dateString = pastDate.toISOString().split('T')[0];

    expect(getEventStatus(dateString)).toBe('completed');
  });

  it('returns ongoing for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getEventStatus(today)).toBe('ongoing');
  });

  it('returns upcoming for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateString = futureDate.toISOString().split('T')[0];

    expect(getEventStatus(dateString)).toBe('upcoming');
  });

  it('formats dates for display', () => {
    expect(formatDateDisplay('2026-03-15')).toContain('2026');
  });

  it('returns derived statuses instead of trusting hardcoded ones', () => {
    const events = getTimelineEvents();
    expect(events).toHaveLength(electionTimelineData.length);

    events.forEach((event) => {
      expect(event.status).toBe(getEventStatus(event.date));
    });
  });

  it('returns a valid next polling phase or null', () => {
    const nextPhase = getNextPollingPhase();

    if (nextPhase) {
      expect(nextPhase.eventType).toBe('polling');
      expect(nextPhase.phase).toBeGreaterThanOrEqual(1);
      expect(nextPhase.phase).toBeLessThanOrEqual(7);
    } else {
      expect(nextPhase).toBeNull();
    }
  });

  it('returns a current phase number in range', () => {
    const currentPhase = getCurrentPhase();
    expect(currentPhase).toBeGreaterThanOrEqual(0);
    expect(currentPhase).toBeLessThanOrEqual(7);
  });
});
