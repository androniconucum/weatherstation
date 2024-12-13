// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCaJXwzCGoqpJKgSv4TDxh0-CauoWj13Yc",
  authDomain: "weatherstation-474f2.firebaseapp.com",
  databaseURL: "https://weatherstation-474f2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "weatherstation-474f2",
  storageBucket: "weatherstation-474f2.firebasestorage.app",
  messagingSenderId: "315579475162",
  appId: "1:315579475162:web:73d7181416428c9c96f1e3",
  measurementId: "G-SQ61MJC5PG"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

