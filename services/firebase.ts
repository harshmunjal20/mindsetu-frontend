

// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBHrdmEaJfXt1dX2TBgkNXjVEBtC6rr3OU",
  authDomain: "mindsetu-b0db5.firebaseapp.com",
  projectId: "mindsetu-b0db5",
  storageBucket: "mindsetu-b0db5.firebasestorage.app",
  messagingSenderId: "1076454011107",
  appId: "1:1076454011107:web:4e3e755dacd1e6dfe615d6",
  measurementId: "G-L5FBTCB85W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
