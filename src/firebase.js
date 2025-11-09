// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ------------------- Cấu hình Firebase -------------------
const firebaseConfig = {
  apiKey: "AIzaSyACb8VGMaZ6lcZ3rmciNT-6kH9UBo7QXKc",
  authDomain: "study-planneer.firebaseapp.com",
  projectId: "study-planneer",
  storageBucket: "study-planneer.appspot.com",
  messagingSenderId: "902062009341",
  appId: "1:902062009341:web:fef7bd3494da12d7d14794",
  measurementId: "G-SQE1M10P78"
};

// ------------------- Khởi tạo Firebase -------------------
const app = initializeApp(firebaseConfig);

// ------------------- Xuất các dịch vụ -------------------
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ------------------- Xuất các hàm auth -------------------
export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
};
