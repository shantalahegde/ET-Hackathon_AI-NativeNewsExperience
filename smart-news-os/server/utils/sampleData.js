// Sample news data organized by role relevance
// Each article has a `roles` array indicating which user roles should see it

const allSampleNews = [
  // ═══════════════════════════════════════
  //  INVESTOR-FOCUSED ARTICLES
  // ═══════════════════════════════════════
  {
    id: 'inv-1',
    title: 'Tech Giants Report Record Q4 Earnings Amid AI Boom',
    description: 'Major technology companies including Microsoft, Google, and Meta reported better-than-expected quarterly earnings, driven largely by investments in artificial intelligence infrastructure and cloud computing services.',
    url: 'https://www.reuters.com/technology/big-tech-earnings/',
    urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    source: { name: 'Business Today' },
    publishedAt: '2026-03-28T10:00:00Z',
    content: 'The latest earnings season has brought remarkable results for the technology sector. Microsoft reported a 33% increase in cloud revenue, while Google saw its advertising business rebound strongly. Meta\'s Reality Labs division showed reduced losses as the company pivoted its AI strategy.',
    category: 'technology',
    tags: ['stocks', 'AI', 'earnings'],
    roles: ['investor']
  },
  {
    id: 'inv-2',
    title: 'Federal Reserve Holds Rates Steady, Signals Potential Cuts',
    description: 'The Federal Reserve maintained its benchmark interest rate at 4.25-4.50% but hinted at possible rate cuts in the second half of 2026 as inflation continues to moderate.',
    url: 'https://www.reuters.com/markets/us/federal-reserve/',
    urlToImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    source: { name: 'Financial Express' },
    publishedAt: '2026-03-26T15:00:00Z',
    content: 'In its latest policy decision, the Federal Reserve chose to keep interest rates unchanged. Fed Chair indicated that the central bank is closely monitoring inflation data and could begin easing monetary policy if price pressures continue to decline. Markets reacted positively, with the S&P 500 gaining 1.2%.',
    category: 'economy',
    tags: ['economy', 'stocks', 'interest rates'],
    roles: ['investor']
  },
  {
    id: 'inv-3',
    title: 'Cryptocurrency Market Cap Reaches $4 Trillion Milestone',
    description: 'The total cryptocurrency market capitalization has crossed the $4 trillion mark for the first time, driven by institutional adoption and the success of Bitcoin ETFs.',
    url: 'https://www.coindesk.com/markets/',
    urlToImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    source: { name: 'Crypto Daily' },
    publishedAt: '2026-03-24T09:00:00Z',
    content: 'Bitcoin continues to lead with a price above $95,000, while Ethereum has also seen significant gains. The approval and success of multiple spot Bitcoin ETFs have brought billions in institutional money into the space.',
    category: 'crypto',
    tags: ['crypto', 'stocks', 'investment'],
    roles: ['investor']
  },
  {
    id: 'inv-4',
    title: 'RBI Maintains Growth Forecast at 7.2% for FY2026-27',
    description: 'The Reserve Bank of India has maintained its GDP growth forecast at 7.2% for the current fiscal year, citing strong domestic consumption and manufacturing activity.',
    url: 'https://www.livemint.com/economy/rbi-monetary-policy',
    urlToImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    source: { name: 'Mint' },
    publishedAt: '2026-03-21T07:00:00Z',
    content: 'The RBI cited robust domestic consumption, increasing manufacturing activity under Make in India, and growing foreign investment as key drivers. Inflation remains within the target band at 4.5%.',
    category: 'economy',
    tags: ['economy', 'India', 'GDP'],
    roles: ['investor']
  },
  {
    id: 'inv-5',
    title: 'Sensex Hits All-Time High of 82,000; Nifty Crosses 25,000',
    description: 'Indian equity markets surged to record highs as FII inflows accelerated and corporate earnings beat expectations across banking and IT sectors.',
    url: 'https://economictimes.indiatimes.com/markets',
    urlToImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
    source: { name: 'Economic Times' },
    publishedAt: '2026-03-27T04:00:00Z',
    content: 'The Sensex rallied 650 points to close at 82,150 while the Nifty 50 ended above 25,050 for the first time. Banking stocks led the charge with HDFC Bank and ICICI Bank hitting new highs. FII bought net ₹4,200 crore worth of Indian equities.',
    category: 'markets',
    tags: ['stocks', 'India', 'markets'],
    roles: ['investor']
  },
  {
    id: 'inv-6',
    title: 'Gold Prices Surge Past $2,800 Amid Geopolitical Uncertainty',
    description: 'Gold prices hit a new all-time high, driven by safe-haven demand as geopolitical tensions rise in the Middle East and US-China trade friction intensifies.',
    url: 'https://www.reuters.com/markets/commodities/gold/',
    urlToImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800',
    source: { name: 'Reuters' },
    publishedAt: '2026-03-25T11:00:00Z',
    content: 'Gold futures rose 2.3% to $2,812 per ounce. Analysts at Goldman Sachs raised their year-end target to $3,000. Central bank buying remains strong, with China and India among the largest purchasers.',
    category: 'commodities',
    tags: ['investment', 'commodities', 'economy'],
    roles: ['investor']
  },
  {
    id: 'inv-7',
    title: 'Warren Buffett Discloses Massive Stake in Indian Tech Conglomerate',
    description: 'Berkshire Hathaway revealed a $4.2 billion investment in an Indian technology conglomerate, marking Buffett\'s largest bet on the Indian market.',
    url: 'https://www.bloomberg.com/markets/',
    urlToImage: 'https://images.unsplash.com/photo-1553729459-uj3ad8e9smab?w=800',
    source: { name: 'Bloomberg' },
    publishedAt: '2026-03-23T16:00:00Z',
    content: 'The disclosure sent the Indian stock surging 12% in pre-market trading. Buffett cited India\'s demographic dividend and growing digital economy as the primary investment thesis. This marks Berkshire\'s second major Asian investment after its Japan trading house positions.',
    category: 'investing',
    tags: ['investment', 'stocks', 'India'],
    roles: ['investor']
  },

  // ═══════════════════════════════════════
  //  STARTUP FOUNDER-FOCUSED ARTICLES
  // ═══════════════════════════════════════
  {
    id: 'sf-1',
    title: 'India\'s Startup Ecosystem Sees $12B in Funding for Q1 2026',
    description: 'Indian startups have attracted $12 billion in venture capital funding during the first quarter of 2026, marking a significant recovery from the funding winter.',
    url: 'https://economictimes.indiatimes.com/tech/startups',
    urlToImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    source: { name: 'Economic Times' },
    publishedAt: '2026-03-27T08:30:00Z',
    content: 'Key sectors attracting investment include fintech, healthtech, and AI/ML startups. Notable rounds include a $500M Series D for a Bangalore-based AI company and a $300M raise by a Mumbai fintech unicorn.',
    category: 'startups',
    tags: ['startups', 'funding', 'India'],
    roles: ['startup_founder']
  },
  {
    id: 'sf-2',
    title: 'SaaS Industry Consolidation Accelerates with $50B in M&A Activity',
    description: 'The software-as-a-service industry is seeing massive consolidation with over $50 billion in mergers and acquisitions announced in Q1 2026 alone.',
    url: 'https://techcrunch.com/category/enterprise/',
    urlToImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    source: { name: 'TechCrunch' },
    publishedAt: '2026-03-20T16:00:00Z',
    content: 'Key deals include a $15B acquisition of a project management startup and a $8B purchase of an AI-powered CRM platform. Analysts suggest this reflects the maturation of the SaaS market.',
    category: 'technology',
    tags: ['startups', 'SaaS', 'M&A'],
    roles: ['startup_founder']
  },
  {
    id: 'sf-3',
    title: 'Y Combinator W26 Batch: 70% of Startups Are AI-Native',
    description: 'The latest Y Combinator batch reveals a dramatic shift toward AI-first companies, with 70% of accepted startups building AI-native products across healthcare, legal, and enterprise verticals.',
    url: 'https://www.ycombinator.com/blog',
    urlToImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: { name: 'Y Combinator Blog' },
    publishedAt: '2026-03-26T10:00:00Z',
    content: 'YC partner Michael Seibel noted that AI is no longer a category — it\'s the default technology layer. Standout startups include an AI legal assistant valued at $100M and an autonomous drug discovery platform. Non-AI startups in the batch focus on climate tech and space.',
    category: 'startups',
    tags: ['startups', 'AI', 'YCombinator'],
    roles: ['startup_founder']
  },
  {
    id: 'sf-4',
    title: 'How This Solo Founder Built a $50M ARR SaaS in 18 Months',
    description: 'A deep dive into how a bootstrapped founder went from zero to $50M annual recurring revenue without raising a single dollar of venture capital.',
    url: 'https://www.indiehackers.com',
    urlToImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    source: { name: 'Indie Hackers' },
    publishedAt: '2026-03-24T08:00:00Z',
    content: 'The founder credits three key decisions: building in public on Twitter, focusing on a niche underserved market (compliance for fintech), and using AI to automate 80% of customer support. The company now has 12,000 paying customers across 40 countries.',
    category: 'entrepreneurship',
    tags: ['startups', 'SaaS', 'bootstrapping'],
    roles: ['startup_founder']
  },
  {
    id: 'sf-5',
    title: 'India Becomes World\'s Third Largest Startup Ecosystem',
    description: 'India has overtaken the UK to become the world\'s third-largest startup ecosystem, with over 120 unicorns and 85,000+ active startups.',
    url: 'https://yourstory.com/startups',
    urlToImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
    source: { name: 'YourStory' },
    publishedAt: '2026-03-22T06:00:00Z',
    content: 'A NASSCOM report shows that Indian startups employed 1.2 million people directly and 3.5 million indirectly. Tier-2 cities like Pune, Jaipur, and Kochi are emerging as new startup hubs, accounting for 28% of all new startup registrations.',
    category: 'startups',
    tags: ['startups', 'India', 'ecosystem'],
    roles: ['startup_founder']
  },
  {
    id: 'sf-6',
    title: 'Sequoia India Launches $2.5B Fund for Early-Stage AI Startups',
    description: 'Sequoia Capital India has raised its largest-ever fund dedicated entirely to seed and Series A investments in AI-native Indian startups.',
    url: 'https://techcrunch.com/tag/sequoia-india/',
    urlToImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
    source: { name: 'TechCrunch' },
    publishedAt: '2026-03-21T12:00:00Z',
    content: 'The fund will invest $500K to $15M per deal, targeting AI startups in B2B SaaS, developer tools, and vertical AI applications. Sequoia partner Shailendra Singh called India\'s AI talent pool "second only to the US."',
    category: 'venture capital',
    tags: ['startups', 'funding', 'AI', 'venture capital'],
    roles: ['startup_founder']
  },
  {
    id: 'sf-7',
    title: 'Government Launches ₹10,000 Crore Startup Innovation Fund',
    description: 'The Indian government announced a massive ₹10,000 crore fund-of-funds to back deep tech startups in AI, semiconductors, biotech, and green energy.',
    url: 'https://pib.gov.in/PressReleasePage.aspx',
    urlToImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    source: { name: 'PIB India' },
    publishedAt: '2026-03-19T05:30:00Z',
    content: 'The fund will be managed by SIDBI and will provide matching capital to approved VC funds investing in Indian deep tech startups. Eligible companies must have at least one patent filing and R&D expenditure above 15% of revenue.',
    category: 'policy',
    tags: ['startups', 'funding', 'India', 'policy'],
    roles: ['startup_founder']
  },

  // ═══════════════════════════════════════
  //  STUDENT-FOCUSED ARTICLES
  // ═══════════════════════════════════════
  {
    id: 'stu-1',
    title: 'AI Healthcare Startups Revolutionize Drug Discovery Process',
    description: 'A new wave of AI-powered healthcare startups is dramatically reducing the time and cost of drug discovery, with several candidates now entering clinical trials.',
    url: 'https://www.reuters.com/technology/artificial-intelligence/',
    urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    source: { name: 'Health Tech Review' },
    publishedAt: '2026-03-23T11:00:00Z',
    content: 'Companies like Insilico Medicine and Recursion Pharmaceuticals are using machine learning to identify promising drug compounds in months rather than years. This has the potential to significantly reduce the $2.6 billion average cost of bringing a new drug to market.',
    category: 'healthcare',
    tags: ['AI', 'healthcare', 'technology'],
    roles: ['student']
  },
  {
    id: 'stu-2',
    title: 'Top 10 Programming Languages to Learn in 2026 for High-Paying Jobs',
    description: 'A comprehensive analysis of job market data reveals which programming languages offer the best career prospects and salary growth in 2026.',
    url: 'https://www.freecodecamp.org/news/',
    urlToImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    source: { name: 'freeCodeCamp' },
    publishedAt: '2026-03-27T09:00:00Z',
    content: 'Python tops the list for the fourth consecutive year, driven by AI/ML demand. Rust has climbed to #2 for systems programming roles. TypeScript, Go, and Kotlin round out the top 5. AI prompt engineering is now a separate skill category with average salaries exceeding $150K.',
    category: 'careers',
    tags: ['technology', 'careers', 'programming'],
    roles: ['student']
  },
  {
    id: 'stu-3',
    title: 'Google, Microsoft, and Amazon Announce Massive Campus Hiring Drives',
    description: 'Big tech companies announce plans to hire over 50,000 fresh graduates and interns globally, with a strong focus on AI, cloud, and cybersecurity roles.',
    url: 'https://www.linkedin.com/news/',
    urlToImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    source: { name: 'LinkedIn News' },
    publishedAt: '2026-03-26T07:00:00Z',
    content: 'Google plans to hire 15,000 fresh graduates, focusing on AI research and cloud engineering. Microsoft\'s program targets 12,000 hires across Azure and Copilot divisions. Amazon is expanding its India campus hiring with 8,000 positions in Bangalore and Hyderabad.',
    category: 'careers',
    tags: ['careers', 'technology', 'hiring'],
    roles: ['student']
  },
  {
    id: 'stu-4',
    title: 'MIT Offers Free AI Certification — Here\'s How to Enroll',
    description: 'MIT\'s OpenCourseWare program launches a comprehensive, free AI certification covering machine learning, deep learning, NLP, and computer vision with hands-on projects.',
    url: 'https://ocw.mit.edu/',
    urlToImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800',
    source: { name: 'MIT News' },
    publishedAt: '2026-03-25T10:00:00Z',
    content: 'The 12-week program includes video lectures from MIT professors, coding assignments in Python, and a capstone project. Enrollment is free, with an optional $99 verified certificate. Over 200,000 students signed up within the first 48 hours of launch.',
    category: 'education',
    tags: ['AI', 'learning', 'technology', 'education'],
    roles: ['student']
  },
  {
    id: 'stu-5',
    title: 'How a 22-Year-Old Built a ₹5 Crore Business While in College',
    description: 'The inspiring story of a final-year engineering student who built a profitable edtech startup while completing her degree.',
    url: 'https://yourstory.com/stories',
    urlToImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    source: { name: 'YourStory' },
    publishedAt: '2026-03-23T14:00:00Z',
    content: 'Starting with a WhatsApp group for coding tutorials, she scaled to a full platform with 50,000 paying subscribers. The key insight: college students prefer learning from peers over professors. The company now employs 25 student-tutors across 8 IITs.',
    category: 'inspiration',
    tags: ['startups', 'learning', 'careers'],
    roles: ['student']
  },
  {
    id: 'stu-6',
    title: 'The Rise of AI Co-Pilots: How Students Are Using AI to Learn 3x Faster',
    description: 'Research from Stanford shows students using AI tutoring tools perform significantly better in STEM subjects, sparking debate about the future of education.',
    url: 'https://www.nature.com/articles/',
    urlToImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    source: { name: 'Nature' },
    publishedAt: '2026-03-22T08:00:00Z',
    content: 'The study tracked 5,000 college students over two semesters. Those using AI co-pilots like ChatGPT and Claude as learning aids scored 34% higher on average. The key was structured prompting — students who asked AI to explain concepts step-by-step learned far more than those who used AI to get answers.',
    category: 'education',
    tags: ['AI', 'learning', 'education', 'technology'],
    roles: ['student']
  },
  {
    id: 'stu-7',
    title: 'Understanding Web3: A Beginner\'s Guide to Blockchain Careers',
    description: 'As blockchain technology matures, new career paths are emerging. Here\'s what students need to know about building a career in Web3 and decentralized technologies.',
    url: 'https://www.coindesk.com/learn/',
    urlToImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    source: { name: 'CoinDesk Learn' },
    publishedAt: '2026-03-20T13:00:00Z',
    content: 'Blockchain developer salaries have risen 40% year-over-year. Key skills include Solidity, Rust, and smart contract auditing. Companies like Polygon, Coinbase, and Alchemy are actively recruiting from college campuses.',
    category: 'technology',
    tags: ['technology', 'careers', 'crypto', 'learning'],
    roles: ['student']
  },

  // ═══════════════════════════════════════
  //  SHARED ARTICLES (appear for all roles)
  // ═══════════════════════════════════════
  {
    id: 'shared-1',
    title: 'Electric Vehicle Sales Surge 45% Globally in Early 2026',
    description: 'Global electric vehicle sales have surged 45% year-over-year in the first quarter of 2026, with China and Europe leading the charge.',
    url: 'https://www.reuters.com/business/autos-transportation/electric-vehicles/',
    urlToImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    source: { name: 'Auto Industry Weekly' },
    publishedAt: '2026-03-25T12:00:00Z',
    content: 'Tesla maintains its lead in the US market but faces increasing competition from Chinese manufacturers like BYD and NIO. Battery costs have dropped 20%, making EVs increasingly competitive.',
    category: 'automotive',
    tags: ['EV', 'stocks', 'green energy'],
    roles: ['investor', 'startup_founder', 'student']
  },
  {
    id: 'shared-2',
    title: 'Renewable Energy Investments Hit $600B Globally in 2025',
    description: 'Global investments in renewable energy reached a record $600 billion in 2025, with solar and wind power accounting for over 80% of new electricity generation capacity.',
    url: 'https://www.reuters.com/business/energy/renewable-energy/',
    urlToImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    source: { name: 'Energy World' },
    publishedAt: '2026-03-19T10:00:00Z',
    content: 'Solar power attracted $380 billion, followed by wind at $150 billion. India emerged as the third-largest renewable energy market globally.',
    category: 'energy',
    tags: ['green energy', 'investment', 'economy'],
    roles: ['investor', 'startup_founder', 'student']
  },
  {
    id: 'shared-3',
    title: 'Global Supply Chain Disruptions Ease as Shipping Costs Normalize',
    description: 'After years of disruption, global supply chains are showing signs of normalization with shipping costs returning to pre-pandemic levels.',
    url: 'https://www.reuters.com/business/global-supply-chains/',
    urlToImage: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800',
    source: { name: 'Global Trade Monitor' },
    publishedAt: '2026-03-22T14:00:00Z',
    content: 'Container shipping rates have fallen by 70% from their 2022 peaks. Companies are increasingly diversifying their supply chains and investing in nearshoring strategies.',
    category: 'economy',
    tags: ['economy', 'trade', 'logistics'],
    roles: ['investor', 'startup_founder', 'student']
  }
];

/**
 * Get news filtered by user role.
 * Returns role-specific articles + shared articles.
 */
function getNewsByRole(role) {
  return allSampleNews.filter(article =>
    article.roles.includes(role)
  );
}

/**
 * Get all sample news (for unauthenticated users or home page)
 */
function getAllNews() {
  return allSampleNews;
}

// Story arc sample data for timeline and sentiment tracking
const sampleStoryArcs = [
  {
    id: 1,
    topic: 'AI Industry Evolution',
    entity_type: 'industry',
    events: [
      { date: '2026-01-15', title: 'OpenAI launches GPT-5', sentiment: 0.8, description: 'Next-gen model with multimodal capabilities' },
      { date: '2026-02-01', title: 'EU AI Act enforcement begins', sentiment: -0.3, description: 'New regulations affect AI deployment' },
      { date: '2026-02-20', title: 'Google DeepMind achieves AGI milestone', sentiment: 0.9, description: 'Breakthrough in reasoning capabilities' },
      { date: '2026-03-05', title: 'AI-related job market shifts', sentiment: 0.1, description: 'Mixed impact on employment across sectors' },
      { date: '2026-03-15', title: 'AI chip shortage intensifies', sentiment: -0.5, description: 'NVIDIA supply constraints affect industry' },
      { date: '2026-03-25', title: 'Major AI safety agreement signed', sentiment: 0.6, description: '30 countries sign AI safety accord' }
    ],
    sentiment_data: { overall: 0.27, trend: 'positive' },
    key_entities: ['OpenAI', 'Google DeepMind', 'NVIDIA', 'EU Commission', 'Microsoft']
  },
  {
    id: 2,
    topic: 'Indian Fintech Boom',
    entity_type: 'industry',
    events: [
      { date: '2026-01-10', title: 'UPI crosses 15 billion monthly transactions', sentiment: 0.9, description: 'Record digital payment volumes' },
      { date: '2026-01-28', title: 'PhonePe files for IPO', sentiment: 0.7, description: 'Expected valuation of $25 billion' },
      { date: '2026-02-14', title: 'RBI issues new digital lending guidelines', sentiment: -0.2, description: 'Tighter regulations on fintech lending' },
      { date: '2026-03-01', title: 'CBDC pilot expanded to 50 cities', sentiment: 0.5, description: 'Digital rupee gains traction' },
      { date: '2026-03-20', title: 'Paytm recovery gains momentum', sentiment: 0.4, description: 'Stock recovers after regulatory action' }
    ],
    sentiment_data: { overall: 0.46, trend: 'positive' },
    key_entities: ['PhonePe', 'Paytm', 'RBI', 'UPI', 'Razorpay']
  },
  {
    id: 3,
    topic: 'Tesla & EV Market Competition',
    entity_type: 'company',
    events: [
      { date: '2026-01-05', title: 'Tesla launches affordable Model 2', sentiment: 0.8, description: 'Price point at $25,000 disrupts market' },
      { date: '2026-01-22', title: 'BYD overtakes Tesla in global sales', sentiment: -0.4, description: 'Chinese EV maker takes top spot' },
      { date: '2026-02-10', title: 'Tesla FSD achieves Level 4 certification', sentiment: 0.9, description: 'Autonomous driving milestone reached' },
      { date: '2026-02-28', title: 'European EV tariffs on Chinese imports', sentiment: 0.3, description: 'Protects domestic manufacturers' },
      { date: '2026-03-12', title: 'Tesla Megapack orders surge', sentiment: 0.7, description: 'Energy storage division booms' },
      { date: '2026-03-26', title: 'Global EV sales up 45%', sentiment: 0.6, description: 'Industry-wide acceleration continues' }
    ],
    sentiment_data: { overall: 0.48, trend: 'positive' },
    key_entities: ['Tesla', 'BYD', 'NIO', 'Volkswagen', 'Elon Musk']
  }
];

module.exports = { allSampleNews, getNewsByRole, getAllNews, sampleStoryArcs };
