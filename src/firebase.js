import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDCeSl1acc_F_VHI1hI2aNhu6z1suF-D6o",
  authDomain: "rent-contract-app.firebaseapp.com",
  projectId: "rent-contract-app",
  storageBucket: "rent-contract-app.firebasestorage.app",
  messagingSenderId: "975445760785",
  appId: "1:975445760785:web:948336111b08e12a0d4ab0"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;