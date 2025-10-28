// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider,setPersistence, browserLocalPersistence, } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAPYrOEYs0Avtw5AiglidvO0AbFOoPEuYw",
  authDomain: "freelance-project-manage-c1.firebaseapp.com",
  projectId: "freelance-project-manage-c1",
  storageBucket: "freelance-project-manage-c1.firebasestorage.app",
  messagingSenderId: "412368696539",
  appId: "1:412368696539:web:498d8337eee580547e08fe",
  measurementId: "G-SSHW65R75N"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Exports
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
