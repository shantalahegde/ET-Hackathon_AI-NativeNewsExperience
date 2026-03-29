// Chat Routes - AI-powered conversational interface
const express = require('express');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// In-memory conversation store (fallback when DB unavailable)
const conversationStore = new Map();

/**
 * POST /chat/query
 * Send a message to the AI chatbot with article context
 */
router.post('/query', authenticateToken, async (req, res) => {
  try {
    const { message, articleContext, sessionId } = req.body;
    const userId = req.user.id;
    const role = req.user.role || 'student';
    const currentSessionId = sessionId || uuidv4();

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get conversation history
    let conversationHistory = [];
    try {
      const [history] = await pool.query(
        'SELECT role, message FROM chat_history WHERE user_id = ? AND session_id = ? ORDER BY created_at ASC LIMIT 20',
        [userId, currentSessionId]
      );
      conversationHistory = history.map(h => ({
        role: h.role,
        content: h.message
      }));
    } catch (err) {
      // Use in-memory store
      conversationHistory = conversationStore.get(currentSessionId) || [];
    }

    // Store user message
    try {
      await pool.query(
        'INSERT INTO chat_history (user_id, article_id, role, message, session_id) VALUES (?, ?, ?, ?, ?)',
        [userId, articleContext?.id || null, 'user', message, currentSessionId]
      );
    } catch (err) {
      // Store in memory
      if (!conversationStore.has(currentSessionId)) {
        conversationStore.set(currentSessionId, []);
      }
      conversationStore.get(currentSessionId).push({ role: 'user', content: message });
    }

    let aiResponse;

    if (openai) {
      // Build messages array with system context
      const systemMessage = {
        role: 'system',
        content: `You are an expert AI business news analyst assistant in the "Smart News OS" platform. 
The user's role is: ${role.replace('_', ' ')}.
${articleContext ? `\nCurrent article context:\nTitle: ${articleContext.title}\nContent: ${articleContext.content || articleContext.description}` : ''}

Guidelines:
- Provide clear, insightful analysis tailored to the user's role
- For investors: focus on financial implications, market impact, investment opportunities
- For startup founders: focus on market opportunities, competitive landscape, innovation trends
- For students: provide educational context, explain concepts simply, highlight career relevance
- Be conversational but professional
- Use data and specific examples when possible
- Keep responses concise but comprehensive`
      };

      const messages = [
        systemMessage,
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7
      });

      aiResponse = completion.choices[0].message.content;
    } else {
      // Generate smart mock response
      aiResponse = generateMockResponse(message, articleContext, role);
    }

    // Store AI response
    try {
      await pool.query(
        'INSERT INTO chat_history (user_id, article_id, role, message, session_id) VALUES (?, ?, ?, ?, ?)',
        [userId, articleContext?.id || null, 'assistant', aiResponse, currentSessionId]
      );
    } catch (err) {
      if (conversationStore.has(currentSessionId)) {
        conversationStore.get(currentSessionId).push({ role: 'assistant', content: aiResponse });
      }
    }

    res.json({
      response: aiResponse,
      sessionId: currentSessionId
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process your message. Please try again.' });
  }
});

/**
 * GET /chat/history/:sessionId
 * Get chat history for a session
 */
router.get('/history/:sessionId', authenticateToken, async (req, res) => {
  try {
    const [history] = await pool.query(
      'SELECT role, message, created_at FROM chat_history WHERE user_id = ? AND session_id = ? ORDER BY created_at ASC',
      [req.user.id, req.params.sessionId]
    );
    res.json({ history, sessionId: req.params.sessionId });
  } catch (err) {
    const stored = conversationStore.get(req.params.sessionId) || [];
    res.json({ history: stored, sessionId: req.params.sessionId });
  }
});

/**
 * Generate mock AI responses for demo mode
 */
function generateMockResponse(message, articleContext, role) {
  const lowerMessage = message.toLowerCase();

  // Contextual responses based on user intent
  if (lowerMessage.includes('explain') && lowerMessage.includes('simply')) {
    if (articleContext) {
      return `Here's a simplified explanation:\n\n${articleContext.title} essentially means that significant changes are happening in this sector. Think of it like this: when major players in an industry make big moves, it creates a ripple effect that impacts everyone from large investors to everyday consumers.\n\nThe key takeaway is that this development signals a shift in how the market operates, and it's worth watching how it unfolds over the coming weeks.`;
    }
    return 'I\'d be happy to explain! Could you share which article or topic you\'d like me to simplify? I can break down complex business concepts into easy-to-understand terms.';
  }

  if (lowerMessage.includes('impact') && lowerMessage.includes('investor')) {
    return `**Impact Analysis for Investors:**\n\n📈 **Short-term:** Market volatility may increase as traders react to this news. Consider monitoring related stocks and sectors closely.\n\n📊 **Medium-term:** This development could create new investment opportunities in related sectors. Diversification strategies should account for these market shifts.\n\n🎯 **Long-term:** The structural changes implied by this news could reshape industry dynamics. Position your portfolio to benefit from emerging trends.\n\n💡 **Action Items:**\n- Review exposure to affected sectors\n- Watch for follow-up announcements\n- Consider hedging strategies if applicable`;
  }

  if (lowerMessage.includes('impact') && (lowerMessage.includes('startup') || lowerMessage.includes('founder'))) {
    return `**Impact Analysis for Startup Founders:**\n\n🚀 **Opportunities:** This development opens up new market gaps that innovative startups can fill. Consider how your product/service can address emerging needs.\n\n⚠️ **Challenges:** Increased competition and potential regulatory changes mean founders need to be agile and well-funded.\n\n💡 **Strategic Advice:**\n- Identify underserved customer segments created by this shift\n- Build partnerships with established players\n- Ensure your runway accounts for market uncertainty\n- Focus on unique value propositions that differentiate you`;
  }

  if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
    if (articleContext) {
      return `**Quick Summary:**\n\n${articleContext.description || articleContext.title}\n\nThis news is significant because it reflects broader trends in the business landscape. The key players involved are making strategic moves that could reshape their respective markets.`;
    }
    return 'I can summarize any article for you! Just click on a news story and I\'ll provide a comprehensive breakdown tailored to your interests.';
  }

  if (lowerMessage.includes('trend') || lowerMessage.includes('future')) {
    return `**Trend Analysis:**\n\nBased on current market dynamics, several key trends are emerging:\n\n1. **AI Integration** - Businesses across sectors are rapidly adopting AI solutions\n2. **Sustainable Growth** - ESG considerations are becoming central to investment decisions\n3. **Digital Transformation** - Companies are accelerating their digital strategies\n4. **Global Realignment** - Supply chains and trade relationships are being restructured\n\nThese trends are interconnected and will likely define the business landscape for the next 2-3 years.`;
  }

  // Default contextual response
  if (articleContext) {
    return `Great question about "${articleContext.title}"!\n\nThis is an important development in the business world. As a ${role.replace('_', ' ')}, here are the key things to consider:\n\n1. **Market Impact:** This news could influence related sectors and investment patterns\n2. **Strategic Implications:** Companies and stakeholders will need to adapt their strategies\n3. **Future Outlook:** Watch for follow-up developments and market reactions\n\nWould you like me to dive deeper into any specific aspect? I can analyze the financial impact, explain the background, or discuss potential opportunities.`;
  }

  return `I'm your AI business news analyst, ready to help! Here are some things I can do:\n\n💬 **"Explain this simply"** - Break down complex topics\n📊 **"What's the impact on investors?"** - Role-specific analysis\n📝 **"Summarize this article"** - Quick overview\n🔮 **"What are the trends?"** - Market trend analysis\n\nClick on any news article and ask me questions about it for a personalized briefing!`;
}

module.exports = router;
