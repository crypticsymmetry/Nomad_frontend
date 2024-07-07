import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCEjiw2NdpMSIuv0_VKXHzlrMywAyMtYg4",
  authDomain: "nomadpowersports-84e70.firebaseapp.com",
  projectId: "nomadpowersports-84e70",
  storageBucket: "nomadpowersports-84e70.appspot.com",
  messagingSenderId: "476619609513",
  appId: "1:476619609513:web:15a6bcc9a8677a9e0ce0b8",
  measurementId: "G-M1D1T3QZRX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth, signInWithEmailAndPassword, onAuthStateChanged };
