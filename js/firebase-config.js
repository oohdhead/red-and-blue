import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMXJXataSk-13FyOChiFrvCUEHcxo-SvQ",
  authDomain: "red-and-blue-c98c6.firebaseapp.com",
  databaseURL: "https://red-and-blue-c98c6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "red-and-blue-c98c6",
  storageBucket: "red-and-blue-c98c6.firebasestorage.app",
  messagingSenderId: "822398052354",
  appId: "1:822398052354:web:f1ea75c5957faf16c99f1b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);