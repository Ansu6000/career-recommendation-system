import Groq from 'groq-sdk';
import { questions, careerCategories } from "../data/questions";

// Initialize Groq client
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

let groq = null;
if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
  groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
  console.log("✅ Groq AI initialized");
} else {
  console.warn("⚠️ Groq API key missing - using fallback");
}

// ═══════════════════════════════════════════════════════════════════════════
// WEIGHTED SCORING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
const calculateWeightedScores = (answers) => {
  const scores = {
    tech: 0,
    medical: 0,
    commerce: 0,
    humanities: 0,
    creative: 0,
    defense: 0,
    aviation: 0,
    sports: 0,
    government: 0
  };

  Object.entries(answers).forEach(([questionId, selectedAnswer]) => {
    const question = questions.find(q => String(q.id) === String(questionId));
    if (!question) return;

    const option = question.options.find(opt => opt.text === selectedAnswer);
    if (!option || !option.weights) return;

    // Add weighted scores
    Object.entries(option.weights).forEach(([category, weight]) => {
      if (scores.hasOwnProperty(category)) {
        scores[category] += weight;
      }
    });
  });

  return scores;
};

// Get top 3 categories sorted by score
const getTopCategories = (scores) => {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, score]) => ({ category, score }));
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN AI FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
export const generateCareerPath = async (userProfile, answers) => {
  console.log("🤖 Starting AI Career Analysis...");

  // Calculate weighted scores
  const scores = calculateWeightedScores(answers);
  const topCategories = getTopCategories(scores);
  console.log("📊 Weighted Scores:", scores);
  console.log("🏆 Top Categories:", topCategories);

  // If no API key, use fallback
  if (!groq) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getSmartFallback(scores, topCategories);
  }

  // Build detailed context from answers
  const detailedContext = Object.entries(answers).map(([questionId, selectedAnswer]) => {
    const question = questions.find(q => String(q.id) === String(questionId));
    return question ? `Q${questionId} (${question.sectionTitle}): "${question.question}"\nAnswer: "${selectedAnswer}"` : null;
  }).filter(Boolean).join('\n\n');

  if (!detailedContext) return getSmartFallback(scores, topCategories);

  // Build score summary
  const scoreSummary = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, score]) => `${cat}: ${score}`)
    .join(', ');

  const systemPrompt = `You are PATHWISE - an expert Indian Career Counselor for Class 10-12 students.
You have deep knowledge of all career paths including Defense Forces, Aviation, Government Services, and unconventional careers.

═══════════════════════════════════════════════════════════════════════════
CRITICAL RULES - READ CAREFULLY:
═══════════════════════════════════════════════════════════════════════════
1. ANALYZE the weighted scores and recommend careers that MATCH the HIGHEST scoring category
2. The student's WEIGHTED SCORES are: ${scoreSummary}
3. PRIMARY CATEGORY: ${topCategories[0]?.category?.toUpperCase() || 'TECH'}
4. Secondary: ${topCategories[1]?.category?.toUpperCase() || 'COMMERCE'}, Tertiary: ${topCategories[2]?.category?.toUpperCase() || 'HUMANITIES'}

★★★ COHERENCY RULES - EXTREMELY IMPORTANT ★★★
- The roadmap MUST be for the PRIMARY career (1st recommendation)
- DO NOT mix incompatible paths:
  • B.Tech and B.Com are DIFFERENT streams - pick ONE
  • JEE and CLAT are for DIFFERENT careers - pick based on primary category
  • NDA and NEET are mutually exclusive - don't combine
  • Science PCM and Arts are different streams - recommend ONE stream only
- All 3 career recommendations should be from RELATED fields
- The entrance exams should ONLY be for the recommended career path

CAREER CATEGORY MAPPING (Pick careers from the PRIMARY category):
- tech → B.Tech route: JEE Main/Advanced → IITs/NITs → Software Engineer, Data Scientist
- medical → NEET route: NEET UG → MBBS/BDS → Doctor, Surgeon
- commerce → Commerce route: B.Com/BBA/CA Foundation → CA, MBA, Investment Banking
- humanities → Arts route: CLAT/CUET → BA LLB/BA → Lawyer, Journalist, UPSC
- creative → Design route: NID/NIFT/NATA → B.Des/B.Arch → Designer, Architect
- defense → NDA/CDS route: NDA after 12th OR CDS after graduation → Army/Navy/Air Force Officer
- aviation → Pilot route: Class 12 PCM → Flying School (CPL) → Commercial Pilot, OR JEE → B.Tech Aerospace
- sports → Training route: Sports quota/SAI → Professional Athlete, Coach
- government → UPSC route: Any graduation → UPSC CSE → IAS/IPS/IFS

USE INDIAN CONTEXT:
- Exams: JEE, NEET, CLAT, UPSC, NDA, CDS, AFCAT, CA Foundation, NID, NIFT
- Degrees: B.Tech, MBBS, BA LLB, B.Des, B.Arch, B.Com, BBA
- Salaries in INR (Lakhs per annum)
- Colleges: IITs, AIIMS, NLUs, IIMs, NID, NIFT, NDA Khadakwasla, IMA Dehradun

For DEFENSE careers: Physical requirements, NCC bonus, SSB Interview, Training academies
For AVIATION careers: Class 1 Medical, CPL costs (₹35-50L), flying hours required

═══════════════════════════════════════════════════════════════════════════
STUDENT PROFILE:
═══════════════════════════════════════════════════════════════════════════
Name: ${userProfile.name || "Student"}
Class: ${userProfile.grade || "12"}
Board: ${userProfile.board || "CBSE"}

═══════════════════════════════════════════════════════════════════════════
STUDENT'S ANSWERS (15 Questions):
═══════════════════════════════════════════════════════════════════════════
${detailedContext}

═══════════════════════════════════════════════════════════════════════════
RESPONSE FORMAT - JSON ONLY:
═══════════════════════════════════════════════════════════════════════════
Respond with ONLY valid JSON in this exact structure:
{
  "archetype": {
    "title": "The [Adjective] [Noun]",
    "description": "3-4 sentences about their personality, strengths, and natural inclinations based on answers.",
    "traits": ["Trait1", "Trait2", "Trait3", "Trait4"]
  },
  "strengthSpectrum": {
    "analytical": 0-100,
    "creative": 0-100,
    "practical": 0-100,
    "social": 0-100,
    "physical": 0-100,
    "leadership": 0-100
  },
  "topCareers": [
    {
      "pathName": "Specific Career Name with Full Title",
      "category": "tech/medical/commerce/humanities/creative/defense/aviation/sports/government",
      "match": "XX%",
      "reason": "2-3 sentences explaining WHY this matches their specific answers",
      "relevance": "Current demand and status in India",
      "salary": "₹XL - ₹YL per annum",
      "description": "What this job involves day-to-day",
      "physicalRequirements": "If applicable for defense/aviation/sports"
    },
    {
      "pathName": "Second Best Career Option",
      "category": "category",
      "match": "XX%",
      "reason": "Why this matches",
      "relevance": "Status in India",
      "salary": "₹XL - ₹YL",
      "description": "Job description",
      "physicalRequirements": "If applicable"
    },
    {
      "pathName": "Third Career Option",
      "category": "category", 
      "match": "XX%",
      "reason": "Why this matches",
      "relevance": "Status in India",
      "salary": "₹XL - ₹YL",
      "description": "Job description",
      "physicalRequirements": "If applicable"
    }
  ],
  "roadmap": {
    "class11_12_stream": "Pick ONLY ONE: Science PCM, Science PCB, Commerce, or Arts - based on primary career",
    "focus_areas": "Key subjects for the PRIMARY career path only",
    "entrance_exams": [
      {"name": "PRIMARY Exam for this career", "desc": "Purpose", "timeline": "When to appear"}
    ],
    "college_degree": "ONE specific degree (e.g., B.Tech CSE from IITs, NOT B.Tech or B.Com)",
    "preparation_timeline": "Year-by-year plan for this specific path",
    "skills_to_learn": [
      {"skill": "Skill for PRIMARY career", "desc": "Why important", "resource": "Where to learn"}
    ],
    "physical_preparation": "Only if defense/aviation/sports career"
  },
  "learning_resources": [
    {"name": "Resource Name", "type": "Video/Book/Course/Channel", "link": "URL", "why": "Why this helps"},
    {"name": "Resource 2", "type": "Type", "link": "URL", "why": "Relevance"}
  ],
  "role_models": [
    {"name": "Famous Person Name", "achievement": "What they did", "lesson": "What to learn from them"}
  ],
  "analysis": {
    "academic_strengths": "Based on their subject preferences and problem-solving style",
    "work_style": "Based on their personality and team preferences", 
    "risk_appetite": "Based on their stability vs adventure preferences",
    "physical_readiness": "For defense/sports careers",
    "key_differentiator": "What makes this student unique"
  },
  "alternativePaths": [
    {"career": "Alternative Career", "reason": "Why this could also work", "transition": "How to pivot if needed"}
  ]
}`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are PATHWISE, India's most accurate career counselor AI. Respond ONLY with valid JSON, no markdown, no explanations outside JSON." },
        { role: "user", content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    console.log("✅ Groq Response received");

    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);

    if (!parsed.topCareers || !parsed.roadmap) {
      throw new Error("Incomplete response structure");
    }

    // Add scores to the response for reference
    parsed.scores = scores;
    parsed.topCategories = topCategories;

    return parsed;

  } catch (error) {
    console.error("❌ Groq Error:", error.message);
    return getSmartFallback(scores, topCategories);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SMART FALLBACK SYSTEM - EXPANDED FOR ALL 9 CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════
const getSmartFallback = (scores, topCategories) => {
  console.log("📊 Using Smart Fallback (Weighted Scoring)");

  const primaryCategory = topCategories[0]?.category || 'tech';
  console.log("Selected Primary Category:", primaryCategory);

  return getFallbackByCategory(primaryCategory, scores);
};

const getFallbackByCategory = (category, scores) => {
  const commonAnalysis = {
    "academic_strengths": "Determined from assessment responses.",
    "work_style": "Analyzed from personality questions.",
    "risk_appetite": "Calculated from goal-oriented answers.",
    "physical_readiness": "Evaluated from fitness preference questions.",
    "key_differentiator": "Your unique combination of traits sets you apart."
  };

  const fallbacks = {
    // ═══════════════════════════════════════════════════════════════════════
    // TECHNOLOGY
    // ═══════════════════════════════════════════════════════════════════════
    tech: {
      "archetype": {
        "title": "The Code Architect",
        "description": "You possess a logical mind that thrives on solving complex problems. You see patterns where others see chaos and can break down any challenge into manageable pieces. Technology is your playground.",
        "traits": ["Logical", "Innovative", "Detail-Oriented", "Curious"]
      },
      "strengthSpectrum": { "analytical": 92, "creative": 65, "practical": 78, "social": 55, "physical": 45, "leadership": 60 },
      "topCareers": [
        {
          "pathName": "Software Development Engineer (SDE)",
          "category": "tech",
          "match": "94%",
          "reason": "Your logical approach to problems and love for building solutions aligns perfectly with software engineering.",
          "relevance": "Extremely high demand in India and globally. Tech giants like Google, Microsoft, Amazon actively hire from India.",
          "salary": "₹8L - ₹45L per annum",
          "description": "Design, develop, and maintain software applications. Build products used by millions.",
          "roadmap": {
            "class11_12_stream": "Science (PCM) - Physics, Chemistry, Mathematics",
            "focus_areas": "Programming (Python/Java), Data Structures, Algorithms",
            "entrance_exams": [
              { "name": "JEE Main/Advanced", "desc": "Gateway to IITs and top NITs", "timeline": "Class 12" }
            ],
            "college_degree": "B.Tech Computer Science from IIT/NIT/IIIT",
            "skills_to_learn": [
              { "skill": "Python/Java", "desc": "Core programming languages", "resource": "LeetCode, HackerRank" }
            ]
          },
          "learning_resources": [
            { "name": "CS50 by Harvard", "type": "Course", "link": "cs50.harvard.edu", "why": "Best intro to CS" }
          ]
        },
        {
          "pathName": "Data Scientist / AI-ML Engineer",
          "category": "tech",
          "match": "89%",
          "reason": "Your analytical skills and curiosity make you ideal for uncovering insights from data.",
          "relevance": "Fastest growing career. Every company needs data scientists.",
          "salary": "₹12L - ₹35L per annum",
          "description": "Analyze large datasets, build predictive models, and create AI solutions."
        },
        {
          "pathName": "Product Manager",
          "category": "tech",
          "match": "82%",
          "reason": "Your problem-solving abilities combined with strategic thinking suit product roles.",
          "relevance": "High demand in startups and MNCs.",
          "salary": "₹18L - ₹50L per annum",
          "description": "Define product vision, work with engineers and designers to build products users love."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Science (PCM)",
        "focus_areas": "Mathematics, Physics, Computer Science, Coding",
        "entrance_exams": [
          { "name": "JEE Main", "desc": "NITs, IIITs admission", "timeline": "January & April of Class 12" },
          { "name": "JEE Advanced", "desc": "IIT admission", "timeline": "June of Class 12" }
        ],
        "college_degree": "B.Tech CSE/IT from IIT/NIT/IIIT",
        "preparation_timeline": "Start JEE prep from Class 11. Focus on NCERT + coaching material.",
        "skills_to_learn": [
          { "skill": "Python Programming", "desc": "Industry standard", "resource": "Codecademy, freeCodeCamp" },
          { "skill": "Data Structures", "desc": "Core for placements", "resource": "GeeksforGeeks" }
        ]
      },
      "learning_resources": [
        { "name": "freeCodeCamp", "type": "Course", "link": "freecodecamp.org", "why": "Free, comprehensive" },
        { "name": "3Blue1Brown", "type": "YouTube", "link": "youtube.com/3blue1brown", "why": "Visual math learning" }
      ],
      "role_models": [
        { "name": "Sundar Pichai", "achievement": "CEO of Google", "lesson": "Humble beginnings, consistent excellence" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Cybersecurity Analyst", "reason": "Growing field with high salaries", "transition": "Learn ethical hacking alongside" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DEFENSE
    // ═══════════════════════════════════════════════════════════════════════
    defense: {
      "archetype": {
        "title": "The Fearless Defender",
        "description": "You have the heart of a warrior - brave, disciplined, and driven by duty. You thrive under pressure and are willing to make sacrifices for something greater than yourself. The nation calls, and you're ready to answer.",
        "traits": ["Courageous", "Disciplined", "Patriotic", "Resilient"]
      },
      "strengthSpectrum": { "analytical": 65, "creative": 45, "practical": 88, "social": 72, "physical": 95, "leadership": 90 },
      "topCareers": [
        {
          "pathName": "Indian Army Officer (NDA/CDS Entry)",
          "category": "defense",
          "match": "96%",
          "reason": "Your love for discipline, physical challenges, and serving the nation makes you ideal for Army leadership.",
          "relevance": "Highest respect in Indian society. Job security, pension, and pride of uniform.",
          "salary": "₹56,000 - ₹2,50,000 per month + perks (housing, medical, canteen)",
          "description": "Lead soldiers, plan operations, protect borders, and participate in national security missions.",
          "physicalRequirements": "Height: 157.5cm+, Weight proportional, Eyesight 6/6 (correctable)",
          "roadmap": {
            "class11_12_stream": "Science/Commerce/Arts - All eligible for NDA/CDS",
            "focus_areas": "Physical fitness, General Knowledge, Mathematics (for NDA)",
            "entrance_exams": [
              { "name": "NDA (National Defence Academy)", "desc": "After Class 12 - 3-year training at Khadakwasla", "timeline": "April & September every year" },
              { "name": "CDS (Combined Defence Services)", "desc": "After Graduation - Direct entry to IMA", "timeline": "Twice a year" }
            ],
            "college_degree": "Any Bachelor's degree (for CDS) or 10+2 (for NDA)",
            "skills_to_learn": [
              { "skill": "Physical Training", "desc": "1600m running, push-ups, pull-ups", "resource": "Start NOW daily" },
              { "skill": "SSB Interview Prep", "desc": "OLQ development", "resource": "SSB coaching after written exam" }
            ],
            "physical_preparation": "Daily: 5km run, 50 push-ups, 10 pull-ups, 50 squats. Join NCC if available."
          },
          "learning_resources": [
            { "name": "SSBCrack", "type": "Website", "link": "ssbcrack.com", "why": "Comprehensive SSB prep" },
            { "name": "Pathfinder NDA Book", "type": "Book", "link": "Amazon", "why": "Best for NDA written exam" }
          ]
        },
        {
          "pathName": "Indian Air Force Officer (AFCAT/NDA)",
          "category": "defense",
          "match": "91%",
          "reason": "Your daring spirit and discipline align with the Air Force's high-performance culture.",
          "relevance": "Elite force with cutting-edge technology. Fighter pilots are national heroes.",
          "salary": "₹60,000 - ₹2,50,000 per month + flying allowance",
          "description": "Fly fighter jets, transport aircraft, or lead ground operations. Technical and flying branches available.",
          "physicalRequirements": "Strict medical - Eyesight 6/6 for pilots, height 162.5cm+"
        },
        {
          "pathName": "Intelligence Bureau (IB) / RAW Officer",
          "category": "defense",
          "match": "85%",
          "reason": "Your strategic thinking and bravery suit covert intelligence operations.",
          "relevance": "Secretive but vital for national security. Direct recruitment through UPSC.",
          "salary": "₹50,000 - ₹1,80,000 per month",
          "description": "Gather intelligence, analyze threats, and protect India from internal and external enemies."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Any stream - Science preferred for technical branches",
        "focus_areas": "Physical fitness, Current Affairs, Mathematics",
        "entrance_exams": [
          { "name": "NDA", "desc": "Class 12 pass, Age 16.5-19.5", "timeline": "Twice yearly" },
          { "name": "CDS", "desc": "Graduation required", "timeline": "Twice yearly" },
          { "name": "AFCAT", "desc": "For Air Force after graduation", "timeline": "Twice yearly" }
        ],
        "college_degree": "Any Graduation (B.Tech preferred for technical branches)",
        "preparation_timeline": "Physical prep: Start NOW. Written prep: Class 11-12. SSB: Post written clear.",
        "skills_to_learn": [
          { "skill": "Physical Endurance", "desc": "Core requirement", "resource": "Daily PT routine" },
          { "skill": "Leadership", "desc": "SSB tests this heavily", "resource": "NCC, sports teams" }
        ],
        "physical_preparation": "5km run in <24 mins, 12+ pull-ups, 60+ push-ups, rope climbing"
      },
      "learning_resources": [
        { "name": "Drishti IAS Defence", "type": "Course", "link": "drishtiias.com", "why": "Complete prep material" },
        { "name": "Let's Crack It", "type": "YouTube", "link": "YouTube", "why": "Free NDA/CDS guidance" }
      ],
      "role_models": [
        { "name": "Field Marshal Sam Manekshaw", "achievement": "Led India to victory in 1971 war", "lesson": "Courage and wit" },
        { "name": "Major Sandeep Unnikrishnan", "achievement": "Hero of 26/11", "lesson": "Ultimate sacrifice for duty" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Paramilitary (CRPF/BSF)", "reason": "Direct recruitment through SSC GD/CAPF", "transition": "Easier entry than Army" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // AVIATION
    // ═══════════════════════════════════════════════════════════════════════
    aviation: {
      "archetype": {
        "title": "The Sky Commander",
        "description": "You dream of soaring above the clouds. The cockpit is your command center, precision is your nature, and adrenaline is your fuel. You're destined to conquer the skies.",
        "traits": ["Precision-Focused", "Calm Under Pressure", "Adventurous", "Technical"]
      },
      "strengthSpectrum": { "analytical": 78, "creative": 50, "practical": 85, "social": 60, "physical": 80, "leadership": 75 },
      "topCareers": [
        {
          "pathName": "Commercial Airline Pilot (CPL)",
          "category": "aviation",
          "match": "95%",
          "reason": "Your love for aviation, precision, and adventure makes the cockpit your natural home.",
          "relevance": "Global pilot shortage. Indian airlines expanding rapidly. High demand.",
          "salary": "₹15L - ₹75L per annum (Captains earn ₹1Cr+)",
          "description": "Fly passenger and cargo aircraft for airlines like IndiGo, Air India, Emirates.",
          "physicalRequirements": "Class 1 Medical: Perfect eyesight (surgery allowed now), height 162cm+, no color blindness",
          "roadmap": {
            "class11_12_stream": "Science (PCM) - Physics essential for understanding flight mechanics",
            "focus_areas": "Physics, Mathematics, English proficiency",
            "entrance_exams": [
              { "name": "DGCA CPL Exams", "desc": "Navigation, Meteorology, Air Regulations, Tech General", "timeline": "After 10+2" }
            ],
            "college_degree": "Class 12 with Physics & Maths, then Flying Training (18-24 months)",
            "skills_to_learn": [
              { "skill": "Flying Training (CPL)", "desc": "200 hours of flight time required", "resource": "DGCA approved flying schools" }
            ]
          },
          "learning_resources": [
            { "name": "Aviator Cloud", "type": "Course", "link": "aviatorcloud.in", "why": "DGCA exam prep" },
            { "name": "Mentour Pilot", "type": "YouTube", "link": "youtube.com/mentourpilot", "why": "Real pilot insights" }
          ]
        },
        {
          "pathName": "Indian Air Force Fighter Pilot",
          "category": "aviation",
          "match": "90%",
          "reason": "If you want to fly the fastest machines and serve the nation, this is your path.",
          "relevance": "Elite career. Get paid to fly ₹200 Crore fighter jets.",
          "salary": "₹8L - ₹20L per annum + perks",
          "description": "Fly Rafale, Sukhoi, Tejas. Defend Indian airspace.",
          "physicalRequirements": "Strictest medical standards. Perfect eyesight mandatory."
        },
        {
          "pathName": "Aerospace Engineer",
          "category": "aviation",
          "match": "84%",
          "reason": "Your technical aptitude can help design the aircraft others fly.",
          "relevance": "Growing with ISRO, HAL, private space companies like Agnikul.",
          "salary": "₹8L - ₹30L per annum",
          "description": "Design aircraft, spacecraft, and satellites. Work at ISRO, HAL, Boeing."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Science (PCM) - Mandatory for aviation",
        "focus_areas": "Physics, Mathematics, Physical Fitness",
        "entrance_exams": [
          { "name": "NDA/AFCAT", "desc": "For IAF Pilot", "timeline": "After 12th / Graduation" },
          { "name": "IGRUA/IndiGo Cadet Program", "desc": "For Commercial Pilot", "timeline": "After 12th" }
        ],
        "college_degree": "CPL from DGCA approved school OR B.Tech Aerospace for engineering path",
        "preparation_timeline": "CPL route: ₹35-50 Lakhs investment, 2 years training. IAF: Free training if selected.",
        "skills_to_learn": [
          { "skill": "Flight Simulator", "desc": "Get familiar with cockpit", "resource": "Microsoft Flight Sim" },
          { "skill": "Physics & Navigation", "desc": "Core for DGCA exams", "resource": "Oxford ATPL books" }
        ],
        "physical_preparation": "Maintain fitness for DGCA Class 1 Medical"
      },
      "learning_resources": [
        { "name": "Captain Joe", "type": "YouTube", "link": "youtube.com/captainjoe", "why": "Pilot life insights" },
        { "name": "DGCA Official", "type": "Website", "link": "dgca.gov.in", "why": "Official exam info" }
      ],
      "role_models": [
        { "name": "JRD Tata", "achievement": "Father of Indian Civil Aviation", "lesson": "Pioneer spirit" },
        { "name": "Gunjan Saxena", "achievement": "First female IAF pilot in combat", "lesson": "Break barriers" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Air Traffic Controller", "reason": "Critical aviation role without flying", "transition": "Through AAI recruitment" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // GOVERNMENT / CIVIL SERVICES
    // ═══════════════════════════════════════════════════════════════════════
    government: {
      "archetype": {
        "title": "The Nation Builder",
        "description": "You believe in serving the public and building systems that help millions. Power to you means responsibility, not privilege. You want to be part of India's administrative backbone.",
        "traits": ["Public-Spirited", "Disciplined", "Strategic", "Ethical"]
      },
      "strengthSpectrum": { "analytical": 80, "creative": 55, "practical": 75, "social": 85, "physical": 50, "leadership": 90 },
      "topCareers": [
        {
          "pathName": "IAS Officer (Indian Administrative Service)",
          "category": "government",
          "match": "95%",
          "reason": "Your drive to create impact and strategic thinking make you ideal for administration.",
          "relevance": "Most prestigious civil service. District Collectors run entire districts.",
          "salary": "₹56,100 - ₹2,50,000 per month + perks (housing, car, staff)",
          "description": "Policy making, district administration, managing government programs.",
          "roadmap": {
            "class11_12_stream": "Arts/Humanities preferred (direct UPSC focus), Science/Commerce also viable",
            "focus_areas": "History, Polity, Geography, Economics, Current Affairs",
            "entrance_exams": [
              { "name": "UPSC CSE", "desc": "Prelims → Mains → Interview. 3 stages, 1 year process.", "timeline": "After Graduation, Age 21-32" }
            ],
            "college_degree": "Any Graduation (BA/B.Sc/B.Tech)",
            "skills_to_learn": [
              { "skill": "Answer Writing", "desc": "Core UPSC skill", "resource": "ForumIAS, Drishti" }
            ]
          },
          "learning_resources": [
            { "name": "UPSC Essentials", "type": "Indian Express", "link": "indianexpress.com", "why": "Daily current affairs" },
            { "name": "StudyIQ", "type": "YouTube", "link": "youtube.com/studyiq", "why": "Free UPSC lectures" }
          ]
        },
        {
          "pathName": "IPS Officer (Indian Police Service)",
          "category": "government",
          "match": "90%",
          "reason": "Your leadership and sense of justice align with maintaining law and order.",
          "relevance": "Lead police forces. SP, DIG, DGP positions. High respect.",
          "salary": "₹56,100 - ₹2,25,000 per month + perks",
          "description": "Maintain law and order, investigate crimes, lead police operations.",
          "physicalRequirements": "Physical test in UPSC: 1600m run, long jump, shot put"
        },
        {
          "pathName": "Bank PO (SBI/RBI Officer)",
          "category": "government",
          "match": "85%",
          "reason": "Your analytical skills suit banking with job security.",
          "relevance": "Stable career. Good growth to DGM/GM levels.",
          "salary": "₹45,000 - ₹1,80,000 per month",
          "description": "Banking operations, loans, customer service, branch management."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Humanities (for UPSC) or Commerce (for Banking)",
        "focus_areas": "Reading newspapers daily, GS subjects, Essay writing",
        "entrance_exams": [
          { "name": "UPSC CSE", "desc": "For IAS/IPS/IFS", "timeline": "After graduation" },
          { "name": "IBPS/SBI PO", "desc": "For banking", "timeline": "After graduation" },
          { "name": "SSC CGL", "desc": "For central govt jobs", "timeline": "After graduation" }
        ],
        "college_degree": "BA (Hons) Political Science/History/Sociology preferred for UPSC",
        "preparation_timeline": "UPSC needs 2-3 years dedicated prep. Start reading The Hindu from Class 11.",
        "skills_to_learn": [
          { "skill": "Current Affairs", "desc": "Daily newspaper reading", "resource": "The Hindu, Indian Express" },
          { "skill": "Answer Writing", "desc": "UPSC Mains core skill", "resource": "ForumIAS" }
        ]
      },
      "learning_resources": [
        { "name": "Drishti IAS", "type": "Website", "link": "drishtiias.com", "why": "Complete UPSC material" },
        { "name": "Unacademy UPSC", "type": "App", "link": "unacademy.com", "why": "Free foundation content" }
      ],
      "role_models": [
        { "name": "Sardar Patel", "achievement": "United India as Home Minister", "lesson": "Iron will" },
        { "name": "Kiran Bedi", "achievement": "First female IPS officer", "lesson": "Break stereotypes" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "State PSC", "reason": "Similar to UPSC but state-level, relatively easier", "transition": "Prepare simultaneously" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SPORTS
    // ═══════════════════════════════════════════════════════════════════════
    sports: {
      "archetype": {
        "title": "The Champion Athlete",
        "description": "You were born to compete. Your body is your instrument, discipline is your mantra, and winning is your obsession. The field, court, or arena is where you truly come alive.",
        "traits": ["Competitive", "Disciplined", "Physically Elite", "Goal-Oriented"]
      },
      "strengthSpectrum": { "analytical": 50, "creative": 45, "practical": 80, "social": 70, "physical": 98, "leadership": 75 },
      "topCareers": [
        {
          "pathName": "Professional Athlete",
          "category": "sports",
          "match": "95%",
          "reason": "Your physical abilities and competitive drive make professional sports your calling.",
          "relevance": "Cricket, Football, Badminton, Wrestling - growing sports economy in India.",
          "salary": "₹10L - ₹100Cr+ (top cricketers)",
          "description": "Compete at national/international level. Represent India.",
          "physicalRequirements": "Peak physical condition. Sport-specific training from young age.",
          "roadmap": {
            "class11_12_stream": "Any - Balance academics with training (NIOS for flexibility)",
            "focus_areas": "Your chosen sport - daily 4-6 hours training",
            "entrance_exams": [
              { "name": "SAI Trials", "desc": "Sports Authority of India selection", "timeline": "Ongoing" },
              { "name": "State Sports Quota", "desc": "For college admissions", "timeline": "As per state" }
            ],
            "college_degree": "Sports quota admission to colleges or distance education",
            "skills_to_learn": [
              { "skill": "Sport-specific Skills", "desc": "Technical excellence", "resource": "Academy coaching" }
            ]
          }
        },
        {
          "pathName": "Sports Manager / Agent",
          "category": "sports",
          "match": "82%",
          "reason": "Your sports knowledge combined with business acumen can manage athletes and events.",
          "relevance": "Growing industry with IPL, ISL, PKL. Need for professional management.",
          "salary": "₹8L - ₹50L per annum",
          "description": "Manage athlete careers, negotiate contracts, organize sporting events."
        },
        {
          "pathName": "Sports Coach / Trainer",
          "category": "sports",
          "match": "78%",
          "reason": "Your experience and passion can shape the next generation of athletes.",
          "relevance": "SAI, state academies, private schools hiring quality coaches.",
          "salary": "₹4L - ₹25L per annum",
          "description": "Train athletes, develop training programs, guide to championships."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Any - Focus on training more than academics initially",
        "focus_areas": "Daily training, nutrition, sports psychology",
        "entrance_exams": [
          { "name": "National/State Trials", "desc": "Selection for teams", "timeline": "As per sport federation" }
        ],
        "college_degree": "B.P.Ed, BBA in Sports Management, or regular degree with sports quota",
        "preparation_timeline": "Start specialized training by age 10-12 for most sports.",
        "skills_to_learn": [
          { "skill": "Sport-specific Training", "desc": "Technical skills", "resource": "Join academy" },
          { "skill": "Mental Conditioning", "desc": "Sports psychology", "resource": "Sports psychologist" }
        ],
        "physical_preparation": "Sport-specific. Consult professional coaches."
      },
      "learning_resources": [
        { "name": "Khel Ratna Documentaries", "type": "Video", "link": "YouTube", "why": "Inspiring stories" }
      ],
      "role_models": [
        { "name": "Neeraj Chopra", "achievement": "Olympic Gold Medalist", "lesson": "Persistence wins" },
        { "name": "PV Sindhu", "achievement": "World Badminton Champion", "lesson": "Hard work beats talent" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Sports Physiotherapist", "reason": "Heal athletes, stay in sports", "transition": "BPT degree" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MEDICAL
    // ═══════════════════════════════════════════════════════════════════════
    medical: {
      "archetype": {
        "title": "The Compassionate Healer",
        "description": "You have a calling to heal and help. Life and death don't scare you - they motivate you. Your hands can save lives, and your heart cares deeply for human suffering.",
        "traits": ["Empathetic", "Resilient", "Detail-Oriented", "Selfless"]
      },
      "strengthSpectrum": { "analytical": 75, "creative": 40, "practical": 90, "social": 85, "physical": 55, "leadership": 65 },
      "topCareers": [
        {
          "pathName": "Doctor (MBBS) / Surgeon",
          "category": "medical",
          "match": "96%",
          "reason": "Your desire to heal and help others makes medicine your true calling.",
          "relevance": "Doctors are always needed. Respected profession with job security.",
          "salary": "₹8L - ₹50L+ per annum (surgeons earn more)",
          "description": "Diagnose illnesses, treat patients, perform surgeries, save lives."
        },
        {
          "pathName": "Biotech Researcher",
          "category": "medical",
          "match": "85%",
          "reason": "Your scientific curiosity can lead to drug discoveries.",
          "relevance": "Growing sector. COVID highlighted biotech importance.",
          "salary": "₹6L - ₹25L per annum",
          "description": "Research new drugs, vaccines, genetic treatments."
        },
        {
          "pathName": "Psychiatrist / Psychologist",
          "category": "medical",
          "match": "80%",
          "reason": "Your empathy can help heal minds.",
          "relevance": "Mental health awareness growing. High demand.",
          "salary": "₹8L - ₹30L per annum",
          "description": "Treat mental health conditions, counseling, therapy."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Science (PCB) - Biology mandatory",
        "focus_areas": "Biology, Chemistry, Physics (NCERT mastery)",
        "entrance_exams": [
          { "name": "NEET UG", "desc": "Only exam for MBBS/BDS in India", "timeline": "May of Class 12" }
        ],
        "college_degree": "MBBS (5.5 years) from AIIMS/GMCs",
        "preparation_timeline": "NEET prep: Class 11-12 full focus. NCERT is Bible.",
        "skills_to_learn": [
          { "skill": "NCERT Mastery", "desc": "NEET is NCERT based", "resource": "NCERT textbooks" }
        ]
      },
      "learning_resources": [
        { "name": "Physics Wallah", "type": "YouTube/App", "link": "physicswallah.com", "why": "Affordable NEET prep" },
        { "name": "Khan Academy MCAT", "type": "Course", "link": "khanacademy.org", "why": "Deep conceptual learning" }
      ],
      "role_models": [
        { "name": "Dr. Devi Shetty", "achievement": "Made heart surgery affordable", "lesson": "Healthcare for all" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Veterinary Doctor", "reason": "If you love animals", "transition": "NEET qualifies for BVSc too" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // COMMERCE
    // ═══════════════════════════════════════════════════════════════════════
    commerce: {
      "archetype": {
        "title": "The Strategic Mogul",
        "description": "Money talks, and you understand its language. You see opportunity where others see risk. Numbers excite you, markets intrigue you, and building wealth is your game.",
        "traits": ["Strategic", "Ambitious", "Risk-Taking", "Financially Savvy"]
      },
      "strengthSpectrum": { "analytical": 85, "creative": 55, "practical": 70, "social": 75, "physical": 40, "leadership": 80 },
      "topCareers": [
        {
          "pathName": "Chartered Accountant (CA)",
          "category": "commerce",
          "match": "94%",
          "reason": "Your numerical abilities and discipline suit the rigorous CA path.",
          "relevance": "CAs are respected, well-paid, and always in demand.",
          "salary": "₹7L - ₹30L per annum (Big 4 partners earn crores)",
          "description": "Audit companies, taxation, financial consulting."
        },
        {
          "pathName": "Investment Banker",
          "category": "commerce",
          "match": "90%",
          "reason": "Your risk appetite and financial acumen suit high-stakes finance.",
          "relevance": "Top-paying job. Work on billion-dollar deals.",
          "salary": "₹15L - ₹1Cr+ per annum",
          "description": "M&A deals, IPOs, corporate finance advisory."
        },
        {
          "pathName": "Entrepreneur / Startup Founder",
          "category": "commerce",
          "match": "85%",
          "reason": "Your ambition and strategic thinking can build companies.",
          "relevance": "India's startup ecosystem is booming.",
          "salary": "Variable - sky's the limit",
          "description": "Build your own business, raise funding, scale globally."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Commerce with Mathematics",
        "focus_areas": "Accountancy, Economics, Business Studies, Maths",
        "entrance_exams": [
          { "name": "CA Foundation", "desc": "Entry to CA course", "timeline": "After Class 12" },
          { "name": "CAT", "desc": "For MBA at IIMs", "timeline": "After graduation" }
        ],
        "college_degree": "B.Com (Hons) from SRCC/Hindu College, or BBA + CA",
        "preparation_timeline": "Start CA Foundation prep in Class 11-12.",
        "skills_to_learn": [
          { "skill": "Excel/Financial Modeling", "desc": "Industry essential", "resource": "CFI courses" }
        ]
      },
      "learning_resources": [
        { "name": "Zerodha Varsity", "type": "Course", "link": "zerodha.com/varsity", "why": "Free markets education" },
        { "name": "CA Rachana Ranade", "type": "YouTube", "link": "YouTube", "why": "Stock market simplified" }
      ],
      "role_models": [
        { "name": "Mukesh Ambani", "achievement": "Richest Indian", "lesson": "Vision and execution" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Company Secretary", "reason": "Corporate governance focus", "transition": "CS Foundation after 12th" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HUMANITIES
    // ═══════════════════════════════════════════════════════════════════════
    humanities: {
      "archetype": {
        "title": "The Voice of Change",
        "description": "You believe in the power of words, ideas, and justice. Society needs reformers, and you have the conviction to challenge wrongs and advocate for rights.",
        "traits": ["Articulate", "Empathetic", "Intellectual", "Justice-Seeking"]
      },
      "strengthSpectrum": { "analytical": 75, "creative": 70, "practical": 55, "social": 90, "physical": 40, "leadership": 70 },
      "topCareers": [
        {
          "pathName": "Lawyer / Advocate",
          "category": "humanities",
          "match": "94%",
          "reason": "Your argumentative skills and sense of justice make law your arena.",
          "relevance": "Growing legal market. Corporate lawyers earn very well.",
          "salary": "₹5L - ₹50L+ per annum (top lawyers)",
          "description": "Fight cases, draft contracts, legal consulting."
        },
        {
          "pathName": "Journalist / Editor",
          "category": "humanities",
          "match": "88%",
          "reason": "Your communication skills and curiosity suit storytelling.",
          "relevance": "Digital media growing. Need for quality journalism.",
          "salary": "₹4L - ₹25L per annum",
          "description": "Report news, write stories, create content."
        },
        {
          "pathName": "Professor / Academician",
          "category": "humanities",
          "match": "82%",
          "reason": "Your intellectual depth can shape young minds.",
          "relevance": "Respected profession. UGC NET gives good opportunities.",
          "salary": "₹6L - ₹18L per annum",
          "description": "Teach at universities, research, publish papers."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Humanities/Arts",
        "focus_areas": "English, Political Science, History, Sociology",
        "entrance_exams": [
          { "name": "CLAT", "desc": "For NLUs (best law colleges)", "timeline": "After Class 12" },
          { "name": "CUET", "desc": "For DU, Central Universities", "timeline": "After Class 12" }
        ],
        "college_degree": "BA LLB (5 years) from NLU or BA from DU",
        "preparation_timeline": "CLAT prep: Start in Class 11.",
        "skills_to_learn": [
          { "skill": "Legal Reasoning", "desc": "CLAT core", "resource": "CLATapult" },
          { "skill": "Debating", "desc": "Builds argumentation", "resource": "School debate club" }
        ]
      },
      "learning_resources": [
        { "name": "Unacademy CLAT", "type": "App", "link": "unacademy.com", "why": "Structured CLAT prep" },
        { "name": "LiveLaw", "type": "Website", "link": "livelaw.in", "why": "Legal current affairs" }
      ],
      "role_models": [
        { "name": "Fali Nariman", "achievement": "Legendary constitutional lawyer", "lesson": "Principle over profit" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Diplomat (IFS)", "reason": "Represent India globally", "transition": "UPSC route" }
      ],
      "scores": scores
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CREATIVE
    // ═══════════════════════════════════════════════════════════════════════
    creative: {
      "archetype": {
        "title": "The Visual Storyteller",
        "description": "You see the world differently - in colors, shapes, and stories. Your imagination is your superpower, and creation is your purpose. Ordinary doesn't exist in your vocabulary.",
        "traits": ["Imaginative", "Original", "Aesthetic", "Expressive"]
      },
      "strengthSpectrum": { "analytical": 55, "creative": 95, "practical": 65, "social": 70, "physical": 40, "leadership": 55 },
      "topCareers": [
        {
          "pathName": "UI/UX Designer",
          "category": "creative",
          "match": "96%",
          "reason": "Your visual sense and user empathy make you perfect for digital design.",
          "relevance": "Every tech company needs designers. High salaries.",
          "salary": "₹6L - ₹35L per annum",
          "description": "Design apps, websites, user experiences that delight millions."
        },
        {
          "pathName": "Film Director / Producer",
          "category": "creative",
          "match": "88%",
          "reason": "Your storytelling abilities and visual imagination suit cinema.",
          "relevance": "OTT boom created unprecedented opportunities.",
          "salary": "Variable - ₹5L to Crores",
          "description": "Direct films, web series, documentaries, ads."
        },
        {
          "pathName": "Architect",
          "category": "creative",
          "match": "82%",
          "reason": "Your spatial thinking and creativity can shape skylines.",
          "relevance": "Infrastructure push in India. Sustainable architecture growing.",
          "salary": "₹5L - ₹25L per annum",
          "description": "Design buildings, spaces, cities of the future."
        }
      ],
      "roadmap": {
        "class11_12_stream": "Any - Science (for Architecture) or Arts (for Design)",
        "focus_areas": "Drawing, Portfolio building, Design software",
        "entrance_exams": [
          { "name": "NID DAT", "desc": "National Institute of Design", "timeline": "After Class 12" },
          { "name": "NIFT", "desc": "For Fashion Design", "timeline": "After Class 12" },
          { "name": "NATA/JEE Paper 2", "desc": "For Architecture", "timeline": "After Class 12" }
        ],
        "college_degree": "B.Des from NID, B.Arch from SPA/IIT, BA Film from FTII",
        "preparation_timeline": "Build portfolio from Class 9-10. Design exams test creativity.",
        "skills_to_learn": [
          { "skill": "Figma/Adobe XD", "desc": "UI tools", "resource": "YouTube tutorials" },
          { "skill": "Sketching", "desc": "Foundation skill", "resource": "Daily practice" }
        ]
      },
      "learning_resources": [
        { "name": "Figma", "type": "Tool", "link": "figma.com", "why": "Industry standard UI tool" },
        { "name": "Awwwards", "type": "Website", "link": "awwwards.com", "why": "Design inspiration" }
      ],
      "role_models": [
        { "name": "SS Rajamouli", "achievement": "Made globally acclaimed films", "lesson": "Dream big, execute perfectly" }
      ],
      "analysis": commonAnalysis,
      "alternativePaths": [
        { "career": "Game Designer", "reason": "Gaming industry booming", "transition": "Learn Unity/Unreal" }
      ],
      "scores": scores
    }
  };

  return fallbacks[category] || fallbacks.tech;
};

export { calculateWeightedScores, getTopCategories };
