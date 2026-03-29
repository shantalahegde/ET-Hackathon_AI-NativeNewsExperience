// FeedPage - Personalized news feed (My ET)
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { newsAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import BriefingPanel from '../components/BriefingPanel';

export default function FeedPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchPersonalized();
  }, []);

  const fetchPersonalized = async () => {
    setLoading(true);
    try {
      const res = await newsAPI.personalized();
      setArticles(res.data.articles || []);
    } catch (err) {
      // Fallback to general news
      try {
        const res = await newsAPI.fetch({ query: 'business' });
        setArticles(res.data.articles || []);
      } catch {
        setArticles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    investor: {
      title: 'Investor Feed',
      subtitle: 'Markets, stocks, and financial analysis curated for your portfolio',
      emoji: '📊',
      color: 'var(--accent-green)',
    },
    startup_founder: {
      title: 'Founder Feed',
      subtitle: 'Startups, funding rounds, and innovation trends for builders',
      emoji: '🚀',
      color: 'var(--accent-secondary)',
    },
    student: {
      title: 'Learning Feed',
      subtitle: 'Technology, career insights, and business fundamentals',
      emoji: '📚',
      color: 'var(--accent-cyan)',
    },
  };

  const info = roleInfo[user?.role] || roleInfo.student;

  return (
    <div>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <h1 className="topbar-title">
            <Sparkles size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />
            My Feed
          </h1>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn" onClick={fetchPersonalized} id="feed-refresh">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="page-container">
        {/* Role-specific header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 24,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-secondary)',
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 36 }}>{info.emoji}</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: info.color }}>
                {info.title}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                {info.subtitle}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <span className="tag tag-ai" style={{ fontSize: 12, padding: '4px 12px' }}>
              <Sparkles size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
              AI Personalized
            </span>
            <span className="tag tag-default" style={{ fontSize: 12, padding: '4px 12px' }}>
              <Filter size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
              Role-optimized
            </span>
          </div>
        </motion.div>

        {/* Articles */}
        {loading ? (
          <div className="news-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                  <div className="skeleton" style={{ height: 18, width: '90%' }} />
                  <div className="skeleton" style={{ height: 14, width: '100%' }} />
                  <div className="skeleton" style={{ height: 14, width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
              Showing {articles.length} articles personalized for {user?.role?.replace('_', ' ') || 'you'}
            </div>
            <div className="news-grid">
              {articles.map((article, index) => (
                <NewsCard
                  key={article.id || index}
                  article={article}
                  index={index}
                  onClick={setSelectedArticle}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No personalized articles yet</div>
            <div className="empty-state-desc">
              We're building your feed. Check back shortly for AI-curated news.
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedArticle && (
          <BriefingPanel
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
