import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { TimelineEvent } from './timeline-data';
import {
  electionTimelineData,
} from './timeline-data';
import './ElectionTimeline.css';

/**
 * ═══════════════════════════════════════════════════════════════════
 * HEADER COMPONENT
 * Displays timeline title and description
 * ═══════════════════════════════════════════════════════════════════
 */
const TimelineHeader: React.FC = () => {
  return (
    <motion.div
      className="timeline-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="timeline-header-title">📅 Election Timeline & Key Dates</h1>
      <p className="timeline-header-subtitle">
        Important deadlines and dates for upcoming elections, registration cutoffs, and voting days
      </p>
    </motion.div>
  );
};



/**
 * ═══════════════════════════════════════════════════════════════════
 * TIMELINE ITEM COMPONENT
 * Individual event with expandable details
 * ═══════════════════════════════════════════════════════════════════
 */
interface TimelineItemComponentProps {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const TimelineItemComponent: React.FC<TimelineItemComponentProps> = ({
  event,
  isExpanded,
  onToggleExpand
}) => {
  const date = new Date(event.date + 'T00:00:00');
  const dateDisplay = date.toLocaleDateString('en-IN', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <motion.div
      className={`timeline-item ${event.status} ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      role="listitem"
      aria-expanded={isExpanded}
    >
      {/* Timeline dot marker */}
      <div className="timeline-dot" aria-hidden="true">
        {/* {event.status === 'completed' ? '✓' : event.status === 'ongoing' ? '●' : '○'} */}
      </div>

      {/* Main content */}
      <div className="timeline-item-header">
        <div className="timeline-icon" role="img" aria-label={event.title}>
          {event.icon}
        </div>
        <div className="timeline-item-meta">
          <div className="timeline-date">
            {dateDisplay}<br />
            {event.timelineLabel && (
              <span className="ml-2 text-indigo-400 font-semibold">{event.timelineLabel}</span>
            )}
          </div>
          <h3 className="timeline-title">{event.title}</h3>
          <p className="timeline-description">{event.description}</p>
          {/* <span className={`timeline-status ${event.status}`}>
            {event.status === 'completed' ? 'Completed' : event.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
          </span> */}
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        <div className="timeline-item-expandable">
          <div className="timeline-details">
            <p>{event.details}</p>
            {(event.importance === 'critical' || event.importance === 'high') && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255, 111, 0, 0.1)', borderRadius: '6px', borderLeft: '3px solid rgb(255, 111, 0)' }}>
                <strong style={{ color: 'rgb(255, 111, 0)' }}>⚠️ Important Event</strong>
              </div>
            )}
          </div>

          {/* Sources section */}
          {event.sources.length > 0 && (
            <div className="timeline-sources">
              <span className="timeline-sources-title">📚 Official Sources:</span>
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
      </AnimatePresence>

      {/* Expand/collapse button */}
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



/**
 * ═══════════════════════════════════════════════════════════════════
 * MAIN ELECTION TIMELINE COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 */
interface ElectionTimelineProps {
  onEventSelect?: (event: TimelineEvent) => void;
}

const ElectionTimeline: React.FC<ElectionTimelineProps> = () => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
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
      {/* Header */}
      <TimelineHeader />

      {/* Content area */}
      <div className="timeline-content">
        {/* Timeline items */}
        {electionTimelineData.length > 0 ? (
          <motion.div
            className="timeline-scroll-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="timeline-items" role="list">
              <AnimatePresence mode="wait">
                {electionTimelineData.map(event => (
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
            <div className="timeline-empty-icon">📭</div>
            <div className="timeline-empty-title">No events found</div>
            <div className="timeline-empty-desc">
              Check back later for upcoming election dates
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer note */}
      <motion.div
        className="timeline-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        📋 All dates based on ECI official schedule • Last updated today
      </motion.div>
    </motion.div>
  );
};

export default ElectionTimeline;
