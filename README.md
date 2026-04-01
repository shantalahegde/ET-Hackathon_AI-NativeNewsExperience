🚀 Smart News OS — AI-Powered Business Intelligence Platform
A next-generation, AI-native personalized business news platform that replaces traditional static news reading with an interactive, AI-powered experience.

Tech Stack Node.js MySQL OpenAI

✨ Features
1. User Authentication
Register/Login with JWT-based authentication
Role selection: Investor, Startup Founder, Student
Personalized experience based on role
2. Personalized News Feed (My Feed)
Fetches business news from NewsAPI (with sample data fallback)
AI-powered article summarization
Role-based relevance ranking
Dynamic dashboard with headlines, summaries, and tags
3. News Navigator (Interactive Briefing)
Click any article for an AI-powered Interactive Briefing
Summary, Key Points, Impact Analysis (per role)
Built-in AI Chatbot for follow-up questions
Maintains conversation context per article
Quick-ask buttons: "Explain this simply", "Impact on investors?"
4. AI Video Generator
Converts article summaries into narrated video briefings
Canvas-based video rendering with animated slides
Text-to-Speech narration using Web Speech API
Progress bar and playback controls
5. Story Arc Tracker
Tracks ongoing business topics over time
Timeline view with chronological events
Sentiment analysis with bar charts (Recharts)
Key entity tracking (companies, people)
6. Multilingual Support
Translate summaries into Hindi, Kannada, Tamil
Contextual AI translation (not literal)
Language toggle in every briefing
🛠 Tech Stack
Layer	Technology
Frontend	React 19, Vite, Tailwind CSS v4, Framer Motion
Backend	Node.js, Express.js
Database	MySQL
AI	OpenAI GPT-3.5/4 API
Charts	Recharts
Icons	Lucide React
Video	HTML5 Canvas + Web Speech API
Auth	JWT (jsonwebtoken + bcryptjs)
📁 Project Structure
smart-news-os/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   ├── NewsCard.jsx        # Article card component
│   │   │   └── BriefingPanel.jsx   # AI briefing + chat + video
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Authentication
│   │   │   ├── RegisterPage.jsx    # Registration with roles
│   │   │   ├── HomePage.jsx        # Main dashboard
│   │   │   ├── FeedPage.jsx        # Personalized feed
│   │   │   ├── StoryTrackerPage.jsx # Story arc tracking
│   │   │   └── SavedNewsPage.jsx   # Saved articles
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.jsx                 # Routes & layout
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── config/
│   │   └── db.js                   # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js                 # JWT middleware
│   ├── routes/
│   │   ├── auth.js                 # /auth/* endpoints
│   │   ├── news.js                 # /news/* endpoints
│   │   ├── chat.js                 # /chat/* endpoints
│   │   ├── video.js                # /video/* endpoints
│   │   └── translate.js            # /translate endpoint
│   ├── models/
│   │   └── schema.sql              # Database schema
│   ├── utils/
│   │   └── sampleData.js           # Fallback data
│   ├── index.js                    # Server entry point
│   ├── .env                        # Environment config
│   ├── .env.example                # Config template
│   └── package.json
│
└── README.md
🚀 Quick Start
Prerequisites
Node.js v18+ (download)
MySQL (optional — app works in demo mode without it)
1. Clone / Navigate to the project
cd smart-news-os
2. Setup Backend
cd server
npm install
Configure environment (edit server/.env):

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_news_os
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-your-key          # Optional
NEWS_API_KEY=your-newsapi-key       # Optional
Setup MySQL database (optional):

mysql -u root -p < models/schema.sql
Start the server:

npm start
# or for auto-reload:
npm run dev
3. Setup Frontend
cd ../client
npm install
npm run dev
4. Open the app
Frontend: http://localhost:5173
Backend: http://localhost:5000
🎯 How It Works (Demo Mode)
The app is designed to work without any API keys or database for easy local testing:

Component	With API Key	Without (Demo Mode)
News Feed	Live from NewsAPI	10 sample business articles
AI Summary	OpenAI GPT	Pre-written mock summaries
Chat	OpenAI contextual chat	Smart mock responses
Video	AI-generated scripts	Template scripts + TTS
Translation	OpenAI translation	Placeholder translations
Database	Full MySQL persistence	In-memory (resets on restart)
Auth	Full user management	Demo login (any credentials work)
🔌 API Endpoints
Method	Endpoint	Auth	Description
POST	/auth/register	No	Register new user
POST	/auth/login	No	Authenticate user
GET	/auth/profile	Yes	Get user profile
PUT	/auth/preferences	Yes	Update preferences
GET	/news/fetch	Opt.	Fetch latest news
GET	/news/personalized	Yes	Get role-based feed
POST	/news/briefing	Yes	Generate AI briefing
POST	/news/save	Yes	Save article
GET	/news/saved	Yes	Get saved articles
DELETE	/news/saved/:id	Yes	Remove saved article
GET	/news/story-arcs	Opt.	Get story arc data
POST	/chat/query	Yes	Send chat message
GET	/chat/history/:id	Yes	Get chat history
POST	/video/generate	Yes	Generate video script
POST	/translate	Yes	Translate text
GET	/health	No	Health check
🗄 Database Schema
-- Core tables
users          (id, name, email, password, role)
preferences    (id, user_id, topics, language)
saved_articles (id, user_id, article_id, title, description, url, ...)
chat_history   (id, user_id, article_id, role, message, session_id)
news_cache     (id, cache_key, data, expires_at)
story_arcs     (id, topic, entity_type, events, sentiment_data, key_entities)
🎨 Design
Theme: Dark Bloomberg/Terminal-inspired
Typography: Inter + JetBrains Mono (Google Fonts)
Effects: Glassmorphism, smooth animations, gradient accents
Colors: Deep indigo primary, cyan/green/amber accents
Responsive: Full mobile support with drawer sidebar
📜 License
MIT License — Built with ❤️ for the future of business intelligence.
