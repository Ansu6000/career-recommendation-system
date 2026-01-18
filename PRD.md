# Pathwise - Product Requirements Document (PRD)

---

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Product Name** | Pathwise |
| **Version** | 1.0 |
| **Document Owner** | Product Team |
| **Last Updated** | January 18, 2026 |
| **Status** | Active Development |

---

## 🎯 Executive Summary

### Vision Statement
Pathwise is an AI-powered career guidance platform designed to help students in Classes 10-12 navigate one of their most important life decisions—choosing a career path. By combining psychometric assessment with advanced AI, Pathwise delivers personalized, actionable career roadmaps tailored to the local education system and job market.

### Mission
To democratize access to quality career counseling by providing every student—regardless of socioeconomic background—with personalized, data-driven career guidance that was previously only available through expensive private counselors.

### The Problem
Students in Classes 10-12 face critical decisions that shape their futures:
- Choosing streams after Class 10 (Science/Commerce/Arts)
- Preparing for entrance exams (JEE, NEET, CLAT, NDA, UPSC)
- Selecting degree programs and colleges
- Understanding emerging career paths

**Current challenges:**
- **Limited Access:** Professional career counseling costs ₹5,000-₹50,000+
- **Generic Advice:** One-size-fits-all guidance ignores individual strengths
- **Information Overload:** 200+ career options with no personalized filtering
- **Outdated Information:** Traditional counselors often unaware of new-age careers
- **Timing Pressure:** Decisions need to be made under exam stress and time constraints

### The Solution
Pathwise uses a scientifically-designed 15-question assessment combined with Groq AI (LLaMA 3 70B) to generate:
- **3 highly-personalized career recommendations** with salary expectations
- **Step-by-step roadmaps** including stream selection, entrance exams, and degree paths
- **Curated resources** for each recommended career

---

## 👥 Target Audience

### Primary Users

| Segment | Description | Key Needs |
|---------|-------------|-----------|
| **Class 10 Students** | 14-16 years, about to choose stream | Stream guidance (PCM/PCB/Commerce/Arts) |
| **Class 11-12 Students** | 16-18 years, preparing for entrance exams | Exam strategy, college selection, alternative paths |
| **Parents** | 35-50 years, involved in child's career decisions | Validation, roadmap clarity, trust in recommendations |

### User Personas

#### Persona 1: Aarav (Class 10 Student)
- **Age:** 15 years
- **Location:** Tier-2 city (Jaipur)
- **Context:** Top 10% in class, parents want him to become an engineer, but he's confused
- **Pain Points:**
  - "Everyone says engineering, but I like economics too"
  - "How do I know if I'm right for IIT?"
  - "What if I choose wrong and regret it?"
- **Goals:** Clear stream recommendation, understand all options

#### Persona 2: Priya (Class 12 Student)
- **Age:** 17 years
- **Location:** Metro (Bangalore)
- **Context:** Class 12 Commerce student, wants to explore beyond CA
- **Pain Points:**
  - "Is CA my only option in Commerce?"
  - "I like technology too—can I combine both?"
  - "I need a backup plan if CA doesn't work"
- **Goals:** Discover hybrid careers, understand emerging fields

#### Persona 3: Rakesh (Parent)
- **Age:** 45 years
- **Location:** Rural Maharashtra
- **Context:** First-generation professional in family, limited career awareness
- **Pain Points:**
  - "I don't know careers beyond Doctor/Engineer/Lawyer"
  - "Is this new career stable and respected?"
  - "I want the best for my child but don't know what that is"
- **Goals:** Trust the platform, understand career viability

---

## 🛠️ Product Features

### Core Features (MVP - Current)

#### 1. User Authentication
| Aspect | Details |
|--------|---------|
| **Methods** | Email/Password via Firebase Auth |
| **Features** | Signup, Login, Logout, Session persistence |
| **Data** | User profile stored in Firebase Auth |

#### 2. Career Assessment (15 Questions)
| Aspect | Details |
|--------|---------|
| **Sections** | Academic Strengths (5), Work Style (5), Goals & Values (5) |
| **Design** | Weighted scoring across 9 career categories |
| **Categories** | Tech, Medical, Commerce, Humanities, Creative, Defense, Aviation, Sports, Government |
| **Time** | 5-10 minutes average completion |

#### 3. AI Career Generation
| Aspect | Details |
|--------|---------|
| **AI Model** | Groq API with LLaMA 3 70B |
| **Output** | 3 personalized career recommendations |
| **Per Career** | Name, description, roadmap, resources, salary range, growth potential |

#### 4. Results Dashboard
| Aspect | Details |
|--------|---------|
| **Cards** | Expandable career cards with detailed information |
| **Roadmap** | Stream → Entrance Exams → Degree → Career path |
| **Resources** | Curated courses, books, YouTube channels |
| **Persistence** | Results saved to Supabase, accessible on refresh |

#### 5. Assessment History
| Aspect | Details |
|--------|---------|
| **Feature** | View all past assessments |
| **Data** | Date, careers recommended, ability to retake |
| **Limit** | Unlimited retakes for exploration |

### Planned Features (V2.0)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Google Sign-In** | High | One-click authentication |
| **Comparative Analysis** | High | Compare 2-3 careers side by side |
| **College Finder** | High | Recommend colleges for chosen career |
| **Exam Tracker** | Medium | Track entrance exam dates and prep |
| **Mentor Connect** | Medium | Connect with professionals in chosen field |
| **Parent Mode** | Medium | Simplified view for parents |
| **Vernacular Support** | High | Hindi, Tamil, Telugu, Bengali |

### Future Roadmap (V3.0+)

| Feature | Description |
|---------|-------------|
| **AI Career Counselor Chat** | Conversational AI for follow-up questions |
| **Scholarship Finder** | Match scholarships to user profile |
| **Resume Builder** | For college applications |
| **Psychometric Deep Dive** | Detailed personality assessment |
| **Industry Insights** | Job market trends and projections |

---

## 📊 Analytics & Metrics

### Key Performance Indicators (KPIs)

#### Engagement Metrics
| Metric | Definition | Target |
|--------|------------|--------|
| **DAU** | Daily Active Users | Track growth |
| **MAU** | Monthly Active Users | Track growth |
| **DAU/MAU Ratio** | Stickiness | >20% |
| **Session Duration** | Avg time in app | >5 mins |
| **Pages per Session** | Engagement depth | >3 |

#### Assessment Metrics
| Metric | Definition | Target |
|--------|------------|--------|
| **Completion Rate** | Started → Completed | >85% |
| **Avg Completion Time** | Time to finish assessment | 5-10 mins |
| **Retake Rate** | Users who retake | 15-25% |
| **Drop-off Point** | Question where users abandon | Identify & fix |

#### Retention Metrics
| Metric | Definition | Target |
|--------|------------|--------|
| **D1 Retention** | % returning Day 1 | >30% |
| **D7 Retention** | % returning Day 7 | >15% |
| **D30 Retention** | % returning Day 30 | >8% |

#### Conversion Metrics
| Metric | Definition | Target |
|--------|------------|--------|
| **Signup → Assessment** | % who start assessment | >80% |
| **Assessment → Results** | % who view results | >95% |
| **Results → Return** | % who come back | >25% |

#### Career Analytics
| Metric | Definition | Purpose |
|--------|------------|---------|
| **Top Careers Generated** | Most recommended careers | Content focus |
| **Category Distribution** | Tech vs Medical vs Commerce | Market insights |
| **Career × User Segment** | Careers by Class 10/11/12 | Personalization |

### Analytics Implementation

Analytics are tracked via a custom `analytics.js` service that integrates with Supabase:

```javascript
// Key events tracked:
ANALYTICS_EVENTS = {
    USER_SIGNUP, USER_LOGIN, USER_LOGOUT,
    ASSESSMENT_STARTED, ASSESSMENT_COMPLETED, ASSESSMENT_ABANDONED,
    QUESTION_ANSWERED, RESULTS_VIEWED, CAREER_EXPANDED,
    RESOURCE_CLICKED, PAGE_VIEW, SESSION_START, SESSION_END
}
```

Dashboard views available via Supabase SQL:
- `vw_dau` - Daily active users
- `vw_mau` - Monthly active users
- `vw_assessment_metrics` - Completion rates
- `vw_career_distribution` - Career category breakdown

---

## 🏗️ Technical Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | Fast SPA with modern DX |
| **Styling** | Vanilla CSS + CSS Variables | Full control, dark theme |
| **Authentication** | Firebase Auth | Secure, scalable auth |
| **Database** | Supabase (PostgreSQL) | Assessments + Analytics |
| **AI** | Groq API (LLaMA 3 70B) | Career generation |
| **Hosting** | Vercel | Edge deployment, auto-scaling |
| **Icons** | Lucide React | Consistent iconography |

### Data Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Auth  │  │  Assessment │  │   Results   │  │  Home   │ │
│  └────┬────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
└───────┼──────────────┼─────────────────┼─────────────┼──────┘
        │              │                 │             │
        ▼              ▼                 ▼             ▼
┌───────────────┐  ┌─────────────────────────────────────────┐
│  Firebase     │  │              Supabase                    │
│  Auth         │  │  ┌─────────────┐  ┌───────────────────┐ │
│               │  │  │ assessments │  │ analytics_events  │ │
│  • Users      │  │  │ • id        │  │ • event_type      │ │
│  • Sessions   │  │  │ • user_id   │  │ • user_id         │ │
│               │  │  │ • result    │  │ • properties      │ │
│               │  │  │ • answers   │  │ • timestamp       │ │
└───────────────┘  │  └─────────────┘  └───────────────────┘ │
                   └─────────────────────────────────────────┘
                                    │
                                    ▼
                   ┌─────────────────────────────────────────┐
                   │              Groq API                    │
                   │  • LLaMA 3 70B                          │
                   │  • Career generation prompts            │
                   │  • Structured JSON output               │
                   └─────────────────────────────────────────┘
```

### API Integrations

#### Groq AI Integration
- **Model:** LLaMA 3 70B (fast inference)
- **Input:** User answers + profile data
- **Output:** Structured JSON with 3 careers
- **Latency:** <3 seconds typical

#### Supabase Integration
- **Tables:** `assessments`, `analytics_events`, `daily_metrics`
- **Operations:** CRUD for assessments, INSERT for analytics
- **RLS:** Optional row-level security for multi-tenant

---

## 🎨 Design Specifications

### Design Principles
1. **Trust First:** Professional, reliable appearance
2. **Simplicity:** One thing per screen, clear CTAs
3. **Guidance:** Users never feel lost
4. **Celebration:** Results feel rewarding

### Visual Identity

| Element | Specification |
|---------|--------------|
| **Primary Color** | Purple gradient (#8B5CF6 → #6366F1) |
| **Background** | Dark (#0f0f0f, #1a1a1f, #252530) |
| **Text** | White (#ffffff) with 70% secondary |
| **Cards** | Glassmorphism with subtle borders |
| **Animations** | Subtle fade-in, smooth transitions |

### Responsive Design
| Breakpoint | Behavior |
|------------|----------|
| **Mobile** (<768px) | Single column, touch-optimized |
| **Tablet** (768-1024px) | 2-column cards |
| **Desktop** (>1024px) | Full layout, 3-column cards |

---

## 🚀 Go-to-Market Strategy

### Launch Phases

#### Phase 1: Beta (Current)
- **Target:** 100-500 users
- **Channels:** Direct sharing, word of mouth
- **Goals:** Validate core flow, collect feedback

#### Phase 2: Soft Launch
- **Target:** 5,000 users
- **Channels:** Social media, school partnerships
- **Goals:** Achieve product-market fit, optimize completion rate

#### Phase 3: Growth
- **Target:** 50,000+ users
- **Channels:** Paid ads, influencer partnerships, school integrations
- **Goals:** Scale acquisition, introduce premium features

### Distribution Channels

| Channel | Strategy | Expected CAC |
|---------|----------|--------------|
| **Organic Social** | Career content, success stories | Free |
| **School Partnerships** | B2B2C, integrate in career week | Low |
| **Parent WhatsApp Groups** | Viral sharing | Free |
| **YouTube Ads** | Target Class 10-12 students | ₹50-100 |
| **Instagram/Facebook** | Career reels, testimonials | ₹30-80 |

### Monetization (Future)

| Model | Description | Price Point |
|-------|-------------|-------------|
| **Freemium** | Basic assessment free, premium features paid | ₹0 base |
| **Premium Report** | Detailed PDF report with full analysis | ₹299/report |
| **Subscription** | Unlimited assessments + mentor connect | ₹999/year |
| **School License** | Bulk access for institutions | ₹25,000/year |

---

## 📈 Success Criteria

### Phase 1 Success (Current)
- [ ] 500+ completed assessments
- [ ] >80% completion rate
- [ ] NPS > 40

### Phase 2 Success
- [ ] 10,000+ registered users
- [ ] >15% D7 retention
- [ ] 3 school partnerships

### Phase 3 Success
- [ ] 100,000+ users
- [ ] 5% premium conversion
- [ ] Break-even financially

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **AI hallucination in career advice** | High | Medium | Structured prompts, human review layer |
| **Low completion rate** | High | Medium | Shorten questions, add progress incentives |
| **Trust issues (accuracy)** | High | Medium | Testimonials, expert validation, transparency |
| **Groq API downtime** | Medium | Low | Fallback to cached results, queue retry |
| **Data privacy concerns** | High | Low | Clear privacy policy, minimal data collection |
| **Competition from EdTech giants** | Medium | Medium | Niche focus, superior UX, local context |

---

## 📝 Appendix

### A. Competitive Analysis

| Competitor | Strengths | Weaknesses | Pathwise Advantage |
|------------|-----------|------------|-------------------|
| **iDreamCareer** | Established, school partnerships | Expensive, generic | Free + personalized |
| **Mindler** | Comprehensive, certification | Complex, overwhelming | Simple 15-min flow |
| **CareerGuide.com** | Extensive database | Outdated UI, no AI | Modern AI-powered |
| **Manual Counselors** | Personal touch | Expensive, limited access | Scalable, affordable |

### B. Question Framework

The 15 questions are designed based on:
- **Holland's RIASEC Model:** Career interest categories
- **Multiple Intelligences Theory:** Learning style alignment
- **Indian Career Context:** Local entrance exams, streams, degrees

### C. Career Categories

| Category | Careers Covered |
|----------|-----------------|
| **Tech** | Software Engineer, Data Scientist, AI/ML Engineer, Cybersecurity Analyst |
| **Medical** | Doctor, Surgeon, Psychiatrist, Biotech Researcher |
| **Commerce** | CA, Investment Banker, Consultant, Entrepreneur |
| **Humanities** | Lawyer, Journalist, Psychologist, Teacher |
| **Creative** | UI/UX Designer, Architect, Film Director, Game Designer |
| **Defense** | Army/Navy/Air Force Officer, NDA, RAW/IB |
| **Aviation** | Commercial Pilot, Fighter Pilot, Aerospace Engineer |
| **Sports** | Professional Athlete, Sports Coach, Sports Manager |
| **Government** | IAS, IPS, IFS, Bank PO, Railway Officer |

---

## ✅ Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| Business Stakeholder | | | |

---

*This PRD is a living document and will be updated as the product evolves.*
