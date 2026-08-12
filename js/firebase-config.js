// Firebase App
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

// Firebase Authentication
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyD0izNMCi-Ef52v_bW5WWeB4nxoaUrehG4",

    authDomain: "safinatussurur.firebaseapp.com",

    projectId: "safinatussurur",

    storageBucket: "safinatussurur.firebasestorage.app",

    messagingSenderId: "1065917297456",

    appId: "1:1065917297456:web:27197bcdee49c226920ef5",

    measurementId: "G-CPHKKWHZRD"
};


// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
const auth = getAuth(app);


// Firestore
const db = getFirestore(app);


// Export
export {
    app,
    auth,
    db
};