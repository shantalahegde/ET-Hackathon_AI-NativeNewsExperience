// HomePage - Main dashboard with news overview and stats
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Globe, Zap, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { newsAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import BriefingPanel from '../components/BriefingPanel';

export default function HomePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await newsAPI.fetch({ query: 'business technology finance' });
      setArticles(res.data.articles || []);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTags = ['all', 'stocks', 'startups', 'AI', 'economy', 'crypto'];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = !searchQuery ||
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'all' ||
      (article.tags || []).some((t) => t.toLowerCase() === activeFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const roleGreeting = {
    investor: '📊 Market Dashboard',
    startup_founder: '🚀 Startup Pulse',
    student: '📚 Learning Hub',
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <h1 className="topbar-title">{roleGreeting[user?.role] || '🏠 Home'}</h1>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn" onClick={fetchNews} id="refresh-btn">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="page-container">
        {/* Stats Cards */}
        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="stat-card">
            <div className="stat-card-label">Total Articles</div>
            <div className="stat-card-value" style={{ color: 'var(--accent-primary)' }}>
              {articles.length}
            </div>
            <div className="stat-card-change positive">
              <TrendingUp size={12} /> Live feed
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">AI Summaries</div>
            <div className="stat-card-value" style={{ color: 'var(--accent-cyan)' }}>
              <Sparkles size={22} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 4 }} />
              {articles.filter((a) => a.aiSummary).length || articles.length}
            </div>
            <div className="stat-card-change positive">Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Categories</div>
            <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>
              {new Set(articles.flatMap((a) => a.tags || [])).size || 6}
            </div>
            <div className="stat-card-change positive">
              <Globe size={12} /> Topics tracked
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Your Role</div>
            <div className="stat-card-value" style={{ fontSize: 20, color: 'var(--accent-secondary)' }}>
              <Zap size={18} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {user?.role?.replace('_', ' ') || 'User'}
            </div>
            <div className="stat-card-change positive">Personalized</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 40, background: 'var(--bg-card)' }}
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-input"
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  className={`tab ${activeFilter === tag ? 'active' : ''}`}
                  onClick={() => setActiveFilter(tag)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 12,
                    textTransform: 'capitalize',
                  }}
                  id={`filter-${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* News Grid */}
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
        ) : filteredArticles.length > 0 ? (
          <div className="news-grid">
            {filteredArticles.map((article, index) => (
              <NewsCard
                key={article.id || index}
                article={article}
                index={index}
                onClick={setSelectedArticle}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📰</div>
            <div className="empty-state-title">No articles found</div>
            <div className="empty-state-desc">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Unable to fetch news. Please check your connection and try again.'}
            </div>
            <button className="topbar-btn" onClick={fetchNews} style={{ marginTop: 12 }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}
      </div>

      {/* Briefing Panel */}
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
