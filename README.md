# Pathwise

## AI-Powered Career Guidance for Indian Students

A comprehensive career counseling platform designed specifically for Indian students in Class 10-12. The platform uses AI to analyze interests, personality, and goals to create personalized career blueprints.

---

## Overview

Pathwise addresses the challenge faced by Indian students when selecting career paths, choosing streams after Class 10, preparing for entrance exams, and selecting appropriate degrees. The platform provides:

- 3 personalized career recommendations with salary expectations and growth potential
- Step-by-step roadmap including stream selection, entrance exams, and degree paths
- Curated learning resources including courses, books, and channels

---

## Features

| Feature | Description |
|---------|-------------|
| Assessment System | 15 professionally designed questions covering aptitude, personality, and values |
| AI-Powered Analysis | Uses Groq AI (LLaMA 3) to analyze responses and generate personalized recommendations |
| Career Roadmap | Specific guidance for Class 11/12 stream, entrance exams (JEE, NEET, CLAT, NDA, UPSC), and degrees |
| 9 Career Domains | Tech, Medical, Commerce, Humanities, Creative, Defense, Aviation, Sports, Government |
| Indian Context | Built specifically for the Indian education system and career landscape |
| Responsive Design | Modern UI with dark theme, glassmorphism, and smooth animations |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite |
| Styling | Vanilla CSS with CSS Variables |
| Authentication | Firebase Auth (Email/Password) |
| Database | Supabase (PostgreSQL) |
| AI | Groq API (LLaMA 3 70B) |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account (for authentication)
- Supabase account (for database)
- Groq API key (for AI features)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/pathwise.git
   cd pathwise
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Groq AI Configuration
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

---

## API Configuration

### Firebase Setup
1. Go to Firebase Console (https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password provider
4. Go to Project Settings and copy the web app configuration
5. Add the configuration values to your `.env` file

### Supabase Setup
1. Go to Supabase (https://supabase.com/)
2. Create a new project
3. Create the following table:

```sql
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  result JSONB,
  answers JSONB,
  profile_used JSONB,
  retake_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
```

4. Copy the Project URL and Anon Key to your `.env` file

### Groq API Setup
1. Go to Groq Console (https://console.groq.com/)
2. Create an API key
3. Add the key to your `.env` file as `VITE_GROQ_API_KEY`

---

## Project Structure

```
pathwise/
├── src/
│   ├── components/
│   │   ├── Assessment.jsx    # Quiz/Assessment flow
│   │   ├── Auth.jsx          # Login/Signup page
│   │   ├── Results.jsx       # Career blueprint display
│   │   └── CustomDropdown.jsx # Custom dropdown component
│   ├── data/
│   │   └── questions.js      # Assessment questions with weighted scoring
│   ├── services/
│   │   ├── gemini.js         # AI integration (Groq API)
│   │   └── supabase.js       # Supabase database service
│   ├── App.jsx               # Main app + Homepage
│   ├── firebase.js           # Firebase configuration
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── index.html
├── package.json
└── vite.config.js
```

---

## Assessment System

The assessment consists of 15 questions across 3 sections:

| Section | Focus Area | Questions |
|---------|------------|-----------|
| Academic Strengths | Subject preferences, problem-solving style, learning approach | 5 |
| Work Style and Personality | Pressure handling, discipline, communication, flexibility | 5 |
| Goals and Values | Career motivation, preparation commitment, environment preference | 5 |

Each answer option has weighted scores mapped to 9 career categories, enabling accurate career matching based on response patterns.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

- Groq for providing fast AI inference
- Firebase for authentication services
- Supabase for database infrastructure
- Lucide for icon library
- Vite for build tooling
