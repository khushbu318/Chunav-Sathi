# Election Timeline - Implementation Guide

## 🚀 Quick Start

### 1. **Import the Component**

```typescript
// In your App.tsx or main component file
import ElectionTimeline from './components/features/timeline/ElectionTimeline';
import './components/features/timeline/ElectionTimeline.css';
```

### 2. **Basic Usage**

```tsx
function App() {
  return (
    <div className="app-container">
      {/* Other components */}
      <ElectionTimeline />
    </div>
  );
}
```

### 3. **With Event Handler**

```tsx
function App() {
  const handleEventSelect = (event: TimelineEvent) => {
    console.log('Event selected:', event);
    // Do something with the selected event
  };

  return (
    <ElectionTimeline onEventSelect={handleEventSelect} />
  );
}
```

---

## 📦 Component Props

```typescript
interface ElectionTimelineProps {
  /**
   * Callback fired when user selects a timeline event
   * @param event - The selected TimelineEvent
   */
  onEventSelect?: (event: TimelineEvent) => void;
}
```

---

## 🎯 Usage in App.tsx (WhatsApp Panel Structure)

If you're using the WhatsApp-style two-panel layout:

```tsx
import React, { useState } from 'react';
import ElectionTimeline from './components/features/timeline/ElectionTimeline';
import { Calendar } from 'lucide-react';

function App() {
  const [activePanel, setActivePanel] = useState<string>('home');

  return (
    <div className="flex h-screen bg-whatsapp-bg">
      {/* Left Panel - Contact List */}
      <div className="w-80 bg-whatsapp-panel border-r border-whatsapp-border">
        <div 
          className="p-4 hover:bg-whatsapp-hover cursor-pointer flex items-center gap-3"
          onClick={() => setActivePanel('timeline')}
        >
          <Calendar size={40} className="text-whatsapp-yellow" />
          <div>
            <h3 className="font-semibold text-whatsapp-text">Election Timeline</h3>
            <p className="text-xs text-whatsapp-subtext">Countdown to key dates</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 bg-whatsapp-bg">
        {activePanel === 'timeline' && <ElectionTimeline />}
        {/* Other panels */}
      </div>
    </div>
  );
}

export default App;
```

---

## 🎨 Styling Customization

### **Using Custom CSS Variables**

If you want to customize colors:

```css
/* In your main stylesheet */
:root {
  --timeline-bg: #111b21;
  --timeline-panel: #202c33;
  --timeline-text: #e9edef;
  --timeline-subtext: #8696a0;
  --timeline-green: #00a884;
  --timeline-yellow: #f7c948;
  --timeline-orange: #ff6f00;
}

/* Light theme */
@media (prefers-color-scheme: light) {
  :root {
    --timeline-bg: #ffffff;
    --timeline-panel: #f5f5f5;
    --timeline-text: #212121;
    --timeline-subtext: #666666;
  }
}
```

### **Override Specific Styles**

```css
/* Custom countdown banner */
.timeline-countdown-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Custom phase dot colors */
.phase-dot.completed {
  background: #4ade80;
}

.phase-dot.ongoing {
  background: #fbbf24;
}
```

---

## 📱 Responsive Layout Example

```tsx
function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={isMobile ? 'flex flex-col' : 'flex'}>
      {/* Left panel hidden on mobile, or stacked */}
      <div className={isMobile ? 'hidden' : 'w-80'}>
        {/* Contact list */}
      </div>

      {/* Main timeline */}
      <div className={isMobile ? 'w-full' : 'flex-1'}>
        <ElectionTimeline />
      </div>
    </div>
  );
}
```

---

## 🔌 Data Integration with Backend

If you want to fetch timeline data from your API:

```tsx
import { useEffect, useState } from 'react';

function TimelineContainer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/election/timeline')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading timeline...</div>;
  if (error) return <div>Error: {error}</div>;

  return <ElectionTimeline />;
}
```

---

## 🔔 Notifications Setup

### **Firebase Cloud Messaging Integration**

```typescript
// In your service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  projectId: 'YOUR_PROJECT_ID',
  // ... other config
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/election-icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### **Request Notification Permission**

```typescript
// In your component
async function enableNotifications() {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      // Already granted
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  }
  return false;
}
```

---

## 🧪 Testing the Component

### **Unit Test Example**

```typescript
import { render, screen } from '@testing-library/react';
import ElectionTimeline from './ElectionTimeline';

describe('ElectionTimeline', () => {
  it('renders timeline header', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText(/Election Timeline/i)).toBeInTheDocument();
  });

  it('renders countdown banner', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText(/days/i)).toBeInTheDocument();
  });

  it('renders phase indicator', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText(/7-Phase Election Schedule/i)).toBeInTheDocument();
  });

  it('handles phase selection', async () => {
    const { container } = render(<ElectionTimeline />);
    const phaseDots = container.querySelectorAll('.phase-dot');
    // Click first phase dot
    fireEvent.click(phaseDots[0]);
    // Assert timeline filtered
  });
});
```

### **Integration Test Example**

```typescript
import { test, expect } from '@playwright/test';

test('Election Timeline loads and is interactive', async ({ page }) => {
  await page.goto('/');
  
  // Check countdown banner visible
  await expect(page.locator('.timeline-countdown-banner')).toBeVisible();
  
  // Check phase indicators
  const phaseDots = page.locator('.phase-dot');
  await expect(phaseDots).toHaveCount(7);
  
  // Click phase to filter
  await phaseDots.first().click();
  
  // Check timeline filtered
  const timelineItems = page.locator('.timeline-item');
  const count = await timelineItems.count();
  expect(count).toBeGreaterThan(0);
});
```

---

## 📊 Data Export & Analytics

```typescript
// Export timeline data to CSV
function exportTimelineCSV() {
  const csv = [
    ['Date', 'Event', 'Phase', 'Status', 'Importance'],
    ...electionTimelineData.map(e => [
      e.date,
      e.title,
      e.phase || 'N/A',
      e.status,
      e.importance
    ])
  ];
  
  const content = csv.map(row => row.join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'election-timeline.csv';
  a.click();
}
```

---

## 🐛 Troubleshooting

### **Countdown Not Updating?**
```typescript
// Ensure interval is cleared on unmount
useEffect(() => {
  const interval = setInterval(() => {
    // Update logic
  }, 1000);
  
  return () => clearInterval(interval); // Cleanup!
}, []);
```

### **CSS Not Applied?**
```typescript
// Make sure CSS is imported
import './ElectionTimeline.css';

// Or import at the top of your main App file
import './components/features/timeline/ElectionTimeline.css';
```

### **TypeScript Errors?**
```typescript
// Ensure timeline-data.ts types are exported
import type { TimelineEvent, TimelineProps } from './timeline-data';

// Use proper typing
const event: TimelineEvent = {
  id: 'test',
  date: '2026-03-15',
  // ... other required props
};
```

---

## 🌐 Browser Support

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| iOS Safari | 12+ | ✅ Full Support |
| Android Chrome | 90+ | ✅ Full Support |

---

## 📚 Additional Resources

- **Framer Motion Docs**: https://www.framer.com/motion
- **Lucide React Icons**: https://lucide.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Firebase Cloud Messaging**: https://firebase.google.com/docs/cloud-messaging
- **Web Notifications API**: https://developer.mozilla.org/en-US/docs/Web/API/notification

---

## 🎯 Next Steps

1. ✅ Import component into your app
2. ✅ Customize colors if needed
3. ✅ Test with your data
4. ✅ Set up notifications (optional)
5. ✅ Deploy to production

---

**Component Version**: 1.0.0  
**Last Updated**: May 1, 2026  
**Status**: Production Ready ✅
