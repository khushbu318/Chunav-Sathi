/**
 * Election Timeline - Integration Tests
 * Tests for timeline data, calculations, and component behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  electionTimelineData,
  getDaysRemaining,
  getNextPollingPhase,
  getCurrentPhase,
  formatDateDisplay,
  getEventStatus,
  TimelineEvent
} from './timeline-data';

describe('Timeline Data', () => {
  describe('electionTimelineData', () => {
    it('should have 18 total events', () => {
      expect(electionTimelineData).toHaveLength(18);
    });

    it('should have all required event properties', () => {
      electionTimelineData.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('eventType');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('details');
        expect(event).toHaveProperty('status');
        expect(event).toHaveProperty('icon');
        expect(event).toHaveProperty('color');
        expect(event).toHaveProperty('importance');
        expect(event).toHaveProperty('sources');
      });
    });

    it('should have valid event types', () => {
      const validTypes = ['notification', 'nomination', 'withdrawal', 'polling', 'counting', 'result', 'mcc', 'campaign'];
      electionTimelineData.forEach(event => {
        expect(validTypes).toContain(event.eventType);
      });
    });

    it('should have 7 polling phase events', () => {
      const pollingEvents = electionTimelineData.filter(e => e.eventType === 'polling');
      expect(pollingEvents).toHaveLength(7);
    });

    it('should have correct phase distribution', () => {
      const phases = electionTimelineData
        .filter(e => e.phase)
        .map(e => e.phase)
        .sort();
      expect(phases).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should have unique event IDs', () => {
      const ids = electionTimelineData.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all events with official sources', () => {
      electionTimelineData.forEach(event => {
        expect(event.sources.length).toBeGreaterThan(0);
        event.sources.forEach(source => {
          expect(source.label).toBeTruthy();
          expect(source.url).toBeTruthy();
          expect(source.url).toMatch(/^https?:\/\//);
        });
      });
    });
  });
});

describe('Timeline Utilities', () => {
  describe('getDaysRemaining', () => {
    it('should calculate positive days for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const dateString = futureDate.toISOString().split('T')[0];
      
      const days = getDaysRemaining(dateString);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(10);
    });

    it('should return 0 or negative for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const dateString = pastDate.toISOString().split('T')[0];
      
      const days = getDaysRemaining(dateString);
      expect(days).toBeLessThan(0);
    });

    it('should handle today correctly', () => {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      const days = getDaysRemaining(dateString);
      expect(days).toBe(0);
    });
  });

  describe('getNextPollingPhase', () => {
    it('should return a TimelineEvent or null', () => {
      const nextPhase = getNextPollingPhase();
      if (nextPhase) {
        expect(nextPhase).toHaveProperty('id');
        expect(nextPhase).toHaveProperty('phase');
        expect(nextPhase.eventType).toBe('polling');
      } else {
        expect(nextPhase).toBeNull();
      }
    });

    it('should return a polling event with phase number', () => {
      const nextPhase = getNextPollingPhase();
      if (nextPhase) {
        expect(nextPhase.phase).toBeGreaterThanOrEqual(1);
        expect(nextPhase.phase).toBeLessThanOrEqual(7);
      }
    });
  });

  describe('getCurrentPhase', () => {
    it('should return a number between 0 and 7', () => {
      const phase = getCurrentPhase();
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThanOrEqual(7);
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date correctly', () => {
      const formatted = formatDateDisplay('2026-03-15');
      expect(formatted).toMatch(/\w+,\s\w+\s\d+,\s2026/);
      // Expected format: "Sun, Mar 15, 2026"
    });

    it('should handle different date formats', () => {
      const dates = ['2026-02-10', '2026-04-25', '2026-12-31'];
      dates.forEach(date => {
        const formatted = formatDateDisplay(date);
        expect(formatted).toBeTruthy();
        expect(formatted).toContain('2026');
      });
    });
  });

  describe('getEventStatus', () => {
    it('should return "completed" for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const dateString = pastDate.toISOString().split('T')[0];
      
      expect(getEventStatus(dateString)).toBe('completed');
    });

    it('should return "ongoing" for today', () => {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      expect(getEventStatus(dateString)).toBe('ongoing');
    });

    it('should return "upcoming" for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateString = futureDate.toISOString().split('T')[0];
      
      expect(getEventStatus(dateString)).toBe('upcoming');
    });
  });
});

describe('Timeline Event Validation', () => {
  it('should have MCC before notification', () => {
    const mcc = electionTimelineData.find(e => e.id === 'mcc-start');
    const notification = electionTimelineData.find(e => e.id === 'notification');
    
    expect(mcc?.date < notification?.date).toBe(true);
  });

  it('should have nomination filing before polling', () => {
    const nomination = electionTimelineData.find(e => e.id === 'nomination-start');
    const phase1 = electionTimelineData.find(e => e.phase === 1);
    
    expect(nomination?.date < phase1?.date).toBe(true);
  });

  it('should have counting after all polling phases', () => {
    const counting = electionTimelineData.find(e => e.id === 'counting-day');
    const phase7 = electionTimelineData.find(e => e.phase === 7);
    
    expect(counting?.date >= phase7?.date).toBe(true);
  });

  it('should have result declaration after counting', () => {
    const counting = electionTimelineData.find(e => e.id === 'counting-day');
    const result = electionTimelineData.find(e => e.id === 'result-declaration');
    
    expect(result?.date >= counting?.date).toBe(true);
  });

  it('should have chronological phase order', () => {
    const phases = electionTimelineData
      .filter(e => e.phase)
      .sort((a, b) => a.phase! - b.phase!)
      .map(e => new Date(e.date).getTime());
    
    for (let i = 1; i < phases.length; i++) {
      expect(phases[i]).toBeGreaterThanOrEqual(phases[i - 1]);
    }
  });
});

describe('Data Integrity', () => {
  it('should not have duplicate dates for different events', () => {
    const dateMap = new Map<string, string[]>();
    
    electionTimelineData.forEach(event => {
      if (!dateMap.has(event.date)) {
        dateMap.set(event.date, []);
      }
      dateMap.get(event.date)!.push(event.id);
    });
    
    // Counting and result can have same date, others shouldn't
    dateMap.forEach((ids, date) => {
      if (ids.length > 1) {
        // Only counting-day and result-declaration should share a date
        const allowed = ids.every(id => 
          id === 'counting-day' || id === 'result-declaration'
        );
        expect(allowed).toBe(true);
      }
    });
  });

  it('should have consistent date formats (YYYY-MM-DD)', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    electionTimelineData.forEach(event => {
      expect(event.date).toMatch(dateRegex);
    });
  });

  it('should have valid importance levels', () => {
    const validImportance = ['high', 'medium', 'low'];
    
    electionTimelineData.forEach(event => {
      expect(validImportance).toContain(event.importance);
    });
  });

  it('should have valid status values', () => {
    const validStatus = ['completed', 'ongoing', 'upcoming'];
    
    electionTimelineData.forEach(event => {
      expect(validStatus).toContain(event.status);
    });
  });

  it('should have meaningful icons (emoji)', () => {
    electionTimelineData.forEach(event => {
      expect(event.icon.length).toBeGreaterThan(0);
      // Basic emoji validation (should be Unicode characters)
      expect(event.icon).toMatch(/[^\x00-\x7F]/);
    });
  });
});

describe('Accessibility', () => {
  it('should have descriptive titles for all events', () => {
    electionTimelineData.forEach(event => {
      expect(event.title.length).toBeGreaterThan(5);
      expect(event.title).not.toBeNull();
    });
  });

  it('should have detailed descriptions for all events', () => {
    electionTimelineData.forEach(event => {
      expect(event.details.length).toBeGreaterThan(20);
    });
  });

  it('should have event sources for verification', () => {
    electionTimelineData.forEach(event => {
      expect(event.sources).toBeInstanceOf(Array);
      expect(event.sources.length).toBeGreaterThan(0);
      
      event.sources.forEach(source => {
        expect(source.label).toBeTruthy();
        expect(source.url).toBeTruthy();
      });
    });
  });
});
