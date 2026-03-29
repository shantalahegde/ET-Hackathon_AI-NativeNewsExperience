// Video Generation Route - Convert articles to narrated videos
const express = require('express');
const { OpenAI } = require('openai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * POST /video/generate
 * Generate a video script and TTS data from an article
 * The actual video rendering is done client-side using Canvas + Web Speech API
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { title, content, description } = req.body;
    const articleText = content || description || title;

    let script;

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional news video script writer. Create a video narration script from the given article. 
The script should be structured as a JSON object with:
- "intro": An engaging 1-sentence introduction
- "sections": Array of objects with "heading" and "narration" fields (3-4 sections)
- "conclusion": A 1-sentence closing statement
- "duration_estimate": Estimated duration in seconds

Keep the total script under 60 seconds of narration. Be concise and engaging.
Respond ONLY with valid JSON.`
          },
          { role: 'user', content: `Title: ${title}\nContent: ${articleText}` }
        ],
        max_tokens: 600
      });

      try {
        script = JSON.parse(completion.choices[0].message.content);
      } catch {
        script = generateMockScript(title, articleText);
      }
    } else {
      script = generateMockScript(title, articleText);
    }

    res.json({ script, title });
  } catch (err) {
    console.error('Video generation error:', err);
    res.json({
      script: generateMockScript(req.body.title, req.body.description),
      title: req.body.title,
      mock: true
    });
  }
});

/**
 * Generate a mock video script
 */
function generateMockScript(title, content) {
  const shortContent = (content || '').substring(0, 200);
  return {
    intro: `Breaking business news: ${title}`,
    sections: [
      {
        heading: 'Overview',
        narration: shortContent || `Today we're covering an important development in the business world. ${title}. Let's break down what this means for you.`
      },
      {
        heading: 'Key Impact',
        narration: 'This development has significant implications for markets and investors. Industry experts are closely monitoring the situation for further developments.'
      },
      {
        heading: 'What\'s Next',
        narration: 'Looking ahead, analysts expect this trend to continue shaping the market landscape. Stay tuned for more updates on this evolving story.'
      }
    ],
    conclusion: 'That\'s your Smart News OS briefing. Stay informed, stay ahead.',
    duration_estimate: 45
  };
}

module.exports = router;
