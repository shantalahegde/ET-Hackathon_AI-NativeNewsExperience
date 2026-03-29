// StoryTrackerPage - Track ongoing news topics with timeline and sentiment
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { newsAPI } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

export default function StoryTrackerPage() {
  const [arcs, setArcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedArc, setExpandedArc] = useState(null);

  useEffect(() => {
    fetchArcs();
  }, []);

  const fetchArcs = async () => {
    setLoading(true);
    try {
      const res = await newsAPI.getStoryArcs();
      setArcs(res.data.arcs || []);
    } catch {
      setArcs([]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (value) => {
    if (value > 0.3) return 'var(--accent-green)';
    if (value < -0.3) return 'var(--accent-rose)';
    return 'var(--accent-amber)';
  };

  const getSentimentLabel = (value) => {
    if (value > 0.3) return 'positive';
    if (value < -0.3) return 'negative';
    return 'neutral';
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <h1 className="topbar-title">
            <GitBranch size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />
            Story Tracker
          </h1>
        </div>
      </div>

      <div className="page-container">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}
        >
          Track ongoing business stories with timeline visualization, sentiment analysis, and key entity tracking.
        </motion.p>

        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <span>Loading story arcs...</span>
          </div>
        ) : arcs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {arcs.map((arc, arcIndex) => {
              const isExpanded = expandedArc === arc.id;
              const sentimentData = (arc.events || []).map((e) => ({
                date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sentiment: e.sentiment,
                title: e.title,
              }));

              return (
                <motion.div
                  key={arc.id || arcIndex}
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: arcIndex * 0.1 }}
                  style={{ cursor: 'pointer' }}
                  id={`story-arc-${arc.id}`}
                >
                  {/* Arc Header */}
                  <div
                    style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onClick={() => setExpandedArc(isExpanded ? null : arc.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-md)',
                          background: `${getSentimentColor(arc.sentiment_data?.overall || 0)}15`,
                          border: `1px solid ${getSentimentColor(arc.sentiment_data?.overall || 0)}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {(arc.sentiment_data?.overall || 0) >= 0 ? (
                          <TrendingUp size={20} style={{ color: getSentimentColor(arc.sentiment_data?.overall || 0) }} />
                        ) : (
                          <TrendingDown size={20} style={{ color: getSentimentColor(arc.sentiment_data?.overall || 0) }} />
                        )}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{arc.topic}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                            {arc.entity_type}
                          </span>
                          <span>•</span>
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                            {arc.events?.length || 0} events
                          </span>
                          <span className={`sentiment-badge ${getSentimentLabel(arc.sentiment_data?.overall || 0)}`}>
                            {getSentimentLabel(arc.sentiment_data?.overall || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-tertiary)' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                          {/* Sentiment Chart */}
                          <div className="chart-container">
                            <div className="chart-title">Sentiment Over Time</div>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={sentimentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                                <YAxis domain={[-1, 1]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                                <Tooltip
                                  contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 12,
                                    color: 'var(--text-primary)',
                                  }}
                                  formatter={(value) => [value.toFixed(2), 'Sentiment']}
                                  labelFormatter={(label, payload) => payload?.[0]?.payload?.title || label}
                                />
                                <Bar dataKey="sentiment" radius={[4, 4, 0, 0]}>
                                  {sentimentData.map((entry, index) => (
                                    <Cell
                                      key={index}
                                      fill={getSentimentColor(entry.sentiment)}
                                      fillOpacity={0.8}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Key Entities */}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                              Key Entities
                            </div>
                            <div className="entity-chips">
                              {(arc.key_entities || []).map((entity) => (
                                <span key={entity} className="entity-chip">{entity}</span>
                              ))}
                            </div>
                          </div>

                          {/* Timeline */}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                              Event Timeline
                            </div>
                            <div className="timeline">
                              {(arc.events || []).map((event, i) => (
                                <div
                                  key={i}
                                  className={`timeline-event ${getSentimentLabel(event.sentiment)}`}
                                >
                                  <div className="timeline-date">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </div>
                                  <div className="timeline-title">{event.title}</div>
                                  <div className="timeline-description">{event.description}</div>
                                  <span
                                    className={`sentiment-badge ${getSentimentLabel(event.sentiment)}`}
                                    style={{ marginTop: 8 }}
                                  >
                                    {event.sentiment > 0 ? '+' : ''}{event.sentiment.toFixed(1)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📈</div>
            <div className="empty-state-title">No story arcs available</div>
            <div className="empty-state-desc">
              Story arcs will appear as the system tracks ongoing business narratives.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
