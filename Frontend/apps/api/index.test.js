const test = require('node:test');
const assert = require('node:assert/strict');

const { extractGeminiText, haversineDistance } = require('./index');

test('extractGeminiText joins candidate parts', () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [{ text: 'Hello ' }, { text: 'voter' }],
        },
      },
    ],
  };

  assert.equal(extractGeminiText(response), 'Hello voter');
});

test('extractGeminiText returns empty string for invalid payloads', () => {
  assert.equal(extractGeminiText({}), '');
  assert.equal(extractGeminiText(null), '');
});

test('haversineDistance returns zero for identical coordinates', () => {
  assert.equal(haversineDistance(28.6139, 77.209, 28.6139, 77.209), 0);
});

test('haversineDistance returns a positive distance for different coordinates', () => {
  const distance = haversineDistance(28.6139, 77.209, 19.076, 72.8777);
  assert.ok(distance > 0);
});
