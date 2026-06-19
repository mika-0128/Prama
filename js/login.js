import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const emailInput =
  document.getElementById("email");

  const passwordInput =
  document.getElementById("password");

  const loginBtn =
  document.getElementById("loginBtn");

  const togglePassword =
  document.getElementById("togglePassword");

  emailInput.value = "";
  passwordInput.value = "";

  togglePassword.addEventListener("click", () => {

    if(passwordInput.type === "password"){

      passwordInput.type = "text";

      togglePassword.innerHTML =
      '<i class="fa-regular fa-eye-slash"></i>';

    }else{

      passwordInput.type = "password";

      togglePassword.innerHTML =
      '<i class="fa-regular fa-eye"></i>';

    }

  });

  loginBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const email =
    emailInput.value.trim();

    const password =
    passwordInput.value.trim();

    if(!email || !password){

      alert("Please fill all fields.");
      return;

    }

    try{

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      window.location.href =
      "home.html";

    }catch(error){

      console.error(error);

      if(
        error.code === "auth/invalid-credential"
      ){

        alert(
          "Account not found or password incorrect. Please sign up first."
        );

      }else if(
        error.code === "auth/invalid-email"
      ){

        alert(
          "Please enter a valid email."
        );

      }else{

        alert(
          "Login failed: " +
          error.message
        );

      }

    }

  });

});