// SavedNewsPage - Display and manage saved articles
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { newsAPI } from '../services/api';
import BriefingPanel from '../components/BriefingPanel';

export default function SavedNewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await newsAPI.getSaved();
      setArticles(res.data.articles || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (articleId) => {
    try {
      await newsAPI.removeSaved(articleId);
      setArticles((prev) => prev.filter((a) => a.article_id !== articleId));
    } catch {
      // Optimistic removal
      setArticles((prev) => prev.filter((a) => a.article_id !== articleId));
    }
  };

  return (
    <div>
      <div className="topbar">
        <div className="topbar-left">
          <h1 className="topbar-title">
            <Bookmark size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />
            Saved News
          </h1>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            {articles.length} article{articles.length !== 1 ? 's' : ''} saved
          </span>
        </div>
      </div>

      <div className="page-container">
        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <span>Loading saved articles...</span>
          </div>
        ) : articles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {articles.map((article, index) => (
              <motion.div
                key={article.article_id || index}
                className="saved-article-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() =>
                  setSelectedArticle({
                    id: article.article_id,
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    urlToImage: article.image_url,
                    source: { name: article.source },
                    publishedAt: article.published_at,
                    tags: article.tags ? JSON.parse(article.tags) : [],
                  })
                }
                id={`saved-${article.article_id}`}
              >
                <img
                  className="saved-article-thumb"
                  src={article.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200'}
                  alt={article.title}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200';
                  }}
                />
                <div className="saved-article-info">
                  <div className="saved-article-title">{article.title}</div>
                  <div className="saved-article-meta">
                    {article.source} •{' '}
                    {article.created_at
                      ? new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently saved'}
                  </div>
                  {article.summary && (
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {article.summary.substring(0, 120)}...
                    </div>
                  )}
                </div>
                <button
                  className="saved-article-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSaved(article.article_id);
                  }}
                  title="Remove from saved"
                  id={`remove-saved-${article.article_id}`}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📑</div>
            <div className="empty-state-title">No saved articles yet</div>
            <div className="empty-state-desc">
              When you find interesting articles, click "Save Article" in the briefing panel to add them here for later reading.
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
