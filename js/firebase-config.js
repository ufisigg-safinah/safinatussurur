// ==========================================
// FIREBASE CONFIG
// SAFINATUSSURUR
// ==========================================

import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// CONFIG
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyD0izNMCi-Ef52v_bW5WWeB4nxoaUrehG4",

    authDomain:
        "safinatussurur.firebaseapp.com",

    projectId:
        "safinatussurur",

    storageBucket:
        "safinatussurur.firebasestorage.app",

    messagingSenderId:
        "1065917297456",

    appId:
        "1:1065917297456:web:27197bcdee49c226920ef5"

};


// ==========================================
// INITIALIZE APP
// ==========================================

const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);


// ==========================================
// FIRESTORE
// ==========================================

const db =
    getFirestore(app);


// ==========================================
// AUTH
// ==========================================

const auth =
    getAuth(app);


// ==========================================
// EXPORT
// ==========================================

export {
    app,
    db,
    auth
};
