import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase web config is publishable by design.
const firebaseConfig = {
  apiKey: "AIzaSyDbPe4CQJP9IWzRrOMeN96c60mZe0FjVpw",
  authDomain: "mailmx-3bf2b.firebaseapp.com",
  projectId: "mailmx-3bf2b",
  storageBucket: "mailmx-3bf2b.firebasestorage.app",
  messagingSenderId: "590976503111",
  appId: "1:590976503111:web:948f8d92b657b169115062",
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
    void setPersistence(authInstance, browserLocalPersistence);
  }
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function googleProvider() {
  return new GoogleAuthProvider();
}

export const ADMIN_EMAILS = ["caroluscitra08@gmail.com"];
export const VALID_PASSWORDS = ["fineirga", "prabujaya", "sgsg1122", "aass1122"];
