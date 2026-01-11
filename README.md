<div align="center">

# ⚡ Pathwise

### AI-Powered Career Guidance for Indian Students

**Find your career path in 5 minutes**

[Live Demo](#) · [Report Bug](https://github.com/yourusername/pathwise/issues) · [Request Feature](https://github.com/yourusername/pathwise/issues)

---

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=flat&logo=firebase)
![Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4?style=flat&logo=google)

</div>

---

## 🎯 What is Pathwise?

Pathwise is an AI-powered career counseling platform designed specifically for Indian students in Class 9-12. Instead of generic career tests, we use **Google's Gemini AI** to deeply analyze your interests, personality, and goals to create a personalized career blueprint.

**The Problem:** Students in India are often confused about career choices, especially when it comes to selecting streams after Class 10, preparing for entrance exams, and choosing the right degree. Traditional career counseling is expensive and inaccessible.

**Our Solution:** A free, AI-powered assessment that takes just 5 minutes and delivers:
- 🎯 3 personalized career recommendations with salary info and work environment
- 📚 Step-by-step roadmap (which stream, which exams, which degrees)
- 🔗 Curated learning resources (real YouTube channels, courses, books)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Smart Assessment** | 20 carefully designed questions that go beyond simple multiple-choice |
| **AI-Powered Analysis** | Uses Google Gemini 1.5 Flash to understand context and nuance |
| **Personalized Roadmap** | Specific guidance for Class 11/12 stream, entrance exams (JEE, NEET, CLAT, NID), and degrees |
| **Real Resources** | Actual YouTube channels, Coursera courses, and books - not generic links |
| **Indian Context** | Built specifically for the Indian education system |
| **Beautiful UI** | Dark, cinematic design with glassmorphism and smooth animations |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Vanilla CSS with CSS Variables (dark theme)
- **Authentication:** Firebase Auth (Email/Password + Google Sign-In)
- **Database:** Firebase Firestore
- **AI:** Google Gemini 1.5 Flash API
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Google AI Studio account (for Gemini API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pathwise.git
   cd pathwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:5173](http://localhost:5173) in your browser

---

## 🔑 Getting API Keys

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password + Google)
4. Enable **Firestore Database**
5. Go to Project Settings → Your Apps → Add Web App
6. Copy the config keys to your `.env` file

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to your `.env` file as `VITE_GEMINI_API_KEY`

---

## 📁 Project Structure

```
pathwise/
├── src/
│   ├── components/
│   │   ├── Assessment.jsx    # Quiz/Assessment flow
│   │   ├── Auth.jsx          # Login/Signup page
│   │   └── Results.jsx       # Career blueprint display
│   ├── data/
│   │   └── questions.js      # Assessment questions
│   ├── services/
│   │   └── gemini.js         # AI integration & prompts
│   ├── App.jsx               # Main app + Homepage
│   ├── firebase.js           # Firebase configuration
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎨 Screenshots

<div align="center">

| Homepage | Assessment | Results |
|----------|------------|---------|
| Clean hero section with scroll animations | 20-question assessment with progress tracking | Detailed career blueprint with roadmap |

</div>

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://deepmind.google/technologies/gemini/) for the AI backbone
- [Firebase](https://firebase.google.com/) for authentication and database
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vite](https://vitejs.dev/) for the blazing fast dev experience

---

<div align="center">

**Built with ❤️ for Indian Students**

If this helped you, consider giving it a ⭐

</div>
