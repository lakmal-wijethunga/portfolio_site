// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCCcSc_G4iLFeCcBYgu1ATYoXwadtSeoHU",
  authDomain: "portfolio-like-counter.firebaseapp.com",
  databaseURL: "https://portfolio-like-counter-default-rtdb.firebaseio.com",
  projectId: "portfolio-like-counter",
  storageBucket: "portfolio-like-counter.firebasestorage.app",
  messagingSenderId: "350022100734",
  appId: "1:350022100734:web:ed1fc480fe97427910e7af",
  measurementId: "G-DPDTZMSDBB"
};

// Initialize Firebase with compatibility version for easier use with existing code
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const db = firebase.database();
console.log("Firebase initialized successfully");