// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5ALNDE2LJ3fhIfuKSFrF7VHt4w8gN-xw",
  authDomain: "athlete-management-fb863.firebaseapp.com",
  projectId: "athlete-management-fb863",
  storageBucket: "athlete-management-fb863.appspot.com",
  messagingSenderId: "655607412348",
  appId: "1:655607412348:web:fc3e5cb5bcb005d368fbf9",
  measurementId: "G-W8M6055HMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication

export { auth }; // Export the auth object for use in other files