import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { TimelineEvent } from './timeline-data';
import { getTimelineEvents } from './timeline-data';
import './ElectionTimeline.css';

interface TimelineItemComponentProps {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const TimelineItemComponent: React.FC<TimelineItemComponentProps> = ({
  event,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <motion.div
      className={`timeline-item ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      role="listitem"
      aria-expanded={isExpanded}
    >
      <div className="timeline-dot" aria-hidden="true" />

      <div className="timeline-item-header">
        <div className="timeline-icon" role="img" aria-label={event.title}>
          {event.icon}
        </div>
        <div className="timeline-item-meta">
          <div className="timeline-date">
            {event.timelineLabel && (
              <span className="ml-2 text-indigo-400 font-semibold">{event.timelineLabel}</span>
            )}
          </div>
          <h3 className="timeline-title">{event.title}</h3>
          <p className="timeline-description">{event.description}</p>

          {event.sources.length > 0 && (
            <div className="timeline-sources-inline">
              <div className="flex flex-wrap gap-2">
                {event.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timeline-source-link"
                    title={source.label}
                  >
                    {source.label}
                    <ExternalLink size={10} className="inline ml-1" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        <div className="timeline-item-expandable">
          <div className="timeline-details">
            <p>{event.details}</p>
          </div>
        </div>
      </AnimatePresence>

      <button
        className="timeline-expand-btn"
        onClick={() => onToggleExpand(event.id)}
        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
      >
        <span className="text-sm">{isExpanded ? 'Show less' : 'Show more'}</span>
        <ChevronDown size={16} className="timeline-expand-icon" />
      </button>
    </motion.div>
  );
};

interface ElectionTimelineProps {
  onEventSelect?: (event: TimelineEvent) => void;
}

const ElectionTimeline: React.FC<ElectionTimelineProps> = () => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const timelineEvents = getTimelineEvents();

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <motion.div
      className="timeline-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-label="Election Timeline"
    >
      <div className="timeline-content">
        {timelineEvents.length > 0 ? (
          <motion.div
            className="timeline-scroll-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="timeline-items" role="list">
              <AnimatePresence mode="wait">
                {timelineEvents.map((event) => (
                  <TimelineItemComponent
                    key={event.id}
                    event={event}
                    isExpanded={expandedIds.has(event.id)}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="timeline-empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="timeline-empty-icon">No data</div>
            <div className="timeline-empty-title">No events found</div>
            <div className="timeline-empty-desc">
              Check back later for updated timeline information.
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        className="timeline-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Reference timeline only. Please confirm critical dates on ECI or your State Election Commission website.
      </motion.div>
    </motion.div>
  );
};

export default ElectionTimeline;
