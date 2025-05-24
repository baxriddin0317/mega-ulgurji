import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC42KiznTaPLq--l67rszotoEAH2E3cNbE",
  authDomain: "mega-ulgurji.firebaseapp.com",
  projectId: "mega-ulgurji",
  storageBucket: "mega-ulgurji.firebasestorage.app",
  messagingSenderId: "805239200961",
  appId: "1:805239200961:web:6d987b4cba195b6a294840"
};


const app = initializeApp(firebaseConfig);

const fireDB = getFirestore(app);
const auth = getAuth(app)
const fireStorage = getStorage(app);

export { fireDB, auth, fireStorage }