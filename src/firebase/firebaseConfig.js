import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBG_TV5bNHB406Fvch3C5r9lzSQ4TDXkb4",
  authDomain: "wc2026-predictor-web.firebaseapp.com",
  projectId: "wc2026-predictor-web",
  storageBucket: "wc2026-predictor-web.firebasestorage.app",
  messagingSenderId: "866023692838",
  appId: "1:866023692838:web:860fc60b9a638f358924e7",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);