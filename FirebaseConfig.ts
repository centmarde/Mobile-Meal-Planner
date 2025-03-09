// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSjh5MuA7gCBcm5Zirl-oiaUnQaiXZ1iI",
  authDomain: "meal-planner-c778f.firebaseapp.com",
  projectId: "meal-planner-c778f",
  storageBucket: "meal-planner-c778f.firebasestorage.app",
  messagingSenderId: "823162844630",
  appId: "1:823162844630:web:a8dbf8f19caffc958ba077"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);