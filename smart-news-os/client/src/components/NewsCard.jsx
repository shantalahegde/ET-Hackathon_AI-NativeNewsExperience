// NewsCard - Displays individual news articles in the grid
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Bookmark } from 'lucide-react';

function getTagClass(tag) {
  const t = tag.toLowerCase();
  if (t.includes('stock') || t.includes('market')) return 'tag-stocks';
  if (t.includes('startup') || t.includes('funding')) return 'tag-startups';
  if (t.includes('economy') || t.includes('gdp') || t.includes('rbi')) return 'tag-economy';
  if (t.includes('ai') || t.includes('tech')) return 'tag-ai';
  if (t.includes('crypto') || t.includes('bitcoin')) return 'tag-crypto';
  return 'tag-default';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NewsCard({ article, onClick, onSave, index = 0 }) {
  const fallbackImage = `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop`;

  return (
    <motion.div
      className="card news-card"
      onClick={() => onClick(article)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      id={`news-card-${article.id}`}
    >
      <img
        className="news-card-image"
        src={article.urlToImage || fallbackImage}
        alt={article.title}
        loading="lazy"
        onError={(e) => {
          e.target.src = fallbackImage;
        }}
      />
      <div className="news-card-body">
        <div className="news-card-source">
          <span className="news-card-source-name">
            {article.source?.name || 'News'}
          </span>
          <span className="news-card-source-date">
            <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
            {formatDate(article.publishedAt)}
          </span>
        </div>

        <h3 className="news-card-title">{article.title}</h3>
        
        <p className="news-card-summary">
          {article.aiSummary || article.description}
        </p>

        <div className="news-card-tags">
          {(article.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className={`tag ${getTagClass(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
