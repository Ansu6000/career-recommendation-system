// Career Assessment Questions - Professional & Weighted
// 15 Questions across 3 Sections
// Clear, relevant questions that test career aptitudes without directly asking career preferences

export const questions = [
    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 1: ACADEMIC STRENGTHS & INTERESTS (Questions 1-5)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 1,
        section: "aptitude",
        sectionTitle: "Academic Strengths",
        question: "Which type of subject comes most naturally to you?",
        options: [
            {
                text: "Mathematics and Physics - logical reasoning and problem-solving",
                weights: { tech: 5, aviation: 4, commerce: 3, defense: 2 }
            },
            {
                text: "Biology and Chemistry - understanding systems and processes",
                weights: { medical: 5, sports: 3 }
            },
            {
                text: "History, Civics, and Social Studies - analyzing society and governance",
                weights: { humanities: 5, government: 5, defense: 3 }
            },
            {
                text: "Economics and Accountancy - working with numbers and finance",
                weights: { commerce: 5, government: 3 }
            },
            {
                text: "Art, Music, or Literature - creative expression",
                weights: { creative: 5, humanities: 3 }
            },
            {
                text: "Physical Education and Sports - physical activities and competition",
                weights: { sports: 5, defense: 5, aviation: 3 }
            }
        ]
    },
    {
        id: 2,
        section: "aptitude",
        sectionTitle: "Academic Strengths",
        question: "What type of problems do you enjoy solving?",
        options: [
            {
                text: "Technical problems - debugging code, fixing machines, building systems",
                weights: { tech: 5, aviation: 3 }
            },
            {
                text: "Analytical problems - data analysis, research, finding patterns",
                weights: { tech: 4, commerce: 4, medical: 3 }
            },
            {
                text: "Human problems - conflicts, counseling, understanding behavior",
                weights: { medical: 4, humanities: 5, government: 3 }
            },
            {
                text: "Strategic problems - planning, competition, resource management",
                weights: { commerce: 5, defense: 4, government: 4, sports: 3 }
            },
            {
                text: "Creative problems - design challenges, artistic expression",
                weights: { creative: 5, humanities: 2 }
            },
            {
                text: "Physical challenges - endurance, coordination, tactical execution",
                weights: { sports: 5, defense: 5, aviation: 4 }
            }
        ]
    },
    {
        id: 3,
        section: "aptitude",
        sectionTitle: "Academic Strengths",
        question: "In a group project, which role suits you best?",
        options: [
            {
                text: "Team Leader - organizing, delegating, and ensuring completion",
                weights: { defense: 5, commerce: 4, government: 4, sports: 3 }
            },
            {
                text: "Researcher - gathering information and analyzing data",
                weights: { tech: 4, medical: 4, humanities: 3 }
            },
            {
                text: "Builder/Developer - creating the actual deliverable",
                weights: { tech: 5, creative: 4, aviation: 2 }
            },
            {
                text: "Presenter - communicating ideas and representing the team",
                weights: { humanities: 4, commerce: 4, government: 3 }
            },
            {
                text: "Coordinator - managing people and resolving conflicts",
                weights: { medical: 3, humanities: 4, government: 4 }
            },
            {
                text: "Executor - taking action and getting things done quickly",
                weights: { defense: 4, sports: 5, aviation: 4 }
            }
        ]
    },
    {
        id: 4,
        section: "aptitude",
        sectionTitle: "Academic Strengths",
        question: "What kind of content do you naturally consume in your free time?",
        options: [
            {
                text: "Technology news, coding tutorials, science documentaries",
                weights: { tech: 5, aviation: 2 }
            },
            {
                text: "Health, fitness, medical breakthroughs, psychology",
                weights: { medical: 5, sports: 3 }
            },
            {
                text: "Current affairs, politics, legal cases, social issues",
                weights: { government: 5, humanities: 4, defense: 2 }
            },
            {
                text: "Business news, stock markets, entrepreneurship stories",
                weights: { commerce: 5 }
            },
            {
                text: "Art, design, films, music, creative tutorials",
                weights: { creative: 5, humanities: 2 }
            },
            {
                text: "Sports, fitness, adventure, military/aviation content",
                weights: { sports: 4, defense: 5, aviation: 5 }
            }
        ]
    },
    {
        id: 5,
        section: "aptitude",
        sectionTitle: "Academic Strengths",
        question: "How do you prefer to learn new concepts?",
        options: [
            {
                text: "Hands-on practice - learning by doing and experimenting",
                weights: { tech: 4, sports: 4, defense: 3, creative: 3, aviation: 3 }
            },
            {
                text: "Reading and research - studying in-depth from books/articles",
                weights: { medical: 4, humanities: 4, government: 4 }
            },
            {
                text: "Visual learning - videos, diagrams, and demonstrations",
                weights: { creative: 4, tech: 3, medical: 2 }
            },
            {
                text: "Discussion and debate - learning through conversation",
                weights: { humanities: 5, government: 4, commerce: 3 }
            },
            {
                text: "Structured training - following a defined curriculum or course",
                weights: { defense: 5, aviation: 5, government: 3, commerce: 2 }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 2: WORK STYLE & PERSONALITY (Questions 6-10)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 6,
        section: "personality",
        sectionTitle: "Work Style & Personality",
        question: "How do you handle high-pressure situations with tight deadlines?",
        options: [
            {
                text: "I thrive under pressure - it brings out my best performance",
                weights: { defense: 5, aviation: 5, sports: 5, medical: 3 }
            },
            {
                text: "I stay calm and work methodically through the problem",
                weights: { tech: 4, medical: 4, government: 4 }
            },
            {
                text: "I delegate and organize resources to meet the deadline",
                weights: { commerce: 5, government: 3 }
            },
            {
                text: "I prefer avoiding such situations - I like planned schedules",
                weights: { humanities: 3, creative: 3 }
            },
            {
                text: "I find creative shortcuts to deliver quickly",
                weights: { creative: 4, tech: 3, commerce: 2 }
            }
        ]
    },
    {
        id: 7,
        section: "personality",
        sectionTitle: "Work Style & Personality",
        question: "How important is physical fitness in your daily routine?",
        options: [
            {
                text: "Essential - I train daily and maintain peak fitness",
                weights: { defense: 5, sports: 5, aviation: 4 }
            },
            {
                text: "Important - I exercise regularly for health",
                weights: { medical: 3, commerce: 2, government: 2 }
            },
            {
                text: "Moderate - I stay active but don't follow strict routines",
                weights: { tech: 3, humanities: 3, creative: 3 }
            },
            {
                text: "Low priority - I focus more on mental/creative work",
                weights: { tech: 4, creative: 4, humanities: 3 }
            }
        ]
    },
    {
        id: 8,
        section: "personality",
        sectionTitle: "Work Style & Personality",
        question: "How do you feel about following strict rules and hierarchies?",
        options: [
            {
                text: "I respect hierarchy - discipline and order are important",
                weights: { defense: 5, aviation: 5, government: 5 }
            },
            {
                text: "I follow rules but appreciate some flexibility",
                weights: { commerce: 4, medical: 4, tech: 3 }
            },
            {
                text: "I prefer autonomy and freedom in my work",
                weights: { creative: 5, tech: 4, humanities: 3 }
            },
            {
                text: "I like clear guidelines but dislike micromanagement",
                weights: { commerce: 3, tech: 3, sports: 3 }
            }
        ]
    },
    {
        id: 9,
        section: "personality",
        sectionTitle: "Work Style & Personality",
        question: "How comfortable are you with public speaking and presentations?",
        options: [
            {
                text: "Very comfortable - I enjoy being the center of attention",
                weights: { humanities: 4, commerce: 4, sports: 3, government: 3 }
            },
            {
                text: "Comfortable with preparation - I can present well when ready",
                weights: { tech: 3, medical: 3, defense: 3, government: 4 }
            },
            {
                text: "Prefer one-on-one or small groups over large audiences",
                weights: { medical: 4, tech: 3, creative: 3 }
            },
            {
                text: "I prefer written communication over speaking",
                weights: { tech: 4, creative: 3, humanities: 2 }
            },
            {
                text: "I lead by example and actions, not words",
                weights: { defense: 5, sports: 4, aviation: 4 }
            }
        ]
    },
    {
        id: 10,
        section: "personality",
        sectionTitle: "Work Style & Personality",
        question: "How do you feel about relocating frequently for work?",
        options: [
            {
                text: "Ready for it - I can serve anywhere in the country",
                weights: { defense: 5, government: 5, aviation: 4 }
            },
            {
                text: "Open to it - if the opportunity is good",
                weights: { commerce: 4, tech: 3, medical: 2 }
            },
            {
                text: "Prefer stability - I want to settle in one city",
                weights: { humanities: 3, creative: 3 }
            },
            {
                text: "I prefer remote work with location flexibility",
                weights: { tech: 5, creative: 4 }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 3: GOALS & VALUES (Questions 11-15)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 11,
        section: "goals",
        sectionTitle: "Goals & Values",
        question: "What matters most to you in a career?",
        options: [
            {
                text: "High income and financial growth",
                weights: { commerce: 5, tech: 4, aviation: 3 }
            },
            {
                text: "Job security and stability",
                weights: { government: 5, medical: 3, defense: 3 }
            },
            {
                text: "Serving the nation and public welfare",
                weights: { defense: 5, government: 5, medical: 3 }
            },
            {
                text: "Creative freedom and self-expression",
                weights: { creative: 5, humanities: 3 }
            },
            {
                text: "Prestige and social recognition",
                weights: { medical: 4, government: 4, defense: 4, commerce: 3 }
            },
            {
                text: "Adventure and unique experiences",
                weights: { aviation: 5, defense: 4, sports: 4 }
            },
            {
                text: "Making a difference in people's lives",
                weights: { medical: 5, humanities: 4, government: 3 }
            }
        ]
    },
    {
        id: 12,
        section: "goals",
        sectionTitle: "Goals & Values",
        question: "How much time are you willing to invest in preparation/training?",
        options: [
            {
                text: "5+ years of rigorous training and exams",
                weights: { medical: 5, defense: 5, government: 5, aviation: 4 }
            },
            {
                text: "3-4 years of focused preparation",
                weights: { tech: 4, commerce: 4, humanities: 4 }
            },
            {
                text: "1-2 years of intensive study",
                weights: { commerce: 4, tech: 3 }
            },
            {
                text: "I prefer skill-based paths over exam-based ones",
                weights: { creative: 5, sports: 4, tech: 2 }
            }
        ]
    },
    {
        id: 13,
        section: "goals",
        sectionTitle: "Goals & Values",
        question: "What type of work environment do you prefer?",
        options: [
            {
                text: "Office with modern technology and flexible hours",
                weights: { tech: 5, commerce: 4, creative: 3 }
            },
            {
                text: "Hospital, clinic, or healthcare facility",
                weights: { medical: 5 }
            },
            {
                text: "Government offices and administrative settings",
                weights: { government: 5, humanities: 4 }
            },
            {
                text: "Outdoors, field work, or physically active environments",
                weights: { defense: 5, sports: 5, aviation: 4 }
            },
            {
                text: "Creative studio or independent workspace",
                weights: { creative: 5, humanities: 2 }
            },
            {
                text: "Courtrooms, media houses, or public-facing roles",
                weights: { humanities: 5, government: 3 }
            }
        ]
    },
    {
        id: 14,
        section: "goals",
        sectionTitle: "Goals & Values",
        question: "How do you handle responsibility for critical decisions?",
        options: [
            {
                text: "I take full ownership - I'm confident in my judgment",
                weights: { defense: 5, aviation: 5, medical: 4, commerce: 4 }
            },
            {
                text: "I prefer shared responsibility with a team",
                weights: { tech: 4, commerce: 3, creative: 3 }
            },
            {
                text: "I follow established protocols and guidelines",
                weights: { government: 4, medical: 4, aviation: 3 }
            },
            {
                text: "I consult experts before making major decisions",
                weights: { humanities: 4, medical: 3, government: 3 }
            },
            {
                text: "I trust my instincts and act decisively",
                weights: { sports: 5, defense: 4, commerce: 3 }
            }
        ]
    },
    {
        id: 15,
        section: "goals",
        sectionTitle: "Goals & Values",
        question: "Which trait best describes you?",
        options: [
            {
                text: "Analytical - I think logically and solve problems systematically",
                weights: { tech: 5, commerce: 4, aviation: 3 }
            },
            {
                text: "Compassionate - I care deeply about others' wellbeing",
                weights: { medical: 5, humanities: 4, government: 3 }
            },
            {
                text: "Ambitious - I set high goals and work hard to achieve them",
                weights: { commerce: 5, government: 4, tech: 3 }
            },
            {
                text: "Disciplined - I follow routines and respect structure",
                weights: { defense: 5, aviation: 5, government: 4 }
            },
            {
                text: "Creative - I think differently and express ideas uniquely",
                weights: { creative: 5, humanities: 3 }
            },
            {
                text: "Competitive - I love challenges and winning",
                weights: { sports: 5, commerce: 4, defense: 3 }
            },
            {
                text: "Adventurous - I seek new experiences and thrill",
                weights: { aviation: 5, defense: 4, sports: 4 }
            }
        ]
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// CAREER CATEGORY DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════
export const careerCategories = {
    tech: {
        name: "Technology & Engineering",
        careers: ["Software Engineer", "Data Scientist", "AI/ML Engineer", "Cybersecurity Analyst", "Product Manager", "Cloud Architect", "Robotics Engineer", "Blockchain Developer"]
    },
    medical: {
        name: "Healthcare & Medicine",
        careers: ["Doctor (MBBS)", "Surgeon", "Psychiatrist", "Biotech Researcher", "Pharmacist", "Veterinarian", "Physiotherapist", "Forensic Scientist"]
    },
    commerce: {
        name: "Business & Finance",
        careers: ["Chartered Accountant", "Investment Banker", "Management Consultant", "Entrepreneur", "Financial Analyst", "Economist", "Actuary", "Real Estate Analyst"]
    },
    humanities: {
        name: "Law & Social Sciences",
        careers: ["Lawyer/Advocate", "Journalist", "Teacher/Professor", "Social Worker", "Psychologist", "Diplomat", "Historian", "NGO Director"]
    },
    creative: {
        name: "Arts & Design",
        careers: ["UI/UX Designer", "Film Director", "Architect", "Fashion Designer", "Graphic Designer", "Animator", "Music Producer", "Game Designer"]
    },
    defense: {
        name: "Defense & Armed Forces",
        careers: ["Indian Army Officer", "Indian Navy Officer", "Indian Air Force Officer", "NDA/CDS Graduate", "Paramilitary Officer (CRPF/BSF)", "Intelligence Officer (RAW/IB)", "Coast Guard Officer", "Military Engineer"]
    },
    aviation: {
        name: "Aviation & Aerospace",
        careers: ["Commercial Pilot", "Fighter Pilot", "Aerospace Engineer", "Air Traffic Controller", "Aircraft Maintenance Engineer", "Drone Operator/Engineer", "Space Scientist (ISRO)", "Helicopter Pilot"]
    },
    sports: {
        name: "Sports & Athletics",
        careers: ["Professional Athlete", "Sports Coach", "Sports Physiotherapist", "Sports Manager", "Fitness Trainer", "Sports Journalist", "Esports Professional", "Sports Psychologist"]
    },
    government: {
        name: "Civil Services & Government",
        careers: ["IAS Officer", "IPS Officer", "IFS Officer (Diplomat)", "State PSC Officer", "Bank PO (SBI/RBI)", "Railway Officer", "SSC Officer", "UPSC - Other Services"]
    }
};

// Section definitions for UI
export const sections = [
    {
        id: "aptitude",
        title: "Academic Strengths",
        description: "Understanding your core competencies",
        questionCount: 5
    },
    {
        id: "personality",
        title: "Work Style & Personality",
        description: "How you approach work and challenges",
        questionCount: 5
    },
    {
        id: "goals",
        title: "Goals & Values",
        description: "What drives your career decisions",
        questionCount: 5
    }
];
