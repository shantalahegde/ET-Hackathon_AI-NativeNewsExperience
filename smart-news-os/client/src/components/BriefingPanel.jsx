// BriefingPanel - AI-powered interactive article briefing with chat
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Play,
  Globe,
  Bookmark,
  Sparkles,
  TrendingUp,
  AlertCircle,
  MessageCircle,
  Video,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { newsAPI, chatAPI, videoAPI, translateAPI } from '../services/api';

export default function BriefingPanel({ article, onClose }) {
  const { user } = useAuth();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoScript, setVideoScript] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en');
  const [translatedSummary, setTranslatedSummary] = useState(null);
  const [translatedKeyPoints, setTranslatedKeyPoints] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [saved, setSaved] = useState(false);

  const chatEndRef = useRef(null);
  const canvasRef = useRef(null);
  const speechRef = useRef(null);

  // Fetch briefing on mount
  useEffect(() => {
    fetchBriefing();
    return () => {
      // Cleanup speech synthesis
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await newsAPI.getBriefing({
        title: article.title,
        content: article.content,
        description: article.description,
      });
      setBriefing(res.data.briefing);
    } catch (err) {
      // Use fallback briefing
      setBriefing({
        summary: article.description || article.title,
        keyPoints: [
          'Market dynamics are shifting',
          'Key industry players are adapting',
          'Investment landscape is evolving',
          'Digital transformation accelerates',
        ],
        impact: {
          investor: 'Monitor related markets for opportunities.',
          startup_founder: 'Potential new market gaps to explore.',
          student: 'Important trend for career awareness.',
        },
        sentiment: 'neutral',
        relatedTopics: ['Market Analysis', 'Industry Trends'],
      });
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message: userMessage,
        articleContext: {
          id: article.id,
          title: article.title,
          content: article.content,
          description: article.description,
        },
        sessionId,
      });
      setSessionId(res.data.sessionId);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.response },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Send a direct message (bypasses chatInput state)
  const sendDirectMessage = async (message) => {
    if (!message.trim() || chatLoading) return;

    setChatMessages((prev) => [...prev, { role: 'user', content: message }]);
    setChatLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message,
        articleContext: {
          id: article.id,
          title: article.title,
          content: article.content,
          description: article.description,
        },
        sessionId,
      });
      setSessionId(res.data.sessionId);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.response },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setVideoLoading(true);
    setShowVideo(true);
    try {
      const res = await videoAPI.generate({
        title: article.title,
        content: article.content,
        description: article.description,
      });
      setVideoScript(res.data.script);
    } catch (err) {
      setVideoScript({
        intro: `Breaking news: ${article.title}`,
        sections: [
          { heading: 'Overview', narration: article.description || article.title },
          { heading: 'Analysis', narration: 'Important market developments to watch.' },
        ],
        conclusion: 'Stay informed with Smart News OS.',
        duration_estimate: 30,
      });
    } finally {
      setVideoLoading(false);
    }
  };

  const playVideo = () => {
    if (!videoScript || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 360;

    setIsPlaying(true);
    setVideoProgress(0);

    // Combine all text for narration
    const fullScript = [
      videoScript.intro,
      ...videoScript.sections.map((s) => `${s.heading}. ${s.narration}`),
      videoScript.conclusion,
    ].join('. ');

    // Render video frames on canvas
    const sections = [
      { text: videoScript.intro, color: '#6366f1', label: 'BREAKING' },
      ...videoScript.sections.map((s, i) => ({
        text: s.narration,
        color: ['#8b5cf6', '#22d3ee', '#10b981'][i % 3],
        label: s.heading.toUpperCase(),
      })),
      { text: videoScript.conclusion, color: '#6366f1', label: 'CONCLUSION' },
    ];

    let currentSection = 0;
    const sectionDuration = (videoScript.duration_estimate || 30) / sections.length;

    const renderFrame = () => {
      const section = sections[currentSection];

      // Background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, 640, 360);

      // Gradient accent line
      const gradient = ctx.createLinearGradient(0, 0, 640, 0);
      gradient.addColorStop(0, section.color);
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 4);

      // Label
      ctx.fillStyle = section.color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(section.label, 40, 60);

      // Summary title
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 20px Inter, sans-serif';
      const titleLines = wrapText(ctx, article.title, 560);
      titleLines.forEach((line, i) => {
        ctx.fillText(line, 40, 100 + i * 28);
      });

      // Narration text
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      const narrationLines = wrapText(ctx, section.text, 560);
      const startY = 100 + titleLines.length * 28 + 20;
      narrationLines.slice(0, 5).forEach((line, i) => {
        ctx.fillText(line, 40, startY + i * 22);
      });

      // Bottom bar
      ctx.fillStyle = '#111118';
      ctx.fillRect(0, 330, 640, 30);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Smart News OS • AI Video Brief', 40, 350);

      // Progress bar
      const progress = (currentSection + 1) / sections.length;
      ctx.fillStyle = '#1a1a24';
      ctx.fillRect(0, 356, 640, 4);
      ctx.fillStyle = section.color;
      ctx.fillRect(0, 356, 640 * progress, 4);

      setVideoProgress(progress * 100);
    };

    // Text-to-Speech narration
    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Select a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    // Advance sections over time
    const advanceInterval = setInterval(() => {
      if (currentSection < sections.length - 1) {
        currentSection++;
        renderFrame();
      } else {
        clearInterval(advanceInterval);
        setIsPlaying(false);
        setVideoProgress(100);
      }
    }, sectionDuration * 1000);

    utterance.onend = () => {
      clearInterval(advanceInterval);
      setIsPlaying(false);
      setVideoProgress(100);
    };

    speechRef.current = utterance;
    renderFrame();
    window.speechSynthesis.speak(utterance);
  };

  const stopVideo = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Helper: wrap text for canvas
  function wrapText(ctx, text, maxWidth) {
    const words = (text || '').split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  const handleTranslate = async (lang) => {
    if (lang === 'en') {
      setSelectedLang('en');
      setTranslatedSummary(null);
      setTranslatedKeyPoints(null);
      return;
    }

    setSelectedLang(lang);
    setTranslating(true);
    try {
      // Translate summary
      const summaryText = briefing?.summary || article.description || article.title;
      const res = await translateAPI.translate({
        text: summaryText,
        targetLanguage: lang,
      });
      setTranslatedSummary(res.data.translatedText);

      // Also translate key points
      if (briefing?.keyPoints?.length > 0) {
        const keyPointsText = briefing.keyPoints.join('\n');
        const kpRes = await translateAPI.translate({
          text: keyPointsText,
          targetLanguage: lang,
        });
        setTranslatedKeyPoints(kpRes.data.translatedText.split('\n').filter(Boolean));
      }
    } catch (err) {
      setTranslatedSummary('Translation failed. Please try again.');
      setTranslatedKeyPoints(null);
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    try {
      await newsAPI.save({
        articleId: article.id,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source?.name,
        publishedAt: article.publishedAt,
        summary: briefing?.summary || article.description,
        tags: article.tags,
      });
      setSaved(true);
    } catch (err) {
      setSaved(true); // Optimistic
    }
  };

  const sentimentIcon = {
    positive: '📈',
    negative: '📉',
    neutral: '➡️',
  };

  const quickQuestions = [
    'Explain this simply',
    'What is the impact on investors?',
    'What are the key trends?',
    'How does this affect startups?',
  ];

  return (
    <motion.div
      className="briefing-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      id="briefing-overlay"
    >
      <motion.div
        className="briefing-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        id="briefing-panel"
      >
        {/* Header */}
        <div className="briefing-header">
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sparkles size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
              AI Interactive Briefing
            </div>
            <h2 className="briefing-title">{article.title}</h2>
          </div>
          <button className="briefing-close" onClick={onClose} id="briefing-close">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="briefing-content">
          {loading ? (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <span>Generating AI briefing...</span>
            </div>
          ) : (
            <>
              {/* Language Toggle */}
              <div className="language-toggle">
                {['en', 'hi', 'kn', 'ta'].map((lang) => (
                  <button
                    key={lang}
                    className={`language-btn ${selectedLang === lang ? 'active' : ''}`}
                    onClick={() => handleTranslate(lang)}
                    id={`lang-${lang}`}
                  >
                    {{ en: 'English', hi: 'हिंदी', kn: 'ಕನ್ನಡ', ta: 'தமிழ்' }[lang]}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="briefing-section">
                <div className="briefing-section-title">
                  <Sparkles size={14} /> Summary
                  {briefing?.sentiment && (
                    <span className={`sentiment-badge ${briefing.sentiment}`} style={{ marginLeft: 'auto' }}>
                      {sentimentIcon[briefing.sentiment]} {briefing.sentiment}
                    </span>
                  )}
                </div>
                <div className="briefing-summary">
                  {translating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-tertiary)' }}>
                      <Loader2 size={16} className="loading-spinner" style={{ border: 'none', animation: 'spin 0.8s linear infinite' }} />
                      Translating...
                    </div>
                  ) : (
                    translatedSummary || briefing?.summary
                  )}
                </div>
              </div>

              {/* Key Points */}
              <div className="briefing-section">
                <div className="briefing-section-title">
                  <TrendingUp size={14} /> Key Points
                </div>
                <div className="briefing-key-points">
                  {briefing?.keyPoints?.map((point, i) => (
                    <div key={i} className="briefing-key-point">
                      <span className="briefing-key-point-num">0{i + 1}</span>
                      <span>{(translatedKeyPoints && translatedKeyPoints[i]) || point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div className="briefing-section">
                <div className="briefing-section-title">
                  <AlertCircle size={14} /> Impact Analysis
                </div>
                <div className="briefing-impact">
                  <div className="briefing-impact-label">
                    For {user?.role?.replace('_', ' ') || 'you'}
                  </div>
                  {briefing?.impact?.[user?.role] || briefing?.impact?.investor || 'Analysis not available'}
                </div>
              </div>

              {/* Actions */}
              <div className="briefing-actions">
                <button
                  className={`briefing-action-btn ${saved ? '' : 'primary'}`}
                  onClick={handleSave}
                  disabled={saved}
                  id="briefing-save"
                >
                  <Bookmark size={14} />
                  {saved ? 'Saved ✓' : 'Save Article'}
                </button>
                <button
                  className="briefing-action-btn"
                  onClick={() => setShowChat(!showChat)}
                  id="briefing-chat-toggle"
                >
                  <MessageCircle size={14} />
                  {showChat ? 'Hide Chat' : 'Ask Questions'}
                </button>
                <button
                  className="briefing-action-btn"
                  onClick={handleGenerateVideo}
                  disabled={videoLoading}
                  id="briefing-video"
                >
                  <Video size={14} />
                  {videoLoading ? 'Generating...' : 'Generate Video'}
                </button>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="briefing-action-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    <Globe size={14} /> Read Original
                  </a>
                )}
              </div>

              {/* Video */}
              <AnimatePresence>
                {showVideo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="briefing-section">
                      <div className="briefing-section-title">
                        <Video size={14} /> AI Video Brief
                      </div>
                      <div className="video-container">
                        <canvas ref={canvasRef} className="video-canvas" />
                        {videoLoading ? (
                          <div className="loading-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }}>
                            <div className="loading-spinner" />
                            <span>Generating video script...</span>
                          </div>
                        ) : (
                          <div className="video-controls">
                            <button
                              className="video-play-btn"
                              onClick={isPlaying ? stopVideo : playVideo}
                              id="video-play"
                            >
                              {isPlaying ? <X size={18} /> : <Play size={18} />}
                            </button>
                            <div className="video-progress">
                              <div
                                className="video-progress-bar"
                                style={{ width: `${videoProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Chat Interface */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="chat-container"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
            >
              <div className="chat-messages" id="chat-messages">
                {chatMessages.length === 0 && (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>
                      Ask questions about this article:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {quickQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendDirectMessage(q)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 100,
                            border: '1px solid var(--border-secondary)',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            fontSize: 12,
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                          }}
                          className="quick-question-btn"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.role}`}>
                    <div className="chat-message-avatar">
                      {msg.role === 'assistant' ? '✦' : user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="chat-message-bubble">
                      {msg.content.split('\n').map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message assistant">
                    <div className="chat-message-avatar">✦</div>
                    <div className="chat-message-bubble">
                      <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask about this article..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  disabled={chatLoading}
                  id="chat-input"
                />
                <button
                  className="chat-send"
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  id="chat-send"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
