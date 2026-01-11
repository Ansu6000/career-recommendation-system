import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For this to work, you need to create a .env file with these values
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase with:", firebaseConfig.apiKey ? "Valid Key detected" : "No Key");

let app, auth, googleProvider, db;

// Strict check
const isValid = firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza");

if (isValid) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
    } catch (e) {
        console.error("Firebase Initialization Failed:", e);
    }
} else {
    console.warn("Using Null Firebase Services (Mock Mode)");
}

export { app, auth, googleProvider, db };
