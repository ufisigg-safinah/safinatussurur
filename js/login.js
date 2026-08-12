import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    app
} from "./firebase-config.js";


const auth = getAuth(app);


const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const username = usernameInput.value.trim();
    const password = passwordInput.value;


    // Username admin akan diubah menjadi email internal Firebase
    const email = username + "@safinatussurur.local";


    loginButton.disabled = true;
    loginButton.textContent = "Memproses...";

    loginMessage.textContent = "";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        loginMessage.style.color = "#15803d";

        loginMessage.textContent =
            "Login berhasil!";


        setTimeout(function () {

            window.location.href = "dashboard.html";

        }, 1000);


    } catch (error) {

        console.error(error);

        loginMessage.style.color = "#dc2626";

        loginMessage.textContent =
            "Username atau password salah.";


        loginButton.disabled = false;

        loginButton.textContent = "Login";

    }

});