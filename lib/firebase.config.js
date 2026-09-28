// lib/firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { ENV } from "./env.config"; // Yahan ENV import kar liya

const firebaseApp = getApps()[0] || initializeApp(ENV.firebase);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
