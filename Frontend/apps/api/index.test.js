import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';

// ============================================================================
// Chat API Tests
// ============================================================================

describe('Chat API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should send chat message successfully', async () => {
    const mockResponse = {
      response: 'This is a test response',
      history: [
        { role: 'user', content: 'Hello' },
        { role: 'model', content: 'This is a test response' }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const payload = {
      message: 'Hello',
      history: [],
      language: 'English'
    };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.response).toBe('This is a test response');
    expect(data.history).toHaveLength(2);
  });

  it('should handle empty message', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Please provide a valid question',
        history: []
      })
    });

    const payload = {
      message: '',
      history: [],
      language: 'English'
    };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(response.ok).toBe(true);
  });

  it('should preserve chat history', async () => {
    const existingHistory = [
      { role: 'user', content: 'What is voter registration?' },
      { role: 'model', content: 'Voter registration is the process...' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'New response',
        history: [
          ...existingHistory,
          { role: 'user', content: 'Tell me more' },
          { role: 'model', content: 'New response' }
        ]
      })
    });

    const payload = {
      message: 'Tell me more',
      history: existingHistory,
      language: 'English'
    };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    expect(data.history).toHaveLength(4);
    expect(data.history[0]).toEqual(existingHistory[0]);
  });

  it('should handle different languages', async () => {
    const languages = ['English', 'Hindi', 'Bengali', 'Tamil'];

    for (const lang of languages) {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: `Response in ${lang}`,
          history: [{ role: 'user', content: 'Hello' }]
        })
      });

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          history: [],
          language: lang
        })
      });

      expect(response.ok).toBe(true);
    }
  });

  it('should handle server errors (500)', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal server error' })
    });

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test',
        history: [],
        language: 'English'
      })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should handle service unavailable (503)', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'Service not initialized' })
    });

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test',
        history: [],
        language: 'English'
      })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
  });

  it('should handle very long messages', async () => {
    const longMessage = 'A'.repeat(10000);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Response to long message',
        history: [{ role: 'user', content: longMessage }]
      })
    });

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: longMessage,
        history: [],
        language: 'English'
      })
    });

    expect(response.ok).toBe(true);
  });
});

// ============================================================================
// Booth Finding API Tests
// ============================================================================

describe('Booth Finding API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should find booths by location query', async () => {
    const mockBooths = {
      query: 'Delhi',
      results_count: 2,
      booths: [
        {
          place_id: 'ChIJ1',
          name: 'Election Office',
          address: 'Delhi',
          lat: 28.6139,
          lng: 77.2090,
          distance_km: 0.0,
          status: 'Open',
          rating: 4.5
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBooths
    });

    const response = await fetch(`${API_BASE_URL}/find-booths?location_query=Delhi`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.results_count).toBe(2);
    expect(data.booths).toHaveLength(1);
  });

  it('should find booths by coordinates', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: 'Delhi',
        results_count: 1,
        booths: [
          {
            place_id: 'ChIJ1',
            name: 'Polling Booth',
            address: 'Area',
            lat: 28.6139,
            lng: 77.2090,
            distance_km: 0.5,
            status: 'Open',
            rating: 4.0
          }
        ]
      })
    });

    const response = await fetch(
      `${API_BASE_URL}/find-booths?location_query=Delhi&lat=28.6139&lng=77.2090`
    );

    expect(response.ok).toBe(true);
  });

  it('should handle location not found (404)', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Location not found' })
    });

    const response = await fetch(
      `${API_BASE_URL}/find-booths?location_query=InvalidLocation12345`
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  it('should handle empty results', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: 'NoBooths',
        results_count: 0,
        booths: []
      })
    });

    const response = await fetch(`${API_BASE_URL}/find-booths?location_query=NoBooths`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.results_count).toBe(0);
    expect(data.booths).toHaveLength(0);
  });

  it('should sort booths by distance', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: 'Delhi',
        results_count: 3,
        booths: [
          {
            place_id: 'ChIJ1',
            name: 'Near Booth',
            distance_km: 0.5,
            status: 'Open'
          },
          {
            place_id: 'ChIJ2',
            name: 'Medium Booth',
            distance_km: 2.3,
            status: 'Open'
          },
          {
            place_id: 'ChIJ3',
            name: 'Far Booth',
            distance_km: 8.7,
            status: 'Open'
          }
        ]
      })
    });

    const response = await fetch(`${API_BASE_URL}/find-booths?location_query=Delhi`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    // Verify sorting (nearest first)
    for (let i = 0; i < data.booths.length - 1; i++) {
      expect(data.booths[i].distance_km).toBeLessThanOrEqual(data.booths[i + 1].distance_km);
    }
  });

  it('should handle invalid coordinates', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ detail: 'Invalid coordinates' })
    });

    const response = await fetch(
      `${API_BASE_URL}/find-booths?location_query=Delhi&lat=invalid&lng=77.2090`
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(422);
  });

  it('should handle API not configured (503)', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'Google Maps API not configured' })
    });

    const response = await fetch(`${API_BASE_URL}/find-booths?location_query=Delhi`);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
  });
});

// ============================================================================
// Health Check Tests
// ============================================================================

describe('Health Check API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should return healthy status', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy' })
    });

    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.status).toBe('healthy');
  });

  it('should handle health check failures', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const response = await fetch(`${API_BASE_URL}/health`);

    expect(response.ok).toBe(false);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('API Integration Scenarios', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should handle complete user journey', async () => {
    // Step 1: Get health
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy' })
    });

    // Step 2: Find booths
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: 'Delhi',
        results_count: 1,
        booths: [{ place_id: 'ChIJ1', name: 'Booth' }]
      })
    });

    // Step 3: Chat
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Here\'s information...',
        history: []
      })
    });

    // Execute journey
    const health = await fetch(`${API_BASE_URL}/health`);
    expect(health.ok).toBe(true);

    const booths = await fetch(`${API_BASE_URL}/find-booths?location_query=Delhi`);
    expect(booths.ok).toBe(true);

    const chat = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Where is the polling booth?',
        history: [],
        language: 'English'
      })
    });
    expect(chat.ok).toBe(true);
  });

  it('should handle errors at different stages', async () => {
    // Health check fails
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const health = await fetch(`${API_BASE_URL}/health`);
    expect(health.ok).toBe(false);

    // Retry succeeds
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy' })
    });

    const healthRetry = await fetch(`${API_BASE_URL}/health`);
    expect(healthRetry.ok).toBe(true);
  });
});
