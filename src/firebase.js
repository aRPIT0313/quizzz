// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3fXQo34QGf-TFQEZQIucvvoxkepaIwos",
  authDomain: "quizzwala-ebfdb.firebaseapp.com",
  projectId: "quizzwala-ebfdb",
  storageBucket: "quizzwala-ebfdb.firebasestorage.app",
  messagingSenderId: "239122266640",
  appId: "1:239122266640:web:2136230eae6958c64de895"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);