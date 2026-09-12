import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  limit,
  orderBy,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Firestore instance
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Export auth & firestore helpers
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  fbUpdateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  limit,
  orderBy,
  deleteDoc,
  serverTimestamp,
  runTransaction,
};
export type { User, ConfirmationResult };

