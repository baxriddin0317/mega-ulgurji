import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvjFfygWWmwqyezNwOE4mHQdqF2BJEi_s",
  authDomain: "mega-ulgurji-1fccf.firebaseapp.com",
  projectId: "mega-ulgurji-1fccf",
  storageBucket: "mega-ulgurji-1fccf.firebasestorage.app",
  messagingSenderId: "586829451691",
  appId: "1:586829451691:web:4c3378ba30026ad6ea02ee"
};


const app = initializeApp(firebaseConfig);

const fireDB = getFirestore(app);
const auth = getAuth(app)
const fireStorage = getStorage(app);

export { fireDB, auth, fireStorage }