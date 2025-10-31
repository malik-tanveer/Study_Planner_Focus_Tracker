// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider,setPersistence, browserLocalPersistence, } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCtkiUBmNZ7TvbyZUWVcZp1b06TKAmfgyM",
  authDomain: "study-planner-focus-tracker.firebaseapp.com",
  projectId: "study-planner-focus-tracker",
  storageBucket: "study-planner-focus-tracker.firebasestorage.app",
  messagingSenderId: "51354929545",
  appId: "1:51354929545:web:ba7e3fcc5a4835a962b958",
  measurementId: "G-8K6S3FC24C"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Exports
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
