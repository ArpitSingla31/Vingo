// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-adf1b.firebaseapp.com",
  projectId: "vingo-food-delivery-adf1b",
  storageBucket: "vingo-food-delivery-adf1b.firebasestorage.app",
  messagingSenderId: "793863916374",
  appId: "1:793863916374:web:b08635a8b96022c8cfa4f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}