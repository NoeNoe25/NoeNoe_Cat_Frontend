// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA89Dbt08_90hiOB51p0s5EQWsvN7mG8-c",
  authDomain: "catrobot-b2466.firebaseapp.com",
  projectId: "catrobot-b2466",
  storageBucket: "catrobot-b2466.firebasestorage.app",
  messagingSenderId: "86395044593",
  appId: "1:86395044593:web:6bb470bcc2e4a649a81f50",
  measurementId: "G-119VST88QF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
