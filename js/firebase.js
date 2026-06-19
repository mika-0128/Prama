import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCj2pzb-psvy0jQoBnCdHro7WB-dDtJ59E",
  authDomain: "prama-3026e.firebaseapp.com",
  projectId: "prama-3026e",
  storageBucket: "prama-3026e.firebasestorage.app",
  messagingSenderId: "647449378924",
  appId: "1:647449378924:web:3eddc4af3a34db5f765849",
  measurementId: "G-V7BP33V5PS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
