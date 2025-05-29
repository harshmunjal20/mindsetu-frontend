// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBHrdmEaJfXt1dX2TBgkNXjVEBtC6rr3OU",
  authDomain: "mindsetu-b0db5.firebaseapp.com",
  projectId: "mindsetu-b0db5",
  storageBucket: "mindsetu-b0db5.firebasestorage.app",
  messagingSenderId: "1076454011107",
  appId: "1:1076454011107:web:4e3e755dacd1e6dfe615d6",
  measurementId: "G-L5FBTCB85W"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
