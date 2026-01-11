import { GoogleGenerativeAI } from "@google/generative-ai";
import { questions } from "../data/questions";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateCareerPath = async (userProfile, answers) => {
  console.log("--- generateCareerPath Called ---");
  console.log("User Profile:", userProfile);
  console.log("Raw Answers Object:", answers);

  // 1. Validate API Key
  if (!API_KEY || API_KEY === "your_gemini_api_key" || !API_KEY.startsWith("AIza")) {
    console.warn("❌ Gemini API Key missing or invalid. Using Fallback.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getSmartFallback(answers);
  }
  console.log("✅ API Key is valid. Proceeding with Gemini API call...");

  // 2. Build Context String (Map Answers back to Questions)
  const detailedContext = Object.entries(answers).map(([questionId, selectedAnswer]) => {
    const question = questions.find(q => String(q.id) === String(questionId));
    if (question) {
      return `Question: "${question.question}"\nUser's Answer: "${selectedAnswer}"`;
    }
    return null;
  }).filter(Boolean).join('\n\n---\n\n');

  console.log("--- Detailed Context for LLM ---");
  console.log(detailedContext);

  if (!detailedContext || detailedContext.length < 50) {
    console.warn("⚠️ Context is too short. Falling back.");
    return getSmartFallback(answers);
  }

  // 3. Construct DETAILED Prompt for Child-Friendly Results
  const systemPrompt = `
You are an expert Indian Career Counselor AI helping a young student (Class 9-12) understand their career options.
The student may have VERY LITTLE knowledge about careers, so your explanations must be SIMPLE, DETAILED, and ENCOURAGING.

**About the Student:**
- Name: ${userProfile.name || "Student"}
- Current Class: ${userProfile.grade || "10th"}
- Education Board: ${userProfile.board || "CBSE"}

**Student's Assessment Responses:**
${detailedContext}

---

**Your Task:**
Analyze the student's responses deeply. Generate a HIGHLY DETAILED and CHILD-FRIENDLY career guidance report.

**STRICT OUTPUT REQUIREMENTS:**

1. **Top 3 Careers** - For EACH career, provide:
   - "title": The job title
   - "matchPercentage": How well it matches (e.g., "92%")
   - "reason": 1-2 sentences explaining WHY this matches their answers
   - "description": 2-3 sentences explaining what this job is and what you do daily (in simple language a 15-year-old can understand)
   - "salaryRange": Expected salary range in India (e.g., "₹6-15 LPA starting, ₹25-50 LPA with experience")
   - "workEnvironment": Where you work (e.g., "Office, sometimes work from home", "Hospital", "Creative studio")
   - "famousExample": One famous person or company associated with this career (e.g., "Sundar Pichai - CEO of Google")

2. **Roadmap** - Step-by-step guidance:
   - "immediateAction": What to start doing THIS WEEK (very specific)
   - "class11_12": Which stream to choose (Science PCM/PCB, Commerce, Arts) and why
   - "entranceExams": Specific entrance exams with full names (e.g., "JEE Main - Joint Entrance Examination for engineering")
   - "after12th": Specific degree programs with duration (e.g., "B.Tech in Computer Science - 4 years")
   - "higherEducation": Masters/certifications for career growth
   - "skillsToBuild": 5 key skills with brief descriptions

3. **Resources** - Exactly 4 resources with REAL URLs:
   - Include: 1 YouTube channel, 1 free online course, 1 website, 1 book/reading material
   - Format: { "name": "...", "url": "https://...", "type": "...", "description": "What you'll learn from this" }

4. **Motivation** - A short encouraging message (2-3 sentences) personalized to the student.

**OUTPUT FORMAT:**
Return ONLY valid JSON. No markdown. No extra text.

{
  "topCareers": [
    {
      "title": "Software Engineer",
      "matchPercentage": "95%",
      "reason": "You love logic and problem-solving...",
      "description": "Software engineers build apps, websites, and games...",
      "salaryRange": "₹6-15 LPA starting, ₹25-50+ LPA with experience",
      "workEnvironment": "Tech office or work from home",
      "famousExample": "Sundar Pichai - CEO of Google"
    }
  ],
  "roadmap": {
    "immediateAction": "Download VS Code and complete your first Python tutorial on freeCodeCamp",
    "class11_12": "Take Science stream with Physics, Chemistry, Maths (PCM). Also learn coding outside school.",
    "entranceExams": "JEE Main (Joint Entrance Exam) for IITs/NITs, or BITSAT for BITS Pilani",
    "after12th": "B.Tech in Computer Science (4 years) from a good engineering college",
    "higherEducation": "M.Tech or MS in specialization like AI/ML, or MBA for management roles",
    "skillsToBuild": [
      {"skill": "Programming", "why": "The core skill - start with Python or JavaScript"},
      {"skill": "Problem Solving", "why": "Practice on LeetCode or HackerRank"},
      {"skill": "Communication", "why": "You'll work in teams and present ideas"},
      {"skill": "System Design", "why": "Understanding how big apps are built"},
      {"skill": "Continuous Learning", "why": "Tech changes fast, always stay updated"}
    ]
  },
  "resources": [
    {"name": "freeCodeCamp", "url": "https://www.freecodecamp.org", "type": "Free Course", "description": "Learn coding from scratch with hands-on projects"},
    {"name": "Traversy Media", "url": "https://www.youtube.com/@TraversyMedia", "type": "YouTube", "description": "Easy-to-follow web development tutorials"},
    {"name": "roadmap.sh", "url": "https://roadmap.sh", "type": "Website", "description": "Visual guides showing what to learn step by step"},
    {"name": "Atomic Habits by James Clear", "url": "https://jamesclear.com/atomic-habits", "type": "Book", "description": "Build good habits for success in any career"}
  ],
  "motivation": "You have a sharp analytical mind and genuine curiosity about technology. With consistent effort, you can absolutely become a successful engineer. Start small, stay curious, and never stop learning!"
}
`;

  console.log("--- Sending Enhanced Prompt to Gemini ---");

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text();

    console.log("--- Raw Gemini Response ---");
    console.log(text);

    // Sanitize and Parse JSON
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      console.error("❌ Could not find valid JSON braces in response.");
      return getSmartFallback(answers);
    }
    text = text.substring(firstBrace, lastBrace + 1);

    const parsedResult = JSON.parse(text);
    console.log("✅ Successfully Parsed Gemini Result:", parsedResult);
    return parsedResult;

  } catch (error) {
    console.error("❌ Gemini API Call Failed:", error);
    return getSmartFallback(answers);
  }
};

// -----------------------------------------------------------------------------
// SMART FALLBACK with DETAILED responses
// -----------------------------------------------------------------------------
export const getSmartFallback = (answers) => {
  console.log("--- Using Smart Fallback ---");
  const answerString = Object.values(answers).join(' ').toLowerCase();

  // --- TECH / ENGINEERING ---
  if (answerString.includes('computer') || answerString.includes('mathematics') || answerString.includes('coding') || answerString.includes('engineering') || answerString.includes('tech reviews') || answerString.includes('analyze data')) {
    return {
      topCareers: [
        {
          title: "Software Engineer",
          matchPercentage: "95%",
          reason: "Your love for computers and logical problem-solving is a perfect match.",
          description: "Software engineers build the apps on your phone, websites you visit, and even video games. You'll write code to solve problems and create things millions of people use.",
          salaryRange: "₹6-15 LPA starting, ₹25-50+ LPA with 5+ years",
          workEnvironment: "Tech office or work from home",
          famousExample: "Sundar Pichai - CEO of Google"
        },
        {
          title: "Data Scientist",
          matchPercentage: "90%",
          reason: "Your analytical mindset is perfect for finding patterns in data.",
          description: "Data scientists analyze huge amounts of data to help companies make smart decisions. It's like being a detective who uses math and coding to find hidden insights.",
          salaryRange: "₹8-18 LPA starting, ₹30-60 LPA with experience",
          workEnvironment: "Corporate office, often remote-friendly",
          famousExample: "DJ Patil - First US Chief Data Scientist"
        },
        {
          title: "AI/ML Engineer",
          matchPercentage: "85%",
          reason: "For someone who loves tech and innovation.",
          description: "AI engineers teach computers to think and learn. You'll build chatbots, self-driving car systems, and smart assistants like Alexa.",
          salaryRange: "₹10-20 LPA starting, ₹40-80+ LPA with expertise",
          workEnvironment: "Research labs or tech companies",
          famousExample: "Demis Hassabis - Founder of DeepMind (AlphaGo)"
        }
      ],
      roadmap: {
        immediateAction: "Download VS Code and complete the first 5 lessons on freeCodeCamp.org",
        class11_12: "Take Science stream with Physics, Chemistry, Maths (PCM). Start learning Python in your free time.",
        entranceExams: "JEE Main (for NITs/IIITs), JEE Advanced (for IITs), BITSAT (for BITS Pilani)",
        after12th: "B.Tech in Computer Science & Engineering - 4 years",
        higherEducation: "M.Tech/MS in AI, Data Science, or MBA for management track",
        skillsToBuild: [
          { skill: "Programming (Python/Java)", why: "The foundation of all tech careers" },
          { skill: "Data Structures & Algorithms", why: "Needed for job interviews & building efficient software" },
          { skill: "Problem Solving", why: "Practice daily on LeetCode or HackerRank" },
          { skill: "Communication", why: "You'll work in teams and explain technical concepts" },
          { skill: "Cloud Computing (AWS/GCP)", why: "Modern apps run on the cloud" }
        ]
      },
      resources: [
        { name: "freeCodeCamp", url: "https://www.freecodecamp.org", type: "Free Course", description: "Learn full-stack development with projects" },
        { name: "CS50 by Harvard", url: "https://pll.harvard.edu/course/cs50", type: "Course", description: "Best intro to computer science, free from Harvard" },
        { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", type: "YouTube", description: "Practical web development tutorials" },
        { name: "roadmap.sh", url: "https://roadmap.sh/", type: "Guide", description: "Visual career paths for developers" }
      ],
      motivation: "You have a natural talent for logical thinking! The tech industry rewards curiosity and persistence. Start coding today - every expert was once a beginner. Your future is bright! 🚀"
    };
  }

  // --- MEDICAL ---
  if (answerString.includes('biology') || answerString.includes('chemistry') || answerString.includes('medical') || answerString.includes('healthcare') || answerString.includes('human body') || answerString.includes('fascinated')) {
    return {
      topCareers: [
        {
          title: "Doctor (MBBS)",
          matchPercentage: "96%",
          reason: "Your fascination with the human body and desire to help people is perfect for medicine.",
          description: "Doctors diagnose illnesses and treat patients. You could specialize in surgery, pediatrics (kids), cardiology (heart), or many other fields. It's one of the most respected professions.",
          salaryRange: "₹8-15 LPA starting, ₹20-50+ LPA (specialists earn much more)",
          workEnvironment: "Hospitals, clinics, or private practice",
          famousExample: "Dr. Devi Shetty - Famous heart surgeon who made surgeries affordable"
        },
        {
          title: "Medical Researcher",
          matchPercentage: "88%",
          reason: "Your analytical mind is great for discovering new treatments.",
          description: "Medical researchers work in labs to develop new medicines, vaccines, and treatments. They're the ones who created COVID vaccines!",
          salaryRange: "₹6-12 LPA starting, ₹15-30 LPA with PhD",
          workEnvironment: "Research labs, universities, pharmaceutical companies",
          famousExample: "Dr. Gagandeep Kang - India's first female FRS in medicine"
        },
        {
          title: "Pharmacist",
          matchPercentage: "82%",
          reason: "Combines chemistry knowledge with patient care.",
          description: "Pharmacists are medicine experts. You'll advise people on medications, check for drug interactions, and can even own your own pharmacy.",
          salaryRange: "₹4-8 LPA starting, ₹12-25 LPA with experience",
          workEnvironment: "Hospitals, retail pharmacies, pharmaceutical companies",
          famousExample: "Kiran Mazumdar-Shaw - Founder of Biocon"
        }
      ],
      roadmap: {
        immediateAction: "Read your NCERT Biology chapters thoroughly. Watch medical documentaries on YouTube.",
        class11_12: "Take Science with Physics, Chemistry, Biology (PCB). Focus heavily on NEET preparation.",
        entranceExams: "NEET UG (National Eligibility cum Entrance Test) - the ONLY exam for medical admission in India",
        after12th: "MBBS (5.5 years including internship) from a government medical college if possible",
        higherEducation: "MD/MS specialization (3 years) in your chosen field",
        skillsToBuild: [
          { skill: "Biology & Chemistry", why: "Foundation of all medical knowledge" },
          { skill: "Empathy", why: "Understanding patients' feelings is crucial" },
          { skill: "Patience", why: "Medical training is long but rewarding" },
          { skill: "Attention to Detail", why: "Small details can save lives" },
          { skill: "Communication", why: "Explaining things to patients clearly" }
        ]
      },
      resources: [
        { name: "Khan Academy Medicine", url: "https://www.khanacademy.org/science/health-and-medicine", type: "Free Course", description: "Clear explanations of medical concepts" },
        { name: "Osmosis", url: "https://www.osmosis.org/", type: "Learning Platform", description: "Visual medical education videos" },
        { name: "Dr. Najeeb Lectures", url: "https://www.youtube.com/@DoctorNajeeb", type: "YouTube", description: "In-depth medical lectures" },
        { name: "Unacademy NEET", url: "https://unacademy.com/goal/neet-ug/RYYMX", type: "Course", description: "Structured NEET preparation" }
      ],
      motivation: "Medicine is a noble calling, and your compassion for others will make you a wonderful doctor. The journey is long, but imagine how many lives you'll save and families you'll bring joy to! Stay dedicated! 💪"
    };
  }

  // --- ARTS / DESIGN ---
  if (answerString.includes('art') || answerString.includes('design') || answerString.includes('creative') || answerString.includes('painting') || answerString.includes('editing videos') || answerString.includes('fashion')) {
    return {
      topCareers: [
        {
          title: "UX/UI Designer",
          matchPercentage: "94%",
          reason: "Your creativity and visual sense are perfect for designing digital experiences.",
          description: "UX/UI designers create the look and feel of apps and websites. You decide where buttons go, what colors to use, and how to make things easy to use. Big companies pay well for great designers!",
          salaryRange: "₹5-12 LPA starting, ₹20-40 LPA with experience",
          workEnvironment: "Design studios, tech companies, or freelance",
          famousExample: "Jony Ive - Designer of iPhone"
        },
        {
          title: "Graphic Designer",
          matchPercentage: "88%",
          reason: "Your artistic skills can create stunning visual content.",
          description: "Graphic designers create logos, posters, social media graphics, and marketing materials. Every brand you see has a graphic designer behind it.",
          salaryRange: "₹4-10 LPA starting, ₹15-30 LPA with experience",
          workEnvironment: "Creative agencies, in-house teams, or freelance",
          famousExample: "Satyajit Ray - Legendary filmmaker who also designed his own posters"
        },
        {
          title: "Video Editor / Content Creator",
          matchPercentage: "80%",
          reason: "Your interest in visual storytelling fits perfectly here.",
          description: "Video editors bring stories to life by cutting, arranging, and adding effects to videos. From YouTube to Bollywood, everyone needs editors!",
          salaryRange: "₹3-8 LPA starting, Creator income can be unlimited",
          workEnvironment: "Production houses, YouTube studios, or from home",
          famousExample: "Bhuvan Bam - One of India's biggest content creators"
        }
      ],
      roadmap: {
        immediateAction: "Start a small design project - redesign a poster or app screen using Canva or Figma (free tools)",
        class11_12: "Arts stream is fine, but Commerce/Science also works. Build your portfolio in free time.",
        entranceExams: "NID DAT (National Institute of Design), NIFT Entrance, UCEED (for IIT Design)",
        after12th: "B.Des (Bachelor of Design) - 4 years from NID, NIFT, or good private colleges",
        higherEducation: "M.Des in Interaction Design or HCI (Human-Computer Interaction)",
        skillsToBuild: [
          { skill: "Figma/Adobe XD", why: "Industry-standard design tools" },
          { skill: "Color Theory", why: "Understanding what colors work together" },
          { skill: "Typography", why: "Choosing and pairing fonts effectively" },
          { skill: "User Research", why: "Understanding what users actually need" },
          { skill: "Prototyping", why: "Creating interactive mockups of your designs" }
        ]
      },
      resources: [
        { name: "Google UX Design Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design", type: "Course", description: "Industry-recognized UX certification from Google" },
        { name: "The Futur", url: "https://www.youtube.com/@thefutur", type: "YouTube", description: "Design business and career advice" },
        { name: "Behance", url: "https://www.behance.net/", type: "Portfolio Site", description: "See top designers' work and build your portfolio" },
        { name: "Refactoring UI", url: "https://www.refactoringui.com/", type: "Book/Guide", description: "Practical UI design tips" }
      ],
      motivation: "Your creative mind sees the world differently - that's a superpower! Designers shape how we experience technology and brands every day. Start creating now, and your portfolio will open amazing doors! 🎨"
    };
  }

  // --- BUSINESS / COMMERCE / LAW ---
  if (answerString.includes('economics') || answerString.includes('business') || answerString.includes('management') || answerString.includes('law') || answerString.includes('finance') || answerString.includes('convincing') || answerString.includes('debate')) {
    return {
      topCareers: [
        {
          title: "Investment Banker / Finance Manager",
          matchPercentage: "92%",
          reason: "Your interest in economics and strategic thinking fits finance perfectly.",
          description: "Investment bankers help companies raise money, buy other companies, and make big financial decisions. It's challenging but one of the highest-paying careers.",
          salaryRange: "₹10-25 LPA starting, ₹50 LPA - ₹2 Cr+ for senior roles",
          workEnvironment: "Banks, financial firms, can be high-pressure",
          famousExample: "Uday Kotak - Founder of Kotak Mahindra Bank"
        },
        {
          title: "Corporate Lawyer",
          matchPercentage: "88%",
          reason: "Your debate skills and logical thinking are ideal for law.",
          description: "Corporate lawyers help businesses with contracts, mergers, and legal issues. You won't be in court often - more like advising on deals worth crores!",
          salaryRange: "₹12-25 LPA starting at top firms, ₹50 LPA+ as partner",
          workEnvironment: "Law firms, corporate legal teams",
          famousExample: "Nita Ambani - Trained solicitor, business leader"
        },
        {
          title: "Management Consultant",
          matchPercentage: "85%",
          reason: "Your ability to analyze and persuade is perfect for consulting.",
          description: "Consultants are hired to solve business problems. You'll work with different companies, travel a lot, and give advice to CEOs!",
          salaryRange: "₹15-30 LPA starting at top firms (McKinsey, BCG, Bain)",
          workEnvironment: "Client offices, lots of travel",
          famousExample: "Indra Nooyi - Former PepsiCo CEO, started in consulting"
        }
      ],
      roadmap: {
        immediateAction: "Start reading business news - download Mint or Economic Times app. Read 2 articles daily.",
        class11_12: "Commerce stream with Economics, Accounts, Business Studies, Maths if possible.",
        entranceExams: "CLAT (for law), CAT/XAT (for MBA later), CFA Foundation",
        after12th: "B.Com / BBA for business, or 5-year Integrated Law (BA LLB) from NLUs for law",
        higherEducation: "MBA from IIM/ISB, or LLM for law specialization, CFA/CA for finance",
        skillsToBuild: [
          { skill: "Financial Analysis", why: "Reading and understanding financial statements" },
          { skill: "Communication & Presentation", why: "Convincing clients and stakeholders" },
          { skill: "Excel & Data Analysis", why: "Business runs on spreadsheets" },
          { skill: "Negotiation", why: "Getting the best deals" },
          { skill: "Strategic Thinking", why: "Seeing the big picture" }
        ]
      },
      resources: [
        { name: "Harvard Business Review", url: "https://hbr.org/", type: "Reading", description: "World-class business insights and case studies" },
        { name: "Investopedia", url: "https://www.investopedia.com/", type: "Website", description: "Learn all finance concepts for free" },
        { name: "Think School", url: "https://www.youtube.com/@ThinkSchool", type: "YouTube", description: "Business case studies in Hindi/English" },
        { name: "Y Combinator Library", url: "https://www.ycombinator.com/library", type: "Resource", description: "Startup and business knowledge from the best" }
      ],
      motivation: "Business and law are fields where your ideas and decisions can shape companies and even countries! Your analytical mind and communication skills are your biggest assets. Stay curious about how the world works! 💼"
    };
  }

  // --- DEFAULT ---
  return {
    topCareers: [
      {
        title: "Product Manager",
        matchPercentage: "88%",
        reason: "A versatile role that combines multiple skills.",
        description: "Product managers decide what features to build in apps and products. You work with designers, engineers, and business teams to create things people love.",
        salaryRange: "₹12-25 LPA starting, ₹40-80+ LPA with experience",
        workEnvironment: "Tech companies, startups",
        famousExample: "Sundar Pichai was a product manager before becoming CEO"
      },
      {
        title: "Digital Marketer",
        matchPercentage: "82%",
        reason: "Combines creativity with data-driven thinking.",
        description: "Digital marketers help brands reach customers online through social media, Google, and content. It's creative, dynamic, and in high demand.",
        salaryRange: "₹4-10 LPA starting, ₹20-40 LPA for experts",
        workEnvironment: "Marketing agencies, any company with online presence",
        famousExample: "Gary Vaynerchuk - Marketing legend"
      },
      {
        title: "Civil Servant (UPSC)",
        matchPercentage: "78%",
        reason: "For those who want to serve the nation.",
        description: "IAS/IPS officers run government departments, make policies, and can change millions of lives. It's tough to crack but incredibly rewarding.",
        salaryRange: "₹6-10 LPA + allowances, but power and impact are huge",
        workEnvironment: "Government offices, field visits",
        famousExample: "Armstrong Pame - Built road for his village without government help"
      }
    ],
    roadmap: {
      immediateAction: "Identify your top 3 interests. Start a small project or blog about one of them.",
      class11_12: "Choose stream based on your strongest subject (Science/Commerce/Arts all have great options)",
      entranceExams: "Depends on your chosen path - explore options in Class 11",
      after12th: "Bachelor's degree in your area of interest",
      higherEducation: "Specialize through Masters or certifications based on field",
      skillsToBuild: [
        { skill: "Communication", why: "Essential in every career" },
        { skill: "Problem Solving", why: "Think critically about challenges" },
        { skill: "Digital Literacy", why: "Every job involves technology now" },
        { skill: "Time Management", why: "Balance academics, hobbies, and growth" },
        { skill: "Networking", why: "Connecting with the right people opens doors" }
      ]
    },
    resources: [
      { name: "Coursera", url: "https://www.coursera.org/", type: "Courses", description: "Learn anything from top universities for free" },
      { name: "LinkedIn Learning", url: "https://www.linkedin.com/learning/", type: "Skills", description: "Professional skills development" },
      { name: "TED Talks", url: "https://www.ted.com/", type: "Inspiration", description: "Ideas worth spreading - find your passion" },
      { name: "Ikigai (Book)", url: "https://www.amazon.in/Ikigai-Japanese-secret-long-happy/dp/178633089X", type: "Book", description: "Find your purpose and direction" }
    ],
    motivation: "You have so much potential! The best career is one where you enjoy the journey, not just the destination. Explore, experiment, and don't be afraid to try new things. Your perfect path is out there waiting for you! ⭐"
  };
};
