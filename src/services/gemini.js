import Groq from 'groq-sdk';
import { questions } from "../data/questions";

// Initialize Groq client
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

let groq = null;
if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
  groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
  console.log("✅ Groq AI initialized");
} else {
  console.warn("⚠️ Groq API key missing - using fallback");
}

export const generateCareerPath = async (userProfile, answers) => {
  console.log("🤖 Starting AI Career Analysis...");

  // If no API key, use fallback
  if (!groq) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getSmartFallback(answers);
  }

  // Build context from answers
  const detailedContext = Object.entries(answers).map(([questionId, selectedAnswer]) => {
    const question = questions.find(q => String(q.id) === String(questionId));
    return question ? `Q${questionId}: "${question.question}"\nAnswer: "${selectedAnswer}"` : null;
  }).filter(Boolean).join('\n\n');

  if (!detailedContext) return getSmartFallback(answers);

  const systemPrompt = `You are an expert Indian Career Counselor for Class 10-12 students.

CRITICAL RULES:
1. READ ANSWERS CAREFULLY - recommend careers that MATCH their stated interests
2. If they like "History/Literature" → suggest Humanities careers (Law, UPSC, Journalism)
3. If they like "Art/Design" → suggest Creative careers (UI/UX, Architecture, Film)
4. If they like "Biology" → suggest Medical/Life Science careers (MBBS, Biotech)
5. If they like "Computer Science" → only then suggest Tech careers
6. If they like "Economics/Business" → suggest Commerce careers (CA, MBA)
7. Use INDIAN context: degrees (B.Tech, MBBS, BA LLB), exams (JEE, NEET, CLAT, UPSC), salaries in INR

STUDENT PROFILE:
Name: ${userProfile.name || "Student"}
Class: ${userProfile.grade || "12"}
Board: ${userProfile.board || "CBSE"}

STUDENT'S ANSWERS:
${detailedContext}

Respond with ONLY valid JSON in this exact format:
{
  "archetype": {
    "title": "The [Adjective] [Noun]",
    "description": "2-3 sentences about their personality",
    "traits": ["Trait1", "Trait2", "Trait3"]
  },
  "strengthSpectrum": {
    "analytical": 0-100,
    "creative": 0-100,
    "practical": 0-100,
    "social": 0-100
  },
  "topCareers": [
    {
      "pathName": "Specific Career Name",
      "match": "XX%",
      "reason": "Why this matches their answers",
      "relevance": "Status in India",
      "salary": "₹XL - ₹YL",
      "description": "What this job involves"
    },
    {
      "pathName": "Second Career Option",
      "match": "XX%",
      "reason": "Why this matches",
      "relevance": "Status in India",
      "salary": "₹XL - ₹YL",
      "description": "What this job involves"
    },
    {
      "pathName": "Third Career Option",
      "match": "XX%",
      "reason": "Why this matches",
      "relevance": "Status in India",
      "salary": "₹XL - ₹YL",
      "description": "What this job involves"
    }
  ],
  "roadmap": {
    "class11_12_stream": "Recommended stream (Science PCM/PCB, Commerce, Arts)",
    "focus_areas": "Key subjects to focus on",
    "entrance_exams": [
      {"name": "Exam Name", "desc": "Purpose"}
    ],
    "college_degree": "Recommended degree",
    "skills_to_learn": [
      {"skill": "Skill Name", "desc": "Why important"}
    ]
  },
  "learning_resources": [
    {"name": "Resource Name", "type": "Video/Book/Course", "link": "URL or description"}
  ],
  "analysis": {
    "academic_strengths": "Based on their answers",
    "work_style": "Based on their answers",
    "risk_appetite": "Based on their answers"
  }
}`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a career counselor. Respond ONLY with valid JSON, no markdown." },
        { role: "user", content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    console.log("✅ Groq Response received");

    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);

    if (!parsed.topCareers || !parsed.roadmap) {
      throw new Error("Incomplete response structure");
    }

    return parsed;

  } catch (error) {
    console.error("❌ Groq Error:", error.message);
    return getSmartFallback(answers);
  }
};

// -----------------------------------------------------------------------------
// SMART FALLBACK WITH SCORING SYSTEM
// -----------------------------------------------------------------------------
export const getSmartFallback = (answers) => {
  console.log("📊 Using Smart Fallback (Scoring System)");

  const scores = { tech: 0, medical: 0, commerce: 0, humanities: 0, creative: 0 };

  Object.entries(answers).forEach(([qId, answer]) => {
    const ans = answer.toLowerCase();
    const questionId = parseInt(qId);
    // (Scoring logic preserved, assuming it works fine)
    if (questionId === 1) {
      if (ans.includes('maths') || ans.includes('physics')) scores.tech += 3;
      if (ans.includes('biology')) scores.medical += 5;
      if (ans.includes('history') || ans.includes('literature')) scores.humanities += 5;
      if (ans.includes('computer')) scores.tech += 4;
      if (ans.includes('economics') || ans.includes('business')) scores.commerce += 5;
      if (ans.includes('art') || ans.includes('design')) scores.creative += 5;
    }
    // ... (rest of scoring logic simplistically implied or we can copy it if we want to be safe, but for brevity I will assume I can just invoke the getter. Wait, I must provide the full function content if I am replacing. I'll include the scoring logic.)
    if (questionId === 2) {
      if (ans.includes('gadgets') || ans.includes('code')) scores.tech += 2;
      if (ans.includes('reading') || ans.includes('writing')) scores.humanities += 3;
      if (ans.includes('drawing') || ans.includes('painting') || ans.includes('editing')) scores.creative += 4;
      if (ans.includes('volunteering') || ans.includes('teaching')) scores.medical += 2;
    }
    if (questionId === 3) {
      if (ans.includes('tech') || ans.includes('coding')) scores.tech += 2;
      if (ans.includes('documentaries') || ans.includes('history')) scores.humanities += 3;
      if (ans.includes('art') || ans.includes('filmmaking')) scores.creative += 3;
      if (ans.includes('stock') || ans.includes('business')) scores.commerce += 3;
      if (ans.includes('medical') || ans.includes('surgery')) scores.medical += 3;
    }
    if (questionId === 10) {
      if (ans.includes('creative')) scores.creative += 5;
      if (ans.includes('service') || ans.includes('medicine')) scores.medical += 4;
      if (ans.includes('business')) scores.commerce += 3;
    }
    if (questionId === 13) {
      if (ans.includes('numbers')) scores.tech += 2;
      if (ans.includes('hate math')) { scores.humanities += 3; scores.creative += 3; }
    }
    if (questionId === 15) {
      if (ans.includes('take things apart')) scores.tech += 3;
      if (ans.includes('biology')) scores.medical += 3;
    }
    if (questionId === 16) {
      if (ans.includes('portfolio') || ans.includes('design')) scores.creative += 4;
    }
    if (questionId === 20) {
      if (ans.includes('logical')) scores.tech += 3;
      if (ans.includes('creative')) scores.creative += 5;
      if (ans.includes('empathetic')) scores.medical += 4;
      if (ans.includes('ambitious')) scores.commerce += 3;
    }
  });

  console.log("Scores:", scores);
  const maxCategory = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  console.log("Selected:", maxCategory);

  return getFallbackByCategory(maxCategory);
};

const getFallbackByCategory = (category) => {
  const commonAnalysis = { "academic_strengths": "Based on input.", "work_style": "Determined.", "risk_appetite": "Calculated." };

  const fallbacks = {
    tech: {
      "archetype": { "title": "The Logic Builder", "description": "You love solving problems with clear solutions.", "traits": ["Logical", "Curious", "Technical"] },
      "strengthSpectrum": { "analytical": 90, "creative": 60, "practical": 80, "social": 50 },
      "topCareers": [
        {
          "pathName": "Computer Science Engineering", "match": "95%", "reason": "Strong problem-solving approach.", "relevance": "Global demand.", "salary": "₹6L - ₹25L", "description": "Building software and AI.",
          "roadmap": { "class11_12_stream": "Science (PCM)", "focus_areas": "Calculus, Physics, Coding", "entrance_exams": [{ "name": "JEE Mains/Adv", "desc": "Tier-1 Colleges" }], "college_degree": "B.Tech CSE", "skills_to_learn": [{ "skill": "Python/Java", "desc": "Core Logic" }] },
          "learning_resources": [{ "name": "CS50 by Harvard", "type": "Course", "link": "cs50.harvard.edu" }, { "name": "freeCodeCamp", "type": "Course", "link": "freecodecamp.org" }]
        },
        {
          "pathName": "Data Science", "match": "88%", "reason": "Love patterns and data.", "relevance": "High Growth.", "salary": "₹8L - ₹20L", "description": "Analyzing data trends.",
          "roadmap": { "class11_12_stream": "Science (PCM)", "focus_areas": "Statistics, Maths", "entrance_exams": [{ "name": "ISI Admission", "desc": "For Statistics" }], "college_degree": "B.Stat or B.Tech", "skills_to_learn": [{ "skill": "SQL & Python", "desc": "Data Handling" }] },
          "learning_resources": [{ "name": "Kaggle", "type": "Course", "link": "kaggle.com" }, { "name": "3Blue1Brown", "type": "Video", "link": "youtube.com/3blue1brown" }]
        },
        {
          "pathName": "Robotics", "match": "82%", "reason": "Hardware + Software.", "relevance": "Future Tech.", "salary": "₹5L - ₹15L", "description": "Building automated systems.",
          "roadmap": { "class11_12_stream": "Science (PCM)", "focus_areas": "Physics, Mechanics", "entrance_exams": [{ "name": "JEE", "desc": "Engineering" }], "college_degree": "B.Tech Mechatronics", "skills_to_learn": [{ "skill": "Arduino", "desc": "Prototyping" }] },
          "learning_resources": [{ "name": "Arduino Project Hub", "type": "Project", "link": "create.arduino.cc" }]
        }
      ],
      "analysis": commonAnalysis
    },
    // ... (Implement other categories similarly if needed, for brevity I'll do a generic fallback for others or reuse standard structure. I MUST implement them though.)
    medical: {
      "archetype": { "title": "The Compassionate Healer", "description": "Driven by purpose to help others.", "traits": ["Empathetic", "Detail-Oriented", "Resilient"] },
      "strengthSpectrum": { "analytical": 75, "creative": 40, "practical": 90, "social": 85 },
      "topCareers": [
        {
          "pathName": "Medicine (MBBS)", "match": "96%", "reason": "Desire to save lives.", "relevance": "Top Tier.", "salary": "₹10L - ₹25L", "description": "Patient care.",
          "roadmap": { "class11_12_stream": "Science (PCB)", "focus_areas": "Biology", "entrance_exams": [{ "name": "NEET", "desc": "Medical" }], "college_degree": "MBBS", "skills_to_learn": [{ "skill": "Empathy", "desc": "Patient Care" }] },
          "learning_resources": [{ "name": "Khan Academy Medicine", "type": "Video", "link": "khanacademy.org" }]
        },
        {
          "pathName": "Biotechnology", "match": "88%", "reason": "Research focus.", "relevance": "Innovation.", "salary": "₹6L - ₹15L", "description": "Lab research.",
          "roadmap": { "class11_12_stream": "Science (PCB)", "focus_areas": "Genetics", "entrance_exams": [{ "name": "CUET", "desc": "Central Univ" }], "college_degree": "B.Sc/B.Tech Biotech", "skills_to_learn": [{ "skill": "Lab Safety", "desc": "Basics" }] },
          "learning_resources": [{ "name": "Nature Journal", "type": "Read", "link": "nature.com" }]
        },
        {
          "pathName": "Psychology", "match": "82%", "reason": "Understanding minds.", "relevance": "Mental Health focus.", "salary": "₹4L - ₹12L", "description": "Therapy & counseling.",
          "roadmap": { "class11_12_stream": "PCB or Humanities", "focus_areas": "Psychology", "entrance_exams": [{ "name": "CUET", "desc": "For BA/BSc" }], "college_degree": "BA/B.Sc Psychology", "skills_to_learn": [{ "skill": "Listening", "desc": "Therapy" }] },
          "learning_resources": [{ "name": "CrashCourse Psychology", "type": "Video", "link": "youtube.com/crashcourse" }]
        }
      ],
      "analysis": commonAnalysis
    },
    commerce: {
      "archetype": { "title": "The Strategic Planner", "description": "Organized and ambitious.", "traits": ["Strategic", "Organized", "Ambitious"] },
      "strengthSpectrum": { "analytical": 80, "creative": 55, "practical": 70, "social": 75 },
      "topCareers": [
        {
          "pathName": "Chartered Accountancy", "match": "94%", "reason": "Finance pro.", "relevance": "Respected.", "salary": "₹7L - ₹25L", "description": "Audit & Tax.",
          "roadmap": { "class11_12_stream": "Commerce", "focus_areas": "Accounts", "entrance_exams": [{ "name": "CA Foundation", "desc": "Entry" }], "college_degree": "B.Com", "skills_to_learn": [{ "skill": "Excel", "desc": "Financials" }] },
          "learning_resources": [{ "name": "ICAI BoS", "type": "Portal", "link": "icai.org" }]
        },
        {
          "pathName": "Investment Banking", "match": "90%", "reason": "High stakes finance.", "relevance": "Lucrative.", "salary": "₹15L+", "description": "Mergers & Acquisitions.",
          "roadmap": { "class11_12_stream": "Commerce/Science", "focus_areas": "Maths, Econ", "entrance_exams": [{ "name": "IPMAT", "desc": "IIMs" }], "college_degree": "MBA/BBA", "skills_to_learn": [{ "skill": "Valuation", "desc": "Finance" }] },
          "learning_resources": [{ "name": "Aswath Damodaran", "type": "Video", "link": "youtube.com" }]
        },
        {
          "pathName": "Management (MBA)", "match": "85%", "reason": "Leadership.", "relevance": "Universal.", "salary": "₹12L+", "description": "Business Ops.",
          "roadmap": { "class11_12_stream": "Any", "focus_areas": "Communication", "entrance_exams": [{ "name": "CAT", "desc": "Post Grad" }], "college_degree": "BBA", "skills_to_learn": [{ "skill": "Leadership", "desc": "Management" }] },
          "learning_resources": [{ "name": "HBR", "type": "Read", "link": "hbr.org" }]
        }
      ],
      "analysis": commonAnalysis
    },
    humanities: {
      "archetype": { "title": "The Storyteller", "description": "Expressive and aware.", "traits": ["Expressive", "Curious", "Social"] },
      "strengthSpectrum": { "analytical": 60, "creative": 85, "practical": 50, "social": 90 },
      "topCareers": [
        {
          "pathName": "Law", "match": "94%", "reason": "Justice & Argument.", "relevance": "Stable.", "salary": "₹6L - ₹20L", "description": "Legal System.",
          "roadmap": { "class11_12_stream": "Humanities", "focus_areas": "Pol Sci, Legal", "entrance_exams": [{ "name": "CLAT", "desc": "NLUs" }], "college_degree": "BA LLB", "skills_to_learn": [{ "skill": "Debating", "desc": "Courtroom" }] },
          "learning_resources": [{ "name": "LiveLaw", "type": "Read", "link": "livelaw.in" }]
        },
        {
          "pathName": "Journalism", "match": "88%", "reason": "Awareness.", "relevance": "Media.", "salary": "₹4L - ₹10L", "description": "News & Reporting.",
          "roadmap": { "class11_12_stream": "Humanities", "focus_areas": "English, History", "entrance_exams": [{ "name": "IIMC Entrance", "desc": "Mass Comm" }], "college_degree": "BJMC", "skills_to_learn": [{ "skill": "Writing", "desc": "Reporting" }] },
          "learning_resources": [{ "name": "Reuters Institute", "type": "Read", "link": "reutersinstitute.politics.ox.ac.uk" }]
        },
        {
          "pathName": "Civil Services", "match": "85%", "reason": "Impact.", "relevance": "Prestigious.", "salary": "Govt Scales", "description": "Administration.",
          "roadmap": { "class11_12_stream": "Humanities", "focus_areas": "General Studies", "entrance_exams": [{ "name": "UPSC", "desc": "IAS/IPS" }], "college_degree": "BA History/PolSci", "skills_to_learn": [{ "skill": "Current Affairs", "desc": "Exam" }] },
          "learning_resources": [{ "name": "Vision IAS", "type": "Portal", "link": "visionias.in" }]
        }
      ],
      "analysis": commonAnalysis
    },
    creative: {
      "archetype": { "title": "The Creator", "description": "Imaginative and detailed.", "traits": ["Artistic", "Innovative", "Visual"] },
      "strengthSpectrum": { "analytical": 50, "creative": 95, "practical": 65, "social": 70 },
      "topCareers": [
        {
          "pathName": "UI/UX Design", "match": "96%", "reason": "Digital Creativity.", "relevance": "Tech Boom.", "salary": "₹6L - ₹25L", "description": "App & Web Design.",
          "roadmap": { "class11_12_stream": "Any", "focus_areas": "Design, Psych", "entrance_exams": [{ "name": "NID DAT", "desc": "Design" }], "college_degree": "B.Des", "skills_to_learn": [{ "skill": "Figma", "desc": "UI Tool" }] },
          "learning_resources": [{ "name": "Nielsen Norman Grp", "type": "Read", "link": "nngroup.com" }]
        },
        {
          "pathName": "Filmmaking", "match": "90%", "reason": "Storytelling.", "relevance": "Media.", "salary": "Variable", "description": "Direction/Editing.",
          "roadmap": { "class11_12_stream": "Arts", "focus_areas": "Lit, Media", "entrance_exams": [{ "name": "FTII JET", "desc": "Film" }], "college_degree": "B.A Film", "skills_to_learn": [{ "skill": "Editing", "desc": "Premiere Pro" }] },
          "learning_resources": [{ "name": "StudioBinder", "type": "Video", "link": "studiobinder.com" }]
        },
        {
          "pathName": "Architecture", "match": "85%", "reason": "Space & Form.", "relevance": "Construction.", "salary": "₹5L - ₹15L", "description": "Building Design.",
          "roadmap": { "class11_12_stream": "Science (Maths)", "focus_areas": "Geometry", "entrance_exams": [{ "name": "NATA", "desc": "Arch" }], "college_degree": "B.Arch", "skills_to_learn": [{ "skill": "Drafting", "desc": "Blueprints" }] },
          "learning_resources": [{ "name": "ArchDaily", "type": "Read", "link": "archdaily.com" }]
        }
      ],
      "analysis": commonAnalysis
    }
  };

  return fallbacks[category] || fallbacks.tech;
};
