// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWPQiaemMoyV_CEsV9kZIgD2Oh69q7Ujg",
  authDomain: "roofcx-blog.firebaseapp.com",
  projectId: "roofcx-blog",
  storageBucket: "roofcx-blog.firebasestorage.app",
  messagingSenderId: "286772512770",
  appId: "1:286772512770:web:14f11f4553bcac541f3f1b",
  measurementId: "G-GJMJXF8E0R"
};

// Initialize Firebase and export the app instance
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export { firebaseConfig };