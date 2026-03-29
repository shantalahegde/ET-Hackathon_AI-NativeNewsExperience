// Translation Route - Multilingual support
const express = require('express');
const { OpenAI } = require('openai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Language display names
const languageNames = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil'
};

/**
 * POST /translate
 * Translate text to target language with contextual understanding
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { text, targetLanguage = 'hi' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    const validLanguages = ['hi', 'kn', 'ta', 'en'];
    if (!validLanguages.includes(targetLanguage)) {
      return res.status(400).json({ error: `Invalid target language. Supported: ${validLanguages.join(', ')}` });
    }

    // If target is English, return as-is
    if (targetLanguage === 'en') {
      return res.json({ translatedText: text, language: 'en', languageName: 'English' });
    }

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in business and financial content. 
Translate the given text into ${languageNames[targetLanguage]}. 
Important: Provide a CONTEXTUAL translation, not literal. 
Business and technical terms should be translated with their commonly understood equivalents in ${languageNames[targetLanguage]}.
If a term is universally used in English (like "GDP", "IPO", "AI"), keep it in English.
Respond with ONLY the translation, no additional text.`
          },
          { role: 'user', content: text }
        ],
        max_tokens: 1000
      });

      res.json({
        translatedText: completion.choices[0].message.content,
        language: targetLanguage,
        languageName: languageNames[targetLanguage]
      });
    } else {
      // Return mock translations
      res.json({
        translatedText: getMockTranslation(text, targetLanguage),
        language: targetLanguage,
        languageName: languageNames[targetLanguage],
        mock: true,
        note: 'Set OPENAI_API_KEY for real translations'
      });
    }
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

/**
 * Mock translations using pre-written phrase dictionaries.
 * Provides readable translated output for demo mode.
 */
function getMockTranslation(text, lang) {
  // Pre-built phrase translation dictionaries
  const translations = {
    hi: {
      'Tech Giants Report Record Q4 Earnings Amid AI Boom': 'AI बूम के बीच टेक दिग्गजों ने Q4 में रिकॉर्ड कमाई की रिपोर्ट दी',
      'India\'s Startup Ecosystem Sees $12B in Funding for Q1 2026': 'भारत के स्टार्टअप इकोसिस्टम में Q1 2026 में $12 बिलियन की फंडिंग आई',
      'Federal Reserve Holds Rates Steady, Signals Potential Cuts': 'फेडरल रिजर्व ने दरें स्थिर रखीं, संभावित कटौती के संकेत दिए',
      'Electric Vehicle Sales Surge 45% Globally in Early 2026': '2026 की शुरुआत में विश्व स्तर पर इलेक्ट्रिक वाहन बिक्री में 45% की वृद्धि',
      'Cryptocurrency Market Cap Reaches $4 Trillion Milestone': 'क्रिप्टोकरेंसी मार्केट कैप $4 ट्रिलियन के मील के पत्थर पर पहुंचा',
      'AI Healthcare Startups Revolutionize Drug Discovery Process': 'AI हेल्थकेयर स्टार्टअप्स ने दवा खोज प्रक्रिया में क्रांति ला दी',
      'Global Supply Chain Disruptions Ease as Shipping Costs Normalize': 'शिपिंग लागत सामान्य होने से वैश्विक आपूर्ति श्रृंखला में सुधार',
      'RBI Maintains Growth Forecast at 7.2% for FY2026-27': 'RBI ने FY2026-27 के लिए 7.2% विकास दर का अनुमान बरकरार रखा',
      'SaaS Industry Consolidation Accelerates with $50B in M&A Activity': 'SaaS उद्योग में $50 बिलियन M&A गतिविधि के साथ समेकन तेज',
      'Renewable Energy Investments Hit $600B Globally in 2025': '2025 में वैश्विक नवीकरणीय ऊर्जा निवेश $600 बिलियन तक पहुंचा',
      'Market dynamics are shifting due to technological and regulatory changes': 'तकनीकी और नियामक परिवर्तनों के कारण बाजार की गतिशीलता बदल रही है',
      'Key industry players are adapting strategies to maintain competitive advantages': 'प्रमुख उद्योग खिलाड़ी प्रतिस्पर्धात्मक लाभ बनाए रखने के लिए रणनीतियां अपना रहे हैं',
      'Investment opportunities and risks are evolving with new developments': 'नए विकास के साथ निवेश के अवसर और जोखिम विकसित हो रहे हैं',
      'Global economic factors continue to influence business decisions': 'वैश्विक आर्थिक कारक व्यावसायिक निर्णयों को प्रभावित करते रहते हैं',
      'Innovation and digital transformation remain primary growth drivers': 'नवाचार और डिजिटल परिवर्तन प्राथमिक विकास चालक बने हुए हैं'
    },
    kn: {
      'Tech Giants Report Record Q4 Earnings Amid AI Boom': 'AI ಉತ್ಕರ್ಷದ ನಡುವೆ ಟೆಕ್ ದೈತ್ಯರು Q4 ದಾಖಲೆ ಗಳಿಕೆ ವರದಿ ಮಾಡಿದರು',
      'India\'s Startup Ecosystem Sees $12B in Funding for Q1 2026': 'ಭಾರತದ ಸ್ಟಾರ್ಟ್‌ಅಪ್ ಪರಿಸರ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ Q1 2026 ರಲ್ಲಿ $12 ಬಿಲಿಯನ್ ಹಣಕಾಸು',
      'Federal Reserve Holds Rates Steady, Signals Potential Cuts': 'ಫೆಡರಲ್ ರಿಸರ್ವ್ ದರಗಳನ್ನು ಸ್ಥಿರವಾಗಿ ಇರಿಸಿದೆ, ಕಡಿತದ ಸಂಕೇತ ನೀಡಿದೆ',
      'Electric Vehicle Sales Surge 45% Globally in Early 2026': '2026 ರ ಆರಂಭದಲ್ಲಿ ಜಾಗತಿಕ ಮಟ್ಟದಲ್ಲಿ ಎಲೆಕ್ಟ್ರಿಕ್ ವಾಹನ ಮಾರಾಟ 45% ಏರಿಕೆ',
      'Cryptocurrency Market Cap Reaches $4 Trillion Milestone': 'ಕ್ರಿಪ್ಟೋಕರೆನ್ಸಿ ಮಾರುಕಟ್ಟೆ ಬಂಡವಾಳ $4 ಟ್ರಿಲಿಯನ್ ಮೈಲಿಗಲ್ಲು ತಲುಪಿದೆ',
      'AI Healthcare Startups Revolutionize Drug Discovery Process': 'AI ಹೆಲ್ತ್‌ಕೇರ್ ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗಳು ಔಷಧ ಅನ್ವೇಷಣೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ಕ್ರಾಂತಿ',
      'Market dynamics are shifting due to technological and regulatory changes': 'ತಾಂತ್ರಿಕ ಮತ್ತು ನಿಯಂತ್ರಕ ಬದಲಾವಣೆಗಳಿಂದ ಮಾರುಕಟ್ಟೆ ಚಲನಶೀಲತೆ ಬದಲಾಗುತ್ತಿದೆ',
      'Key industry players are adapting strategies to maintain competitive advantages': 'ಪ್ರಮುಖ ಉದ್ಯಮ ಆಟಗಾರರು ಸ್ಪರ್ಧಾತ್ಮಕ ಪ್ರಯೋಜನಗಳನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ತಂತ್ರಗಳನ್ನು ಅಳವಡಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದಾರೆ',
      'Innovation and digital transformation remain primary growth drivers': 'ನಾವೀನ್ಯತೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಪರಿವರ್ತನೆ ಪ್ರಾಥಮಿಕ ಬೆಳವಣಿಗೆ ಚಾಲಕಗಳಾಗಿ ಉಳಿದಿವೆ'
    },
    ta: {
      'Tech Giants Report Record Q4 Earnings Amid AI Boom': 'AI வளர்ச்சியின் மத்தியில் தொழில்நுட்ப நிறுவனங்கள் Q4 சாதனை வருவாயை அறிவித்தன',
      'India\'s Startup Ecosystem Sees $12B in Funding for Q1 2026': 'இந்தியாவின் ஸ்டார்ட்அப் சுற்றுச்சூழல் Q1 2026 இல் $12 பில்லியன் நிதி பெற்றது',
      'Federal Reserve Holds Rates Steady, Signals Potential Cuts': 'ஃபெடரல் ரிசர்வ் வட்டி விகிதங்களை நிலையாக வைத்துள்ளது, குறைப்புக்கான சமிக்ஞை',
      'Electric Vehicle Sales Surge 45% Globally in Early 2026': '2026 தொடக்கத்தில் உலகளவில் மின் வாகன விற்பனை 45% உயர்வு',
      'Cryptocurrency Market Cap Reaches $4 Trillion Milestone': 'கிரிப்டோகரன்சி சந்தை மதிப்பு $4 டிரில்லியன் மைல்கல்லை எட்டியது',
      'AI Healthcare Startups Revolutionize Drug Discovery Process': 'AI சுகாதார ஸ்டார்ட்அப்கள் மருந்து கண்டுபிடிப்பு செயல்முறையில் புரட்சி',
      'Market dynamics are shifting due to technological and regulatory changes': 'தொழில்நுட்ப மற்றும் ஒழுங்குமுறை மாற்றங்களால் சந்தை இயக்கவியல் மாறுகிறது',
      'Key industry players are adapting strategies to maintain competitive advantages': 'முக்கிய தொழில்துறை வீரர்கள் போட்டி நன்மைகளை பேணிக்காக்க உத்திகளை மாற்றியமைக்கின்றனர்',
      'Innovation and digital transformation remain primary growth drivers': 'புதுமை மற்றும் டிஜிட்டல் மாற்றம் முதன்மை வளர்ச்சி இயக்கிகளாக உள்ளன'
    }
  };

  const dict = translations[lang] || translations.hi;

  // Check for exact title match first
  if (dict[text]) {
    return dict[text];
  }

  // Try to translate sentence by sentence
  let translatedText = text;
  let matched = false;

  for (const [eng, translated] of Object.entries(dict)) {
    if (text.includes(eng)) {
      translatedText = translatedText.replace(eng, translated);
      matched = true;
    }
  }

  if (matched) {
    return translatedText;
  }

  // Fallback: apply word-level business term translations
  const businessTerms = {
    hi: {
      'market': 'बाजार', 'company': 'कंपनी', 'investment': 'निवेश', 'growth': 'विकास',
      'technology': 'प्रौद्योगिकी', 'business': 'व्यापार', 'economy': 'अर्थव्यवस्था',
      'industry': 'उद्योग', 'startup': 'स्टार्टअप', 'global': 'वैश्विक',
      'revenue': 'राजस्व', 'billion': 'अरब', 'trillion': 'खरब',
      'stock': 'शेयर', 'sector': 'क्षेत्र', 'demand': 'मांग',
      'sales': 'बिक्री', 'price': 'कीमत', 'trade': 'व्यापार',
      'energy': 'ऊर्जा', 'innovation': 'नवाचार', 'digital': 'डिजिटल',
      'report': 'रिपोर्ट', 'record': 'रिकॉर्ड', 'significant': 'महत्वपूर्ण'
    },
    kn: {
      'market': 'ಮಾರುಕಟ್ಟೆ', 'company': 'ಕಂಪನಿ', 'investment': 'ಹೂಡಿಕೆ', 'growth': 'ಬೆಳವಣಿಗೆ',
      'technology': 'ತಂತ್ರಜ್ಞಾನ', 'business': 'ವ್ಯಾಪಾರ', 'economy': 'ಆರ್ಥಿಕತೆ',
      'industry': 'ಉದ್ಯಮ', 'startup': 'ಸ್ಟಾರ್ಟ್‌ಅಪ್', 'global': 'ಜಾಗತಿಕ',
      'revenue': 'ಆದಾಯ', 'billion': 'ಶತಕೋಟಿ', 'stock': 'ಷೇರು',
      'sector': 'ಕ್ಷೇತ್ರ', 'demand': 'ಬೇಡಿಕೆ', 'sales': 'ಮಾರಾಟ',
      'energy': 'ಶಕ್ತಿ', 'innovation': 'ನಾವೀನ್ಯತೆ', 'digital': 'ಡಿಜಿಟಲ್'
    },
    ta: {
      'market': 'சந்தை', 'company': 'நிறுவனம்', 'investment': 'முதலீடு', 'growth': 'வளர்ச்சி',
      'technology': 'தொழில்நுட்பம்', 'business': 'வணிகம்', 'economy': 'பொருளாதாரம்',
      'industry': 'தொழில்', 'startup': 'ஸ்டார்ட்அப்', 'global': 'உலகளாவிய',
      'revenue': 'வருவாய்', 'billion': 'பில்லியன்', 'stock': 'பங்கு',
      'sector': 'துறை', 'demand': 'தேவை', 'sales': 'விற்பனை',
      'energy': 'ஆற்றல்', 'innovation': 'புதுமை', 'digital': 'டிஜிட்டல்'
    }
  };

  const terms = businessTerms[lang] || businessTerms.hi;
  let result = text;
  for (const [eng, translated] of Object.entries(terms)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, translated);
  }
  return result;
}

module.exports = router;
