// News Routes - Fetch, personalize, and generate briefings
const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');
const pool = require('../config/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { allSampleNews, getNewsByRole, getAllNews, sampleStoryArcs } = require('../utils/sampleData');

const router = express.Router();

// In-memory saved articles store (fallback when DB unavailable)
const savedArticlesStore = new Map();

// Initialize OpenAI if key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';

/**
 * Fetch news from NewsAPI with caching and fallback
 */
async function fetchNewsFromAPI(query = 'business', category = 'business') {
  // Check cache first
  try {
    const [cached] = await pool.query(
      'SELECT data FROM news_cache WHERE cache_key = ? AND expires_at > NOW()',
      [`news_${query}_${category}`]
    );
    if (cached.length > 0) {
      return JSON.parse(cached[0].data);
    }
  } catch (err) {
    // DB not available, skip cache
  }

  // Fetch from NewsAPI
  if (NEWS_API_KEY && NEWS_API_KEY !== 'your_newsapi_key_from_newsapi_org') {
    try {
      const response = await axios.get(`${NEWS_API_BASE}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: NEWS_API_KEY
        }
      });

      const articles = response.data.articles.map((article, index) => ({
        id: `api-${Date.now()}-${index}`,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        source: article.source,
        publishedAt: article.publishedAt,
        content: article.content,
        category: category,
        tags: extractTags(article.title + ' ' + (article.description || ''))
      }));

      // Cache the results
      try {
        await pool.query(
          'INSERT INTO news_cache (cache_key, data, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE)) ON DUPLICATE KEY UPDATE data = VALUES(data), expires_at = VALUES(expires_at)',
          [`news_${query}_${category}`, JSON.stringify(articles)]
        );
      } catch (err) {
        // Skip caching
      }

      return articles;
    } catch (err) {
      console.log('NewsAPI fetch failed, using sample data:', err.message);
    }
  }

  // Return sample data as fallback
  return getAllNews();
}

/**
 * Extract tags from text
 */
function extractTags(text) {
  const tagKeywords = {
    'stocks': ['stock', 'shares', 'equity', 'dividend', 'market cap', 'IPO', 'nasdaq', 'sensex', 'nifty'],
    'startups': ['startup', 'founder', 'venture', 'seed', 'series', 'unicorn', 'valuation'],
    'economy': ['gdp', 'inflation', 'interest rate', 'federal reserve', 'rbi', 'fiscal', 'monetary'],
    'AI': ['artificial intelligence', ' ai ', 'machine learning', 'deep learning', 'neural', 'gpt', 'llm'],
    'crypto': ['bitcoin', 'crypto', 'blockchain', 'ethereum', 'token', 'defi'],
    'green energy': ['renewable', 'solar', 'wind', 'electric vehicle', ' ev ', 'sustainable', 'carbon'],
    'fintech': ['fintech', 'digital payment', 'upi', 'banking', 'lending', 'insurance tech']
  };

  const lowerText = text.toLowerCase();
  const tags = [];

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ['business'];
}

/**
 * Rank articles by relevance to user role
 */
function rankByRole(articles, role) {
  const rolePreferences = {
    investor: { priority: ['stocks', 'economy', 'crypto', 'investment'], weight: 2 },
    startup_founder: { priority: ['startups', 'AI', 'fintech', 'SaaS'], weight: 2 },
    student: { priority: ['AI', 'technology', 'careers', 'learning'], weight: 2 }
  };

  const prefs = rolePreferences[role] || rolePreferences.student;

  return articles
    .map(article => {
      let score = 0;
      const tags = article.tags || [];
      tags.forEach(tag => {
        if (prefs.priority.some(p => p.toLowerCase() === tag.toLowerCase())) {
          score += prefs.weight;
        }
      });
      return { ...article, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * GET /news/fetch
 * Fetch latest business news (role-filtered if authenticated)
 */
router.get('/fetch', optionalAuth, async (req, res) => {
  try {
    const role = req.user?.role;
    const { query = 'business', category = 'business' } = req.query;

    // If we have a real API key, fetch from API
    if (NEWS_API_KEY && NEWS_API_KEY !== 'your_newsapi_key_from_newsapi_org') {
      const articles = await fetchNewsFromAPI(query, category);
      const filtered = role ? rankByRole(articles, role) : articles;
      return res.json({ articles: filtered, count: filtered.length });
    }

    // Otherwise return role-filtered sample data
    const articles = role ? getNewsByRole(role) : getAllNews();
    res.json({ articles, count: articles.length, role: role || 'all' });
  } catch (err) {
    console.error('News fetch error:', err);
    const role = req.user?.role;
    const articles = role ? getNewsByRole(role) : getAllNews();
    res.json({ articles, count: articles.length, fallback: true });
  }
});

/**
 * GET /news/personalized
 * Get personalized news feed based on user role
 */
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role || 'student';

    // If we have a real API key, fetch and rank from API
    if (NEWS_API_KEY && NEWS_API_KEY !== 'your_newsapi_key_from_newsapi_org') {
      let articles = await fetchNewsFromAPI('business technology finance');
      articles = rankByRole(articles, role);

      // Generate AI summaries if OpenAI is available
      if (openai) {
        const summarized = await Promise.all(
          articles.slice(0, 5).map(async (article) => {
            try {
              const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                  { role: 'system', content: `You are a business news analyst. Create a brief 2-sentence summary of this article optimized for a ${role.replace('_', ' ')}.` },
                  { role: 'user', content: `Title: ${article.title}\nContent: ${article.content || article.description}` }
                ],
                max_tokens: 100
              });
              return { ...article, aiSummary: completion.choices[0].message.content };
            } catch (err) {
              return { ...article, aiSummary: article.description };
            }
          })
        );
        articles = [...summarized, ...articles.slice(5)];
      } else {
        articles = articles.map(a => ({ ...a, aiSummary: a.description }));
      }

      return res.json({ articles, role, count: articles.length });
    }

    // Return role-filtered sample data
    const articles = getNewsByRole(role).map(a => ({ ...a, aiSummary: a.description }));
    res.json({ articles, role, count: articles.length });
  } catch (err) {
    console.error('Personalized feed error:', err);
    const role = req.user?.role || 'student';
    const articles = getNewsByRole(role).map(a => ({ ...a, aiSummary: a.description }));
    res.json({
      articles,
      role,
      fallback: true
    });
  }
});

/**
 * POST /news/briefing
 * Generate AI-powered interactive briefing for an article
 */
router.post('/briefing', authenticateToken, async (req, res) => {
  try {
    const { title, content, description } = req.body;
    const role = req.user.role || 'student';
    const articleText = content || description || title;

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert business news analyst. Generate a comprehensive briefing in JSON format with these fields:
            - summary: A clear 3-4 sentence summary
            - keyPoints: Array of 4-5 key takeaways
            - impact: Object with fields "investor", "startup_founder", "student" each containing a brief impact analysis
            - sentiment: "positive", "negative", or "neutral"
            - relatedTopics: Array of 3-4 related topics to explore
            Respond ONLY with valid JSON.`
          },
          { role: 'user', content: `Article Title: ${title}\nContent: ${articleText}` }
        ],
        max_tokens: 800
      });

      let briefing;
      try {
        briefing = JSON.parse(completion.choices[0].message.content);
      } catch {
        briefing = {
          summary: completion.choices[0].message.content,
          keyPoints: ['AI-generated summary available'],
          impact: { [role]: 'See summary for details' },
          sentiment: 'neutral',
          relatedTopics: []
        };
      }

      res.json({ briefing, role });
    } else {
      // Generate mock briefing without AI
      res.json({
        briefing: generateMockBriefing(title, articleText, role),
        role,
        mock: true
      });
    }
  } catch (err) {
    console.error('Briefing error:', err);
    res.json({
      briefing: generateMockBriefing(req.body.title, req.body.description, req.user?.role),
      role: req.user?.role,
      mock: true
    });
  }
});

/**
 * Generate a mock briefing when AI is unavailable
 */
function generateMockBriefing(title, content, role) {
  return {
    summary: `${title}. ${content || 'This article covers important developments in the business world that could have significant implications for stakeholders across various sectors.'}`,
    keyPoints: [
      'Market dynamics are shifting due to technological and regulatory changes',
      'Key industry players are adapting strategies to maintain competitive advantages',
      'Investment opportunities and risks are evolving with new developments',
      'Global economic factors continue to influence business decisions',
      'Innovation and digital transformation remain primary growth drivers'
    ],
    impact: {
      investor: 'This development could affect portfolio valuations and investment strategies. Monitor related stocks and sectors for potential opportunities or risks.',
      startup_founder: 'This trend creates new opportunities for innovative solutions. Consider how your startup can leverage or adapt to these market changes.',
      student: 'This is an important development to understand for career planning and market awareness. It highlights key trends in the industry.'
    },
    sentiment: 'neutral',
    relatedTopics: ['Market Analysis', 'Industry Trends', 'Economic Outlook', 'Technology Impact']
  };
}

/**
 * POST /news/save
 * Save an article for later
 */
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { articleId, title, description, url, imageUrl, source, publishedAt, summary, tags } = req.body;

    try {
      await pool.query(
        'INSERT INTO saved_articles (user_id, article_id, title, description, url, image_url, source, published_at, summary, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)',
        [req.user.id, articleId, title, description, url, imageUrl, source, publishedAt, summary, JSON.stringify(tags)]
      );
    } catch (dbErr) {
      // DB unavailable - store in memory
      const userId = req.user.id;
      if (!savedArticlesStore.has(userId)) {
        savedArticlesStore.set(userId, []);
      }
      const userSaved = savedArticlesStore.get(userId);
      // Prevent duplicates
      const exists = userSaved.find(a => a.article_id === articleId);
      if (!exists) {
        userSaved.push({
          article_id: articleId,
          title,
          description,
          url,
          image_url: imageUrl,
          source,
          published_at: publishedAt,
          summary,
          tags: JSON.stringify(tags || []),
          created_at: new Date().toISOString()
        });
      }
    }

    res.json({ message: 'Article saved successfully' });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save article' });
  }
});

/**
 * GET /news/saved
 * Get saved articles
 */
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const [articles] = await pool.query(
      'SELECT * FROM saved_articles WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ articles });
  } catch (err) {
    // Return from in-memory store
    const userId = req.user.id;
    const userSaved = savedArticlesStore.get(userId) || [];
    res.json({ articles: [...userSaved].reverse() });
  }
});

/**
 * DELETE /news/saved/:articleId
 * Remove a saved article
 */
router.delete('/saved/:articleId', authenticateToken, async (req, res) => {
  try {
    try {
      await pool.query(
        'DELETE FROM saved_articles WHERE user_id = ? AND article_id = ?',
        [req.user.id, req.params.articleId]
      );
    } catch (dbErr) {
      // Remove from in-memory store
      const userId = req.user.id;
      if (savedArticlesStore.has(userId)) {
        const filtered = savedArticlesStore.get(userId).filter(
          a => a.article_id !== req.params.articleId
        );
        savedArticlesStore.set(userId, filtered);
      }
    }
    res.json({ message: 'Article removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove article' });
  }
});

/**
 * GET /news/story-arcs
 * Get story arc tracking data
 */
router.get('/story-arcs', optionalAuth, async (req, res) => {
  try {
    const [arcs] = await pool.query('SELECT * FROM story_arcs ORDER BY updated_at DESC');
    if (arcs.length > 0) {
      const parsed = arcs.map(arc => ({
        ...arc,
        events: JSON.parse(arc.events || '[]'),
        sentiment_data: JSON.parse(arc.sentiment_data || '{}'),
        key_entities: JSON.parse(arc.key_entities || '[]')
      }));
      res.json({ arcs: parsed });
    } else {
      res.json({ arcs: sampleStoryArcs, fallback: true });
    }
  } catch (err) {
    res.json({ arcs: sampleStoryArcs, fallback: true });
  }
});

module.exports = router;
