// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "react-app-cd8bc.firebaseapp.com",
  projectId: "react-app-cd8bc", 
  storageBucket: "react-app-cd8bc.appspot.com",
  messagingSenderId: "343849164693",    
  appId: "1:343849164693:web:f4958f72b39126e13c209c"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export default app;